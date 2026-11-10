import React from "react";

interface KeepGoLogoProps {
  variant?: "full" | "symbol" | "text";
  size?: number; // 심볼 기준 크기 (기본: 36)
  className?: string;
  onClick?: () => void;
}

export function KeepGoLogo({
  variant = "full",
  size = 36,
  className = "",
  onClick,
}: KeepGoLogoProps) {
  const symbolWidth = size;
  const symbolHeight = size;
  const textHeight = Math.round(size * 0.72);

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {/* ── 심볼 마크 (YouTube 쇼츠 ▶ + 위치 핀 📍 + 출발 화살표 ➔) ── */}
      {variant !== "text" && (
        <svg
          width={symbolWidth}
          height={symbolHeight}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-sm transition-transform duration-300 hover:scale-105"
          aria-label="KeepGo Symbol"
        >
          <defs>
            {/* 브랜드 에메랄드 그라데이션 */}
            <linearGradient id="kg-grad-emerald" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1dd18a" />
              <stop offset="0.55" stopColor="#16a46b" />
              <stop offset="1" stopColor="#0a6b44" />
            </linearGradient>

            {/* 선셋 앰버 포인트 그라데이션 (쇼츠 하트 & 활력) */}
            <linearGradient id="kg-grad-amber" x1="28" y1="8" x2="44" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffb03a" />
              <stop offset="1" stopColor="#f28522" />
            </linearGradient>

            {/* 소프트 글로우 필터 */}
            <filter id="kg-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#16a46b" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 외곽 부드러운 스퀴클 베이스 */}
          <rect
            x="3"
            y="3"
            width="42"
            height="42"
            rx="13"
            fill="url(#kg-grad-emerald)"
            filter="url(#kg-glow)"
          />

          {/* 쇼츠 화면 질감 및 은은한 하이라이트 곡선 */}
          <path
            d="M5 15C5 9.47715 9.47715 5 15 5H33C38.5228 5 43 9.47715 43 15V19C33 21 21 17 5 24V15Z"
            fill="white"
            fillOpacity="0.12"
          />

          {/* 중앙 심볼: 유튜브 플레이(▶)와 위치 핀(📍)의 융합 */}
          {/* 핀/플레이 바디 */}
          <path
            d="M17 14.5C17 12.8 18.9 11.8 20.3 12.7L32.2 20.5C33.4 21.3 33.4 23.1 32.2 23.9L20.3 31.7C18.9 32.6 17 31.6 17 29.9V14.5Z"
            fill="white"
          />

          {/* 핀 포인트 & 우상향 도약 화살표 헤드 */}
          <path
            d="M27.5 16L35.5 22.2L27.5 28.5L29.5 22.2L27.5 16Z"
            fill="url(#kg-grad-amber)"
          />

          {/* 위치 핀 중심의 마그네틱 링 (Keep의 저장 핀을 상징) */}
          <circle cx="23" cy="22.2" r="3" fill="#16a46b" />

          {/* 우측 상단 반짝이는 영감 스파클 */}
          <circle cx="38" cy="10" r="2.5" fill="#ffd15c" />
        </svg>
      )}

      {/* ── 워드마크: KeepGo ── */}
      {variant !== "symbol" && (
        <div className="flex items-baseline tracking-tight">
          <span
            className="font-bold text-[#17161b] dark:text-[#f4f3f6]"
            style={{
              fontFamily: 'Literata, Pretendard, -apple-system, serif',
              fontSize: `${textHeight}px`,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Keep
          </span>
          <span
            className="font-extrabold text-[#16a46b]"
            style={{
              fontFamily: 'Pretendard, -apple-system, sans-serif',
              fontSize: `${textHeight}px`,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Go
          </span>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-[#f2a33c] ml-0.5 mb-0.5"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
