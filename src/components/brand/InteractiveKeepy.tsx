"use client";

import React, { useEffect, useRef, useState } from "react";
import { KeepyMascot, type KeepyPose } from "./KeepyMascot";

interface SpeechState {
  text: string;
  pose: KeepyPose;
}

/* 스크롤 구간별 포즈 · 멘트 — 구간이 바뀌면 포즈만 바뀌고, 말풍선은 키피를 눌렀을 때만 뜬다 */
const SECTION_SPEECH: SpeechState[] = [
  { text: "안녕! 난 여행 메이트 키피야 🎒", pose: "wave" },
  { text: "저장만 해둔 쇼츠, 너무 아깝죠? 💭", pose: "shorts" },
  { text: "AI가 장소를 쏙쏙 찾아내요! 🔍", pose: "detect" },
  { text: "Google 공식 로그인으로 안전해요 🔒", pose: "float" },
  { text: "이번 주말, 저랑 같이 떠나요! 🚀", pose: "travel" },
];

/** 스크롤 진행률(%) → 구간 번호 */
function sectionOf(progress: number) {
  if (progress < 22) return 0;
  if (progress < 45) return 1;
  if (progress < 70) return 2;
  if (progress < 90) return 3;
  return 4;
}

/** 말풍선이 떠 있는 시간 — 오래 두면 오른쪽 내용을 가린다 */
const BUBBLE_MS = 3500;

/* 화면 오른쪽 아래의 작은 키피.
   내용을 가리지 않도록: 캐릭터는 작게 두고, 말풍선은 키피를 눌렀을 때만 잠깐 보여 준다
   (스크롤로 구간이 바뀔 때는 포즈만 바꾸고 살짝 뛴다 — 말풍선이 자동으로 뜨면 오른쪽 내용을 덮는다).
   말풍선은 클릭을 받지 않아(pointer-events-none) 뒤의 글자 · 버튼을 누르는 데 방해되지 않는다. */
export function InteractiveKeepy() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [speech, setSpeech] = useState<SpeechState>(SECTION_SPEECH[0]);
  const [showBubble, setShowBubble] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const sectionRef = useRef(-1);
  const bubbleTimer = useRef<number | null>(null);

  function flashBubble(next: SpeechState) {
    setSpeech(next);
    setShowBubble(true);
    if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(
      () => setShowBubble(false),
      BUBBLE_MS,
    );
  }

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      // 60px 이상 스크롤 시 플로팅 캐릭터 표시
      setIsVisible(scrollTop > 60);

      const section = sectionOf(progress);
      if (section !== sectionRef.current) {
        const first = sectionRef.current === -1;
        sectionRef.current = section;
        setSpeech(SECTION_SPEECH[section]);
        // 처음 로드할 때를 빼고, 구간이 바뀌면 살짝 뛰어서 알린다
        if (!first) {
          setIsJumping(true);
          window.setTimeout(() => setIsJumping(false), 600);
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (bubbleTimer.current) window.clearTimeout(bubbleTimer.current);
    };
  }, []);

  function handleKeepyClick() {
    setIsJumping(true);
    const clickQuotes: SpeechState[] = [
      { text: "쇼츠 속 그 감성 카페, 가보실래요? ☕", pose: "detect" },
      { text: "구글 로그인 한 번이면 끝나요! ✨", pose: "shorts" },
      { text: "저장만 하던 주말은 이제 안녕! 🎒", pose: "wave" },
      { text: "키피가 완벽한 하루를 선물할게요 💚", pose: "float" },
    ];
    flashBubble(clickQuotes[Math.floor(Math.random() * clickQuotes.length)]);
    window.setTimeout(() => setIsJumping(false), 600);
  }

  if (!isVisible) return null;

  return (
    <aside
      aria-label="KeepGo 플로팅 마스코트 키피"
      className="fixed bottom-4 right-3 sm:right-5 z-50 flex flex-col items-end pointer-events-none"
    >
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1f2421] shadow-lg border border-[#16a46b]/30 text-[11px] font-semibold text-[#16a46b] hover:scale-105 active:scale-95 transition-transform"
          title="키피 열기"
        >
          <span className="w-2 h-2 rounded-full bg-[#16a46b]" />
          <span>키피</span>
        </button>
      ) : (
        <div className="relative flex flex-col items-end">
          {/* 말풍선 — 잠깐만 보이고, 클릭을 받지 않는다 */}
          <div
            aria-live="polite"
            className={`pointer-events-none absolute bottom-full right-0 mb-1 w-max max-w-[200px] px-3 py-2 rounded-2xl bg-white/95 dark:bg-[#1a231e]/95 shadow-lg border border-[#16a46b]/25 text-xs text-[#17161b] dark:text-[#effaf4] transition-all duration-300 ${
              showBubble
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1"
            }`}
          >
            <span className="block font-bold text-[#16a46b] text-[10px] mb-0.5">
              탐험 메이트 키피
            </span>
            <span className="leading-snug">{speech.text}</span>
          </div>

          {/* 숨기기 버튼 — 손을 흔드는 캐릭터의 팔 · 귀를 가리지 않게 위로 띄운다 */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="pointer-events-auto absolute -top-3 -left-1 z-30 w-5 h-5 rounded-full bg-white/90 dark:bg-black/60 shadow border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 text-[10px] flex items-center justify-center transition-colors"
            title="키피 숨기기"
            aria-label="키피 숨기기"
          >
            ✕
          </button>

          {/* 키피 아바타 — 작게 */}
          <div
            onClick={handleKeepyClick}
            className={`pointer-events-auto cursor-pointer transition-transform duration-200 select-none ${
              isJumping ? "-translate-y-3 scale-110" : "hover:scale-105"
            }`}
          >
            <KeepyMascot pose={speech.pose} size={64} animate={!isJumping} />
          </div>
        </div>
      )}
    </aside>
  );
}
