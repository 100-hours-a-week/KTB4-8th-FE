import { eventStatus, daysUntilStart } from "@/features/wishlist/format";
import { HOME_DUMMY_EVENTS, type HomeDummyEvent } from "./dummyEvents";

/** 진행 중 이벤트 중 항상 맨 앞에 보여 줄 이벤트(이 순서대로) */
const PINNED_IDS = [
  "home-everland-bloodcity",
  "home-lotte-strange-world",
  "home-folk-ghostplay",
];

/** 종료일 순서값 — 종료일이 없는(상시 운영) 이벤트는 맨 뒤 */
function endKey(end: string): string {
  return end ? end.slice(0, 10) : "9999-12-31";
}

/** 진행 중 이벤트의 보여 줄 순서 — ① 고정 이벤트(에버랜드 · 롯데월드 · 한국민속촌) ② 나머지는 마감이 가까운 순 */
function compareOngoing(a: HomeDummyEvent, b: HomeDummyEvent): number {
  const pa = PINNED_IDS.indexOf(a.id);
  const pb = PINNED_IDS.indexOf(b.id);
  if (pa >= 0 || pb >= 0) {
    if (pa < 0) return 1;
    if (pb < 0) return -1;
    return pa - pb;
  }
  return endKey(a.end_date).localeCompare(endKey(b.end_date));
}

/** 홈 이벤트 더미를 오늘 기준으로 나눈다 — 진행 중 / 오픈 예정. 기간이 끝난 이벤트는 넣지 않는다. */
export function splitHomeEvents(now = new Date()): {
  ongoing: HomeDummyEvent[];
  upcoming: HomeDummyEvent[];
} {
  const ongoing: HomeDummyEvent[] = [];
  const upcoming: HomeDummyEvent[] = [];
  for (const e of HOME_DUMMY_EVENTS) {
    if (eventStatus(e.start_date, e.end_date, now) === "ended") continue;
    if (daysUntilStart(e.start_date, now) !== null) upcoming.push(e);
    else ongoing.push(e);
  }
  // 진행 중은 고정 이벤트 → 마감 임박순으로(마감일이 같으면 원래 순서 유지 — sort 는 안정 정렬)
  ongoing.sort(compareOngoing);
  // 오픈 예정은 곧 열리는 순서로
  upcoming.sort((a, b) => a.start_date.localeCompare(b.start_date));
  return { ongoing, upcoming };
}
