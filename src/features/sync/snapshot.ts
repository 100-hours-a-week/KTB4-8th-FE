import { apiV2 } from "@/lib/api/client";
import type {
  WishlistEventList,
  WishlistPlaceList,
} from "@/features/wishlist/types";

/* 보관함에 담긴 장소 · 이벤트의 키 목록 — 불러오기 전후를 견줘서 "새로 담긴" 개수를 센다.
   BE 가 동기화 응답에 담긴 개수를 주지 않아서 목록을 직접 비교한다.
   한 쪽에 몇 개를 주는지는 BE 가 정한다(지금은 10개). BE 가 최신순(담은 시각 내림차순)으로 주므로 새로 담긴 항목은 항상 앞쪽에 오고,
   그래서 너무 큰 보관함에서 오래 걸리지 않게 종류별로 앞쪽 MAX_PAGES 쪽까지만 봐도 늘어난 항목을 센다. */

const MAX_PAGES = 12;

async function collect<T>(
  path: string,
  pick: (page: T) => { keys: string[]; next: string | null },
): Promise<string[]> {
  const out: string[] = [];
  let cursor = "";
  for (let i = 0; i < MAX_PAGES; i++) {
    const { data } = await apiV2.get<T>(path, { cursor });
    const { keys, next } = pick(data);
    out.push(...keys);
    if (!next) break;
    cursor = next;
  }
  return out;
}

/** 못 읽으면(API 오류 등) null — 호출한 쪽은 "개수를 모른다"로 본다 */
export async function snapshotSavedKeys(): Promise<Set<string> | null> {
  try {
    const [places, events] = await Promise.all([
      collect<WishlistPlaceList>("/outing-wishlist/places", (d) => ({
        keys: (d.places ?? []).map((p) => `place:${p.place_id}`),
        next: d.next_cursor,
      })),
      collect<WishlistEventList>("/outing-wishlist/events", (d) => ({
        keys: (d.events ?? []).map((e) => `event:${e.event_id}`),
        next: d.next_cursor,
      })),
    ]);
    return new Set([...places, ...events]);
  } catch {
    return null;
  }
}
