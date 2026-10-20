import { NextRequest, NextResponse } from "next/server";
import { exitFacilities } from "@/lib/address/exitFacilities";
import { EXIT_LINE_OVERRIDES } from "@/lib/address/exitLineOverrides";
import { lineOf, stationNameOf } from "@/lib/address/kakaoSubway";

const KAKAO_CATEGORY_URL =
  "https://dapi.kakao.com/v2/local/search/category.json";
const KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const KAKAO_COORD2ADDRESS_URL =
  "https://dapi.kakao.com/v2/local/geo/coord2address.json";
const NAVER_REVERSE_GEOCODE_URL =
  "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc";

/** 이 반경 안의 지하철역을 가져온다(m). 환승역의 다른 노선 승강장까지 모으려고 넉넉히 잡고, 화면에서는 더 가까운 거리까지만 역으로 보여 준다. */
const STATION_RADIUS_M = 500;

/** 핀 주변에서 지하철 출구를 찾는 반경(m). 화면에서 출구로 보여 주는 거리(EXIT_SNAP_M)보다 넉넉히 둔다. */
const EXIT_SEARCH_RADIUS_M = 60;

interface KakaoKeywordDocument {
  place_name: string;
  category_name: string;
  x: string;
  y: string;
}

interface KakaoStationDocument {
  place_name: string;
  category_name: string;
  address_name: string;
  road_address_name: string;
  distance: string;
  x: string;
  y: string;
}

interface KakaoCoord2AddressDocument {
  address: {
    address_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
  } | null;
  road_address: { address_name: string; building_name: string } | null;
}

interface NaverArea {
  name: string;
  alias?: string;
}

interface NaverReverseResult {
  name: string;
  region: {
    area1: NaverArea;
    area2: NaverArea;
    area3: NaverArea;
    area4: NaverArea;
  };
  land?: {
    /** 지번 주소에서 "2" 는 산 */
    type?: string;
    number1?: string;
    number2?: string;
    /** 도로명(roadaddr 에서만) */
    name?: string;
    addition0?: { type: string; value: string };
  };
}

export interface PointInfoResponse {
  /** 핀 근처에서 가장 가까운 지하철역. 환승역은 노선을 모아서 한 건으로 준다 */
  station: {
    name: string;
    lines: string[];
    distanceM: number;
    address: string;
    /** 핀에서 가장 가까운 출구. 근처에 출구가 없으면 null */
    exit: {
      number: string;
      /** 출구가 속한 노선(station.lines 중 하나). 알 수 없으면 null */
      line: string | null;
      distanceM: number;
      /** 출구 근처의 주요 시설(KRIC). 자료가 없으면 빈 배열 */
      facilities: string[];
    } | null;
  } | null;
  /** 핀 위치의 주소. 건물이 있으면 건물명도 같이 준다 */
  address: {
    road: string | null;
    jibun: string | null;
    building: string | null;
    /** 법정동(예: "성동구 도선동", "성남시 분당구 삼평동") — 지번 주소의 구·동 */
    region: string | null;
  } | null;
}

/* ── 지하철 출구 ──────────────────────────────────────────────
   카카오는 출구를 "홍대입구역 2호선 9번출구"(category: …> 지하철출구) 라는 별도 장소로 준다.
   핀 좌표 주변 반경 안에서 "지하철출구" 로 한 번 검색하면 가까운 출구가 거리순으로 나온다.

   ※ 카카오 로컬 API 결과는 저장할 수 없고 실시간 호출로만 쓸 수 있다(카카오 정책).
     그래서 출구 목록을 서버에 모아 두거나 캐시하지 않고, 핀 위치마다 이 요청 안에서만 쓰고 버린다. */

interface ParsedExit {
  stationName: string;
  number: string;
  /** "2호선", "공항철도" 같은 노선 꼬리표(없으면 "") */
  lineText: string;
  latitude: number;
  longitude: number;
}

function distanceMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/** "홍대입구역 2호선 9번출구" → { stationName: "홍대입구역", lineText: "2호선", number: "9" } */
function parseExit(doc: KakaoKeywordDocument): ParsedExit | null {
  if (!doc.category_name.includes("지하철출구")) return null;
  const match = doc.place_name.match(/(\d+(?:-\d+)?)\s*번\s*출구/);
  if (!match || match.index === undefined) return null;
  const [stationName, ...rest] = doc.place_name
    .slice(0, match.index)
    .trim()
    .split(/\s+/);
  if (!stationName) return null;
  const latitude = Number(doc.y);
  const longitude = Number(doc.x);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    stationName,
    number: match[1],
    lineText: rest.join(" "),
    latitude,
    longitude,
  };
}

