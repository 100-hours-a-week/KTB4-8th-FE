import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "KeepGo",
  description:
    "저장만 해둔 그곳, 이제 진짜 떠나요 — 좋아요한 쇼츠에서 찾은 장소로 외출 코스를 만들어 드려요.",
  icons: {
    // 브라우저 탭 · 북마크 아이콘. iOS "홈 화면에 추가"도 같은 이미지를 쓴다.
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#16A46B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 워드마크("KeepGo") 전용 세리프. text= 로 6글자만 받아 1.4KB 로 끝낸다 —
            이 파라미터를 빼면 라틴 전체(14KB)를 받으므로 지우지 말 것.
            next/font/google 은 text 서브셋을 지원하지 않아 14KB 를 받게 되므로 쓰지 않았다.
            no-page-custom-font 규칙은 Pages Router 의 _document 기준이라,
            앱 전역에 적용되는 App Router 루트 레이아웃에서는 해당하지 않는다. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Literata:wght@800&text=KeepGo&display=swap"
        />
      </head>
      <body>
        <Providers>
          {/* 데스크톱에서는 화면 가운데 모바일 뷰포트로 표시된다 (프로토타입과 동일) */}
          <div className="desk">
            <div className="phone" id="phone">
              <div className="phone__stage" id="stage" role="main">
                {children}
              </div>
              <div className="phone__overlays" id="overlays" />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
