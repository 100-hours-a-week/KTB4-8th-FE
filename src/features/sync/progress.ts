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
  /** 가짜 진행이 끝까지 찼는데(약 30초) 실제 요청은 아직 안 끝난 상태 — "더 걸려요" 문구로 바꾼다 */
  capped: boolean;
}

/* 진행 속도 — 처음 15초는 일정한 속도로(30초에서 시작해 1초에 1초씩 줄어든다),
   그 뒤에는 점점 느려진다. 영상이 적어서 요청이 일찍 끝나면 줄어드는 숫자가 곧바로 빨라져 끝나고(끝날 때 채우는 구간),
   영상이 많아 요청이 오래 걸리면 남은 시간이 천천히 줄다가 거의 멈춘 것처럼 보인다(끝까지 가지 않는다). */
const FULL_SPEED_SECONDS = 15;
const TOTAL_SECONDS = TOTAL_VIDEOS / VIDEOS_PER_SECOND;
/** 느려지는 구간의 한계 — 이 시각(초)에는 끝나지 않고 가까워지기만 한다 */
const MAX_VIRTUAL_SECONDS = TOTAL_SECONDS - 0.5;
/** 느려지는 속도의 시간 상수 — 15초 지점에서 속도가 끊기지 않고 이어지도록 한계까지의 거리와 같게 둔다 */
const SLOWDOWN_TAU = MAX_VIRTUAL_SECONDS - FULL_SPEED_SECONDS;

/** 실제 경과 시간(초) → 화면에 보여 주는 진행 시각(초). 15초까지는 같고, 그 뒤로는 느려진다 */
function virtualSeconds(elapsedSeconds: number): number {
  if (elapsedSeconds <= FULL_SPEED_SECONDS) return Math.max(0, elapsedSeconds);
  return (
    FULL_SPEED_SECONDS +
    SLOWDOWN_TAU *
      (1 - Math.exp(-(elapsedSeconds - FULL_SPEED_SECONDS) / SLOWDOWN_TAU))
  );
}

/** 시작한 지 elapsedMs 가 지난 시점의 진행률 */
export function progressAt(elapsedMs: number): SyncProgress {
  // 마지막 1개는 실제 요청이 끝났을 때 채운다(요청이 더 걸려도 100% 에서 멈춰 보이지 않게)
  const analyzed = Math.min(
    TOTAL_VIDEOS - 1,
    Math.floor(virtualSeconds(elapsedMs / 1000) * VIDEOS_PER_SECOND),
  );
  return {
    total: TOTAL_VIDEOS,
    analyzed,
    places: Math.floor(analyzed * PLACES_PER_VIDEO),
    percent: Math.floor((analyzed / TOTAL_VIDEOS) * 100),
    remainingSeconds: Math.ceil((TOTAL_VIDEOS - analyzed) / VIDEOS_PER_SECOND),
    // 남은 시간이 3초 이하로 줄었는데도 안 끝나면 더 걸려요 문구로 바꾼다
    capped: Math.ceil((TOTAL_VIDEOS - analyzed) / VIDEOS_PER_SECOND) <= 3,
  };
}

/** 실제 요청이 끝난 뒤 진행바를 남은 만큼 빠르게 채우는 시간 — 15% 에서 갑자기 100% 로 튀지 않게 한다 */
const FINISH_RAMP_MS = 900;
/** 100% 를 그대로 보여 주는 시간 */
const FINISH_HOLD_MS = 600;
/** 실제 요청이 끝난 뒤 결과 카드로 바꾸기까지 기다리는 시간(채우는 시간 + 100% 유지) */
export const FINISH_TOTAL_MS = FINISH_RAMP_MS + FINISH_HOLD_MS;

