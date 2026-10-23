import { withSentry } from "./sentryClient";

/* API 호출 실패를 Sentry 로 보낸다.
   화면은 실패를 try/catch 로 받아 토스트로 보여 주기 때문에, 이렇게 직접 보내지 않으면
   Sentry 는 그 실패를 모른다. 사용자 입력 탓인 4xx 는 보내지 않는다(잡음). */

/** /user/chat-messages/12/response → /user/chat-messages/:id/response (숫자가 든 구간은 id 로 본다) */
export function normalizeApiPath(path: string): string {
  return path
    .split("?")[0]
    .split("/")
    .map((segment) => (/\d/.test(segment) ? ":id" : segment))
    .join("/");
}

interface ApiFailure {
  method: string;
  path: string;
  status: number;
  code: string;
  /** BE 가 오류 응답에 담아 주는 추적 번호 — BE 로그와 맞춰 볼 때 쓴다 */
  traceId?: string;
}

/** 서버 오류(5xx) — 같은 요청 · 상태 · 경로는 한 이슈로 묶는다 */
export function reportApiServerError(failure: ApiFailure, cause: Error) {
  if (failure.status < 500) return;
  const path = normalizeApiPath(failure.path);
  // 이슈 제목이 BE 의 안내 문구("오류")가 아니라 어느 API 가 실패했는지로 보이게 한다.
  // 원래 에러의 스택과 메시지는 그대로 이어 붙인다.
  const reported = new Error(`${failure.method} ${path} ${failure.status}`, {
    cause,
  });
  reported.name = "ApiError";
  reported.stack = cause.stack;
  withSentry((Sentry) =>
    Sentry.captureException(reported, {
      level: "error",
      extra: { responseMessage: cause.message },
      fingerprint: ["api-error", failure.method, String(failure.status), path],
      tags: {
        "api.method": failure.method,
        "api.path": path,
        "api.status": String(failure.status),
        "api.code": failure.code,
        ...(failure.traceId ? { "be.trace_id": failure.traceId } : {}),
      },
    }),
  );
}

/** 응답 자체를 못 받은 경우(BE 다운 · 연결 끊김). 사용자가 오프라인이거나 직접 취소한 건 제외한다. */
export function reportApiNetworkError(
  method: string,
  path: string,
  cause: unknown,
) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  if (cause instanceof DOMException && cause.name === "AbortError") return;
  const normalized = normalizeApiPath(path);
  withSentry((Sentry) =>
    Sentry.captureException(cause, {
      // BE 장애면 한꺼번에 쌓이므로 알림은 이 레벨(warning)의 급증으로 걸면 된다
      level: "warning",
      fingerprint: ["api-network-error", method, normalized],
      tags: { "api.method": method, "api.path": normalized },
    }),
  );
}
