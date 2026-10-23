"use client";

import { useEffect } from "react";
import { withSentry } from "@/lib/monitoring/sentryClient";

/* 화면을 그리다 처리되지 않은 에러가 나면 Next 기본 오류 화면 대신 이 화면을 보여 주고,
   에러를 Sentry 로 보낸다. 루트 레이아웃까지 대체하므로 전역 CSS 가 없어 스타일을 직접 둔다. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    withSentry((Sentry) => Sentry.captureException(error));
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          background: "#f7f7fa",
          color: "#17161b",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 24px" }}>
          <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>문제가 생겼어요</h1>
          <p style={{ fontSize: 14, color: "#8a8894", margin: "0 0 20px" }}>
            잠시 후 다시 시도해 주세요. 계속되면 알려 주세요.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 12,
              padding: "12px 24px",
              background: "#16a46b",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
