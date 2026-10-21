"use client";

import { useEffect, useState } from "react";
import type { SyncResult } from "@/types/api";

/* 좋아요 영상 분석 진행률 — **더미**.
   BE 에는 진행률 · 분석한 영상 수를 알려주는 조회 API 가 없다(POST youtube-sync / youtube-analyze 는
   끝날 때까지 기다리는 동기 처리에 204 만 준다). 그래서 시작한 시각에서 시간으로 계산한 가짜 진행률을 보여 준다.
   BE 에 상태 조회 API 가 생기면 이 파일의 값을 그 응답으로 바꾸고, NEXT_PUBLIC_SYNC_PROGRESS_DUMMY=off 로 끈다. */

/** 가짜 분석 대상 영상 수와 초당 분석 속도 — 120개를 30초에 끝낸다 */
const TOTAL_VIDEOS = 120;
const VIDEOS_PER_SECOND = 4;
/** 영상 하나당 찾아내는 장소 수(120개 → 87곳) */
const PLACES_PER_VIDEO = 0.725;

export interface SyncProgress {
  total: number;
  analyzed: number;
  /** 지금까지 찾은 장소 수 */
  places: number;
  /** 0~99 — 실제 요청이 끝나기 전에는 100 을 보여주지 않는다 */
  percent: number;
  remainingSeconds: number;
}

/** 시작한 지 elapsedMs 가 지난 시점의 진행률 */
export function progressAt(elapsedMs: number): SyncProgress {
  // 마지막 1개는 실제 요청이 끝났을 때 채운다(요청이 더 걸려도 100% 에서 멈춰 보이지 않게)
  const analyzed = Math.min(
    TOTAL_VIDEOS - 1,
    Math.max(0, Math.floor((elapsedMs / 1000) * VIDEOS_PER_SECOND)),
  );
  return {
    total: TOTAL_VIDEOS,
    analyzed,
    places: Math.floor(analyzed * PLACES_PER_VIDEO),
    percent: Math.floor((analyzed / TOTAL_VIDEOS) * 100),
    remainingSeconds: Math.ceil((TOTAL_VIDEOS - analyzed) / VIDEOS_PER_SECOND),
  };
}

/** 가짜 진행이 끝났을 때 BE 가 개수를 안 알려주면 쓰는 결과(120개 → 87곳) */
export const DUMMY_SYNC_RESULT: SyncResult = {
  videoCount: TOTAL_VIDEOS,
  placeCount: Math.floor(TOTAL_VIDEOS * PLACES_PER_VIDEO),
};

/** "약 6분 남음" · "약 20초 남음" · 거의 끝났으면 "곧 끝나요" */
export function formatRemaining(seconds: number): string {
  if (seconds <= 3) return "곧 끝나요";
  if (seconds >= 90) return `약 ${Math.round(seconds / 60)}분 남음`;
  return `약 ${Math.ceil(seconds / 5) * 5}초 남음`;
}

/** startedAt(시작 시각, ms)이 있는 동안 0.25초마다 갱신되는 진행률. 없으면 null */
export function useSyncProgress(startedAt: number | null): SyncProgress | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [startedAt]);
  return startedAt == null ? null : progressAt(now - startedAt);
}

export type SyncDemoMode = "done" | "fail";

/** URL 의 ?syncDemo= 값 — BE 없이 진행 화면을 확인할 때 쓴다(done: 끝까지, fail: 중간에 실패) */
export function parseSyncDemo(value: string | null): SyncDemoMode | null {
  return value === "done" || value === "fail" ? value : null;
}

/** BE 를 부르지 않고 가짜로 진행시킨다. done 은 다 끝난 뒤 성공, fail 은 60% 쯤에서 실패 */
export function simulateSync(mode: SyncDemoMode): Promise<SyncResult> {
  const total = (TOTAL_VIDEOS / VIDEOS_PER_SECOND) * 1000;
  return new Promise((resolve, reject) => {
    window.setTimeout(
      () =>
        mode === "fail"
          ? reject(new Error("SYNC_DEMO_FAILED"))
          : resolve(DUMMY_SYNC_RESULT),
      mode === "fail" ? total * 0.6 : total,
    );
  });
}