/** 출구가 속한 노선 — 카카오가 적은 노선 꼬리표를 역의 노선 이름에 맞추고, 틀린 것은 표로 바로잡는다 */
function resolveExitLine(
  exit: ParsedExit,
  stationLines: string[],
): string | null {
  const fixed = EXIT_LINE_OVERRIDES[exit.stationName]?.[exit.number];
  if (fixed && stationLines.includes(fixed)) return fixed;
  if (exit.lineText) {
    return (
      stationLines.find(
        (l) => l === exit.lineText || l.endsWith(exit.lineText),
      ) ?? null
    );
  }
  return stationLines.length === 1 ? stationLines[0] : null;
}

type PointAddress = NonNullable<PointInfoResponse["address"]>;

/** 주소 조회 결과 — ok 는 서비스가 정상 응답했는지(결과가 없어도 true), address 는 얻은 주소(없으면 null) */
interface AddressLookup {
  ok: boolean;
  address: PointAddress | null;
}

const join = (...parts: (string | undefined)[]) =>
  parts.filter(Boolean).join(" ");

const landNumber = (r: NaverReverseResult) =>
  r.land?.number2
    ? `${r.land.number1}-${r.land.number2}`
    : (r.land?.number1 ?? "");

/** 네이버 Reverse Geocoding 응답 → 핀 주소. 도로명·지번이 모두 없으면 null */
function parseNaverAddress(results: NaverReverseResult[]): PointAddress | null {
  const roadResult = results.find((r) => r.name === "roadaddr");
  const addrResult = results.find((r) => r.name === "addr");
  const legalResult = results.find((r) => r.name === "legalcode");

  // 도로명 주소는 카카오와 같은 모양("서울특별시 성동구 왕십리로 315")으로 맞춘다
  const road =
    roadResult?.land?.name && roadResult.land.number1
      ? join(
          roadResult.region.area1.name,
          roadResult.region.area2.name,
          roadResult.land.name,
          landNumber(roadResult),
        )
      : null;
  // 지번 주소도 카카오와 같은 모양("서울 성동구 행당동 286-5")
  const jibun = addrResult?.land?.number1
    ? join(
        addrResult.region.area1.alias || addrResult.region.area1.name,
        addrResult.region.area2.name,
        addrResult.region.area3.name,
        addrResult.region.area4.name,
        addrResult.land.type === "2" ? "산" : undefined,
        landNumber(addrResult),
      )
    : null;
  if (!road && !jibun) return null;

  const building =
    roadResult?.land?.addition0?.type === "building"
      ? roadResult.land.addition0.value.trim() || null
      : null;
  const regionSource = legalResult ?? addrResult ?? roadResult;
  const region = regionSource
    ? join(regionSource.region.area2.name, regionSource.region.area3.name) ||
      null
    : null;

  return { road, jibun, building, region };
}

/**
 * 핀 위치의 주소를 네이버 Reverse Geocoding 으로 조회한다(지도와 같은 회사 데이터라 도로명·건물명이 더 잘 나온다).
 * 키가 없거나 호출이 실패하면 ok 가 false — 호출하는 쪽에서 카카오로 대신한다.
 */
