"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { LikedVideoSync } from "@/types/api";

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

/** POST /user/youtube-analyze — BE 에 실제로 구현된 동기화 API.
    진행률을 알려주는 조회 API 가 BE 에 없어서, 끝날 때까지 기다렸다가(동기 처리) 성공 여부만 본다.
    LOCAL_DUMMY 켜짐 여부와 무관하게 항상 실제 BE 를 호출한다(더미는 /user/liked-video-syncs 만 가로챈다). */
export function useSyncYoutubeNow() {
  return useMutation({
    mutationFn: async () => {
      await api.post<void>("/user/youtube-analyze");
    },
  });
}
