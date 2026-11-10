"use client";

import React, { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

interface FaqItem {
  q: string;
  a: string;
  isImportant?: boolean;
}

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: "KeepGo는 내 Google 및 YouTube 계정에서 어떤 정보를 조회하나요?",
      a: "KeepGo는 오직 사용자가 직접 YouTube에서 '좋아요(Liked)'를 표시한 동영상 목록(YouTube Data API `.../youtube.readonly`)만을 읽기 전용으로 조회합니다. 사용자의 허락 없이 어떠한 영상도 게시하거나 댓글을 달지 않으며, 비공개 개인정보나 구독 목록 등 서비스 목적 외의 데이터는 일절 접근하지 않습니다.",
      isImportant: true,
    },
    {
      q: "쇼츠 영상에 상호명이나 자막이 없어도 장소를 찾을 수 있나요?",
      a: "네! 최신 Gemini 멀티모달 AI가 영상 프레임 속 매장 인테리어, 외부 간판 폰트, 오디오 속 멘트 및 크리에이터의 해시태그를 교차 분석하여 96% 이상의 높은 정확도로 실제 장소를 찾아냅니다.",
    },
    {
      q: "추천받은 여행 코스는 어떻게 실제로 활용하나요?",
      a: "추천받은 코스는 장소 순서와 장소 사이 이동 시간을 한눈에 볼 수 있어요. 마음에 드는 코스는 보관함에 저장해 두었다가 언제든 다시 열어 볼 수 있습니다.",
    },
    {
      q: "KeepGo 이용 요금은 무료인가요?",
      a: "네, 현재 KeepGo의 모든 기능(쇼츠 연동, 장소 추출, 코스 생성)은 완전 무료로 제공되고 있습니다.",
    },
    {
      q: "언제든지 서비스 연동을 해제하고 저장된 내 데이터를 삭제할 수 있나요?",
      a: "물론입니다. 서비스 내 마이페이지 설정이나 Google 보안 계정 페이지(myaccount.google.com/permissions)에서 언제든지 연동을 즉시 해제하실 수 있으며, 탈퇴 시 수집된 모든 장소 및 계정 데이터는 복구 불가능하도록 영구 삭제됩니다.",
      isImportant: true,
    },
  ];

  return (
    <section
      id="faq"
      className="py-20 md:py-28 bg-gray-50/70 dark:bg-[#131714] border-t border-gray-100 dark:border-gray-800"
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16a46b] bg-[#effaf4] dark:bg-[#152a1f] px-3.5 py-1 rounded-full border border-[#16a46b]/20">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17161b] dark:text-white mt-4 mb-3 tracking-tight">
              궁금한 점이 있으신가요?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              구글 OAuth 권한 및 서비스 이용에 대해 자주 묻는 질문들을
              모았습니다.
            </p>
          </div>
        </ScrollReveal>

        {/* 아코디언 리스트 */}
        <div className="space-y-3.5">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;

            return (
              <ScrollReveal key={idx} animation="fade-up" delayMs={idx * 80}>
                <div
                  className={`rounded-2xl transition-all border ${
                    isOpen
                      ? "bg-white dark:bg-[#1a211c] border-[#16a46b]/40 shadow-md"
                      : "bg-white/70 dark:bg-[#171c19] border-gray-200/80 dark:border-gray-800/80 hover:border-gray-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                  >
                    <span className="flex items-center gap-2.5 font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                      {item.isImportant && (
                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          보안 정책
                        </span>
                      )}
                      <span>{item.q}</span>
                    </span>
                    <span
                      className={`text-xl transition-transform text-[#16a46b] ${
                        isOpen ? "rotate-45" : "rotate-0"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800 mt-2 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
