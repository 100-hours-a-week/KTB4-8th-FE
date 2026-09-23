"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, isApiError } from "@/lib/api/client";
import type {
  Candidate,
  Category,
  ChatMessage,
  ChatReply,
  CollectionItem,
  RecommendationRun,
  RecommendationSlots,
} from "@/types/api";

/* 코스 추천 팝업이 쓰는 API 훅 — 채팅 · 추천 생성/폴링/취소 · 보관함 저장.
   프로토타입 js/pages/course.js 의 KG.api 호출을 TanStack Query 로 옮겼다. */

export const courseKeys = {
  chat: ["user", "chat-messages"] as const,
  recommendation: (runId: string | null) =>
    ["user", "recommendations", runId] as const,
};

/** GET /user/chat-messages — 팝업을 열었을 때 대화가 비어 있으면 서버 기록으로 채운다(새로고침 대비) */
export function useChatMessages(enabled: boolean) {
  return useQuery({
    queryKey: courseKeys.chat,
    queryFn: async () =>
      (await api.get<ChatMessage[]>("/user/chat-messages")).data,
    enabled,
    staleTime: Infinity,
  });
}

export interface SendChatBody {
  content: string;
  slots: RecommendationSlots;
}

/** POST /user/chat-messages — 응답(ChatReply)에는 사용자 메시지가 들어있지 않다.
    화면이 보낸 메시지를 낙관적으로 먼저 대화 로그에 넣는다. */
export function useSendChatMessage() {
  return useMutation({
    mutationFn: async (body: SendChatBody) =>
      (await api.post<ChatReply>("/user/chat-messages", body)).data,
  });
}

/** DELETE /user/chat-messages — 대화 초기화 */
export function useClearChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => api.del("/user/chat-messages"),
    onSettled: () => qc.removeQueries({ queryKey: courseKeys.chat }),
  });
}

export interface CreateRecommendationBody {
  currentLocation: { latitude: number; longitude: number };
  startAt: string;
  endAt: string;
  preferences?: Category[];
}

/** POST /user/recommendations — 202 로 runId 를 받는다(생성 자체는 비동기 작업이다) */
export function useCreateRecommendation() {
  return useMutation({
    mutationFn: async (body: CreateRecommendationBody) =>
      (await api.post<RecommendationRun>("/user/recommendations", body)).data,
  });
}

/** GET /user/recommendations/{runId} — 완료 전엔 409 RECOMMENDATION_NOT_COMPLETED 를 던진다.
    고정 간격이 아니라 그 오류가 들고 온 retryAfterSeconds 만큼 기다렸다 refetchInterval 이 스스로 다시 부른다. */
export function useRecommendationPoll(runId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: courseKeys.recommendation(runId),
    queryFn: async () =>
      (await api.get<RecommendationRun>(`/user/recommendations/${runId}`)).data,
    enabled: enabled && !!runId,
    retry: false,
    staleTime: 0,
    refetchInterval: (query) => {
      const err = query.state.error;
      if (isApiError(err) && err.code === "RECOMMENDATION_NOT_COMPLETED") {
        return (err.retryAfterSeconds || 1) * 1000;
      }
      return false;
    },
  });
}

export interface CancelRecommendationResult {
  runId: string;
  state: string;
}

/** POST /user/recommendations/cancellation */
export function useCancelRecommendation() {
  return useMutation({
    mutationFn: async () =>
      (
        await api.post<CancelRecommendationResult>(
          "/user/recommendations/cancellation",
          {},
        )
      ).data,
  });
}

/** POST /user/collections/me/items — 코스 후보를 그대로 보관함에 저장한다(itemId = candidateId) */
export function useAddCourseItem() {
  return useMutation({
    mutationFn: async (course: Candidate) =>
      (
        await api.post<CollectionItem>("/user/collections/me/items", {
          itemType: "COURSE",
          itemId: course.candidateId,
          course,
        })
      ).data,
  });
}
