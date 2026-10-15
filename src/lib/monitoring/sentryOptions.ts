import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

/* Sentry 공통 설정 — 브라우저 · 서버 · 엣지 초기화 파일이 같이 쓴다.
   DSN 은 공개 값이라 NEXT_PUBLIC_ 로 빌드에 박고, 비어 있으면 SDK 가 아무것도 보내지 않는다
   (로컬 개발 · CI 빌드는 DSN 없이 그대로 동작한다). */

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || undefined;

/** 에러와 함께 수집되는 URL · 헤더에서 지워야 하는 값 — 구글 로그인 콜백(/oauth?code=…&state=…)과 토큰 */
const SENSITIVE_PARAM =
  /([?&#](?:code|state|token|access_?token|refresh_?token|id_?token)=)[^&#\s]*/gi;

export function scrubUrl(value: string): string {
  return value.replace(SENSITIVE_PARAM, "$1[Filtered]");
}

function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const data = breadcrumb.data;
  if (!data) return breadcrumb;
  for (const key of ["url", "from", "to"]) {
    const v = data[key];
    if (typeof v === "string") data[key] = scrubUrl(v);
  }
  return breadcrumb;
}

function beforeSend(event: ErrorEvent): ErrorEvent | null {
  const request = event.request;
  if (request) {
    if (request.url) request.url = scrubUrl(request.url);
    if (typeof request.query_string === "string")
      request.query_string = scrubUrl("?" + request.query_string).slice(1);
    // 로그인 토큰(Authorization)과 쿠키는 어떤 경우에도 보내지 않는다
    delete request.cookies;
    if (request.headers) {
      for (const name of Object.keys(request.headers)) {
        if (/^(authorization|cookie|set-cookie)$/i.test(name))
          delete request.headers[name];
      }
    }
  }
  event.breadcrumbs = event.breadcrumbs?.map(scrubBreadcrumb);
  return event;
}

export const sentryOptions = {
  dsn: DSN,
  enabled: !!DSN,
  /* 개발 · 운영 서버를 같은 프로젝트에서 구분해 보려고 환경을 나눈다.
     Docker 빌드 인자(NEXT_PUBLIC_SENTRY_ENVIRONMENT)로 정하고, 없으면 NODE_ENV. */
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  // IP · 쿠키 등 사용자 식별 정보는 기본으로 수집하지 않는다
  sendDefaultPii: false,
  ignoreErrors: [
    // 브라우저가 내는 무해한 경고
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications.",
    /^Script error\.?$/,
    // 화면을 떠나며 취소된 요청
    /AbortError/,
    "Non-Error promise rejection captured",
  ],
  // 브라우저 확장 프로그램이 낸 에러
  denyUrls: [
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^safari-(web-)?extension:\/\//i,
  ],
  beforeSend,
  beforeBreadcrumb: scrubBreadcrumb,
};