/** 실제 요청이 finishAt 에 끝났을 때, 그 뒤 now 시점의 진행률 — 끝난 순간의 값에서 100% 까지 부드럽게 채운다 */
export function progressWhileFinishing(
  startedAt: number,
  finishAt: number,
  now: number,
): SyncProgress {
  const from = progressAt(finishAt - startedAt);
  const t = Math.min(1, Math.max(0, (now - finishAt) / FINISH_RAMP_MS));
  const eased = 1 - (1 - t) ** 3;
  const analyzed =
    t >= 1
      ? TOTAL_VIDEOS
      : Math.min(
          TOTAL_VIDEOS - 1,
          Math.round(from.analyzed + (TOTAL_VIDEOS - from.analyzed) * eased),
        );
  return {
    total: TOTAL_VIDEOS,
    analyzed,
    places: Math.floor(analyzed * PLACES_PER_VIDEO),
    percent: Math.floor((analyzed / TOTAL_VIDEOS) * 100),
    remainingSeconds:
      t >= 1 ? 0 : Math.ceil((TOTAL_VIDEOS - analyzed) / VIDEOS_PER_SECOND),
    capped: false,
  };
}

/** 가짜 진행이 끝났을 때 BE 가 개수를 안 알려주면 쓰는 결과(120개 → 87곳) */
export const DUMMY_SYNC_RESULT: SyncResult = {
  videoCount: TOTAL_VIDEOS,
  placeCount: Math.floor(TOTAL_VIDEOS * PLACES_PER_VIDEO),
};

/** "약 6분 남음" · "약 27초 남음" · 거의 끝났으면 "곧 끝나요" — 초는 1초 단위로 줄어든다(5초 단위로 묶으면 멈춘 것처럼 보인다) */
export function formatRemaining(seconds: number): string {
  if (seconds <= 3) return "곧 끝나요";
  if (seconds >= 90) return `약 ${Math.round(seconds / 60)}분 남음`;
  return `약 ${seconds}초 남음`;
}

/** startedAt(시작 시각, ms)이 있는 동안 갱신되는 진행률(0.25초마다). 없으면 null.
    finishAt 이 있으면 실제 요청이 끝난 것이라, 끝난 순간 값에서 100% 까지 채우는 진행률을 더 촘촘히(0.05초) 갱신한다. */
export function useSyncProgress(
  startedAt: number | null,
  finishAt: number | null = null,
): SyncProgress | null {
  const [now, setNow] = useState(() => Date.now());
  const finishing = finishAt != null;
  useEffect(() => {
    if (startedAt == null) return;
    const id = window.setInterval(
      () => setNow(Date.now()),
      finishing ? 50 : 250,
    );
    return () => window.clearInterval(id);
  }, [startedAt, finishing]);
  if (startedAt == null) return null;
  return finishAt != null
    ? progressWhileFinishing(startedAt, finishAt, now)
    : progressAt(now - startedAt);
}

/** 실제 요청이 아주 빨리 끝나도(영상이 적거나 없을 때) 진행 화면을 이만큼은 보여 준다 */
export const MIN_PROGRESS_MS = 5_000;

export type SyncDemoMode = "done" | "fail" | "empty";

/** URL 의 ?syncDemo= 값 — BE 없이 화면을 확인할 때 쓴다(done: 끝까지, fail: 중간에 실패, empty: 영상 없음) */
export function parseSyncDemo(value: string | null): SyncDemoMode | null {
  return value === "done" || value === "fail" || value === "empty"
    ? value
    : null;
}

/** BE 를 부르지 않고 가짜로 진행시킨다. done 은 다 끝난 뒤 성공, fail 은 60% 쯤에서 실패, empty 는 8초 뒤 "찾은 장소 없음" */
export function simulateSync(mode: SyncDemoMode): Promise<SyncResult> {
  const total = (TOTAL_VIDEOS / VIDEOS_PER_SECOND) * 1000;
  return new Promise((resolve, reject) => {
    window.setTimeout(
      () => {
        if (mode === "fail") reject(new Error("SYNC_DEMO_FAILED"));
        else if (mode === "empty") resolve({ videoCount: 0, placeCount: 0 });
        else resolve(DUMMY_SYNC_RESULT);
      },
      mode === "fail" ? total * 0.6 : mode === "empty" ? 8_000 : total,
    );
  });
}
