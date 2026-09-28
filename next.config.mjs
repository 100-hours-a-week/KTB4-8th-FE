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
    ];
  },
};

export default nextConfig;
