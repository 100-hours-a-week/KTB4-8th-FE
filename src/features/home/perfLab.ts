import { useMemo, useSyncExternalStore } from "react";
import type { HomeDummyPlace } from "./dummyPlaces";

/* 성능 측정용 스위치 — 요즘 뜨는 곳 전체보기(/home/places)에 가짜 장소를 대량으로 넣고,
   스크롤 가상화를 켜고 끄며 같은 빌드에서 비교한다.
   빌드할 때 NEXT_PUBLIC_PERF_LAB=on 일 때만 켜진다. 꺼져 있으면 주소창의 ?n= · ?virt= 를 읽지 않아서 실서비스는 늘 실제 장소 · 가상화 켬이다.
     ?n=5000      가짜 장소 5,000곳(최대 20,000)
     ?virt=off    가상화를 끄고 지금처럼 전부 그린다 */

export const PERF_LAB = process.env.NEXT_PUBLIC_PERF_LAB === "on";

const MAX_COUNT = 20_000;

const CATEGORIES = [
  "맛집",
  "맛집",
  "맛집",
  "카페,디저트",
  "카페",
  "전시",
  "기타",
];
const REGIONS = [
  "서울특별시 중구",
  "서울특별시 마포구",
  "서울특별시 종로구",
  "서울특별시 용산구",
  "서울특별시 성동구",
  "경기도 성남시",
];
/** 이름 길이를 섞어서 카드 높이가 제각각이 되게 한다(제목이 두 줄로 넘어가는 경우 포함) */
const SUFFIXES = [
  "",
  "",
  "",
  " 본점",
  " 신사점",
  " 시청 앞 플래그십 스토어 별관",
];

/** 같은 n 이면 늘 같은 결과 — 측정이 흔들리지 않게 무작위 값을 쓰지 않는다. 사진 주소는 넣지 않아 분류 색 + 이모지 타일이 나온다 */
export function makePerfPlaces(n: number): HomeDummyPlace[] {
  return Array.from({ length: n }, (_, i) => {
    const region = REGIONS[i % REGIONS.length];
    return {
      id: `perf-place-${i}`,
      name: `테스트 장소 ${i + 1}${SUFFIXES[i % SUFFIXES.length]}`,
      category: CATEGORIES[i % CATEGORIES.length],
      description: "성능 측정용 가짜 장소예요.",
      address_sg: region,
      address_road: `${region} 테스트로 ${(i % 200) + 1}`,
      naver_place_id: "",
      video_ids: [],
      extra: {},
    };
  });
}

const subscribeNothing = () => () => {};

/** 주소창의 ?n= · ?virt= 를 읽는다. 서버에서 그릴 때와 측정 빌드가 아닐 때는 기본값(실제 장소 · 가상화 켬)이다 */
export function usePerfLab(): { count: number | null; virtual: boolean } {
  const search = useSyncExternalStore(
    subscribeNothing,
    () => (PERF_LAB ? window.location.search : ""),
    () => "",
  );
  return useMemo(() => {
    if (!PERF_LAB) return { count: null, virtual: true };
    const params = new URLSearchParams(search);
    const n = Number(params.get("n"));
    return {
      count: Number.isInteger(n) && n > 0 ? Math.min(n, MAX_COUNT) : null,
      virtual: params.get("virt") !== "off",
    };
  }, [search]);
}
