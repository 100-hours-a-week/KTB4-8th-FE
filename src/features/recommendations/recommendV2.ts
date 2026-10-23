import {
  API_BASE_V2,
  headers,
  toApiError,
  type ApiError,
} from "@/lib/api/client";
import { toRecommendationRun } from "@/lib/api/backend";
import { readSse } from "@/lib/api/sse";
import type { RecommendationRun } from "@/types/api";

/* 코스 추천 v2 — POST /api/v2/member/recommendation (SSE), 취소는 POST .../recommendation/cancellation (204).
   추천 조건은 요청에 싣지 않는다 — BE 가 서버에 저장된 "의도 카드"를 쓰므로, 요청 직전에 조건 수정(PATCH slot)을 먼저 한다.
     outing-course-recommendation.accepted             접수(본문 없음)
     outing-course-recommendation.success              { result: { metadata, snippets, details } } — v1 과 같은 모양
     outing-course-recommendation.service-unavailable  실패 · 시간 초과(503 본문)
     outing-course-recommendation.stopped              취소가 확정됨
   요청 단계에서 막히면 SSE 가 아니라 일반 오류 응답이 온다: 400 조건 부족, 404 조건 없음, 409 이미 추천 중. */

const PREFIX = "outing-course-recommendation.";
/** BE 의 SSE 제한(180초)보다 조금 길게 */
const CLIENT_TIMEOUT_MS = 190_000;

/** 사용자가 취소해서 끝난 추천 — 화면에서 오류로 보여 주지 않는다 */
export class RecommendationStopped extends Error {
  constructor() {
    super("RECOMMENDATION_STOPPED");
    this.name = "RecommendationStopped";
  }
}

export function isRecommendationStopped(
  e: unknown,
): e is RecommendationStopped {
  return e instanceof RecommendationStopped;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** 요청 단계의 일반 오류 응답을 사용자에게 보여 줄 오류로 바꾼다 */
async function requestError(
  res: Response,
  instance: string,
): Promise<ApiError> {
  const body = ((await res.json().catch(() => null)) ?? {}) as object;
  if (res.status === 400) {
    return toApiError(
      {
        ...body,
        instance,
        status: 400,
        code: "RECOMMENDATION_CONDITIONS_MISSING",
        title: "추천에 필요한 조건이 부족해요",
        detail:
          "출발지 · 날짜와 시간 · 외출 가능 시간(3 · 6 · 9시간)이 모두 정해졌는지 확인한 뒤 다시 시도해 주세요.",
      },
      400,
    );
  }
  if (res.status === 409) {
    return toApiError(
      {
        ...body,
        instance,
        status: 409,
        code: "RECOMMENDATION_IN_PROGRESS",
        title: "이미 코스를 만들고 있어요",
        detail: "끝나면 결과가 나와요. 잠시 후 다시 시도해 주세요.",
      },
      409,
    );
  }
  return toApiError({ ...body, instance }, res.status);
}

export async function requestRecommendationV2(): Promise<RecommendationRun> {
  const instance = `${API_BASE_V2}/recommendation`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch(instance, {
      method: "POST",
      headers: headers({ Accept: "text/event-stream" }),
      credentials: "include",
      signal: controller.signal,
    });
    if (!res.ok) throw await requestError(res, instance);
    if (!res.body) throw new Error("RECOMMENDATION_STREAM_MISSING");

    const out: {
      run?: RecommendationRun;
      failure?: ApiError;
      stopped?: boolean;
    } = {};
    await readSse(res.body, (message) => {
      const event = message.event.startsWith(PREFIX)
        ? message.event.slice(PREFIX.length)
        : message.event;
      if (event === "success") {
        const data = parseJson(message.data) as { result?: unknown } | null;
        if (data?.result) {
          out.run = toRecommendationRun(data.result, {
            travelInDescription: false,
          });
        }
        return true;
      }
      if (event === "service-unavailable") {
        out.failure = toApiError(
          { ...((parseJson(message.data) as object | null) ?? {}), instance },
          503,
        );
        return true;
      }
      if (event === "stopped") {
        out.stopped = true;
        return true;
      }
      return false; // accepted — 계속 읽는다
    });

    if (out.run) return out.run;
    if (out.stopped) throw new RecommendationStopped();
    if (out.failure) throw out.failure;
    throw new Error("RECOMMENDATION_STREAM_ENDED");
  } finally {
    clearTimeout(timer);
  }
}

/** 진행 중인 추천을 멈춘다. 진행 중인 요청이 없어도 204 다 */
export async function cancelRecommendationV2(): Promise<void> {
  const instance = `${API_BASE_V2}/recommendation/cancellation`;
  const res = await fetch(instance, {
    method: "POST",
    headers: headers(),
    credentials: "include",
  });
  if (!res.ok) throw await requestError(res, instance);
}
