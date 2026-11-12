import { API_BASE_V3, ApiError, headers, toApiError } from "@/lib/api/client";
import { idempotentFetch } from "@/lib/api/idempotency";
import { readSse } from "@/lib/api/sse";
import type { SyncResult } from "@/types/api";

/* 좋아요 영상 동기화 v3 — POST /api/v3/member/youtube-sync (SSE). 요청 본문은 없다.
   BE(YoutubeSyncConnection)가 보내는 이벤트(이름 앞에 "youtube-sync." 가 붙는다):
     accepted  접수 — 가져온 영상 수 등 첫 상태
     progress  영상 분석이 한 건 끝날 때마다(배치 단위)
     success   모두 분석하고 저장까지 끝남
     conflict · bad-gateway · service-unavailable · internal-server-error   실패(본문은 ProblemDetail 과 같은 키)
   본문(snake_case): video_fetched_count · video_target_count · video_analyzed_count · video_failed_count · progress(0~100).
   아직 모르는 값은 null 이라, 숫자가 아니면 모르는 것으로 본다.
   (BE 문서에는 두 필드만 적혀 있고 코드는 다섯 개를 보낸다 — 값이 없어도 화면이 깨지지 않게 모두 선택값으로 다룬다.) */

const PREFIX = "youtube-sync.";

/** 실시간으로 받은 진행 상태. 모르는 값은 null */
export interface LiveSyncProgress {
  /** YouTube 에서 가져온 영상 수 */
  fetched: number | null;
  /** 분석할 영상 수(가져오기가 끝나야 알 수 있다) */
  target: number | null;
  /** 분석을 마친 영상 수 */
  analyzed: number | null;
  /** 분석에 실패한 영상 수 */
  failed: number | null;
  /** 0~100 */
  progress: number | null;
}

/** 스트림이 열린 뒤 BE 가 실패 이벤트로 알린 오류 — "게이트웨이 시간 제한(502)"과 구별하려고 따로 둔다 */
export class SyncStreamError extends ApiError {
  /** BE 의 실패 코드: YOUTUBE_NOT_CONNECTED(요청 단계 409) · YOUTUBE_REAUTHORIZATION_REQUIRED · YOUTUBE_FETCH_FAILED · SYNC_BUSY(서버 동시 처리 한도) · INTERNAL_ERROR */
  reason: string;
  constructor(problem: ConstructorParameters<typeof ApiError>[0]) {
    super(problem);
    this.name = "SyncStreamError";
    this.reason = problem.code;
  }
}

/** 이 서버에는 v3 동기화가 없다(404 · 405 · 501) — 호출한 쪽이 예전 방식으로 돌아간다 */
export class SyncV3Unavailable extends Error {
  constructor() {
    super("SYNC_V3_UNAVAILABLE");
    this.name = "SyncV3Unavailable";
  }
}

export function isSyncV3Unavailable(e: unknown): e is SyncV3Unavailable {
  return e instanceof SyncV3Unavailable;
}

/** BE 실패 이벤트 → 화면용 상태 코드와 HTTP 상태 */
const STREAM_ERRORS: Record<string, { status: number; fallback: string }> = {
  conflict: { status: 409, fallback: "YOUTUBE_REAUTHORIZATION_REQUIRED" },
  "bad-gateway": { status: 502, fallback: "YOUTUBE_FETCH_FAILED" },
  "service-unavailable": { status: 503, fallback: "SYNC_BUSY" },
  "internal-server-error": { status: 500, fallback: "INTERNAL_ERROR" },
};

