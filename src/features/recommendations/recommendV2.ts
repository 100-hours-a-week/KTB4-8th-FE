import {
  API_BASE_V2,
  API_BASE_V3,
  headers,
  toApiError,
  type ApiError,
} from "@/lib/api/client";
import { idempotentFetch } from "@/lib/api/idempotency";
import { toRecommendationRun } from "@/lib/api/backend";
import { readSse } from "@/lib/api/sse";
import type { RecommendationRun } from "@/types/api";

/* 코스 추천 v2 — POST /api/v2/member/recommendation (SSE), 취소는 POST .../recommendation/cancellation (204).
   추천 조건은 요청에 싣지 않는다 — BE 가 서버에 저장된 "의도 카드"를 쓰므로, 요청 직전에 조건 수정(PATCH slot)을 먼저 한다.
     outing-course-recommendation.accepted             접수(본문 없음)
     outing-course-recommendation.success              { result: { metadata, snippets, details } } — v1 과 같은 모양
     outing-course-recommendation.service-unavailable  실패 · 시간 초과(503 본문)
     outing-course-recommendation.stopped              취소가 확정됨
   요청 단계에서 막히면 SSE 가 아니라 일반 오류 응답이 온다: 400 조건 부족, 404 조건 없음, 409 이미 추천 중.

   v3 — POST /api/v3/member/recommendation. v2 와 같은 계약에 아래가 더해진다(BE develop · 아직 main 에는 없다).
     outing-course-recommendation.status      { stage }  추천이 어느 단계인지(문구는 FE 가 정한다 — progressStages.ts). 단계는 건너뛸 수 있다
     outing-course-recommendation.bad-gateway  AI 오류(502) — service-unavailable 과 같은 모양
   AI 연결이 열리기 전의 실패는 SSE 가 아니라 일반 오류 응답(502 · 503)으로 온다.
   그래서 v3 를 먼저 부르고, 이 서버에 v3 가 없으면(404 · 405 · 501) v2 로 다시 요청한다. 취소는 v2 취소가 v3 추천도 멈춘다. */

const PREFIX = "outing-course-recommendation.";
/** BE 의 SSE 제한(180초)보다 조금 길게 */
const CLIENT_TIMEOUT_MS = 190_000;

/** 이 서버에는 v3 추천이 없다(404 · 405 · 501) — v2 로 다시 요청한다 */
class RecommendV3Unavailable extends Error {}

/** 한 번이라도 v3 없이 v2 로 성공했다면 이 서버에는 v3 가 없다고 보고, 이 탭에서는 처음부터 v2 로 요청한다 */
let v3Missing = false;

/** 진행 단계(status)를 받을 수 있는가 — 화면이 "단계 문구"와 "시간 문구" 중 무엇으로 시작할지 정하는 데 쓴다 */
export function expectsStageUpdates(): boolean {
  return !v3Missing;
}

export interface RecommendationStreamOptions {
  /** 서버가 추천 단계를 알려 줄 때마다(v3) */
  onStage?: (stage: string) => void;
  /** v3 가 없어 v2 로 돌아갔다 — 이제 단계는 오지 않는다 */
  onNoStages?: () => void;
}

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

export async function requestRecommendationV2(
  opts: RecommendationStreamOptions = {},
): Promise<RecommendationRun> {
  if (!v3Missing) {
    try {
      return await streamRecommendation(`${API_BASE_V3}/recommendation`, opts);
    } catch (e) {
      if (!(e instanceof RecommendV3Unavailable)) throw e;
      opts.onNoStages?.();
    }
    // v3 가 없다는 건 v2 가 받아 줘야 확실해진다(404 는 "조건 없음"일 수도 있다)
    const run = await streamRecommendation(
      `${API_BASE_V2}/recommendation`,
      opts,
    );
    v3Missing = true;
    return run;
  }
  return streamRecommendation(`${API_BASE_V2}/recommendation`, opts);
}

async function streamRecommendation(
  instance: string,
  opts: RecommendationStreamOptions,
): Promise<RecommendationRun> {
  const isV3 = instance.startsWith(API_BASE_V3);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await idempotentFetch(instance, {
      method: "POST",
      headers: headers({ Accept: "text/event-stream" }),
      credentials: "include",
      signal: controller.signal,
    });
    if (isV3 && [404, 405, 501].includes(res.status))
      throw new RecommendV3Unavailable();
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
      if (event === "status") {
        const data = parseJson(message.data) as { stage?: unknown } | null;
        if (typeof data?.stage === "string") opts.onStage?.(data.stage);
        return false;
      }
      if (event === "success") {
        const data = parseJson(message.data) as { result?: unknown } | null;
        if (data?.result) {
          out.run = toRecommendationRun(data.result, {
            travelInDescription: false,
          });
        }
        return true;
      }
      if (event === "service-unavailable" || event === "bad-gateway") {
        out.failure = toApiError(
          { ...((parseJson(message.data) as object | null) ?? {}), instance },
          event === "bad-gateway" ? 502 : 503,
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
  const res = await idempotentFetch(instance, {
    method: "POST",
    headers: headers(),
    credentials: "include",
  });
  if (!res.ok) throw await requestError(res, instance);
}
