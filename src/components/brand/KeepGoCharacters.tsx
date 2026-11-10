import React from "react";

export type CharacterName = "popo" | "chichi" | "keepy" | "ruru";

interface CharacterProps {
  name: CharacterName;
  size?: number;
  className?: string;
  animate?: boolean;
  bubbleText?: string;
  onClick?: () => void;
}

export function KeepGoCharacter({
  name,
  size = 130,
  className = "",
  animate = true,
  bubbleText,
  onClick,
}: CharacterProps) {
  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onClick={onClick}
      style={{ width: `${size}px` }}
    >
      {/* ── 상단 말풍선 ── */}
      {bubbleText && (
        <div className="absolute -top-11 z-20 whitespace-nowrap px-3 py-1 rounded-full bg-white dark:bg-[#1f2622] shadow-md border border-gray-100 dark:border-gray-700 text-[11px] font-bold text-gray-800 dark:text-gray-100 animate-bounce">
          {bubbleText}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-white dark:bg-[#1f2622] border-r border-b border-gray-100 dark:border-gray-700 rotate-45" />
        </div>
      )}

      {/* ── 캐릭터 본체 SVG ── */}
      <div
        className={`w-full transition-transform duration-300 ${
          animate ? "character-float-anim" : ""
        } ${onClick ? "cursor-pointer hover:scale-105 active:scale-95" : ""}`}
      >
        {name === "popo" && <PopoCharacter size={size} />}
        {name === "chichi" && <ChichiCharacter size={size} />}
        {name === "keepy" && <KeepyV2Character size={size} />}
        {name === "ruru" && <RuruCharacter size={size} />}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. 포포 (Popo) — 당근 스타일 뽀송 토끼 (발걸음 & 걷기 마스코트)
   ───────────────────────────────────────────────────────────── */
function PopoCharacter({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* 포포 부드러운 화이트 클레이 그라데이션 */}
        <radialGradient id="popo-body" cx="40%" cy="35%" r="65%">
          <stop stopColor="#ffffff" />
          <stop offset="0.75" stopColor="#f4f4f7" />
          <stop offset="1" stopColor="#e3e3ea" />
        </radialGradient>
        {/* 초록색 잎사귀 모자 (당근 레퍼런스 스타일) */}
        <linearGradient
          id="popo-leaf"
          x1="40"
          y1="30"
          x2="100"
          y2="70"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2dd88e" />
          <stop offset="1" stopColor="#129e64" />
        </linearGradient>
        {/* 작은 오렌지 토트백 */}
        <linearGradient
          id="popo-bag"
          x1="18"
          y1="80"
          x2="42"
          y2="105"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff8933" />
          <stop offset="1" stopColor="#e85d04" />
        </linearGradient>
        {/* 그림자 */}
        <ellipse
          id="char-shadow"
          cx="70"
          cy="132"
          rx="36"
          ry="7"
          fill="#000000"
          fillOpacity="0.1"
        />
      </defs>

      <use href="#char-shadow" />

      {/* ── 토끼 귀 (뒤쪽) ── */}
      {/* 왼쪽 귀 */}
      <path
        d="M50 45 C45 20, 52 5, 60 5 C68 5, 68 22, 62 45 Z"
        fill="url(#popo-body)"
        stroke="#e2e1ec"
        strokeWidth="1.5"
      />
      <path
        d="M54 38 C51 22, 55 12, 60 12 C64 12, 64 22, 60 38 Z"
        fill="#fed7aa"
        opacity="0.7"
      />

      {/* 오른쪽 귀 */}
      <path
        d="M78 45 C72 22, 74 5, 82 5 C90 5, 95 20, 89 45 Z"
        fill="url(#popo-body)"
        stroke="#e2e1ec"
        strokeWidth="1.5"
      />
      <path
        d="M80 38 C76 22, 78 12, 83 12 C88 12, 90 22, 86 38 Z"
        fill="#fed7aa"
        opacity="0.7"
      />

      {/* ── 둥글고 통통한 몸체 ── */}
      <path
        d="M70 42 C42 42, 30 62, 30 88 C30 114, 46 128, 70 128 C94 128, 110 114, 110 88 C110 62, 98 42, 70 42 Z"
        fill="url(#popo-body)"
      />

      {/* ── 머리 위 초록 잎사귀 모자 (당근 스타일 3단 퐁퐁) ── */}
      <g id="leaf-hair">
        {/* 가운데 잎 */}
        <ellipse cx="70" cy="45" rx="14" ry="12" fill="url(#popo-leaf)" />
        {/* 왼쪽 잎 */}
        <ellipse cx="56" cy="48" rx="12" ry="10" fill="url(#popo-leaf)" />
        {/* 오른쪽 잎 */}
        <ellipse cx="84" cy="48" rx="12" ry="10" fill="url(#popo-leaf)" />
        {/* 잎사귀 하이라이트 */}
        <ellipse cx="68" cy="40" rx="6" ry="3" fill="#ffffff" opacity="0.3" />
      </g>

      {/* ── 얼굴 (당근 스타일 앙증맞은 이목구비) ── */}
      {/* 볼터치 */}
      <ellipse cx="48" cy="78" rx="6" ry="3.5" fill="#f87171" opacity="0.5" />
      <ellipse cx="92" cy="78" rx="6" ry="3.5" fill="#f87171" opacity="0.5" />

      {/* 동그란 눈 */}
      <circle cx="58" cy="70" r="3.8" fill="#1f1e24" />
      <circle cx="56.5" cy="68.5" r="1.3" fill="#ffffff" />
      <circle cx="82" cy="70" r="3.8" fill="#1f1e24" />
      <circle cx="80.5" cy="68.5" r="1.3" fill="#ffffff" />

      {/* 작은 코와 'ㅅ'자 입 */}
      <path d="M70 73 L68.5 75.5 H71.5 Z" fill="#1f1e24" />
      <path
        d="M66 77 C68 79, 70 79, 70 77 C70 79, 72 79, 74 77"
        stroke="#1f1e24"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* ── 걷는 발과 앙증맞은 신발 ── */}
      {/* 왼발 (앞으로 딛음) */}
      <ellipse cx="58" cy="126" rx="9" ry="6" fill="#16a46b" />
      <path
        d="M52 126 Q58 123 64 126"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* 오른발 */}
      <ellipse cx="84" cy="125" rx="8" ry="5.5" fill="#16a46b" />
      <path
        d="M79 125 Q84 122 89 125"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* ── 주황색 작은 토트백 (당근 스타일) ── */}
      <g transform="translate(18, 76)">
        {/* 가방 끈 */}
        <path
          d="M8 8 C8 0, 16 0, 16 8"
          stroke="#b45309"
          strokeWidth="1.5"
          fill="none"
        />
        {/* 가방 본체 */}
        <rect
          x="3"
          y="7"
          width="18"
          height="16"
          rx="3.5"
          fill="url(#popo-bag)"
        />
        {/* 손잡이 손 */}
        <circle cx="9" cy="8" r="4.5" fill="url(#popo-body)" />
        {/* 가방 속 새싹 핀 */}
        <circle cx="12" cy="15" r="2.5" fill="#ffffff" />
      </g>

      {/* ── 오른손 (흔들며 씩씩하게 전진) ── */}
      <ellipse cx="98" cy="84" rx="6" ry="7" fill="url(#popo-body)" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. 치치 (Chichi) — 카카오 춘식이 스타일 꿀버터 먹보 수달/햄스터
   ───────────────────────────────────────────────────────────── */
