import React from "react";

export type KeepyPose = "wave" | "shorts" | "detect" | "travel" | "float";

interface KeepyMascotProps {
  pose?: KeepyPose;
  size?: number; // 기본 크기 (px)
  className?: string;
  animate?: boolean;
  bubbleText?: string;
  /** true 면 말풍선 자리를 캐릭터 위에 따로 비워 둔다 — 말풍선이 위쪽 글자 · 카드를 덮지 않는다 */
  reserveBubbleSpace?: boolean;
  onClick?: () => void;
}

export function KeepyMascot({
  pose = "wave",
  size = 140,
  className = "",
  animate = true,
  bubbleText,
  reserveBubbleSpace = false,
  onClick,
}: KeepyMascotProps) {
  // SVG 그라데이션 id 는 문서 전체에서 하나여야 한다 — 같은 id 가 여러 개면(숨겨진 캐릭터가 먼저 나올 때 등) 보이는 캐릭터의 채움이 사라진다
  const uid = `keepy${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${
        bubbleText && reserveBubbleSpace ? "pt-14" : ""
      } ${className}`}
      onClick={onClick}
      style={{ width: `${size}px` }}
    >
      {/* ── 키피의 생각 / 말풍선 ── */}
      {bubbleText && (
        <div
          className={`absolute ${reserveBubbleSpace ? "top-1" : "-top-12"} z-20 whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-[#202422] shadow-lg border border-[#16a46b]/20 text-xs font-semibold text-[#0a5236] dark:text-[#74d3a9] animate-bounce`}
        >
          {bubbleText}
          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-[#202422] border-r border-b border-[#16a46b]/20 rotate-45" />
        </div>
      )}

      {/* ── 키피 본체 SVG ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto transition-transform duration-300 ${
          animate ? "keepy-animated" : ""
        }`}
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* 키피 몸체 젤리 그라데이션 */}
          <linearGradient
            id={`${uid}-body`}
            x1="40"
            y1="30"
            x2="120"
            y2="135"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#32d892" />
            <stop offset="0.6" stopColor="#16a46b" />
            <stop offset="1" stopColor="#0e8253" />
          </linearGradient>

          {/* 배 부분 부드러운 민트 크림 */}
          <linearGradient
            id={`${uid}-belly`}
            x1="80"
            y1="80"
            x2="80"
            y2="130"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#eafaf2" />
            <stop offset="1" stopColor="#c5f0dc" />
          </linearGradient>

          {/* 배낭 코랄/선셋 앰버 */}
          <linearGradient
            id={`${uid}-bag`}
            x1="100"
            y1="80"
            x2="140"
            y2="120"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffb347" />
            <stop offset="1" stopColor="#f27022" />
          </linearGradient>

          {/* 탐험 모자/핀 골드 앰버 */}
          <linearGradient
            id={`${uid}-pin`}
            x1="70"
            y1="10"
            x2="90"
            y2="35"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#ffd24d" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>

          {/* 눈 하이라이트 글로우 */}
          <radialGradient id={`${uid}-eye-glow`} cx="50%" cy="50%" r="50%">
            <stop stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* 그림자 */}
          <filter id={`${uid}-shadow`} x="10" y="130" width="140" height="25">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <style>{`
          @keyframes keepy-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(1.5deg); }
          }
          @keyframes keepy-blink {
            0%, 92%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
          }
          @keyframes keepy-wave-hand {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-25deg); }
          }
          @keyframes keepy-sparkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .keepy-animated {
            animation: keepy-float 3.5s ease-in-out infinite;
          }
          .keepy-blink-eye {
            transform-origin: center;
            animation: keepy-blink 4s infinite;
          }
          .keepy-waving {
            transform-origin: 35px 85px;
            animation: keepy-wave-hand 1.6s ease-in-out infinite;
          }
          .keepy-sparkle-dot {
            animation: keepy-sparkle 2s ease-in-out infinite;
          }
        `}</style>

        {/* ── 바닥 그림자 ── */}
        <ellipse
          cx="80"
          cy="142"
          rx="42"
          ry="9"
          fill="#0d261b"
          fillOpacity="0.14"
        />

        {/* ── 등 뒤의 작은 탐험 배낭 ── */}
        <g id="backpack">
          <rect
            x="104"
            y="76"
            width="26"
            height="34"
            rx="9"
            fill={`url(#${uid}-bag)`}
            stroke="#b45309"
            strokeWidth="1.5"
          />
          {/* 배낭 포켓 & 버클 */}
          <rect x="110" y="88" width="18" height="15" rx="4" fill="#fde68a" />
          <line
            x1="119"
            y1="88"
            x2="119"
            y2="103"
            stroke="#d97706"
            strokeWidth="1.5"
          />
          {/* 롤 매트(침낭) 상단 장착 */}
          <rect x="103" y="68" width="28" height="10" rx="5" fill="#38bdf8" />
          <line
            x1="110"
            y1="68"
            x2="110"
            y2="78"
            stroke="#0284c7"
            strokeWidth="1"
          />
          <line
            x1="124"
            y1="68"
            x2="124"
            y2="78"
            stroke="#0284c7"
            strokeWidth="1"
          />
        </g>

        {/* ── 키피 다리 / 발 ── */}
        <g id="feet">
          {/* 왼쪽 발 */}
          <ellipse cx="64" cy="136" rx="13" ry="8" fill="#0e8253" />
          <ellipse cx="64" cy="135" rx="10" ry="5.5" fill="#16a46b" />
          {/* 오른쪽 발 */}
          <ellipse cx="96" cy="136" rx="13" ry="8" fill="#0e8253" />
          <ellipse cx="96" cy="135" rx="10" ry="5.5" fill="#16a46b" />
        </g>

        {/* ── 키피 둥근 몸체 ── */}
        <g id="body">
          {/* 메인 통통한 바디 */}
          <path
            d="M80 34C52 34 38 52 38 84C38 114 54 135 80 135C106 135 122 114 122 84C122 52 108 34 80 34Z"
            fill={`url(#${uid}-body)`}
          />

          {/* 귀 (좌/우 둥근 곰돌이-정령 귀) */}
          <circle cx="44" cy="42" r="14" fill="#0e8253" />
          <circle cx="44" cy="42" r="9" fill="#74d3a9" />

          <circle cx="116" cy="42" r="14" fill="#0e8253" />
          <circle cx="116" cy="42" r="9" fill="#74d3a9" />

          {/* 배 부분 부드러운 민트 크림 패치 */}
          <path
            d="M80 72C64 72 54 84 54 105C54 123 66 130 80 130C94 130 106 123 106 105C106 84 96 72 80 72Z"
            fill={`url(#${uid}-belly)`}
            opacity="0.9"
          />
        </g>

        {/* ── 머리 위 탐험가 핀 & 모자 ── */}
        <g id="hat-and-pin">
          {/* 탐험가 챙 모자 베이스 */}
          <ellipse cx="80" cy="36" rx="30" ry="7" fill="#f59e0b" />
          <path
            d="M62 35C62 26 70 20 80 20C90 20 98 26 98 35Z"
            fill="#d97706"
          />
          <path
            d="M64 35C64 27 71 22 80 22C89 22 96 27 96 35Z"
            fill="#fbbf24"
          />

          {/* 위치 핀 (📍) 장식 */}
          <path
            d="M80 6C74.5 6 70 10.5 70 16C70 22.5 80 29 80 29C80 29 90 22.5 90 16C90 10.5 85.5 6 80 6Z"
            fill={`url(#${uid}-pin)`}
            stroke="#b45309"
            strokeWidth="1.2"
          />
          <circle cx="80" cy="15" r="3" fill="#ffffff" />
        </g>

        {/* ── 얼굴: 눈, 볼터치, 미소 ── */}
        <g id="face">
          {/* 왼쪽 볼터치 */}
          <ellipse cx="56" cy="79" rx="7" ry="4" fill="#f87171" opacity="0.6" />
          {/* 오른쪽 볼터치 */}
          <ellipse
            cx="104"
            cy="79"
            rx="7"
            ry="4"
            fill="#f87171"
            opacity="0.6"
          />

          {/* 왼쪽 눈 (깜빡임 애니메이션) */}
          <g
            className="keepy-blink-eye"
            style={{ transformOrigin: "67px 70px" }}
          >
            <circle cx="67" cy="70" r="7.5" fill="#17161b" />
            {/* 눈망울 하이라이트 */}
            <circle cx="65" cy="67.5" r="3" fill="#ffffff" />
            <circle cx="69.5" cy="72" r="1.3" fill="#ffffff" />
          </g>

          {/* 오른쪽 눈 (깜빡임 애니메이션) */}
          <g
            className="keepy-blink-eye"
            style={{ transformOrigin: "93px 70px" }}
          >
            <circle cx="93" cy="70" r="7.5" fill="#17161b" />
            {/* 눈망울 하이라이트 */}
            <circle cx="91" cy="67.5" r="3" fill="#ffffff" />
            <circle cx="95.5" cy="72" r="1.3" fill="#ffffff" />
          </g>

          {/* 행복한 미소 입 */}
          <path
            d="M74 81C74 85 86 85 86 81"
            stroke="#0a4b30"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* 오픈 마우스 살짝 귀여운 혀 (포즈에 따라) */}
          {pose === "wave" || pose === "travel" ? (
            <path d="M77 82C77 86 83 86 83 82Z" fill="#f43f5e" opacity="0.8" />
          ) : null}
        </g>

        {/* ── 포즈별 손 및 소품 ── */}
        {/* 1) WAVE 포즈: 한 손 흔들기, 한 손은 배에 */}
        {pose === "wave" && (
          <g id="pose-wave">
            {/* 흔드는 왼손 */}
            <g className="keepy-waving">
              <path
                d="M44 80C34 76 26 65 24 55C23 50 30 48 34 53C37 57 42 66 48 74Z"
                fill="#16a46b"
                stroke="#0e8253"
                strokeWidth="1.5"
              />
              <circle cx="26" cy="52" r="6" fill="#32d892" />
            </g>
            {/* 오른손 (배낭 끈 잡기) */}
            <path
              d="M112 85C118 88 120 96 116 102C112 108 105 106 102 98Z"
              fill="#16a46b"
            />
          </g>
        )}

        {/* 2) SHORTS 포즈: 유튜브 쇼츠 스마트폰을 손에 들고 감상 중 */}
        {pose === "shorts" && (
          <g id="pose-shorts">
            {/* 스마트폰 기기 */}
            <rect
              x="66"
              y="74"
              width="28"
              height="44"
              rx="5"
              fill="#18181b"
              stroke="#52525b"
              strokeWidth="1.5"
            />
            {/* 쇼츠 화면 (유튜브 레드 톤 + 재생 아이콘) */}
            <rect x="68" y="77" width="24" height="38" rx="3" fill="#dc2626" />
            <polygon points="78,92 78,100 86,96" fill="#ffffff" />
            {/* 양손으로 폰 잡기 */}
            <ellipse cx="65" cy="94" rx="5" ry="6" fill="#16a46b" />
            <ellipse cx="95" cy="94" rx="5" ry="6" fill="#16a46b" />
            {/* 폰에서 솟아나는 하트/스파클 */}
            <path
              d="M62 68C60 66 57 67 57 69C57 72 62 75 62 75C62 75 67 72 67 69C67 67 64 66 62 68Z"
              fill="#ff4b72"
              className="keepy-sparkle-dot"
            />
          </g>
        )}

        {/* 3) DETECT 포즈: 돋보기로 장소를 찾고 스파클 발생 */}
        {pose === "detect" && (
          <g id="pose-detect">
            {/* 돋보기 프레임 */}
            <circle
              cx="50"
              cy="75"
              r="14"
              fill="#e0f2fe"
              fillOpacity="0.7"
              stroke="#f59e0b"
              strokeWidth="3"
            />
            {/* 돋보기 손잡이 */}
            <line
              x1="40"
              y1="85"
              x2="28"
              y2="97"
              stroke="#b45309"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* 돋보기 안 장소 핀 확대 */}
            <circle cx="50" cy="74" r="5" fill="#16a46b" />
            <circle cx="50" cy="74" r="2" fill="#ffffff" />
            {/* 번쩍이는 영감 스파클 */}
            <polygon
              points="110,48 113,54 119,55 114,59 116,65 110,61 104,65 106,59 101,55 107,54"
              fill="#fbbf24"
              className="keepy-sparkle-dot"
            />
          </g>
        )}

        {/* 4) TRAVEL 포즈: 지도와 나침반을 들고 앞으로 출발 */}
        {pose === "travel" && (
          <g id="pose-travel">
            {/* 접힌 여행 지도 */}
            <polygon
              points="40,82 58,76 74,84 56,90"
              fill="#fef08a"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            <polygon
              points="58,76 74,84 72,100 56,92"
              fill="#fde047"
              stroke="#ca8a04"
              strokeWidth="1"
            />
            {/* 앞발 */}
            <ellipse cx="44" cy="90" rx="6" ry="5" fill="#16a46b" />
            <ellipse cx="76" cy="92" rx="6" ry="5" fill="#16a46b" />
            {/* 방향 나침반 */}
            <circle
              cx="114"
              cy="88"
              r="8"
              fill="#ffffff"
              stroke="#16a46b"
              strokeWidth="1.5"
            />
            <polygon points="114,83 117,88 114,93 111,88" fill="#ef4444" />
          </g>
        )}

        {/* 5) FLOAT 포즈: 가이드 모드 */}
        {pose === "float" && (
          <g id="pose-float">
            <ellipse cx="46" cy="92" rx="7" ry="5" fill="#16a46b" />
            <ellipse cx="114" cy="92" rx="7" ry="5" fill="#16a46b" />
            <polygon
              points="28,32 30,37 35,38 31,41 32,46 28,43 24,46 25,41 21,38 26,37"
              fill="#38bdf8"
              className="keepy-sparkle-dot"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
