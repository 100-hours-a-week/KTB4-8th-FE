import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "KeepGo",
  description:
    "저장만 해둔 그곳, 이제 진짜 떠나요 — 좋아요한 쇼츠에서 찾은 장소로 외출 코스를 만들어 드려요.",
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
