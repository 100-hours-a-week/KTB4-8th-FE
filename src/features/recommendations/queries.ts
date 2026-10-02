"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE, api, headers, toApiError } from "@/lib/api/client";
import { sleep } from "@/lib/format";
import type {
  AvailableMinutes,
  Candidate,
  ChatMessage,
  ChatReply,
  ChatSlot,
  CollectionItem,
  RecommendationRun,
} from "@/types/api";

/* 코스 추천 팝업이 쓰는 API 훅 — 채팅 · 추천 생성/폴링/취소 · 보관함 저장.
   프로토타입 js/pages/course.js 의 KG.api 호출을 TanStack Query 로 옮겼다. */

export const courseKeys = {
  chat: ["user", "chat-messages"] as const,
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

interface BeChatSlot {
  origin?: { lat: number; lng: number } | null;
  region?: string | null;
  /** "yyyy-MM-dd" */
  datetime?: string | null;
  available_time?: number | null;
  /** AI 쪽 스키마가 문자열("카페") → 배열(["카페"])로 바뀐 적이 있어서, BE 가 둘 중
      뭘 내려주든 받을 수 있게 둘 다 허용한다. */
  category?: string | string[] | null;
}

type BeGetReplyResponse =
  | { status: "IN_PROGRESS"; poll_after: number }
  | {
      status: "COMPLETED";
      chat: { content: string; is_by_bot: boolean };
      slot?: BeChatSlot | null;
    };

const VALID_AVAILABLE_MINUTES = new Set<number>([180, 360, 540]);

/** BE 전체가 snake_case 라서 받는 모양 그대로 옮긴다. "시간대"(오전/오후/저녁) 는
    AI/BE 어디에도 없어서 날짜(date)까지만 옮긴다 — CoursePopup 이 시간대는 항상
    사용자가 직접 고르게 한다. */
function toChatSlot(
  beSlot: BeChatSlot | null | undefined,
): ChatSlot | undefined {
  if (!beSlot) return undefined;
  const availableMinutes =
    beSlot.available_time != null &&
    VALID_AVAILABLE_MINUTES.has(beSlot.available_time)
      ? (beSlot.available_time as AvailableMinutes)
      : null;
  return {
    origin: beSlot.origin
      ? { latitude: beSlot.origin.lat, longitude: beSlot.origin.lng }
      : null,
    region: beSlot.region ?? null,
    date: beSlot.datetime ?? null,
    availableMinutes,
    category:
      beSlot.category == null
        ? null
        : Array.isArray(beSlot.category)
          ? beSlot.category
          : [beSlot.category],
  };
}

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
async function pollUntilComplete(chatId: string): Promise<ChatReply> {
  for (let i = 0; i < 30; i++) {
    const reply = await fetchReply(chatId);
    if (reply.status === "COMPLETED") {
      return { content: reply.chat.content, slot: toChatSlot(reply.slot) };
    }
    await sleep((reply.poll_after || 1) * 1000);
  }
  throw new Error("CHAT_REPLY_TIMEOUT");
}

/** POST /user/chat-messages — BE 는 봇 답변을 바로 주지 않고 202 Accepted + Location 헤더만
    돌려준다(비동기 처리). 진짜 답변은 그 Location 을 완료될 때까지 폴링해서 받아와야 한다.
    BE 가 이제 조건 추출 결과(slot)도 같이 주므로, CoursePopup 이 그걸로 조건 카드를
    자동으로 채운다(시간대 제외 — ChatSlot 주석 참고). */
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
      return await pollUntilComplete(chatId);
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

/* BE 전체가 spring.jackson.property-naming-strategy: SNAKE_CASE 라서, 요청 필드도
   그대로 snake_case 로 보내야 한다(camelCase 로 보내면 BE 가 null 로 받고 @NotNull 에 걸린다). */
export interface UpdateSlotBody {
  location: { lat: number; lng: number };
  requested_location_name: string;
  /** BE가 java.time.LocalDateTime으로 받는다 — 타임존 오프셋 없이 "yyyy-MM-ddTHH:mm:ss" 형식이어야 한다 */
  requested_date_time: string;
  available_time: number;
  categories: string[];
}

/** PATCH /user/chat-messages/slot — "의도 카드" 수정. BE가 추천 요청 시 이 값을
    쓰므로(POST 본문을 안 읽는다), 추천을 요청하기 직전에 항상 먼저 호출해야 한다.
    BE가 전체 필드를 다 요구해서(@NotNull/@NotBlank) 매번 현재 조건 전체를 보낸다. */
export function useUpdateSlot() {
  return useMutation({
    mutationFn: async (body: UpdateSlotBody) =>
      (await api.patch<void>("/user/chat-messages/slot", body)).data,
  });
}

/** POST /user/recommendation(단수) — BE가 AI 호출까지 끝내고 결과를 한 번에 동기로
    돌려준다(202+폴링 구조 아님, runId·폴링용 GET 엔드포인트가 BE에 없다).
    요청 본문은 안 읽으므로 보내지 않고, 대신 useUpdateSlot 으로 먼저 조건을 반영해 둔다.
    나중에 BE 가 비동기(202+폴링)로 바뀌면 생성(POST)과 폴링(GET)을 다시 분리하면 된다. */
export function useRequestRecommendation() {
  return useMutation({
    mutationFn: async () =>
      (await api.post<RecommendationRun>("/user/recommendation")).data,
  });
}

/** POST /user/recommendation/cancellation(단수) — 지금은 추천 요청이 동기라 이 응답을
    기다리는 동안에도 FE 는 이미 POST 결과를 기다리고 있다. BE 쪽 작업을 멈추라는 요청만
    보내고, 화면은 바로 idle 로 되돌린다(응답 자체의 상태값은 안 쓴다). */
export function useCancelRecommendation() {
  return useMutation({
    mutationFn: async () => {
      await api.post<void>("/user/recommendation/cancellation");
    },
  });
}

/** POST /user/collections/me/items — 코스 후보를 그대로 보관함에 저장한다(itemId = candidateId) */
export function useAddCourseItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: Candidate) =>
      (
        await api.post<CollectionItem>("/user/collections/me/items", {
          itemType: "COURSE",
          itemId: course.candidateId,
          course,
        })
      ).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["collections", "items"] }),
  });
}
