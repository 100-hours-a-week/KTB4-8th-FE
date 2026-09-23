/* API 클라이언트.
   - 인증: Authorization: Bearer <accessToken> 헤더만 실어 보낸다.
     검증 · 만료 판단은 전부 백엔드가 한다 (2026-09-21 결정).
   - 성공 응답은 { data } 또는 { data, page } 한 겹으로 감싸여 온다.
   - 오류는 RFC 9457 Problem Details 이며 ApiError 로 던진다.
   - 401 AUTHENTICATION_REQUIRED 는 refresh 를 1회 시도한 뒤 실패하면 로그인으로 보낸다. */
import { PROBLEMS, UI, type Effect, type Problem, type Tone } from "./problems";
import type { Envelope, Page } from "@/types/api";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export class ApiError extends Error {
  problem: Problem;
  code: string;
  status: number;
  retryAfterSeconds: number | null;

  constructor(problem: Problem) {
    super(problem.title);
    this.name = "ApiError";
    this.problem = problem;
    this.code = problem.code;
    this.status = problem.status;
    this.retryAfterSeconds = problem.retryAfterSeconds ?? null;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

/** 명세의 원형으로 Problem 본문을 만든다 (Mock · 테스트용) */
export function makeProblem(
  code: string,
  instance = "",
  extra: Partial<Problem> = {},
): Problem {
  const seed = PROBLEMS[code];
  if (!seed) throw new Error("알 수 없는 오류 코드: " + code);
  return {
    type: seed.type,
    title: seed.title,
    status: seed.status,
    detail: seed.detail,
    instance: API_BASE + instance,
    code,
    traceId: "01J" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    ...(seed.retryAfterSeconds
      ? { retryAfterSeconds: seed.retryAfterSeconds }
      : {}),
    ...extra,
  };
}

/** 서버가 준 본문을 ApiError 로 만든다. 카탈로그에 없는 code 가 와도 화면이 죽지 않는다. */
export function toApiError(
  body: unknown,
  status: number,
  instance = "",
): ApiError {
  const b = (body || {}) as Partial<Problem>;
  if (b.code && PROBLEMS[b.code])
    return new ApiError({ ...makeProblem(b.code, instance), ...b } as Problem);
  return new ApiError({
    type: b.type || "about:blank",
    title: b.title || "오류",
    status: b.status || status,
    detail: b.detail || "알 수 없는 오류가 발생했어요.",
    instance: b.instance || API_BASE + instance,
    code: b.code || "INTERNAL_SERVER_ERROR",
    traceId: b.traceId,
    errors: b.errors,
    retryAfterSeconds: b.retryAfterSeconds,
  });
}

/* ── 세션 토큰 ─────────────────────────────────────────────
   Bearer 헤더 방식이라 토큰이 브라우저에 있어야 한다.
   메모리를 우선 쓰고, 재방문 유지용으로 localStorage 에 함께 둔다. */

const STORAGE_KEY = "keepgo.session.v1";

export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  issuedAt?: number;
}

let memory: SessionTokens | null = null;

export function readSession(): SessionTokens | null {
  if (memory) return memory;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memory = raw ? (JSON.parse(raw) as SessionTokens) : null;
  } catch {
    memory = null;
  }
  return memory;
}

export function writeSession(next: SessionTokens | null) {
  memory = next;
  if (typeof window === "undefined") return;
  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 프라이빗 모드 등에서 저장이 막혀도 메모리로 동작한다 */
  }
}

/** 모든 요청에 붙는 헤더 — 프론트가 하는 인증 처리는 이게 전부다 */
export function headers(
  extra?: Record<string, string>,
): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extra || {}),
  };
  const s = readSession();
  if (s?.accessToken)
    h.Authorization = `${s.tokenType || "Bearer"} ${s.accessToken}`;
  return h;
}

