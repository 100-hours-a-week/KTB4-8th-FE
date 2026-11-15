"use client";

import { create } from "zustand";
import { toast, useToastStore } from "@/components/ui/Toast";
import {
  CHAT_V2,
  SYNC_PROGRESS_DUMMY,
  SYNC_V3,
  WISHLIST_V2,
} from "@/lib/constants";
import { sleep } from "@/lib/format";
import { isHomePath } from "@/lib/routes";
import type { SyncResult } from "@/types/api";
import { dismissLastSync, saveLastSync, type LastSync } from "./lastResult";
import {
  countNewItems,
  describeAddedObject,
  useNewItemsStore,
} from "./newItems";
import { snapshotSavedKeys } from "./snapshot";
import {
  FINISH_TOTAL_MS,
  MIN_PROGRESS_MS,
  parseSyncDemo,
  simulateSync,
  type SyncDemoMode,
} from "./progress";
import {
  hasNoSavedGuides,
  isSyncStillRunning,
  requestYoutubeSync,
} from "./queries";
import {
  isSyncV3Unavailable,
  requestYoutubeSyncStream,
  SyncStreamError,
  type LiveSyncProgress,
} from "./syncV3";

/* 좋아요 영상 불러오기(동기화)의 앱 전체 상태.
   예전에는 홈 화면 · 마이페이지가 각자 useState 로 들고 있어서, 다른 탭에 다녀오면 진행 상태가 사라지고
   "불러오기" 버튼이 다시 떴다(그 상태로 또 누르면 요청이 한 번 더 갔다). 그래서 화면 밖(이 스토어)에 둔다.
   - 진행 중에는 start() 가 새 요청을 보내지 않는다(중복 요청 방지).
   - 진행 중이라는 사실은 새로고침 뒤에도 잠깐 유지한다 — 요청은 브라우저가 끊겨도 BE 가 이어 가므로,
     BE 의 게이트웨이 제한 시간(120초) 안에는 "분석 중"으로 복원하고 버튼을 막는다. */

export type SyncStatus =
  "idle" | "pending" | "done" | "empty" | "slow" | "failed";

type Finished = "done" | "empty" | "slow" | "failed";

/** 실패 원인 — BE v3 가 알려 준 경우에만 값이 있다(그 밖에는 일반 실패 문구) */
export type SyncFailReason = "reauth" | "busy" | null;

function failReasonOf(err: unknown): SyncFailReason {
  if (!(err instanceof SyncStreamError)) return null;
  if (
    err.reason === "YOUTUBE_REAUTHORIZATION_REQUIRED" ||
    err.reason === "YOUTUBE_NOT_CONNECTED"
  )
    return "reauth";
  if (err.reason === "SYNC_BUSY") return "busy";
  return null;
}

/** 새로고침 뒤에도 "분석 중"으로 보는 시간 — nginx proxy_read_timeout 과 같다 */
export const SYNC_PENDING_TTL_MS = 120_000;

const PENDING_KEY = "keepgo.sync.pending.v1";

function loadPendingSince(): number | null {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    const since = raw ? Number(JSON.parse(raw)?.startedAt) : NaN;
    return Number.isFinite(since) ? since : null;
  } catch {
    return null;
  }
}

function savePendingSince(startedAt: number) {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify({ startedAt }));
  } catch {
    /* 저장소를 못 써도 이번 방문 동안은 화면 상태로 동작한다 */
  }
}

function clearPending() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* 무시 */
  }
}

/** 새로고침 · 탭 닫기로 페이지가 내려가는 중인지 — 이때는 진행 중이던 요청이 끊겨 오류로 끝나는데,
    그 오류를 "실패"로 처리하면 저장해 둔 "분석 중" 표시가 지워진다. BE 는 요청이 끊겨도 분석을 이어 간다. */
let unloading = false;
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    unloading = true;
  });
  // 뒤로 가기 캐시에서 되살아난 페이지는 다시 정상 상태다
  window.addEventListener("pageshow", () => {
    unloading = false;
  });
}

/** 개발용 토큰으로 로그인한 로컬 계정은 유튜브 연동이 없어 실제 동기화가 늘 실패한다 —
    진행률 더미가 켜져 있으면 BE 를 부르지 않고 가짜로 끝까지 진행시킨다(?syncDemo= 로 실패 · 빈 결과도 볼 수 있다). */
export function defaultSyncDemo(): SyncDemoMode | null {
  return (
    parseSyncDemo(
      new URLSearchParams(window.location.search).get("syncDemo"),
    ) ??
    (SYNC_PROGRESS_DUMMY && process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN
      ? "done"
      : null)
  );
}

const onHome = () => isHomePath(window.location.pathname);

/** 홈이 아닌 화면에 남기는 결과 막대의 내용 — 닫거나 홈으로 가기 전까지 보여 준다(토스트는 5초 만에 사라져 놓치기 쉽다) */
export interface SyncBar {
  state: Finished;
  result: SyncResult | null;
  reason: SyncFailReason;
}

