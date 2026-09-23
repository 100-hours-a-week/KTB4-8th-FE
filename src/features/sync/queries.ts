"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, isApiError } from "@/lib/api/client";
import type { AnalyticsStatistics, LikedVideoSync } from "@/types/api";

/* 홈의 동기화 카드가 쓰는 훅 — 프로토타입 js/pages/home.js 의 bootstrap()/requestSync()/startPolling() 을
   TanStack Query 로 옮겼다. 명세에 동기화 진행 상태를 따로 조회하는 API가 없어(백엔드 확인 요청),
   analytics-statistics 의 수치로 진행률을 대신 읽는다. */

export const syncKeys = {
  stats: ["user", "analytics-statistics"] as const,
};

export interface UseAnalyticsStatsOptions {
  /** 동기화가 진행 중일 때만 주기적으로 다시 불러온다(완료되면 홈 화면이 꺼 준다) */
  polling?: boolean;
}

/** GET /user/analytics-statistics — 폴링 중엔 프로토타입과 같은 900ms 간격이 기본이고,
    오류가 retryAfterSeconds 를 들고 오면 그 값을 우선한다(코스 추천 폴링과 같은 규칙). */
export function useAnalyticsStats({
  polling = false,
}: UseAnalyticsStatsOptions = {}) {
  return useQuery({
    queryKey: syncKeys.stats,
    queryFn: async () =>
      (await api.get<AnalyticsStatistics>("/user/analytics-statistics")).data,
    refetchInterval: (query) => {
      if (!polling) return false;
      const err = query.state.error;
      if (isApiError(err) && err.retryAfterSeconds)
        return err.retryAfterSeconds * 1000;
      return 900;
    },
  });
}

/** POST /user/liked-video-syncs — 좋아요 영상 불러오기(동기화) 시작 */
export function useStartSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await api.post<LikedVideoSync>("/user/liked-video-syncs", {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: syncKeys.stats }),
  });
}