async function fetchNaverAddress(
  lat: number,
  lng: number,
): Promise<AddressLookup> {
  const keyId = process.env.NAVER_MAPS_API_KEY_ID;
  const key = process.env.NAVER_MAPS_API_KEY;
  if (!keyId || !key) return { ok: false, address: null };
  try {
    const res = await fetch(
      `${NAVER_REVERSE_GEOCODE_URL}?${new URLSearchParams({
        // 네이버 좌표 파라미터는 "경도,위도"
        coords: `${lng},${lat}`,
        orders: "roadaddr,addr,legalcode",
        output: "json",
      })}`,
      {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": keyId,
          "X-NCP-APIGW-API-KEY": key,
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return { ok: false, address: null };
    const json = (await res.json()) as {
      status?: { code?: number };
      results?: NaverReverseResult[];
    };
    // 3 = 결과 없음(한국 밖·바다). 오류가 아니라 "주소가 없다"는 정상 응답이다.
    if (json.status?.code === 3) return { ok: true, address: null };
    if (json.status?.code !== 0) return { ok: false, address: null };
    return { ok: true, address: parseNaverAddress(json.results ?? []) };
  } catch {
    return { ok: false, address: null };
  }
}

/** 카카오 좌표→주소 — 네이버 조회가 안 될 때의 대체 경로 */
async function fetchKakaoAddress(
  point: { x: string; y: string },
  headers: Record<string, string>,
): Promise<AddressLookup> {
  try {
    const res = await fetch(
      `${KAKAO_COORD2ADDRESS_URL}?${new URLSearchParams(point)}`,
      { headers, cache: "no-store" },
    );
    if (!res.ok) return { ok: false, address: null };
    const json = (await res.json()) as {
      documents?: KakaoCoord2AddressDocument[];
    };
    const doc = json.documents?.[0];
    if (!doc || (!doc.road_address && !doc.address)) {
      return { ok: true, address: null };
    }
    return {
      ok: true,
      address: {
        road: doc.road_address?.address_name || null,
        jibun: doc.address?.address_name || null,
        building: doc.road_address?.building_name?.trim() || null,
        region:
          [doc.address?.region_2depth_name, doc.address?.region_3depth_name]
            .filter(Boolean)
            .join(" ") || null,
      },
    };
  } catch {
    return { ok: false, address: null };
  }
}

/**
 * 지도 핀 위치를 설명하는 정보(가까운 지하철역·출구, 도로명·지번 주소, 건물명)를 돌려준다.
 * 카카오 REST API 키를 브라우저에 노출하지 않으려고 BFF 에서 호출한다.
 */
export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return NextResponse.json(
      { error: "INVALID_COORDINATE", station: null, address: null },
      { status: 400 },
    );
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) {
    return NextResponse.json(
      { error: "KAKAO_REST_API_KEY_MISSING", station: null, address: null },
      { status: 503 },
    );
  }

  const headers = { Authorization: `KakaoAK ${restApiKey}` };
  // 카카오 좌표 파라미터는 x=경도, y=위도
  const point = { x: String(lng), y: String(lat) };

  const stationRequest = fetch(
    `${KAKAO_CATEGORY_URL}?${new URLSearchParams({
      ...point,
      category_group_code: "SW8",
      radius: String(STATION_RADIUS_M),
      sort: "distance",
      size: "15",
    })}`,
    { headers, cache: "no-store" },
  );
  const exitRequest = fetch(
    `${KAKAO_KEYWORD_URL}?${new URLSearchParams({
      ...point,
      query: "지하철출구",
      radius: String(EXIT_SEARCH_RADIUS_M),
      sort: "distance",
      size: "15",
    })}`,
    { headers, cache: "no-store" },
  );

  const [stationResult, exitResult, naverResult] = await Promise.allSettled([
    stationRequest.then(async (res) =>
      res.ok
        ? ((await res.json()) as { documents: KakaoStationDocument[] })
        : null,
    ),
    exitRequest.then(async (res) =>
      res.ok
        ? ((await res.json()) as { documents: KakaoKeywordDocument[] })
        : null,
    ),
    fetchNaverAddress(lat, lng),
  ]);

  const stationPayload =
    stationResult.status === "fulfilled" ? stationResult.value : null;
  const exitPayload =
    exitResult.status === "fulfilled" ? exitResult.value : null;

  // 주소는 네이버를 먼저 쓰고, 못 얻으면(키 없음·오류·결과 없음) 카카오로 대신한다
  let lookup: AddressLookup =
    naverResult.status === "fulfilled"
      ? naverResult.value
      : { ok: false, address: null };
  if (!lookup.address) {
    const kakao = await fetchKakaoAddress(point, headers);
    lookup = { ok: lookup.ok || kakao.ok, address: kakao.address };
  }
  const address = lookup.address;

  // 역·주소 조회가 모두 실패하면 클라이언트가 재시도할 수 있게 오류로 돌려준다
  if (!stationPayload && !lookup.ok) {
    return NextResponse.json(
      { error: "LOCAL_API_UNAVAILABLE", station: null, address: null },
      { status: 502 },
    );
  }

  let station: PointInfoResponse["station"] = null;
  const docs = stationPayload?.documents ?? [];
  if (docs.length > 0) {
    // 거리순이라 첫 건이 가장 가까운 역이다. 같은 역의 다른 노선 승강장은 노선만 모은다.
    const first = docs[0];
    const name = stationNameOf(first.place_name, lineOf(first.category_name));
    const lines: string[] = [];
    for (const doc of docs) {
      const line = lineOf(doc.category_name);
      if (stationNameOf(doc.place_name, line) !== name || !line) continue;
      if (!lines.includes(line)) lines.push(line);
    }

    const stationAddress = first.road_address_name || first.address_name;

    // 이 역의 출구 중 핀에서 가장 가까운 것
    let exit: NonNullable<PointInfoResponse["station"]>["exit"] = null;
    let nearestM = Infinity;
    for (const doc of exitPayload?.documents ?? []) {
      const parsed = parseExit(doc);
      if (!parsed || parsed.stationName !== name) continue;
      const d = distanceMeters(lat, lng, parsed.latitude, parsed.longitude);
      if (d < nearestM) {
        nearestM = d;
        exit = {
          number: parsed.number,
          line: resolveExitLine(parsed, lines),
          distanceM: Math.round(d),
          facilities: exitFacilities(name, parsed.number, stationAddress),
        };
      }
    }

    station = {
      name,
      lines,
      distanceM: Math.round(Number(first.distance) || 0),
      address: stationAddress,
      exit,
    };
  }

  return NextResponse.json({ station, address } satisfies PointInfoResponse);
}