/** 끝났을 때의 안내. 홈에서는 위쪽 카드가 결과를 보여 주므로 막대를 띄우지 않는다(완료 토스트만 예외).
    그 밖의 화면에서는 결과 막대를 남긴다. */
function notifyFinished(
  result: Finished,
  summary: SyncResult | null = null,
  reason: SyncFailReason = null,
  startToastId?: number,
) {
  if (onHome()) {
    if (result !== "done") return;
    // 새로 담긴 개수를 셀 수 있었다면 개수로 알려 준다(못 셌으면 일반 문구)
    const places = summary?.addedPlaces;
    const events = summary?.addedEvents;
    const counted = places != null && events != null;
    const added = counted ? describeAddedObject(places, events) : "";
    toast.ok(
      added ? `${added} 담았어요.` : "좋아요 영상을 불러왔어요.",
      "완료",
    );
    return;
  }
  // 시작할 때 띄운 "다른 화면을 봐도 계속돼요" 토스트는 이제 필요 없다 — 결과 막대와 겹쳐 보이지 않게 치운다
  if (startToastId != null) useToastStore.getState().remove(startToastId);
  useSyncStore.setState({ bar: { state: result, result: summary, reason } });
}

interface SyncStore {
  status: SyncStatus;
  result: SyncResult | null;
  /** 가짜 진행률의 시작 시각 — 진행 중이고 진행률 더미가 켜져 있을 때만 값이 있다 */
  startedAt: number | null;
  /** 실제 요청이 끝난 직후 잠깐 진행바를 100% 로 채워 보여 주는 동안 값이 있다 */
  finishAt: number | null;
  /** 새로고침 뒤 복원된 "분석 중"인지(요청을 이 화면이 들고 있지 않다) */
  restored: boolean;
  /** BE v3 가 실시간으로 알려 준 진행 상태 — v3 로 진행 중일 때만 값이 있다(없으면 가짜 진행률을 쓴다) */
  live: LiveSyncProgress | null;
  /** 끝났다는 소식이 온 직후 진행바를 100% 로 채워 보여 주는 동안 true(v3) */
  liveDone: boolean;
  /** 실패했다면 BE 가 알려 준 원인 */
  failReason: SyncFailReason;
  /** 홈이 아닌 화면에서 끝났을 때 남기는 결과 막대 — 새로 시작하면 지운다 */
  bar: SyncBar | null;
  /** 시작한다. 이미 진행 중이면 요청을 보내지 않고 안내만 띄운 뒤 false 를 돌려준다.
      demo: 지정하면 그 값(null 이면 실제 BE 호출), 생략하면 defaultSyncDemo() */
  start: (opts?: { demo?: SyncDemoMode | null }) => Promise<boolean>;
  /** 새로고침 직전에 진행 중이었다면 "분석 중"으로 되살린다 */
  restorePending: () => void;
  /** 홈이 마지막 결과(저장된 값)를 되살린다 — 아무 상태도 없을 때만 */
  hydrate: (state: LastSync["state"], result: SyncResult | null) => void;
  /** 결과 카드를 닫는다(진행 중에는 닫을 수 없다) */
  dismiss: () => void;
  /** 결과 막대를 닫는다 — 홈 카드도 같이 닫은 것으로 남겨, 홈에 가도 같은 결과가 다시 뜨지 않게 한다 */
  closeBar: () => void;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  status: "idle",
  result: null,
  startedAt: null,
  finishAt: null,
  restored: false,
  live: null,
  liveDone: false,
  failReason: null,
  bar: null,

