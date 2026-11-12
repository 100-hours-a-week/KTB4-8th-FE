"use client";

import React, { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";
import { KeepyMascot, type KeepyPose } from "../brand/KeepyMascot";
import { SyncCardPreview } from "./SyncCardPreview";

interface StepData {
  step: string;
  badge: string;
  title: string;
  desc: string;
  details: string[];
  pose: KeepyPose;
  characterBubble: string;
  progressPercent: number;
  progressLabel: string;
  extraMeta: string;
}

export function LandingProcess() {
  const [activeStep, setActiveStep] = useState(0);

  const steps: StepData[] = [
    {
      step: "01",
      badge: "Google OAuth & YouTube 연동",
      title: "좋아요한 쇼츠 영상을 안전하게 불러옵니다",
      desc: "구글 계정으로 로그인하면 평소 YouTube에서 '좋아요' 표시한 쇼츠 목록을 실시간으로 가져옵니다. 별도의 수동 링크 복사 없이 한 번에 동기화됩니다.",
      details: [
        "공식 YouTube Data API v3 (youtube.readonly) 최소 권한 사용",
        "비공개 개인 정보 및 업로드 권한 일절 요청 없음",
        "언제든 원클릭으로 동기화 해제 가능",
      ],
      pose: "shorts",
      characterBubble: "쇼츠 좋아요 목록 찾는 중! 📱",
      progressPercent: 100,
      progressLabel: "동기화 완료 (48개 쇼츠 수집)",
      extraMeta: "소요 시간: 1.1초 · 안전 암호화 연결",
    },
    {
      step: "02",
      badge: "Gemini AI 멀티모달 분석",
      title: "영상 속 간판, 자막, 오디오에서 장소를 추출합니다",
      desc: "쇼츠 영상에 상호명이 직접 적혀있지 않아도 걱정 마세요. Gemini AI가 영상 속 간판 폰트, 자막 문맥, 음성 설명, 위치 해시태그를 심층 분석하여 정확한 장소를 찾아냅니다.",
      details: [
        "영상 프레임 비주얼 OCR & 간판 인식",
        "오디오 음성 텍스트 변환(STT) 및 뉘앙스 분석",
        "장소 추출 정확도 96.8% 달성",
      ],
      pose: "detect",
      characterBubble: "간판이랑 자막에서 장소 발견! 🔍",
      progressPercent: 88,
      progressLabel: "영상 분석 진행률 88% (장소 42곳 감지)",
      extraMeta: "Gemini 1.5 Flash 멀티모달 실시간 처리",
    },
    {
      step: "03",
      badge: "스마트 지도 아카이빙",
      title: "카테고리별 태깅과 네이버 지도 실시간 매핑",
      desc: "추출된 장소들을 카페, 식당, 문화공간, 포토스팟 등으로 스마트하게 분류하고, 네이버 지도 실제 주소, 도로명, 상세 좌표와 100% 매칭하여 지도 위에 예쁘게 보관합니다.",
      details: [
        "네이버 지도 API 기반 정확한 지번/도로명 주소 매칭",
        "영업시간, 대표 메뉴, 주차 가능 여부 자동 파악",
        "내 장소 보관함(Keep)에 영구 저장 및 폴더링",
      ],
      pose: "float",
      characterBubble: "지도에 핀을 쏙쏙 꽂아둘게요 📍",
      progressPercent: 100,
      progressLabel: "네이버 지도 좌표 매칭 100%",
      extraMeta: "서울 성동구 아차산로9길 8 (성수역 2번 출구)",
    },
    {
      step: "04",
      badge: "최적 동선 코스 추천",
      title: "낭비 없는 완벽한 하루 여행 코스 완성",
      desc: "저장한 장소 중에서 조건에 맞는 곳을 골라, 장소 사이 이동 시간을 계산한 여행 코스를 추천해 드립니다. 이제 진짜 떠나기만 하세요!",
      details: [
        "장소 사이 이동 시간을 계산한 코스 순서",
        "지역 · 날짜 · 외출 시간 · 카테고리 조건으로 추천",
        "마음에 드는 코스는 보관함에 저장",
      ],
      pose: "travel",
      characterBubble: "출발 준비 완료! 떠나자! 🧳",
      progressPercent: 100,
      progressLabel: "코스 구성 완료 (3곳)",
      extraMeta: "성수율 카페 ➔ 어니언 성수 ➔ 서울숲 (이동 18분)",
    },
  ];

  return (
    <section
      id="process"
      className="py-20 md:py-32 relative overflow-hidden bg-gray-50/50 dark:bg-[#121613]"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* 상단 섹션 헤더 */}
        <ScrollReveal animation="fade-up">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16a46b] bg-[#effaf4] dark:bg-[#152a1f] px-3.5 py-1 rounded-full border border-[#16a46b]/20">
              How KeepGo Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17161b] dark:text-white mt-4 mb-4 tracking-tight">
              쇼츠 좋아요에서 여행 코스까지,
              <br />
              <span className="text-[#16a46b]">4단계로 완성되는 마법</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              복잡한 수작업은 KeepGo의 AI 엔진이 전담합니다. 사용자는 그저
              마음에 드는 쇼츠를 즐기기만 하세요.
            </p>
          </div>
        </ScrollReveal>

        {/* 4단계 카드 리스트 */}
        <div className="space-y-10">
          {steps.map((item, index) => {
            const isEven = index % 2 === 1;

            return (
              <ScrollReveal
                key={index}
                animation={isEven ? "fade-left" : "fade-right"}
                durationMs={600}
                className="w-full"
              >
                <div
                  onMouseEnter={() => setActiveStep(index)}
                  className={`p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#17201b] border transition-all duration-300 shadow-sm hover:shadow-xl ${
                    activeStep === index
                      ? "border-[#16a46b] shadow-[#16a46b]/10"
                      : "border-gray-200/80 dark:border-gray-800"
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* 텍스트 설명 (7 cols) */}
                    <div
                      className={`lg:col-span-7 space-y-4 ${
                        isEven ? "lg:order-2" : "lg:order-1"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-black text-[#16a46b]/40 dark:text-[#16a46b]/60 font-mono">
                          {item.step}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#effaf4] dark:bg-[#14281e] text-[#16a46b] border border-[#16a46b]/20">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.desc}
                      </p>

                      <ul className="space-y-2 pt-2">
                        {item.details.map((detail, dIdx) => (
                          <li
                            key={dIdx}
                            className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                          >
                            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16a46b] flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 인터랙티브 실제 카드 & 라이브 진행률 (5 cols) */}
                    <div
                      className={`lg:col-span-5 flex flex-col items-center justify-center relative ${
                        isEven ? "lg:order-1" : "lg:order-2"
                      }`}
                    >
                      {/* 1단계는 실제 앱 홈의 "좋아요 영상 불러오기" 카드와 같은 모양, 나머지는 상태 프리뷰 박스.
                          나머지 박스는 1단계 카드(.home__sync)와 같은 너비 · 최소 높이(186px) · 둥글기(24px) · 안쪽 여백(20px)에 같은 그라데이션 테두리 */}
                      {index === 0 ? (
                        <SyncCardPreview className="w-full max-w-sm" />
                      ) : (
                        <div className="gborder flex min-h-[186px] w-full max-w-sm flex-col justify-center space-y-4 rounded-[24px] bg-white p-5 shadow-lg dark:bg-[#121914]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-[#16a46b] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#16a46b] animate-ping" />
                              LIVE PROCESS
                            </span>
                            <span className="text-gray-400 font-mono">
                              STEP {item.step}
                            </span>
                          </div>

                          {/* 라이브 진행률 바 */}
                          <div>
                            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                              <span>{item.progressLabel}</span>
                              <span className="font-mono text-[#16a46b]">
                                {item.progressPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#16a46b] to-[#38e29a] transition-all duration-700"
                                style={{ width: `${item.progressPercent}%` }}
                              />
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                            <span className="truncate">{item.extraMeta}</span>
                            <span className="text-[#16a46b] font-bold shrink-0 ml-2">
                              정상 가동
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 단계별 살아있는 키피 캐릭터 */}
                      <div className="mt-3 transform hover:scale-105 transition-transform">
                        <KeepyMascot
                          pose={item.pose}
                          size={105}
                          bubbleText={item.characterBubble}
                          reserveBubbleSpace
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
