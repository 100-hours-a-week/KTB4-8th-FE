"use client";

import React, { useEffect } from "react";

export type PolicyType = "privacy" | "terms";

interface PolicyModalProps {
  type: PolicyType | null;
  onClose: () => void;
}

export function PolicyModal({ type, onClose }: PolicyModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (type) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [type, onClose]);

  if (!type) return null;

  const isPrivacy = type === "privacy";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#1a1f1c] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden text-[#17161b] dark:text-[#f4f3f6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 id="policy-title" className="text-lg font-bold text-[#16a46b]">
              {isPrivacy ? "KeepGo 개인정보처리방침" : "KeepGo 서비스 이용약관"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              최종 개정일: 2026년 10월 1일 · 버전 1.2
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {isPrivacy ? (
            <>
              <div className="p-4 rounded-xl bg-[#effaf4] dark:bg-[#142e22] border border-[#16a46b]/20 text-xs">
                <p className="font-semibold text-[#0a5236] dark:text-[#74d3a9] mb-1">
                  🔒 Google API 서비스 사용자 데이터 정책 준수 선언
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  KeepGo는 Google API로부터 수신한 정보의 사용 및 다른 앱으로의
                  이전에 대해 제한적 사용(Limited Use) 요건을 포함한{" "}
                  <strong>Google API Services User Data Policy</strong>를
                  전적으로 준수합니다.
                </p>
              </div>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  1. 수집하는 개인정보 항목 및 수집 방법
                </h3>
                <p className="mb-2">
                  서비스는 사용자의 원활한 소셜 로그인 및 쇼츠 기반 맞춤 코스
                  추천 기능을 위해 최소한의 정보를 수집합니다.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>
                    <strong>Google 계정 정보:</strong> 이름, 이메일 주소, 프로필
                    이미지 URL (회원 식별 및 계정 연동)
                  </li>
                  <li>
                    <strong>
                      YouTube API 접근 데이터
                      (https://www.googleapis.com/auth/youtube.readonly):
                    </strong>
                    사용자가 직접 ‘좋아요’ 표시한 동영상 중 장소 관련 콘텐츠의
                    제목, 설명, 썸네일 정보 (코스 추출 목적)
                  </li>
                  <li>
                    <strong>서비스 이용 기록:</strong> AI 추출 장소 저장 목록,
                    생성된 맞춤 여행 일정
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  2. 개인정보 및 YouTube 데이터의 이용 목적
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>
                    <strong>장소 정보 자동 추출:</strong> 좋아요한 유튜브 쇼츠
                    속 맛집, 카페, 관광지 상호명 및 위치 자동 감지
                  </li>
                  <li>
                    <strong>맞춤 여행 동선 추천:</strong> 추출된 장소를 바탕으로
                    최적 이동 경로와 일정 플래닝 제공
                  </li>
                  <li>
                    <strong>회원 식별 및 서비스 보안 관리:</strong> 불법 접근
                    방지 및 개인화 설정 유지
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  3. 개인정보의 제3자 제공 및 판매 금지
                </h3>
                <p className="text-xs">
                  KeepGo는 사용자의 사전 동의 없이 어떠한 개인정보나 YouTube API
                  데이터를 제3자 광고주, 데이터 브로커, 마케팅 기업에 판매하거나
                  제공하지 않습니다. AI 모델 학습(Gemini)에 활용되는 텍스트는
                  장소 추출 파이프라인 내에서 즉시 처리되며, 개인 식별 정보와
                  분리되어 안전하게 보호됩니다.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  4. 데이터 보관 기간 및 파기 절차
                </h3>
                <p className="text-xs">
                  사용자가 서비스 회원 탈퇴를 요청하거나 Google 계정 연동을
                  해제하는 경우, 수집된 모든 프로필 데이터와 아카이빙된 개인
                  코스는 지체 없이(영업일 기준 3일 이내) 재생 불가능한 방법으로
                  완전 파기됩니다.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  5. 이용자의 권리와 행사 방법
                </h3>
                <p className="text-xs">
                  이용자는 언제든지 본 서비스의 [마이페이지 → 계정 설정] 또는
                  Google 보안 계정 관리(myaccount.google.com/permissions)에서
                  KeepGo의 권한 접근을 즉시 취소하고 데이터 열람·수정·삭제를
                  요구할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  6. 개인정보 보호책임자 및 문의처
                </h3>
                <p className="text-xs">
                  • 서비스명: KeepGo
                  <br />
                  • 담당 부서: 프라이버시 및 보안팀
                  <br />• 문의 이메일: support@keepgo.app / chris.lee@keepgo.app
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  제1조 (목적)
                </h3>
                <p className="text-xs">
                  본 약관은 ‘KeepGo’(이하 “서비스”)가 제공하는 유튜브 쇼츠 기반
                  장소 추출 및 코스 추천 제반 서비스의 이용과 관련하여 이용자와
                  서비스 제공자의 권리, 의무 및 책임사항을 규정함을 목적으로
                  합니다.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  제2조 (용어의 정의)
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>
                    “이용자”란 본 약관에 동의하고 Google 계정 연동을 통해
                    서비스를 이용하는 회원을 의미합니다.
                  </li>
                  <li>
                    “쇼츠 아카이브”란 이용자가 YouTube에서 좋아요를 표시한 쇼츠
                    동영상 중 AI가 장소 정보를 감지하여 구조화한 목록을
                    말합니다.
                  </li>
                  <li>
                    “코스 추천”이란 추출된 장소들의 지리적 좌표와 이동 경로를
                    분석하여 AI가 제안하는 여행 일정을 말합니다.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  제3조 (서비스의 제공 및 한계)
                </h3>
                <p className="text-xs">
                  1. 서비스는 AI(Gemini) 멀티모달 분석을 통해 영상 속 정보를
                  추출하므로, 실제 매장의 영업시간, 휴무일, 폐업 여부 등은 현장
                  사정에 따라 상이할 수 있습니다. 중요한 방문 일정의 경우 실제
                  매장에 사전 확인을 권장합니다.
                  <br />
                  2. 서비스는 천재지변, Google/YouTube API 시스템 장애, 정기점검
                  등으로 인한 일시적 중단이 발생할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  제4조 (회원의 의무 및 계정 보안)
                </h3>
                <p className="text-xs">
                  이용자는 타인의 Google 계정을 도용하여 본 서비스를 이용하거나,
                  서비스의 정상적인 운영을 방해하는 자동화 스크립트, 크롤링
                  행위를 하여서는 안 됩니다.
                </p>
              </section>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#151916] border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#16a46b] hover:bg-[#0e8a58] text-white font-medium text-xs transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
