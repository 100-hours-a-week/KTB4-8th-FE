"use client";

import React from "react";
import { KeepGoLogo } from "../brand/KeepGoLogo";
import { LEGAL_CONTACT_FORM_URL as INQUIRY_FORM_URL } from "@/features/legal/content";
import type { PolicyType } from "./PolicyModal";

interface LandingFooterProps {
  onOpenPolicy: (type: PolicyType) => void;
}

export function LandingFooter({ onOpenPolicy }: LandingFooterProps) {
  return (
    <footer className="bg-gray-100/80 dark:bg-[#0f1411] border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 py-14 text-xs">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="mb-2">
              <KeepGoLogo size={30} variant="full" />
            </div>
            <p className="text-gray-500 max-w-sm">
              유튜브 쇼츠 좋아요 기반 스마트 여행 장소 아카이브 & AI 맞춤 코스
              추천 서비스
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onOpenPolicy("privacy")}
              className="text-gray-800 dark:text-gray-200 font-bold hover:text-[#16a46b] underline transition-colors"
            >
              개인정보처리방침 (Privacy Policy)
            </button>
            <button
              type="button"
              onClick={() => onOpenPolicy("terms")}
              className="text-gray-700 dark:text-gray-300 hover:text-[#16a46b] transition-colors"
            >
              서비스 이용약관 (Terms of Service)
            </button>
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Google API 정책
            </a>
            <a
              href={INQUIRY_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              문의하기
            </a>
          </div>
        </div>

        {/* 법적 고지 및 저작권 */}
        <div className="space-y-3 text-[11px] text-gray-500 dark:text-gray-500 leading-relaxed">
          <p>
            KeepGo는 YouTube 및 Google LLC와 독립적으로 운영되는 서비스입니다.
            KeepGo의 Google API 정보 사용 및 타 앱으로의 전송은 제한적 사용
            요건(Limited Use Requirements)을 포함한{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="underline text-gray-600 dark:text-gray-400 hover:text-[#16a46b]"
            >
              Google API Services User Data Policy
            </a>
            를 준수합니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <p>
              © {new Date().getFullYear()} KeepGo Team. All rights reserved.
            </p>
            <p>Made with 💚 for smart travelers</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
