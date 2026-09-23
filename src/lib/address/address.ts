/* 지역 · 주소 검색 어댑터.
   화면(지역 검색 바텀시트)은 이 모듈만 호출하고, 데이터 소스는 여기서 갈아끼운다.

   - 'jusoKr'         : slick-address-kr (행정안전부 도로명주소 검색 API) — 실시간 자동완성.
                        juso.go.kr 검색 API 키 + 도메인 등록이 필요하다.
                        (NEXT_PUBLIC_JUSO_API_KEY 가 비어 있으면 'localDb' 로 자동 대체)
   - 'localDb' (기본) : 자체 지역 DB(법정동코드) 검색 — 기능정의서 10장 방식. 키가 필요 없다.

   slick-address-kr 는 도로명주소만 돌려주고 좌표는 아직 제공하지 않아(2026-09 기준 로드맵 항목),
   결과의 시군구·읍면동명을 자체 지역 DB(matchRegion)에 대조해 좌표를 보완한다. */
import {
  AddressApiClient,
  JusoApiError,
  type AddressResult,
} from "slick-address-kr";
import {
  matchRegion,
  nearestRegion,
  searchRegions,
  type Region,
} from "./regionDb";

export type AddressProvider = "localDb" | "jusoKr";

export const addressConfig = {
  provider: "localDb" as AddressProvider,
  jusoApiKey: process.env.NEXT_PUBLIC_JUSO_API_KEY || "",
  nominatim: "https://nominatim.openstreetmap.org/reverse",
};

export interface AddressHit {
  id: string;
  /** 화면에 노출하는 라벨 */
  label: string;
  /** 보조 문구 */
  sub: string;
  latitude: number | null;
  longitude: number | null;
  code?: string;
  source: AddressProvider;
  /** 현재 위치로 채운 값인지 */
  current?: boolean;
  /** 역지오코딩 경로 — 'reverse' | 'nearest' */
  via?: string;
}

function fromRegion(r: Region): AddressHit {
  return {
    id: r.id,
    label: r.label,
    sub: r.full,
    latitude: r.latitude,
    longitude: r.longitude,
    code: r.code,
    source: "localDb",
  };
}

export class AddressKeyMissingError extends Error {
  needsKey = true;
  constructor() {
    super("juso.go.kr 검색 API 키가 설정되지 않았습니다.");
  }
}

/* ── provider: slick-address-kr ─────────────────────────── */

let jusoClient: AddressApiClient | null = null;

function getJusoClient(): AddressApiClient {
  if (!addressConfig.jusoApiKey) throw new AddressKeyMissingError();
  if (!jusoClient)
    jusoClient = new AddressApiClient({ apiKey: addressConfig.jusoApiKey });
  return jusoClient;
}

/** codes 가 있으면 건물 단위로, 없으면 도로명주소 문자열로 안정적인 id 를 만든다 */
function jusoResultId(a: AddressResult, index: number): string {
  const c = a.codes;
  return c
    ? `${c.admCd}-${c.rnMgtSn}-${c.buldMnnm}-${c.buldSlno}-${c.udrtYn}`
    : `${a.roadAddress || a.jibunAddress}-${index}`;
}

function fromJuso(a: AddressResult, index: number): AddressHit {
  // 좌표는 아직 API 가 주지 않아, 시군구·읍면동명을 자체 지역 DB에 대조해 근사치로 채운다.
  const region = a.sigungu ? matchRegion(a.sigungu, a.bname || "") : null;
  return {
    id: jusoResultId(a, index),
    label: a.roadAddress || a.jibunAddress,
    sub: a.jibunAddress,
    latitude: region?.latitude ?? null,
    longitude: region?.longitude ?? null,
    source: "jusoKr",
  };
}

async function searchJuso(q: string): Promise<AddressHit[]> {
  const client = getJusoClient();
  try {
    const { results } = await client.search(q, { countPerPage: 20 });
    return results.map(fromJuso);
  } catch (err) {
    if (err instanceof JusoApiError) throw new Error(err.userMessage);
    throw err;
  }
}

/** 지역 검색 — 2자 미만이면 빈 배열. API 키가 없으면 자체 지역 DB로 대체한다. */
export async function searchAddress(q: string): Promise<AddressHit[]> {
  const v = String(q || "").trim();
  if (v.length < 2) return [];
  if (addressConfig.provider === "jusoKr" && addressConfig.jusoApiKey) {
    return searchJuso(v);
  }
  return searchRegions(v, 50).map(fromRegion);
}

/* ── 단말 위치 ─────────────────────────────────────────── */

export interface GeoFailure {
  code: number;
  message?: string;
  insecure: boolean;
}

/** 'granted' | 'prompt' | 'denied' | 'unknown' */
export async function permissionState(): Promise<string> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query)
    return "unknown";
  try {
    const st = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    return st.state;
  } catch {
    return "unknown";
  }
}

/** 브라우저 권한 동의 창을 띄우고 좌표를 받는다 */
export function currentPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
}> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject({
        code: 2,
        insecure: !window.isSecureContext,
        message: "이 브라우저는 위치를 지원하지 않아요.",
      } as GeoFailure);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) =>
        reject({
          code: err.code,
          message: err.message,
          insecure: !window.isSecureContext,
        } as GeoFailure),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}

export class ReverseGeocodeError extends Error {
  reverseFailed = true;
  constructor() {
    super("역지오코딩 실패");
  }
}

/** 지도 API(OpenStreetMap Nominatim)로 조회하고 그 결과를 지역 DB 항목과 맞춘다.
    조회가 실패하면 좌표상 가장 가까운 항목으로 대체한다.
    ※ 회의록 2장대로 백엔드가 역지오코딩을 맡게 되면 이 함수만 API 호출로 바꾼다. */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<AddressHit> {
  let matched: Region | null = null;
  let via = "nearest";

  try {
    const url =
      `${addressConfig.nominatim}?format=jsonv2&zoom=16&addressdetails=1` +
      `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
    const res = await fetch(url, { headers: { "Accept-Language": "ko" } });
    if (!res.ok) throw new Error(`reverse ${res.status}`);
    const json = (await res.json()) as { address?: Record<string, string> };
    const a = json.address || {};
    const sigungu = a.city_district || a.borough || a.county || a.city || "";
    const dong = a.quarter || a.neighbourhood || a.suburb || a.village || "";
    matched = matchRegion(sigungu, dong);
    if (matched) via = "reverse";
  } catch {
    matched = null;
  }

  if (!matched) {
    const near = nearestRegion(lat, lng);
    if (!near) throw new ReverseGeocodeError();
    matched = near.region;
  }

  return { ...fromRegion(matched), via, latitude: lat, longitude: lng };
}
