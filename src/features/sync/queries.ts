"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiV2, isApiError } from "@/lib/api/client";
import { CHAT_V2 } from "@/lib/constants";
import type { LikedVideoSync, SyncResult } from "@/types/api";

/* 홈의 동기화 카드가 쓰는 훅 — 프로토타입 js/pages/home.js 의 bootstrap()/requestSync()/startPolling() 을
   TanStack Query 로 옮겼다. */

export const syncKeys = {
  stats: ["user", "analytics-statistics"] as const,
};

/** POST /user/liked-video-syncs — 좋아요 영상 불러오기(동기화) 시작 */
export function useStartSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await api.post<LikedVideoSync>("/user/liked-video-syncs", {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: syncKeys.stats }),
  });
}

/** 동기화(영상 분석)가 게이트웨이 시간 제한(502 · 504 · 408)이나 오래 끊긴 연결로 끝난 경우.
    BE 는 요청이 끊겨도 분석을 이어 가므로 "실패"가 아니라 "더 걸리는 중"으로 보여 준다. */
export function isSyncStillRunning(error: unknown, elapsedMs: number): boolean {
  if (isApiError(error)) return [408, 502, 504].includes(error.status);
  // 응답을 못 받고 연결이 끊긴 경우 — 한참 기다린 뒤라면 시간 제한으로 본다
  return error instanceof TypeError && elapsedMs > 20_000;
}

/** 좋아요 영상 불러오기(동기화) 요청.
    - NEXT_PUBLIC_CHAT_V2=on: POST /api/v2/member/youtube-sync — BE 가 좋아요 영상을 가져와 AI 로 분석하고
      보관함에 담은 뒤 204 로 끝난다. 영상이 많으면 끝날 때까지 요청이 열려 있어 오래 걸린다.
    - 꺼져 있으면 POST /user/youtube-analyze(v1) — 지금 BE 는 영상 목록만 가져오고 분석 · 보관함 저장 코드가 꺼져 있다.
    진행률을 알려주는 조회 API 가 BE 에 없어서, 끝날 때까지 기다렸다가(동기 처리) 성공 여부만 본다.
    LOCAL_DUMMY 켜짐 여부와 무관하게 항상 실제 BE 를 호출한다(더미는 /user/liked-video-syncs 만 가로챈다). */
export function useSyncYoutubeNow() {
  return useMutation({
    mutationFn: async (): Promise<SyncResult> => {
      if (CHAT_V2) {
        await apiV2.post<void>("/youtube-sync");
        return { videoCount: null, placeCount: null };
      }
      // 204(본문 없음)이면 data 가 비어 있다 — 개수를 모르는 것으로 본다
      const { data } = await api.post<SyncResult | undefined>(
        "/user/youtube-analyze",
      );
      return data ?? { videoCount: null, placeCount: null };
    },
  });
}

/** 동기화가 끝난 뒤 보관함(BE v2)에 장소 · 이벤트가 하나도 없는지.
    BE 가 동기화 응답에 영상 · 장소 개수를 주지 않아서, 결과로 "찾은 게 없는" 경우를 알아내는 유일한 단서다.
    true: 둘 다 비어 있음 / false: 있음 / null: 확인하지 못함(API 가 없거나 오류) — 호출한 쪽은 null 을 "모름"으로 본다. */
export async function hasNoSavedGuides(): Promise<boolean | null> {
  try {
    const [places, events] = await Promise.all([
      apiV2.get<{ places?: unknown[] }>("/outing-wishlist/places", {
        cursor: "",
      }),
      apiV2.get<{ events?: unknown[] }>("/outing-wishlist/events", {
        cursor: "",
      }),
    ]);
    return (
      (places.data.places ?? []).length === 0 &&
      (events.data.events ?? []).length === 0
    );
  } catch {
    return null;
  }
}
