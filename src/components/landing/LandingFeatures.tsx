"use client";

import React, { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

export function LandingFeatures() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  const features = [
    {
      tabName: "스마트 쇼츠 보관함",
      tag: "Feature 01",
      title: "좋아요한 쇼츠가 한눈에 정리되는 나만의 아카이브",
      desc: "영상 제목만 봐서는 어딘지 알 수 없었던 쇼츠들. KeepGo는 상호명, 카테고리(카페/맛집/전시), 대표 메뉴, 지역 태그별로 자동 라벨링하여 보관함에 깔끔하게 진열해 드립니다.",
      highlights: [
        "지역별 필터 (성수, 홍대, 제주, 강남 등)",
        "카테고리별 스마트 태그 자동 분류",
        "쇼츠 원본 영상 즉시 재시청 지원",
      ],
      graphicBadge: "성수동 저장 장소 (14개)",
      footerNote: "✨ 저장한 장소가 지역 · 분류별로 정리돼요.",
      items: [
        {
          name: "어니언 성수",
          category: "베이커리 카페",
          time: "도보 5분",
          rating: "4.8",
        },
        {
          name: "대림창고",
          category: "복합문화공간",
          time: "도보 8분",
          rating: "4.7",
        },
        {
          name: "소문난 성수 감자탕",
          category: "맛집",
          time: "도보 12분",
          rating: "4.9",
        },
      ],
    },
    {
      tabName: "AI 코스 자동 설계",
      tag: "Feature 02",
      title: "이동 시간을 계산해 하루 여행 코스 완성",
      desc: "지역 · 날짜 · 외출 시간 · 카테고리만 알려 주세요. 저장한 장소 중에서 AI가 어울리는 곳을 골라, 장소 사이 이동 시간을 계산한 하루 코스를 만들어 드립니다.",
      highlights: [
        "지역 · 날짜 · 외출 가능 시간 · 카테고리 조건으로 추천",
        "장소 사이 이동 시간을 계산한 코스 순서",
        "마음에 드는 코스는 보관함에 저장",
      ],
      graphicBadge: "추천 코스 예시",
      footerNote: "✨ 코스의 장소 사이 이동 시간이 계산되어 있어요.",
      items: [
        {
          name: "카페 온화",
          category: "성수동 · 출발지에서 12분 이동",
          time: "첫 번째 장소",
          rating: "카페",
        },
        {
          name: "대림창고",
          category: "성수동 · 이전 장소에서 7분 이동",
          time: "두 번째 장소",
          rating: "전시",
        },
        {
          name: "성수연방",
          category: "성수동 · 이전 장소에서 5분 이동",
          time: "세 번째 장소",
          rating: "팝업",
        },
      ],
    },
  ];

  const current = features[activeTab];

  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-white dark:bg-[#141815]"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16a46b] bg-[#effaf4] dark:bg-[#152a1f] px-3.5 py-1 rounded-full border border-[#16a46b]/20">
              Powerful Features
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17161b] dark:text-white mt-4 mb-4 tracking-tight">
              당신의 취향을 현실로 꺼내주는
              <br />
              <span className="text-[#16a46b]">KeepGo의 똑똑한 기능들</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              영상 속 스쳐 지나갔던 명소들을 나만의 소중한 여행 컬렉션으로
              만들어 드립니다.
            </p>
          </div>
        </ScrollReveal>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60">
            {features.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx as 0 | 1)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === idx
                    ? "bg-[#16a46b] text-white shadow-md shadow-[#16a46b]/25"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {item.tabName}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 본문 내용 */}
        <ScrollReveal animation="fade-up" durationMs={500}>
          <div className="p-8 sm:p-12 rounded-3xl bg-gray-50/70 dark:bg-[#1a211d] border border-gray-200/80 dark:border-gray-800 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* 기능 설명 텍스트 (6 cols) */}
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold text-[#16a46b] tracking-wider uppercase">
                  {current.tag}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {current.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {current.desc}
                </p>

                <ul className="space-y-2.5 pt-2">
                  {current.highlights.map((h, hIdx) => (
                    <li
                      key={hIdx}
                      className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#16a46b] flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 기능 그래픽 목업 카드 (6 cols) */}
              <div className="lg:col-span-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#151c17] border border-gray-200/80 dark:border-gray-800 shadow-md">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#16a46b]" />
                      {current.graphicBadge}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      KeepGo Preview
                    </span>
                  </div>

                  <div className="space-y-3">
                    {current.items.map((place, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#16a46b]/15 text-[#16a46b] font-bold text-xs flex items-center justify-center">
                            {pIdx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              {place.name}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {place.category}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {place.rating}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {place.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
                    <span className="text-[11px] text-[#16a46b] font-semibold">
                      {current.footerNote ?? ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
