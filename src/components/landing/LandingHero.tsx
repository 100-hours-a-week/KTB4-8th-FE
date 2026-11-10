"use client";

import React from "react";
import { LiveDemoSimulator } from "./LiveDemoSimulator";
import { KeepyMascot } from "../brand/KeepyMascot";

interface LandingHeroProps {
  onStartLogin: () => void;
}

export function LandingHero({ onStartLogin }: LandingHeroProps) {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
      {/* ── 배경 장식 오르브 (Glow Orbs) ── */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-[#16a46b]/15 to-[#32d892]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-gradient-to-bl from-[#f2a33c]/15 to-[#ffb347]/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* 아래쪽 여백(sm:pb-[173px])은 시뮬레이터 창 밑의 안내 문구 · 마스코트 자리다.
            열 안이 아니라 여기에 둬서, 왼쪽 글이 오른쪽 "창"만 기준으로 세로 가운데에 놓인다 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center sm:pb-[173px]">
          {/* ── 좌측 카피 & CTA (6 cols) ── */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* 상단 칩 */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#effaf4] dark:bg-[#152a1f] border border-[#16a46b]/30 text-xs font-semibold text-[#0a5236] dark:text-[#74d3a9] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#16a46b] animate-pulse" />
              <span>YouTube Shorts × Gemini AI 여행 플래너</span>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-3xl sm:text-5xl lg:text-[50px] font-extrabold text-[#17161b] dark:text-white leading-[1.18] tracking-tight">
              저장만 해둔 유튜브 쇼츠,
              <br />
              <span className="bg-gradient-to-r from-[#16a46b] via-[#21b777] to-[#0e8a58] bg-clip-text text-transparent">
                이제 진짜 떠나요
              </span>
            </h1>

            {/* 서브 카피 */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              알고리즘에서 좋아요 누르고 잊어버린 핫플들.
              <br className="hidden sm:inline" />
              <strong className="font-semibold text-gray-900 dark:text-white">
                Google 로그인 한 번
              </strong>
              으로 AI가 영상 속 숨은 장소를 쏙쏙 찾아내고, 동선까지 최적화된
              나만의 하루 여행 코스를 완성해 드립니다.
            </p>

            {/* CTA 버튼 그룹 */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                type="button"
                onClick={onStartLogin}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#16a46b] hover:bg-[#0e8a58] text-white font-bold text-base shadow-xl shadow-[#16a46b]/30 hover:shadow-2xl hover:shadow-[#16a46b]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 group"
              >
                {/* Google Icon */}
                <svg
                  className="w-5 h-5 fill-current shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                <span>Google 계정으로 10초 만에 시작하기</span>
                <span className="text-emerald-200 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("process")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-[#1a231e] hover:bg-gray-50 dark:hover:bg-[#222c26] text-gray-700 dark:text-gray-200 font-semibold text-sm border border-gray-200 dark:border-gray-800 transition-colors"
              >
                작동 방식 보기 ↓
              </button>
            </div>

            {/* 신뢰 포인트 */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="text-[#16a46b]">✓</span> Google OAuth 2.0 공식
                보안 프로토콜
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#16a46b]">✓</span> 실시간 진행률 &amp;
                네이버 지도 매핑
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#16a46b]">✓</span> 무료 이용 및 즉시 연동
                해제 가능
              </span>
            </div>
          </div>

          {/* ── 우측: 실제 화면 카드 인터랙티브 시뮬레이터 (6 cols) ── */}
          {/* 창은 앱 카드(350px) 폭에 맞춰 좁게 두고, 마스코트는 그 창을 기준으로 앉힌다.
              아래쪽 여백은 마스코트(와 말풍선)가 카드를 가리지 않고 창 밑에 앉을 자리 */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[420px]">
              <LiveDemoSimulator />

              {/* 우하단 마스코트 키피가 시뮬레이터를 가리키며 인사 */}
              <div className="hidden sm:block absolute top-full mt-[100px] -right-10 z-20 pointer-events-auto">
                <KeepyMascot
                  pose="detect"
                  size={110}
                  bubbleText="이렇게 동작해요! 🔍"
                  className="hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
