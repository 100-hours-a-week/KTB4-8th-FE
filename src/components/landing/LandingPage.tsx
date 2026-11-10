"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { LandingProblem } from "./LandingProblem";
import { LandingProcess } from "./LandingProcess";
import { LandingFeatures } from "./LandingFeatures";
import { LandingGoogleCompliance } from "./LandingGoogleCompliance";
import { LandingFaq } from "./LandingFaq";
import { LandingCta } from "./LandingCta";
import { LandingFooter } from "./LandingFooter";
import { InteractiveKeepy } from "../brand/InteractiveKeepy";
import { PolicyModal, type PolicyType } from "./PolicyModal";
import { loginWithAccessToken } from "@/features/auth/session";

interface LandingPageProps {
  isLoggedIn?: boolean;
}

export function LandingPage({ isLoggedIn = false }: LandingPageProps) {
  const router = useRouter();
  const [policyType, setPolicyType] = useState<PolicyType | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  function handleStartLogin() {
    const devToken = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN;
    if (devToken) {
      loginWithAccessToken(devToken);
      router.push("/home");
      return;
    }

    setIsRedirecting(true);
    // Google OAuth 로그인 시작 경로로 브라우저 이동 (BE 프록시 경로)
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/oauth2/authorization/google");
  }

  return (
    <div className="landing-page min-h-screen bg-white dark:bg-[#111613] text-[#17161b] dark:text-[#f4f3f6] font-sans selection:bg-[#16a46b]/20 selection:text-[#0a5236]">
      {/* ── 상단 네비게이션 헤더 ── */}
      <LandingHeader onStartLogin={handleStartLogin} isLoggedIn={isLoggedIn} />

      {/* ── 메인 콘텐츠 섹션들 ── */}
      <main>
        {/* 1. Hero 섹션 */}
        <LandingHero onStartLogin={handleStartLogin} />

        {/* 2. 문제 제기 및 솔루션 */}
        <LandingProblem />

        {/* 3. 4단계 작동 원리 & 키피 애니메이션 */}
        <LandingProcess />

        {/* 4. 핵심 기능 쇼케이스 */}
        <LandingFeatures />

        {/* 5. Google OAuth & YouTube 데이터 보안 정책 (구글 심사용 핵심) */}
        <LandingGoogleCompliance />

        {/* 6. 자주 묻는 질문 FAQ */}
        <LandingFaq />

        {/* 7. 하단 시작 CTA */}
        <LandingCta onStartLogin={handleStartLogin} />
      </main>

      {/* ── 푸터 ── */}
      <LandingFooter onOpenPolicy={(type) => setPolicyType(type)} />

      {/* ── 화면 우하단 스크롤 인터랙티브 플로팅 캐릭터 '키피' ── */}
      <InteractiveKeepy />

      {/* ── 개인정보처리방침 / 이용약관 팝업 모달 ── */}
      <PolicyModal type={policyType} onClose={() => setPolicyType(null)} />

      {/* ── OAuth 이동 시 로딩 인디케이터 오버레이 ── */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="w-10 h-10 border-4 border-white/20 border-t-[#16a46b] rounded-full animate-spin mb-4" />
          <p className="font-semibold text-sm">Google 계정으로 이동하는 중…</p>
        </div>
      )}
    </div>
  );
}
