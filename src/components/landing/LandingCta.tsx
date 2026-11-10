"use client";

import React from "react";
import { ScrollReveal } from "./ScrollReveal";
import { KeepyMascot } from "../brand/KeepyMascot";

interface LandingCtaProps {
  onStartLogin: () => void;
}

export function LandingCta({ onStartLogin }: LandingCtaProps) {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-white dark:bg-[#141815]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <ScrollReveal animation="zoom-in">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#16a46b] via-[#128a58] to-[#095435] text-white p-8 sm:p-14 text-center shadow-2xl">
            {/* 내부 장식 파티클 */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-[#f2a33c]/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              {/* 캐릭터 센터 배치 */}
              <div className="flex justify-center -mb-2">
                <KeepyMascot
                  pose="travel"
                  size={120}
                  bubbleText="지금 떠날 시간이야! 🚀"
                  reserveBubbleSpace
                  className="hover:scale-105 transition-transform"
                />
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                이번 주말, 쇼츠 속 그곳으로
                <br />
                <span className="text-emerald-200">진짜 떠나볼까요?</span>
              </h2>

              <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed max-w-xl mx-auto">
                알고리즘 속에 잠들어 있던 수많은 핫플들,
                <br className="hidden sm:inline" />
                KeepGo가 당신만의 특별한 하루 여행 코스로 깨워드립니다.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={onStartLogin}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-gray-100 text-[#0e8a58] font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                  </svg>
                  <span>Google 계정으로 무료 시작</span>
                </button>
              </div>

              <p className="text-xs text-emerald-200/80 pt-1">
                🔒 Google 공식 OAuth 2.0 보안 인증 · 언제든지 원클릭 연동 해제
                가능
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