function parseJson(text: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/** 이벤트 본문 → 진행 상태 */
export function toLiveProgress(
  data: Record<string, unknown> | null,
): LiveSyncProgress {
  const d = data ?? {};
  const progress = num(d.progress);
  return {
    fetched: num(d.video_fetched_count),
    target: num(d.video_target_count),
    analyzed: num(d.video_analyzed_count),
    failed: num(d.video_failed_count),
    progress:
      progress == null
        ? null
        : Math.min(100, Math.max(0, Math.round(progress))),
  };
}

/** 끝난 동기화의 결과 건수 — 영상 수는 분석 대상 수, 장소 수는 BE 가 안 알려 준다.
    분석할 영상이 하나도 없었다면 "찾은 게 없음"으로 바로 알 수 있다. */
export function toSyncResult(last: LiveSyncProgress): SyncResult {
  if (last.target === 0 || last.fetched === 0)
    return { videoCount: 0, placeCount: 0 };
  return { videoCount: last.target ?? last.analyzed, placeCount: null };
}

/** 동기화를 시작하고 끝날 때까지 이벤트를 읽는다. 진행 상태가 올 때마다 onProgress 를 부른다.
    - 요청 단계에서 막히면(401 · 409 등) 일반 오류 응답이 온다 → ApiError
    - 스트림 중 실패 이벤트 → SyncStreamError
    - 이 서버에 v3 가 없으면 → SyncV3Unavailable
    - 끝났다는 이벤트 없이 연결이 끊기면 → TypeError("SYNC_STREAM_ENDED") (BE 는 분석을 이어 간다) */
export async function requestYoutubeSyncStream(opts: {
  onProgress: (live: LiveSyncProgress) => void;
  signal?: AbortSignal;
}): Promise<SyncResult> {
  const instance = `${API_BASE_V3}/youtube-sync`;
  const res = await idempotentFetch(instance, {
    method: "POST",
    headers: headers({ Accept: "text/event-stream" }),
    credentials: "include",
    signal: opts.signal,
  });
  if (res.status === 404 || res.status === 405 || res.status === 501)
    throw new SyncV3Unavailable();
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // 409 = 유튜브 계정이 연동돼 있지 않음(YOUTUBE_NOT_CONNECTED). 스트림이 열리기 전에 BE 가 일반 오류로 막는다
    if (res.status === 409) {
      const b = (body ?? {}) as Record<string, unknown>;
      throw new SyncStreamError({
        type: typeof b.type === "string" ? b.type : "about:blank",
        title: typeof b.title === "string" ? b.title : "Conflict",
        status: 409,
        detail: typeof b.detail === "string" ? b.detail : "",
        instance,
        code:
          typeof b.code === "string" && b.code
            ? b.code
            : "YOUTUBE_NOT_CONNECTED",
      });
    }
    throw toApiError(body, res.status, instance);
  }
  if (!res.body) throw new TypeError("SYNC_STREAM_ENDED");

  let last: LiveSyncProgress = {
    fetched: null,
    target: null,
    analyzed: null,
    failed: null,
    progress: null,
  };
  let result: SyncResult | null = null;
  let failure: SyncStreamError | null = null;

  await readSse(res.body, (message) => {
    const event = message.event.startsWith(PREFIX)
      ? message.event.slice(PREFIX.length)
      : message.event;
    const data = parseJson(message.data);
    if (event === "accepted" || event === "progress") {
      last = toLiveProgress(data);
      opts.onProgress(last);
      return false;
    }
    if (event === "success") {
      last = toLiveProgress(data);
      opts.onProgress({ ...last, progress: 100 });
      result = toSyncResult(last);
      return true;
    }
    const known = STREAM_ERRORS[event];
    if (known) {
      const code =
        typeof data?.code === "string" && data.code
          ? data.code
          : known.fallback;
      failure = new SyncStreamError({
        type: typeof data?.type === "string" ? data.type : "about:blank",
        title: typeof data?.title === "string" ? data.title : "오류",
        status: known.status,
        detail: "",
        instance,
        code,
        traceId: typeof data?.trace_id === "string" ? data.trace_id : undefined,
      });
      return true;
    }
    return false; // 알 수 없는 이벤트는 건너뛴다
  });

  if (failure) throw failure;
  if (result) return result;
  throw new TypeError("SYNC_STREAM_ENDED");
}
