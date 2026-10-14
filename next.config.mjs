// 설정 파일에서는 빌드 전용 진입점(/config)을 쓴다. 기본 진입점은 브라우저·서버용이라 withSentryConfig 가 없다.
import { withSentryConfig } from "@sentry/nextjs/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloud 결정: 정적 export 대신 Node 런타임 컨테이너로 서빙한다.
  output: "standalone",
  reactStrictMode: true,
  images: {
    // 장소 썸네일이 외부 URL 로 내려오면 여기에 호스트를 등록한다.
    remotePatterns: [],
  },
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      // 구글 로그인 시작 경로는 BE(Spring Security oauth2Login)가 전담한다. API가 아니라
      // 브라우저 전체 이동(리다이렉트)으로만 호출되므로, 쿠키가 앱과 같은 도메인에 남도록
      // /api/* 와 마찬가지로 프록시해야 한다 — 없으면 이 경로가 FE 쪽에서 404가 난다.
      {
        source: "/oauth2/:path*",
        destination: `${backendOrigin}/oauth2/:path*`,
      },
      // 업로드한 프로필 사진 등 BE 가 /public/** 으로 직접 서빙하는 정적 파일. 이것도 안 넘기면
      // <img src="/public/..."> 가 FE 자체 404 로 떨어져 깨진 이미지로 보인다.
      {
        source: "/public/:path*",
        destination: `${backendOrigin}/public/:path*`,
      },
    ];
  },
};

/* Sentry — 빌드 때 소스맵을 올려 에러 위치를 원본 코드로 읽게 한다.
   SENTRY_AUTH_TOKEN 은 빌드에만 필요한 비밀 값이다(런타임 · 이미지에 남기지 않는다).
   토큰이 없으면(로컬 · CI 빌드) 소스맵을 만들지도 올리지도 않는다. */
const hasAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN);

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  ...(process.env.SENTRY_RELEASE
    ? { release: { name: process.env.SENTRY_RELEASE } }
    : {}),
  sourcemaps: {
    disable: !hasAuthToken,
    // 올린 뒤에는 지운다 — 배포 이미지에 .map 이 남으면 누구나 원본 소스를 볼 수 있다
    deleteSourcemapsAfterUpload: true,
  },
  widenClientFileUpload: true,
  // 광고 차단기가 Sentry 요청을 막지 못하게 우리 도메인(/monitoring)으로 거쳐 보낸다
  tunnelRoute: "/monitoring",
  telemetry: false,
  suppressOnRouterTransitionStartWarning: true,
  silent: !process.env.CI,
});
