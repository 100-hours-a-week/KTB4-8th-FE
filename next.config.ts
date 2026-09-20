// Next.js 설정의 속성 이름과 자료형을 TypeScript로 검사한다.
import type { NextConfig } from "next";

// 이 파일은 빌드/서버 설정이다. Nginx의 라우팅 설정과는 별개다.
const nextConfig: NextConfig = {
    // Node 서버 실행에 필요한 파일을 .next/standalone에 모은다.
    // 정적 export의 out/과 다르므로 기존 CI/Dockerfile도 함께 전환해야 한다.
    // 컨테이너에서는 보통 node server.js로 실행하며 public, .next/static도 복사한다.
    output: "standalone",
    // 페이지 URL 끝에 /를 붙이는 규칙. 프록시에서도 경로를 보존해야 한다.
    trailingSlash: true,
    images: {
        // next/image의 서버 이미지 최적화를 사용하지 않고 원본을 제공한다.
        // standalone의 필수 조건은 아니며 기존 동작을 유지하기 위한 설정이다.
        unoptimized: true,
    },
};

// Next.js가 읽을 기본 설정 객체를 내보낸다.
export default nextConfig;
