import { eventStatus, daysUntilStart } from "@/features/wishlist/format";
import { HOME_DUMMY_EVENTS, type HomeDummyEvent } from "./dummyEvents";

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
  // 오픈 예정은 곧 열리는 순서로
  upcoming.sort((a, b) => a.start_date.localeCompare(b.start_date));
  return { ongoing, upcoming };
}
