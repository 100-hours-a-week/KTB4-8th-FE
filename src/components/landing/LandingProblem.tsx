"use client";

import React from "react";
import { ScrollReveal } from "./ScrollReveal";
import { KeepyMascot } from "../brand/KeepyMascot";

export function LandingProblem() {
  const problems = [
    {
      emoji: "📱",
      badge: "끝없는 스크롤",
      title: "좋아요는 눌렀는데… 어디 있었더라?",
      desc: "쇼츠 보며 가고 싶었던 맛집을 막상 주말에 찾으려면 수백 개의 좋아요 목록을 뒤지다 결국 포기하게 됩니다.",
    },
    {
      emoji: "✍️",
      badge: "수동 검색 노가다",
      title: "영상 멈추고 지도 앱에 타이핑 검색",
      desc: "영상 속 찰나의 간판과 자막을 보며 일시정지하고, 지도 앱 켜서 일일이 상호명을 검색해 북마크하는 번거로움.",
    },
    {
      emoji: "🧭",
      badge: "동선 낭비",
      title: "막상 가보니 반대편… 꼬여버린 일정",
      desc: "저장해둔 카페와 식당의 위치가 서울 끝과 끝! 이동 시간만 1시간 반씩 걸려 길 위에서 에너지를 다 쏟습니다.",
    },
  ];

  return (
    <section
      id="problem"
      className="py-20 md:py-28 bg-gray-50/70 dark:bg-[#131714] border-y border-gray-100 dark:border-gray-800/80"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* 상단 타이틀 */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16a46b] bg-[#effaf4] dark:bg-[#152a1f] px-3 py-1 rounded-full border border-[#16a46b]/20">
              Why KeepGo
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17161b] dark:text-white mt-4 mb-4 tracking-tight">
              쇼츠 속 멋진 장소들,
              <br />
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                왜 우리는 늘 가보지 못했을까요?
              </span>
            </h2>
            {/* 데스크톱(lg 이상)은 한 줄, 그보다 좁으면 쉼표 뒤에서 두 줄로 나눈다. 폭 390px 미만 폰은 둘째 줄이 넘치지 않게 폭에 맞춰 글자를 조금 줄인다(둘째 문장이 약 25em, 여유를 두고 26으로 나눈다) */}
            <p className="text-sm max-[389px]:text-[length:calc((100vw_-_40px)_/_26)] sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              <span className="block lg:inline">
                매일 쏟아지는 핫플 영상에 &lsquo;좋아요&rsquo;는 늘어나지만,
              </span>{" "}
              <span className="block lg:inline">
                현실 여행으로 이어지기까지는 너무 많은 수고가 필요했습니다.
              </span>
            </p>
          </div>
        </ScrollReveal>

        {/* 3가지 페인포인트 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((item, idx) => (
            <ScrollReveal
              key={idx}
              animation="fade-up"
              delayMs={idx * 150}
              className="h-full"
            >
              <div className="h-full p-7 rounded-3xl bg-white dark:bg-[#1a201c] border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ── KeepGo 솔루션 배너 + 키피의 해결책 ── */}
        <ScrollReveal animation="zoom-in" delayMs={300} className="mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#16a46b] via-[#108c58] to-[#0a6b44] p-8 sm:p-10 text-white shadow-xl">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-emerald-100">
                  KeepGo의 해결책 ✨
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">
                  &ldquo;영상 저장만 하세요, 여행 계획은 KeepGo가 다
                  세워둘게요.&rdquo;
                </h3>
                <p className="text-sm text-emerald-50 leading-relaxed max-w-xl">
                  당신이 YouTube 쇼츠에서 좋아요를 누르는 순간, Gemini AI가
                  장소를 감지하고 네이버 지도와 동선 최적화 알고리즘이 완벽한
                  하루 코스로 정리해 둡니다.
                </p>
              </div>

              <div className="md:col-span-4 flex justify-center md:justify-end">
                <KeepyMascot
                  pose="travel"
                  size={120}
                  bubbleText="모든 준비는 끝났어! 🗺️"
                  reserveBubbleSpace
                  className="hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* 배경 기하학 장식 */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
