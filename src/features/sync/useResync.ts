"use client";

import { useCallback, useRef, useState } from "react";
import { SYNC_PROGRESS_DUMMY } from "@/lib/constants";
import { sleep } from "@/lib/format";
import type { SyncResult } from "@/types/api";
import { saveLastSync } from "./lastResult";
import {
  FINISH_TOTAL_MS,
  MIN_PROGRESS_MS,
  parseSyncDemo,
  simulateSync,
  useSyncProgress,
  type SyncDemoMode,
  type SyncProgress,
} from "./progress";
import {
  hasNoSavedGuides,
  isSyncStillRunning,
  useSyncYoutubeNow,
} from "./queries";

/* 마이페이지의 "좋아요 영상 다시 불러오기" — 홈의 불러오기(home/page.tsx handleStartSync)와 같은 흐름을 훅으로 묶었다.
   진행 → 결과(done · empty) / 지연(slow) / 실패(failed). 끝나면 홈이 "마지막 결과 카드"를 되살릴 수 있게 결과를 저장한다. */

export type ResyncState =
  "idle" | "pending" | "done" | "empty" | "slow" | "failed";

export interface Resync {
  state: ResyncState;
  result: SyncResult | null;
  /** 진행 중일 때만 값이 있다 */
  progress: SyncProgress | null;
  start: () => Promise<void>;
  /** 결과 막대를 닫는다(진행 중에는 닫을 수 없다) */
  dismiss: () => void;
}

export function useResync(): Resync {
  const syncNow = useSyncYoutubeNow();
  const [state, setState] = useState<ResyncState>("idle");
  const [result, setResult] = useState<SyncResult | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishAt, setFinishAt] = useState<number | null>(null);
  const startedAtRef = useRef(0);

  const start = useCallback(async () => {
    setState("pending");
    setResult(null);
    setStartedAt(SYNC_PROGRESS_DUMMY ? Date.now() : null);
    // 개발용 토큰으로 로그인한 로컬 계정은 유튜브 연동이 없어 실제 동기화가 늘 실패한다 — 홈과 같이 가짜로 끝까지 진행시킨다(?syncDemo= 로 지정)
    const demo: SyncDemoMode | null =
      parseSyncDemo(
        new URLSearchParams(window.location.search).get("syncDemo"),
      ) ??
      (SYNC_PROGRESS_DUMMY && process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN
        ? "done"
        : null);
    try {
      const began = Date.now();
      startedAtRef.current = began;
      const res = demo ? await simulateSync(demo) : await syncNow.mutateAsync();
      const counted = res.videoCount != null && res.placeCount != null;
      const [none] = await Promise.all([
        demo || counted ? null : hasNoSavedGuides(),
        SYNC_PROGRESS_DUMMY
          ? sleep(MIN_PROGRESS_MS - (Date.now() - began))
          : null,
      ]);
      const empty = counted
        ? res.videoCount === 0 || res.placeCount === 0
        : none === true;
      if (SYNC_PROGRESS_DUMMY) {
        setFinishAt(Date.now());
        await sleep(FINISH_TOTAL_MS);
      }
      setResult(res);
      setState(empty ? "empty" : "done");
      saveLastSync(empty ? "empty" : "done", res);
    } catch (err) {
      setState(
        isSyncStillRunning(err, Date.now() - startedAtRef.current)
          ? "slow"
          : "failed",
      );
    } finally {
      setStartedAt(null);
      setFinishAt(null);
    }
  }, [syncNow]);

  const progress = useSyncProgress(
    state === "pending" ? startedAt : null,
    finishAt,
  );

  const dismiss = useCallback(() => {
    setState((s) => (s === "pending" ? s : "idle"));
  }, []);

  return { state, result, progress, start, dismiss };
}
