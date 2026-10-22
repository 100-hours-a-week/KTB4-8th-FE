import type { SyncResult } from "@/types/api";

/* 마지막 좋아요 영상 불러오기 결과 — 홈을 떠났다 돌아와도 "정리했어요" 카드를 다시 보여 주려고 이 브라우저(localStorage)에 남긴다.
   홈 화면의 상태는 화면 안에만 있어서, 저장해 두지 않으면 다른 페이지에 갔다 오는 순간 "아직 저장된 장소가 없어요" 첫 화면으로 돌아간다.
   결과 카드를 닫으면(dismissed) 그 뒤로는 카드를 보여 주지 않는다. 새로 불러오기를 끝내면 다시 보인다. */

const KEY = "keepgo.sync.last.v1";

export interface LastSync {
  state: "done" | "empty";
  result: SyncResult | null;
  dismissed: boolean;
}

export function loadLastSync(): LastSync | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LastSync>;
    if (value.state !== "done" && value.state !== "empty") return null;
    return {
      state: value.state,
      result: value.result ?? null,
      dismissed: !!value.dismissed,
    };
  } catch {
    return null;
  }
}

export function saveLastSync(state: LastSync["state"], result: SyncResult) {
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ state, result, dismissed: false }),
    );
  } catch {
    /* 저장소를 못 써도 이번 방문 동안은 화면 상태로 동작한다 */
  }
}

/** 결과 카드를 닫았다고 남긴다. 저장된 결과가 없던 경우(서버 보관함을 보고 띄운 카드)에도 닫은 기록을 만든다. */
export function dismissLastSync(
  state: LastSync["state"],
  result: SyncResult | null,
) {
  const last = loadLastSync();
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        state: last?.state ?? state,
        result: last?.result ?? result,
        dismissed: true,
      }),
    );
  } catch {
    /* 무시 */
  }
}