/* ── 세션 만료 훅 ──────────────────────────────────────────
   화면이 아니라 여기서 한 번만 처리하도록 콜백을 등록받는다. */

let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(fn: (() => void) | null) {
  onSessionExpired = fn;
}

/* ── 요청 ──────────────────────────────────────────────── */

function qs(query?: Record<string, unknown>) {
  if (!query) return "";
  const parts = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    );
  return parts.length ? `?${parts.join("&")}` : "";
}

interface RequestOptions {
  query?: Record<string, unknown>;
  body?: unknown;
  signal?: AbortSignal;
  /** 내부용 — refresh 재시도 여부 */
  retried?: boolean;
}

async function send<T>(
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<Envelope<T>> {
  const url = API_BASE + path + qs(opts.query);

  const res = await fetch(url, {
    method,
    headers: headers(),
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: opts.signal,
    cache: "no-store",
  });

  if (res.status === 204) return { data: undefined as unknown as T };

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.ok) return body as Envelope<T>;

  const err = toApiError(body, res.status, path);

  // 401 AUTHENTICATION_REQUIRED → refresh 1회 → 실패하면 로그인으로
  if (
    err.code === "AUTHENTICATION_REQUIRED" &&
    !opts.retried &&
    readSession()
  ) {
    try {
      const s = readSession()!;
      const r = await fetch(API_BASE + "/user/auth-session/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: s.refreshToken }),
      });
      if (!r.ok)
        throw toApiError(
          await r.json().catch(() => null),
          r.status,
          "/user/auth-session/refresh",
        );
      const next = (await r.json()) as Envelope<SessionTokens>;
      writeSession({ ...s, ...next.data, issuedAt: Date.now() });
      return send<T>(method, path, { ...opts, retried: true });
    } catch (e) {
      writeSession(null);
      onSessionExpired?.();
      throw e;
    }
  }

  if (
    err.code === "REFRESH_TOKEN_REQUIRED" ||
    describe(err).effect === "RELOGIN"
  ) {
    writeSession(null);
    onSessionExpired?.();
  }

  throw err;
}

export const api = {
  get: <T>(
    path: string,
    query?: Record<string, unknown>,
    signal?: AbortSignal,
  ) => send<T>("GET", path, { query, signal }),
  post: <T>(path: string, body?: unknown) => send<T>("POST", path, { body }),
  patch: <T>(path: string, body?: unknown) => send<T>("PATCH", path, { body }),
  del: <T>(path: string) => send<T>("DELETE", path),
};

/** 목록 응답의 page 커서를 함께 쓰는 헬퍼 */
export type Paged<T> = { data: T[]; page?: Page };

/* ── 화면 문구 ─────────────────────────────────────────── */

export interface Described {
  tone: Tone;
  text: string;
  effect: Effect | null;
  silent: boolean;
  code: string;
  status: number;
  title: string;
  traceId?: string;
  field?: string;
}

/** code → 화면에 보여줄 문구로 바꾼다 */
export function describe(err: unknown): Described {
  if (!isApiError(err)) {
    return {
      tone: "error",
      text: "알 수 없는 오류가 발생했어요.",
      effect: null,
      silent: false,
      code: "UNKNOWN",
      status: 0,
      title: "오류",
    };
  }
  const rule = UI[err.code] || {
    tone: "error" as Tone,
    text: err.problem.detail,
  };
  let text = rule.text;
  if (rule.effect === "RETRY_AFTER" && err.retryAfterSeconds) {
    text += ` ${err.retryAfterSeconds}초 후 다시 시도해 주세요.`;
  }
  const first = err.problem.errors?.[0];
  if (err.code === "USER_VALIDATION_FAILED" && first) text = first.message;
  return {
    tone: rule.tone,
    text,
    effect: rule.effect ?? null,
    silent: !!rule.silent,
    code: err.code,
    status: err.status,
    title: err.problem.title,
    traceId: err.problem.traceId,
    field: first?.field,
  };
}
