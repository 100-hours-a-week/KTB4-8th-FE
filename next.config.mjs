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
      // (로그인 콜백 /login/oauth2/code/** 은 프록시가 아니라
      // src/app/login/oauth2/code/[provider]/route.ts 가 직접 받는다.)
      {
        source: "/oauth2/:path*",
        destination: `${backendOrigin}/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