function ChichiCharacter({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* 치치 춘식이풍 따뜻한 꿀버터 옐로우 */}
        <radialGradient id="chichi-body" cx="45%" cy="35%" r="65%">
          <stop stopColor="#ffd868" />
          <stop offset="0.8" stopColor="#f5be38" />
          <stop offset="1" stopColor="#e5a820" />
        </radialGradient>
        {/* 뽀얀 주둥이/볼 */}
        <ellipse
          id="chichi-muzzle"
          cx="70"
          cy="77"
          rx="14"
          ry="10"
          fill="#ffffff"
        />
      </defs>

      {/* 바닥 그림자 */}
      <ellipse
        cx="70"
        cy="130"
        rx="34"
        ry="7"
        fill="#000000"
        fillOpacity="0.1"
      />

      {/* ── 둥근 귀 ── */}
      <circle
        cx="44"
        cy="46"
        r="10"
        fill="url(#chichi-body)"
        stroke="#d99b1c"
        strokeWidth="1.2"
      />
      <circle cx="44" cy="46" r="6" fill="#e5a820" opacity="0.6" />
      <circle
        cx="96"
        cy="46"
        r="10"
        fill="url(#chichi-body)"
        stroke="#d99b1c"
        strokeWidth="1.2"
      />
      <circle cx="96" cy="46" r="6" fill="#e5a820" opacity="0.6" />

      {/* ── 둥글넓적 통통한 바디 ── */}
      <path
        d="M70 42 C44 42, 34 60, 34 86 C34 112, 48 126, 70 126 C92 126, 106 112, 106 86 C106 60, 96 42, 70 42 Z"
        fill="url(#chichi-body)"
      />

      {/* ── 뽈록 나온 배 패치 ── */}
      <ellipse cx="70" cy="104" rx="20" ry="14" fill="#fffbeb" opacity="0.8" />

      {/* ── 얼굴: 춘식이 이목구비 ── */}
      {/* 뽀얀 주둥이 */}
      <ellipse cx="70" cy="74" rx="15" ry="10" fill="#ffffff" />

      {/* 앙증맞은 까만 눈 */}
      <circle cx="54" cy="65" r="3.2" fill="#17161a" />
      <circle cx="86" cy="65" r="3.2" fill="#17161a" />

      {/* 눈썹 살짝 */}
      <path
        d="M51 58 Q54 56 57 58"
        stroke="#92400e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M83 58 Q86 56 89 58"
        stroke="#92400e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 동그란 까만 코 */}
      <ellipse cx="70" cy="70" rx="3.5" ry="2.8" fill="#17161a" />

      {/* 'ㅅ'자 입 & 낼름 혓바닥 */}
      <path
        d="M66 75 C68 77, 70 77, 70 75 C70 77, 72 77, 74 75"
        stroke="#17161a"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* 낼름 귀여운 혀 */}
      <path d="M68 76 C68 80, 72 80, 72 76 Z" fill="#f43f5e" />

      {/* 발그레 볼 */}
      <ellipse cx="44" cy="72" rx="6" ry="3.5" fill="#fb7185" opacity="0.6" />
      <ellipse cx="96" cy="72" rx="6" ry="3.5" fill="#fb7185" opacity="0.6" />

      {/* ── 앙증맞은 다리 ── */}
      <ellipse cx="57" cy="124" rx="8" ry="6" fill="#e5a820" />
      <ellipse cx="83" cy="124" rx="8" ry="6" fill="#e5a820" />

      {/* ── 양손: 맛있는 디저트/포크 들고 행복해함 ── */}
      {/* 왼손: 작은 포크 */}
      <g transform="translate(26, 80)">
        <line
          x1="12"
          y1="2"
          x2="6"
          y2="18"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10 2 L14 4 L12 8"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="10" r="5" fill="url(#chichi-body)" />
      </g>
      {/* 오른손: 배에 올리고 만족 */}
      <ellipse cx="98" cy="88" rx="6" ry="6" fill="url(#chichi-body)" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. 키피 (Keepy v2) — 당근/카카오풍으로 한층 더 동글납작 귀여워진 에메랄드 탐험곰
   ───────────────────────────────────────────────────────────── */
function KeepyV2Character({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="keepy-v2" cx="45%" cy="35%" r="65%">
          <stop stopColor="#38e29a" />
          <stop offset="0.75" stopColor="#16a46b" />
          <stop offset="1" stopColor="#0c7d4e" />
        </radialGradient>
      </defs>

      <ellipse
        cx="70"
        cy="130"
        rx="34"
        ry="7"
        fill="#000000"
        fillOpacity="0.1"
      />

      {/* 둥근 귀 */}
      <circle cx="44" cy="46" r="10" fill="#0c7d4e" />
      <circle cx="44" cy="46" r="6" fill="#74d3a9" />
      <circle cx="96" cy="46" r="10" fill="#0c7d4e" />
      <circle cx="96" cy="46" r="6" fill="#74d3a9" />

      {/* 몸체 */}
      <path
        d="M70 42 C44 42, 34 60, 34 86 C34 112, 48 126, 70 126 C92 126, 106 112, 106 86 C106 60, 96 42, 70 42 Z"
        fill="url(#keepy-v2)"
      />

      {/* 머리 위 위치 핀(📍) 미니 모자 */}
      <path
        d="M70 20 C64 20, 60 25, 60 30 C60 36, 70 42, 70 42 C70 42, 80 36, 80 30 C80 25, 76 20, 70 20 Z"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="1.2"
      />
      <circle cx="70" cy="28" r="2.8" fill="#ffffff" />

      {/* 뽀얀 민트 배 패치 */}
      <ellipse cx="70" cy="98" rx="18" ry="16" fill="#effaf4" opacity="0.85" />

      {/* 이목구비 */}
      <circle cx="56" cy="68" r="3.5" fill="#17161a" />
      <circle cx="54.8" cy="66.5" r="1.2" fill="#ffffff" />
      <circle cx="84" cy="68" r="3.5" fill="#17161a" />
      <circle cx="82.8" cy="66.5" r="1.2" fill="#ffffff" />

      {/* 앙증맞은 볼터치 */}
      <ellipse cx="46" cy="74" rx="5.5" ry="3" fill="#f87171" opacity="0.6" />
      <ellipse cx="94" cy="74" rx="5.5" ry="3" fill="#f87171" opacity="0.6" />

      {/* 미소 */}
      <path
        d="M66 76 C68 78.5, 72 78.5, 74 76"
        stroke="#064e3b"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* 돋보기 들고 있는 손 */}
      <g transform="translate(86, 72)">
        <circle
          cx="14"
          cy="8"
          r="8"
          fill="#e0f2fe"
          stroke="#f59e0b"
          strokeWidth="2"
          opacity="0.85"
        />
        <line
          x1="8"
          y1="14"
          x2="2"
          y2="20"
          stroke="#b45309"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="14" cy="8" r="2.5" fill="#16a46b" />
        <ellipse cx="6" cy="14" rx="4.5" ry="4.5" fill="url(#keepy-v2)" />
      </g>

      {/* 왼손 안녕 */}
      <ellipse cx="40" cy="82" rx="5.5" ry="6.5" fill="url(#keepy-v2)" />

      {/* 발 */}
      <ellipse cx="58" cy="124" rx="8" ry="6" fill="#0c7d4e" />
      <ellipse cx="82" cy="124" rx="8" ry="6" fill="#0c7d4e" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. 루루 (Ruru) — 코스 완주를 축하하는 나침반 아기새
   ───────────────────────────────────────────────────────────── */
function RuruCharacter({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="ruru-body" cx="45%" cy="35%" r="65%">
          <stop stopColor="#fef08a" />
          <stop offset="0.8" stopColor="#facc15" />
          <stop offset="1" stopColor="#eab308" />
        </radialGradient>
      </defs>

      <ellipse
        cx="70"
        cy="126"
        rx="26"
        ry="6"
        fill="#000000"
        fillOpacity="0.1"
      />

      {/* 머리 위 뿅 솟은 새싹 털 */}
      <path d="M70 42 Q68 28 62 25 Q70 28 70 42" fill="#16a46b" />
      <path d="M70 42 Q74 28 80 27 Q72 30 70 42" fill="#34d399" />

      {/* 둥글둥글 솜뭉치 몸체 */}
      <circle cx="70" cy="80" r="36" fill="url(#ruru-body)" />

      {/* 날개 (좌/우) */}
      <ellipse
        cx="36"
        cy="84"
        rx="8"
        ry="12"
        fill="#eab308"
        transform="rotate(-15 36 84)"
      />
      <ellipse
        cx="104"
        cy="84"
        rx="8"
        ry="12"
        fill="#eab308"
        transform="rotate(15 104 84)"
      />

      {/* 하얀 가슴 깃털 */}
      <ellipse cx="70" cy="94" rx="18" ry="14" fill="#ffffff" opacity="0.9" />

      {/* 앙증맞은 눈 */}
      <circle cx="56" cy="74" r="3" fill="#17161a" />
      <circle cx="84" cy="74" r="3" fill="#17161a" />

      {/* 작은 오렌지 부리 */}
      <polygon points="66,78 74,78 70,84" fill="#f97316" />

      {/* 볼터치 */}
      <ellipse cx="48" cy="80" rx="4" ry="2.5" fill="#f87171" opacity="0.6" />
      <ellipse cx="92" cy="80" rx="4" ry="2.5" fill="#f87171" opacity="0.6" />

      {/* 가슴에 반짝이는 나침반 별 배지 */}
      <polygon
        points="70,90 72,94 76,95 73,98 74,102 70,100 66,102 67,98 64,95 68,94"
        fill="#f59e0b"
      />

      {/* 작은 발 */}
      <ellipse cx="62" cy="116" rx="5" ry="3.5" fill="#ea580c" />
      <ellipse cx="78" cy="116" rx="5" ry="3.5" fill="#ea580c" />
    </svg>
  );
}
