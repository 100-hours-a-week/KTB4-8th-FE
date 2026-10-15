import { LEGAL_DONG_META, LEGAL_DONG_ROWS } from "./legalDongData";

/* 행정표준코드관리시스템 "법정동 코드 전체자료" 기반 지역 검색 DB.
   원본에는 좌표가 없으므로 일반 검색 결과 좌표는 null이며,
   현재 위치 역지오코딩 실패 시에만 GEO_ANCHORS를 보조로 사용한다. */
export interface Region {
  id: string;
  sido: string;
  sigungu: string;
  dong: string;
  code: string;
  latitude: number | null;
  longitude: number | null;
  label: string;
  full: string;
}

interface IndexedRegion extends Region {
  shortSido: string;
  dongKey: string;
  sigunguKey: string;
  locationKey: string;
  fullKey: string;
}

type GeoAnchor = [string, string, string, number, number];
const GEO_ANCHORS: GeoAnchor[] = [
  ["서울특별시", "성동구", "성수동1가", 37.5445, 127.0557],
  ["서울특별시", "마포구", "서교동", 37.5533, 126.921],
  ["서울특별시", "용산구", "이태원동", 37.5345, 126.9946],
  ["경기도", "수원시 팔달구", "인계동", 37.265, 127.031],
  ["경기도", "성남시 분당구", "정자동", 37.367, 127.108],
  ["인천광역시", "연수구", "송도동", 37.383, 126.656],
  ["부산광역시", "해운대구", "우동", 35.163, 129.137],
  ["대구광역시", "수성구", "범어동", 35.857, 128.623],
  ["대전광역시", "서구", "둔산동", 36.351, 127.384],
  ["광주광역시", "동구", "충장로1가", 35.149, 126.915],
  ["울산광역시", "남구", "삼산동", 35.539, 129.338],
  ["강원특별자치도", "강릉시", "교동", 37.766, 128.897],
  ["경상북도", "경주시", "황남동", 35.833, 129.213],
  ["전북특별자치도", "전주시 완산구", "풍남동1가", 35.815, 127.15],
  ["전라남도", "여수시", "중앙동", 34.74, 127.739],
  ["충청남도", "천안시 동남구", "신부동", 36.818, 127.154],
  ["충청북도", "청주시 상당구", "북문로1가", 36.638, 127.49],
  ["제주특별자치도", "제주시", "연동", 33.487, 126.49],
];

const norm = (value: string) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const SIDO_SHORT: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  전남광주통합특별시: "광주전남",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

function createRegion([code, full]: readonly [string, string]): IndexedRegion {
  const parts = full.split(/\s+/);
  const sido = parts[0];
  const dong = parts.at(-1) || "";
  const sigungu = parts.slice(1, -1).join(" ");
  const shortSido = SIDO_SHORT[sido] || sido;
  return {
    id: code,
    code,
    sido,
    sigungu,
    dong,
    label: `${sigungu || sido} ${dong}`,
    full,
    latitude: null,
    longitude: null,
    shortSido,
    dongKey: norm(dong),
    sigunguKey: norm(sigungu),
    locationKey: norm(`${shortSido} ${sigungu} ${dong}`),
    fullKey: norm(full),
  };
}

const INDEXED_REGIONS: IndexedRegion[] = LEGAL_DONG_ROWS.map(createRegion);
export const REGIONS: Region[] = INDEXED_REGIONS;
export const REGION_DB_META = LEGAL_DONG_META;

type SearchHit = { region: IndexedRegion; rank: number };

/** 같은 이름의 시군구가 여러 시도에 있으면 한 지역이 결과 상한을 독점하지 않게 섞는다. */
function interleaveJurisdictions(hits: SearchHit[]): SearchHit[] {
  const groups = new Map<string, SearchHit[]>();
  for (const hit of hits) {
    const groupKey = `${hit.region.sido}|${hit.region.sigungu}`;
    const group = groups.get(groupKey) || [];
    group.push(hit);
    groups.set(groupKey, group);
  }
  if (groups.size < 2) return hits;

  const queues = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ko"))
    .map(([, group]) => group);
  const mixed: SearchHit[] = [];
  for (let index = 0; mixed.length < hits.length; index += 1) {
    for (const queue of queues) {
      if (queue[index]) mixed.push(queue[index]);
    }
  }
  return mixed;
}

/** 2자 이상 입력 시 시군구·읍면동을 검색한다. */
export function searchRegions(q: string, limit = 50): Region[] {
  const key = norm(q);
  if (key.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const region of INDEXED_REGIONS) {
    let rank = -1;
    if (region.dongKey === key) rank = 0;
    else if (region.dongKey.startsWith(key)) rank = 1;
    else if (region.sigunguKey === key) rank = 2;
    else if (
      region.locationKey.startsWith(key) ||
      region.sigunguKey.startsWith(key)
    )
      rank = 3;
    else if (region.dongKey.includes(key)) rank = 4;
    else if (region.locationKey.includes(key) || region.fullKey.includes(key))
      rank = 5;
    if (rank >= 0) hits.push({ region, rank });
  }
  hits.sort(
    (a, b) =>
      a.rank - b.rank || a.region.full.localeCompare(b.region.full, "ko"),
  );

  const ordered: SearchHit[] = [];
  for (let rank = 0; rank <= 5; rank += 1) {
    const sameRank = hits.filter((hit) => hit.rank === rank);
    ordered.push(
      ...(rank === 2 || rank === 3
        ? interleaveJurisdictions(sameRank)
        : sameRank),
    );
  }

  const hasDuplicateJurisdictions =
    new Set(ordered.map(({ region }) => `${region.sido}|${region.sigungu}`))
      .size > 1;

  return ordered.slice(0, limit).map(({ region }) => {
    const queryIncludesSido = key.startsWith(norm(region.shortSido));
    return hasDuplicateJurisdictions || queryIncludesSido
      ? { ...region, label: `${region.shortSido} ${region.label}` }
      : region;
  });
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = (aLat - bLat) * 111;
  const dLng = (aLng - bLng) * 88;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

export function nearestRegion(lat: number, lng: number) {
  let best: Region | null = null;
  let bestDistance = Infinity;
  for (const [, sigungu, dong, anchorLat, anchorLng] of GEO_ANCHORS) {
    const distance = distanceKm(lat, lng, anchorLat, anchorLng);
    if (distance >= bestDistance) continue;
    const region = matchRegion(sigungu, dong);
    if (!region) continue;
    bestDistance = distance;
    best = { ...region, latitude: anchorLat, longitude: anchorLng };
  }
  return best ? { region: best, distanceKm: bestDistance } : null;
}

export function matchRegion(sigungu: string, dong: string): Region | null {
  const guKey = norm(sigungu);
  const dongKey = norm(dong);
  let hit = INDEXED_REGIONS.find(
    (region) =>
      region.dongKey === dongKey &&
      (!guKey || region.sigunguKey.includes(guKey)),
  );
  if (!hit && dongKey)
    hit = INDEXED_REGIONS.find((region) => region.dongKey.startsWith(dongKey));
  if (!hit && guKey)
    hit = INDEXED_REGIONS.find((region) => region.sigunguKey.includes(guKey));
  return hit || null;
}
