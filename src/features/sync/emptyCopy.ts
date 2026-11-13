import type { SyncResult } from "@/types/api";

/* 좋아요 영상 불러오기가 "찾은 게 없음"으로 끝났을 때의 안내 문구.
   같은 "0건"이어도 사용자가 할 일이 달라서 세 가지로 나눈다.
   - no-liked     YouTube 에서 가져온 좋아요 영상이 0개 → 좋아요를 눌러 달라고 안내
   - no-eligible  영상은 가져왔지만 분석할 수 있는 영상이 0개 → BE 가 3분 이하 공개 영상만 분석한다
   - no-places    그 밖에(분석은 했는데 장소가 0곳이거나, 영상 수를 BE 가 안 알려 줄 때) → 예전 문구
   영상 수(fetchedCount)는 BE v3 만 알려 준다. 모르면 no-places 로 둔다. */

export type SyncEmptyKind = "no-liked" | "no-eligible" | "no-places";

export interface SyncEmptyCopy {
  kind: SyncEmptyKind;
  /** 홈 카드 배지 */
  badge: string;
  /** 홈 카드 제목(마침표 포함) */
  title: string;
  /** 홈 카드 설명 · 토스트 본문 */
  msg: string;
  /** 토스트 제목(마침표 없음) */
  toastTitle: string;
}

const RETRY_HINT = "장소가 나오는 쇼츠에 좋아요를 누른 뒤 다시 불러와 보세요.";

export function syncEmptyKind(result: SyncResult | null): SyncEmptyKind {
  const fetched = result?.fetchedCount;
  if (fetched === 0) return "no-liked";
  if (fetched != null && fetched > 0 && result?.videoCount === 0)
    return "no-eligible";
  return "no-places";
}

export function syncEmptyCopy(result: SyncResult | null): SyncEmptyCopy {
  const kind = syncEmptyKind(result);
  if (kind === "no-liked") {
    return {
      kind,
      badge: "좋아요한 영상 없음",
      title: "좋아요한 영상이 없어요.",
      msg: `유튜브에서 ${RETRY_HINT}`,
      toastTitle: "좋아요한 영상이 없어요",
    };
  }
  if (kind === "no-eligible") {
    return {
      kind,
      badge: "분석할 영상 없음",
      title: "분석할 수 있는 영상이 없어요.",
      msg: `좋아요한 영상 ${result?.fetchedCount}개를 찾았지만, 3분 이하의 공개 영상만 분석할 수 있어요.`,
      toastTitle: "분석할 수 있는 영상이 없어요",
    };
  }
  return {
    kind,
    badge: "찾은 장소 없음",
    title: "좋아요 영상에서 장소를 찾지 못했어요.",
    msg: RETRY_HINT,
    toastTitle: "찾은 장소가 없어요",
  };
}
