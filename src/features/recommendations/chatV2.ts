import {
  API_BASE_V2,
  headers,
  toApiError,
  type ApiError,
} from "@/lib/api/client";
import { readSse } from "@/lib/api/sse";
import type { AvailableMinutes, ChatReply, ChatSlot } from "@/types/api";
import { parseSlotDatetime } from "./slotTime";

/* 채팅 전송 v2 — POST /api/v2/member/chat-messages.
   v1(202 + Location 폴링)과 달리 같은 연결에서 SSE 로 답을 받는다.
     chat-reply.accepted             요청 접수(사용자 메시지) — 화면에는 이미 보여 줘서 무시한다
     chat-reply.success              봇 답변 + 추출한 조건(slot) — 이걸로 끝
     chat-reply.service-unavailable  실패 · 시간 초과(503 본문)
   글자가 하나씩 흐르는 스트림이 아니라, 완료 이벤트에 답변이 통째로 들어 있다. */

/** BE 의 SSE 제한(180초)보다 조금 길게 — BE 가 service-unavailable 을 보내기 전에 끊지 않도록 */
const CLIENT_TIMEOUT_MS = 190_000;

/* 같은 사용자의 채팅은 BE 가 한 번에 하나만 처리한다(처리 중에 또 보내면 409 Conflict, 조건 수정(PATCH slot)도 같은 잠금을 쓴다).
   그래서 ① 이 브라우저에서는 앞 요청이 끝나길 기다렸다 보내고(팝업을 닫았다 다시 열어도 마찬가지),
   ② 그래도 409 가 오면(새로고침 직후처럼 앞 요청이 BE 에서 아직 끝나는 중) 잠깐씩 기다렸다가 몇 번 다시 보낸다. */
const CONFLICT_RETRY_DELAYS_MS = [1_000, 2_000, 3_000];
let pendingSend: Promise<unknown> | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** v2 slot 은 v1 과 필드 이름이 다르다(BE ChatServiceV2.SlotPayload) */
interface BeChatSlotV2 {
  coordinate?: { lat: number | null; lng: number | null } | null;
  location_name_requested?: string | null;
  /** "yyyy-MM-dd HH:mm:ss" — 00:00:00 은 "시각 모름" */
  time_requested_datetime?: string | null;
  /** 시간 단위 정수(3 · 6 · 9) */
  time_available_hours?: number | null;
  categories?: string[] | null;
}

interface BeChatSuccessV2 {
  chat: { content: string; is_by_bot: boolean };
  slot?: BeChatSlotV2 | null;
}

/** datetime → 화면용 date · time · timeOfDay */
function pickDateTime(value: string | null | undefined) {
  const { date, time, timeOfDay } = parseSlotDatetime(value);
  return { date, time, timeOfDay };
}

const VALID_AVAILABLE_MINUTES = new Set<number>([180, 360, 540]);

/** v2 slot → 화면이 쓰는 ChatSlot. 값이 없는(null) 필드는 아직 못 뽑은 것이라 그대로 비운다 */
export function toChatSlotV2(
  slot: BeChatSlotV2 | null | undefined,
): ChatSlot | undefined {
  if (!slot) return undefined;
  const minutes =
    typeof slot.time_available_hours === "number"
      ? slot.time_available_hours * 60
      : null;
  const { lat, lng } = slot.coordinate ?? {};
  return {
    origin:
      typeof lat === "number" && typeof lng === "number"
        ? { latitude: lat, longitude: lng }
        : null,
    region: slot.location_name_requested ?? null,
    ...pickDateTime(slot.time_requested_datetime),
    availableMinutes:
      minutes != null && VALID_AVAILABLE_MINUTES.has(minutes)
        ? (minutes as AvailableMinutes)
        : null,
    category: slot.categories?.length ? slot.categories : null,
  };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** 여러 번 시도해도 409 라서 보내지 못했을 때의 오류 — 화면에는 "처리 중이니 잠시 후 다시"로 보인다 */
function busyError(instance: string): ApiError {
  return toApiError(
    {
      instance,
      status: 409,
      code: "CHAT_IN_PROGRESS",
      title: "이전 메시지를 처리하고 있어요",
      detail: "잠시 후 다시 보내 주세요.",
    },
    409,
  );
}

export async function sendChatMessageV2(body: {
  content: string;
}): Promise<ChatReply> {
  // 앞 요청이 있으면 끝날 때까지(성공이든 실패든) 기다린다
  while (pendingSend) await pendingSend.catch(() => {});
  const run = sendOnce(body, 0);
  pendingSend = run;
  try {
    return await run;
  } finally {
    if (pendingSend === run) pendingSend = null;
  }
}

async function sendOnce(
  body: { content: string },
  attempt: number,
): Promise<ChatReply> {
  const path = "/chat-messages";
  const instance = API_BASE_V2 + path;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch(instance, {
      method: "POST",
      headers: headers({ Accept: "text/event-stream" }),
      body: JSON.stringify(body),
      credentials: "include",
      signal: controller.signal,
    });
    if (res.status === 409) {
      // BE 가 앞 요청을 아직 처리 중 — 잠깐 기다렸다 다시 보낸다
      const delay = CONFLICT_RETRY_DELAYS_MS[attempt];
      if (delay === undefined) throw busyError(instance);
      clearTimeout(timer);
      await sleep(delay);
      return sendOnce(body, attempt + 1);
    }
    if (!res.ok) {
      const parsed = (await res.json().catch(() => null)) as object | null;
      throw toApiError({ ...parsed, instance }, res.status);
    }
    if (!res.body) throw new Error("CHAT_STREAM_MISSING");

    const result: { reply?: ChatReply; failure?: ApiError } = {};
    await readSse(res.body, (message) => {
      if (message.event === "chat-reply.success") {
        const data = parseJson(message.data) as BeChatSuccessV2 | null;
        if (data?.chat?.content != null) {
          result.reply = {
            content: data.chat.content,
            slot: toChatSlotV2(data.slot),
          };
        }
        return true;
      }
      if (message.event === "chat-reply.service-unavailable") {
        const parsed = parseJson(message.data) as object | null;
        result.failure = toApiError({ ...parsed, instance }, 503);
        return true;
      }
      return false; // chat-reply.accepted 등 — 계속 읽는다
    });

    if (result.reply) return result.reply;
    if (result.failure) throw result.failure;
    throw new Error("CHAT_STREAM_ENDED");
  } finally {
    clearTimeout(timer);
  }
}
