"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  API_BASE,
  api,
  headers,
  isApiError,
  toApiError,
} from "@/lib/api/client";
import { sleep } from "@/lib/format";
import type {
  Candidate,
  Category,
  ChatMessage,
  ChatReply,
  CollectionItem,
  RecommendationRun,
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
}

type BeGetReplyResponse =
  | { status: "IN_PROGRESS"; poll_after: number }
  | { status: "COMPLETED"; chat: { content: string; is_by_bot: boolean } };

/** POST 응답의 Location 헤더(".../chat-messages/{chatId}/response")에서 chatId 를 뽑아낸다 —
    응답 본문에는 안 들어있고 헤더로만 온다. */
function parseChatId(location: string | null): string {
  const match = location?.match(/\/chat-messages\/(\d+)\/response/);
  if (!match) throw new Error("CHAT_LOCATION_MISSING");
  return match[1];
}

async function fetchReply(chatId: string): Promise<BeGetReplyResponse> {
  const path = `/user/chat-messages/${chatId}/response`;
  const res = await fetch(API_BASE + path, {
    headers: headers(),
    credentials: "include",
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(body, res.status, path);
  return body as BeGetReplyResponse;
}

/** 완료될 때까지 폴링한다. BE 가 IN_PROGRESS 응답에 poll_after(초)를 함께 주므로 그만큼
    기다렸다 다시 묻는다 — 최대 30회(지금 BE 기준 약 30초)까지만 시도하고 포기한다. */
async function pollUntilComplete(chatId: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const reply = await fetchReply(chatId);
    if (reply.status === "COMPLETED") return reply.chat.content;
    await sleep((reply.poll_after || 1) * 1000);
  }
  throw new Error("CHAT_REPLY_TIMEOUT");
}

/** POST /user/chat-messages — BE 는 봇 답변을 바로 주지 않고 202 Accepted + Location 헤더만
    돌려준다(비동기 처리). 진짜 답변은 그 Location 을 완료될 때까지 폴링해서 받아와야 한다.
    주의: BE 응답(GetReplyResponse)엔 텍스트뿐이고, 조건 카드용 구조화 필드(지역·날짜·카테고리)나
    선택지 버튼에 해당하는 값은 아직 없다 — BE/AI 쪽에서 아직 정해지지 않은 부분이다. */
export function useSendChatMessage() {
  return useMutation({
    mutationFn: async (body: SendChatBody): Promise<ChatReply> => {
      const path = "/user/chat-messages";
      const res = await fetch(API_BASE + path, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
        credentials: "include",
      });
      const parsed = await res.json().catch(() => null);
      if (!res.ok) throw toApiError(parsed, res.status, path);
      const chatId = parseChatId(res.headers.get("Location"));
      const content = await pollUntilComplete(chatId);
      return { content };
    },
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
  state: "CANCELLING";
  requestedAt: string;
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
