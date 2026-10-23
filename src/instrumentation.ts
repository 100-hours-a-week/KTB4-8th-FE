import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// 서버 요청 처리 중 난 에러를 보낸다(Next 15 부터 호출되고, 14 에서는 무시되어 무해하다)
export const onRequestError = Sentry.captureRequestError;
