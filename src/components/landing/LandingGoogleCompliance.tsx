"use client";

import React from "react";
import { ScrollReveal } from "./ScrollReveal";

export function LandingGoogleCompliance() {
  return (
    <section
      id="compliance"
      className="py-20 md:py-28 bg-[#effaf4]/60 dark:bg-[#111e17] border-y border-[#16a46b]/20"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0a5236] dark:text-[#74d3a9] bg-white dark:bg-[#162e22] px-3.5 py-1 rounded-full border border-[#16a46b]/30 shadow-sm">
              <svg
                className="w-3.5 h-3.5 fill-current text-[#16a46b]"
                viewBox="0 0 24 24"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <span>Google API Services User Data Policy Compliance</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17161b] dark:text-white mt-4 mb-4 tracking-tight">
              사용자의 소중한 데이터,
              <br />
              <span className="text-[#16a46b]">
                철저하고 투명하게 보호합니다
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              KeepGo는 구글 공식 보안 표준과 사용자 데이터 제한적 사용
              정책(Limited Use Requirements)을 철저히 준수합니다.
            </p>
          </div>
        </ScrollReveal>

        {/* 4대 보안 원칙 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {/* 1. 최소 권한의 원칙 */}
          <ScrollReveal animation="fade-up" delayMs={100}>
            <div className="p-7 rounded-3xl bg-white dark:bg-[#18231c] border border-gray-200/80 dark:border-gray-800 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#16a46b] flex items-center justify-center font-bold text-sm">
                    01
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    최소한의 읽기(Read-only) 권한만 요청
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  KeepGo는 YouTube의{" "}
                  <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    .../auth/youtube.readonly
                  </code>{" "}
                  단 하나의 권한만을 사용합니다.
                </p>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 space-y-1">
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">
                    ❌ 절대 하지 않는 행위:
                  </p>
                  <p>
                    • 사용자 명의의 동영상 업로드 / 댓글 작성 / 채널 구독 변경
                  </p>
                  <p>• 비공개 개인정보 열람 및 불필요한 유튜브 활동 추적</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* 2. 장소 추출 단일 목적 활용 */}
          <ScrollReveal animation="fade-up" delayMs={200}>
            <div className="p-7 rounded-3xl bg-white dark:bg-[#18231c] border border-gray-200/80 dark:border-gray-800 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#16a46b] flex items-center justify-center font-bold text-sm">
                    02
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    여행 코스 추천 목적 외 활용 엄격 금지
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  수집된 쇼츠 데이터는 사용자가 요청한 ‘장소 추출 및 여행 일정
                  생성’ 단 하나의 기능에만 사용됩니다.
                </p>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 space-y-1">
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">
                    🛡️ 데이터 안전 보장:
                  </p>
                  <p>
                    • 제3자 마케팅사, 데이터 브로커 대상 판매/공유 일절 불가
                  </p>
                  <p>• 외부 광고 타겟팅 목적의 프로파일링 원천 차단</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* 3. 엔드투엔드 암호화 */}
          <ScrollReveal animation="fade-up" delayMs={300}>
            <div className="p-7 rounded-3xl bg-white dark:bg-[#18231c] border border-gray-200/80 dark:border-gray-800 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#16a46b] flex items-center justify-center font-bold text-sm">
                    03
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    강력한 전송/보관 암호화 (AES-256 & TLS 1.3)
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  Google과의 모든 통신은 최신 TLS 1.3 암호화 프로토콜을 통하며,
                  임시 토큰과 세션 데이터는 업계 표준 암호화 알고리즘으로
                  안전하게 보호됩니다.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* 4. 언제든 철회 및 즉시 영구 삭제 */}
          <ScrollReveal animation="fade-up" delayMs={400}>
            <div className="p-7 rounded-3xl bg-white dark:bg-[#18231c] border border-gray-200/80 dark:border-gray-800 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#16a46b] flex items-center justify-center font-bold text-sm">
                    04
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    언제든지 원클릭 연동 해제 및 데이터 파기
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  사용자는 서비스 내 [계정 설정] 또는 Google 보안 계정 관리에서
                  언제든지 연동을 즉시 해제할 수 있으며, 요청 즉시 보관된 모든
                  데이터는 영구 복구 불가능하게 파기됩니다.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* 구글 심사관용 공식 공지 박스 */}
        <ScrollReveal animation="zoom-in" delayMs={500}>
          <div className="p-6 rounded-2xl bg-white dark:bg-[#152019] border border-[#16a46b]/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  Google API Services User Data Policy 준수 공표
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  KeepGo&apos;s use and transfer to any other app of information
                  received from Google APIs will adhere to{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[#16a46b] font-medium hover:text-[#0e8a58]"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
