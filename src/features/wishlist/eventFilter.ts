import { CATEGORY_EMOJI, CATEGORY_LABEL } from "@/lib/constants";
import { eventStatus } from "./format";
import { splitCategories } from "./format";

/* 보관함 이벤트 탭의 필터 — 진행 상태(전체/진행중/종료) + 카테고리 + 지역(시·도 → 구·군).
   BE 가 아직 이벤트를 분류하지 않아서, 어떤 분류가 이벤트인지와 지역 구분은 FE 에서 직접 한다. */

/** 이벤트로 보는 분류. 산책에는 한강공원 축제 같은 야외 행사도 넣는다. BE 가 분류를 내려주면 걷어낸다. */
export const EVENT_CATEGORIES = [
  { label: "팝업", emoji: "🎟️" },
  { label: "전시", emoji: "🖼️" },
  { label: "공연", emoji: "🎤" },
  { label: "산책", emoji: "🌿" },
  { label: "레저·스포츠", emoji: "🏟️" },
  { label: "축제", emoji: "🎉" },
] as const;

export type StatusFilter = "ALL" | "ONGOING" | "ENDED";

export interface EventFilter {
  status: StatusFilter;
  category: string | null;
  sido: string | null;
  gu: string | null;
}

export const NO_FILTER: EventFilter = {
  status: "ALL",
  category: null,
  sido: null,
  gu: null,
};

const SIDO_SHORT: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전북",
  전라북도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

/** "서울특별시 성동구" · "서울 성동구" → { sido: "서울", gu: "성동구" } */
export function splitRegion(text: string | null | undefined): {
  sido: string;
  gu: string;
} {
  const [first = "", second = ""] = (text ?? "").trim().split(/\s+/);
  return { sido: SIDO_SHORT[first] ?? first, gu: second };
}

/** 필터가 보는 이벤트 한 건의 사실들 */
export interface EventFacts {
  categories: string[];
  sido: string;
  gu: string;
  ended: boolean;
}

export function eventFacts(
  category: string | null | undefined,
  address: string | null | undefined,
  start: string | null | undefined,
  end: string | null | undefined,
): EventFacts {
  return {
    categories: splitCategories(category),
    ...splitRegion(address),
    ended: eventStatus(start, end) === "ended",
  };
}

/** 장소 탭의 필터가 보는 장소 한 건의 사실들 — 이벤트 필터와 같은 모양이라 상태(진행중 · 종료)만 늘 "끝나지 않음"으로 둔다 */
export function placeFacts(
  category: string | null | undefined,
  address: string | null | undefined,
): EventFacts {
  return {
    categories: splitCategories(category),
    ...splitRegion(address),
    ended: false,
  };
}

/** 코스 탭의 필터가 보는 코스 한 건의 사실들 — 분류는 없고 지역만 있다.
    코스의 area 는 "서울 성동구"처럼 시·도가 붙어 오기도 하고 "성동구 성수동"처럼 구부터 오기도 한다.
    시·도가 없으면 서울(서비스 지역)로 본다. */
export function courseFacts(area: string | null | undefined): EventFacts {
  const [first = ""] = (area ?? "").trim().split(/\s+/);
  const hasSido =
    first in SIDO_SHORT || Object.values(SIDO_SHORT).includes(first);
  const region = hasSido ? splitRegion(area) : { sido: "서울", gu: first };
  return { categories: [], ...region, ended: false };
}

/** 분류 이름 → 이모지(온보딩 분류 + 이벤트 분류) */
const EMOJI_BY_LABEL: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(CATEGORY_LABEL).map(([key, label]) => [
      label,
      CATEGORY_EMOJI[key as keyof typeof CATEGORY_EMOJI],
    ]),
  ),
  ...Object.fromEntries(EVENT_CATEGORIES.map((c) => [c.label, c.emoji])),
};

export interface CategoryOption {
  label: string;
  emoji?: string;
}

/** 보관한 장소에 있는 분류만 모은다 — 온보딩 분류 순서를 먼저, 그 밖의 분류는 그 뒤에 */
export function placeCategoryOptions(facts: EventFacts[]): CategoryOption[] {
  const present = new Set(facts.flatMap((f) => f.categories));
  const order = Object.values(CATEGORY_LABEL);
  const known = order.filter((label) => present.has(label));
  const others = [...present].filter((label) => !order.includes(label));
  return [...known, ...others].map((label) => ({
    label,
    emoji: EMOJI_BY_LABEL[label],
  }));
}

/** 진행중은 아직 끝나지 않은 이벤트(시작 전 포함) */
export function matchesEvent(f: EventFacts, filter: EventFilter): boolean {
  if (filter.status === "ONGOING" && f.ended) return false;
  if (filter.status === "ENDED" && !f.ended) return false;
  if (filter.category && !f.categories.includes(filter.category)) return false;
  if (filter.sido && f.sido !== filter.sido) return false;
  if (filter.gu && f.gu !== filter.gu) return false;
  return true;
}

/** 필터 버튼에 보이는 글자 — "팝업 · 성동구". 고른 게 없으면 빈 문자열 */
export function filterLabel(filter: EventFilter): string {
  return [filter.category, filter.gu ?? filter.sido]
    .filter(Boolean)
    .join(" · ");
}

export interface RegionOption {
  sido: string;
  count: number;
  gus: { gu: string; count: number }[];
}

/** 보관한 이벤트에 있는 지역만 시·도별로 모은다(많은 순) */
export function regionOptions(facts: EventFacts[]): RegionOption[] {
  const bySido = new Map<string, Map<string, number>>();
  for (const f of facts) {
    if (!f.sido) continue;
    const gus = bySido.get(f.sido) ?? new Map<string, number>();
    gus.set(f.gu, (gus.get(f.gu) ?? 0) + 1);
    bySido.set(f.sido, gus);
  }
  const byCount = <T extends { count: number }>(a: T, b: T) =>
    b.count - a.count;
  return [...bySido.entries()]
    .map(([sido, gus]) => ({
      sido,
      count: [...gus.values()].reduce((a, b) => a + b, 0),
      gus: [...gus.entries()]
        .filter(([gu]) => gu)
        .map(([gu, count]) => ({ gu, count }))
        .sort(byCount),
    }))
    .sort(byCount);
}