  start: async (opts) => {
    if (get().status === "pending") {
      toast.info("이미 분석 중이에요. 끝나면 알려 드릴게요.");
      return false;
    }
    const began = Date.now();
    const demo = opts?.demo !== undefined ? opts.demo : defaultSyncDemo();
    // v3 를 쓰면 실제 진행률이 와서 가짜 진행률(startedAt)을 켜지 않는다. v3 가 없는 서버면 아래에서 가짜로 돌아간다.
    const viaV3 = SYNC_V3 && !demo;
    savePendingSince(began);
    set({
      status: "pending",
      result: null,
      startedAt: SYNC_PROGRESS_DUMMY && !viaV3 ? began : null,
      finishAt: null,
      restored: false,
      live: null,
      liveDone: false,
      failReason: null,
      bar: null,
    });
    const startToastId = toast.info(
      "다른 화면을 봐도 계속돼요.",
      "분석을 시작했어요",
    );

    try {
      // 새로 담긴 개수를 세려고 시작 전 보관함을 기록해 둔다 — 오래 걸리면 개수를 포기한다.
      // 가짜 진행은 센 값이 없어 건너뛴다. v1 동기화(youtube-analyze)는 v2 보관함에 담는지 알 수 없어 v2 흐름일 때만 센다.
      const before =
        demo || !(CHAT_V2 && WISHLIST_V2)
          ? null
          : await Promise.race([
              snapshotSavedKeys(),
              sleep(3000).then(() => null),
            ]);
      // 진행률이 실제 값인지(v3) 가짜인지 — v3 요청이 이 서버에 없으면 예전 방식 + 가짜 진행률로 돌아간다
      let real = viaV3;
      let res: SyncResult;
      if (demo) {
        res = await simulateSync(demo);
      } else if (viaV3) {
        try {
          res = await requestYoutubeSyncStream({
            onProgress: (live) => set({ live }),
          });
        } catch (err) {
          if (!isSyncV3Unavailable(err)) throw err;
          real = false;
          if (SYNC_PROGRESS_DUMMY) set({ startedAt: began });
          res = await requestYoutubeSync();
        }
      } else {
        res = await requestYoutubeSync();
      }
      // BE 가 영상 · 장소 개수를 안 알려주면 "찾은 게 없는지"를 보관함으로 확인한다.
      // 실제 요청이 아주 빨리 끝나도 가짜 진행 화면은 최소 시간만큼 보여 준다(진짜 진행률은 그럴 필요가 없다).
      const counted = res.videoCount != null && res.placeCount != null;
      const [none] = await Promise.all([
        demo || counted ? null : hasNoSavedGuides(),
        SYNC_PROGRESS_DUMMY && !real
          ? sleep(MIN_PROGRESS_MS - (Date.now() - began))
          : null,
      ]);
      const empty = counted
        ? res.videoCount === 0 || res.placeCount === 0
        : none === true;
      // 시작 전과 견줘 새로 담긴 장소 · 이벤트를 센다
      let addedKeys: string[] = [];
      let result: SyncResult = res;
      if (before && !empty) {
        const after = await snapshotSavedKeys();
        if (after) {
          addedKeys = [...after].filter((k) => !before.has(k));
          const n = countNewItems(addedKeys);
          result = { ...res, addedPlaces: n.places, addedEvents: n.events };
        }
      }
      // 진행 화면이 있었다면 100% 까지 채우고 잠깐 보여 준 뒤 결과로 바꾼다
      if (real) {
        set({ liveDone: true });
        await sleep(FINISH_TOTAL_MS);
      } else if (SYNC_PROGRESS_DUMMY) {
        set({ finishAt: Date.now() });
        await sleep(FINISH_TOTAL_MS);
      }
      const state = empty ? "empty" : "done";
      clearPending();
      set({
        status: state,
        result,
        startedAt: null,
        finishAt: null,
        live: null,
        liveDone: false,
      });
      saveLastSync(state, result);
      if (addedKeys.length > 0) useNewItemsStore.getState().add(addedKeys);
      notifyFinished(state, result, null, startToastId);
    } catch (err) {
      if (unloading) return true;
      clearPending();
      // 게이트웨이 시간 제한으로 끊겼다면 BE 는 분석을 이어 가는 중이다 — 실패가 아니라 "더 걸리는 중"으로 안내한다
      const state = isSyncStillRunning(err, Date.now() - began)
        ? "slow"
        : "failed";
      const failReason = state === "failed" ? failReasonOf(err) : null;
      set({
        status: state,
        startedAt: null,
        finishAt: null,
        live: null,
        liveDone: false,
        failReason,
      });
      notifyFinished(state, null, failReason, startToastId);
    }
    return true;
  },

  restorePending: () => {
    if (get().status !== "idle") return;
    const since = loadPendingSince();
    if (since == null) return;
    const remaining = SYNC_PENDING_TTL_MS - (Date.now() - since);
    if (remaining <= 0) {
      clearPending();
      return;
    }
    set({
      status: "pending",
      result: null,
      startedAt: SYNC_PROGRESS_DUMMY && !SYNC_V3 ? since : null,
      finishAt: null,
      restored: true,
      live: null,
      liveDone: false,
      failReason: null,
    });
    // 제한 시간이 지나도 끝났다는 소식이 없으면 요청은 시간 제한으로 끝난 것이다 — "더 걸리는 중"으로 바꾼다
    window.setTimeout(() => {
      const s = get();
      if (s.status !== "pending" || !s.restored) return;
      clearPending();
      set({ status: "slow", startedAt: null, finishAt: null });
      notifyFinished("slow");
    }, remaining);
  },

  hydrate: (state, result) => {
    if (get().status !== "idle") return;
    set({ status: state, result });
  },

  dismiss: () => {
    if (get().status === "pending") return;
    set({ status: "idle", result: null });
  },

  closeBar: () => {
    const { bar } = get();
    if (!bar) return;
    if (bar.state === "done" || bar.state === "empty")
      dismissLastSync(bar.state, bar.result);
    set({ bar: null });
    get().dismiss();
  },
}));
