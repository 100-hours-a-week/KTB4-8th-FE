"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { hasSession, loginWithAccessToken } from "@/features/auth/session";
import { LandingPage } from "@/components/landing/LandingPage";

/* BE 가 Google 로그인에 성공하면 액세스 토큰을 담아 이 주소로 리다이렉트한다
   (예: /?accessToken=...&expiresIn=1800&initialLogin=true). 그 값이 있으면 세션으로 저장하고,
   신규 가입이면 온보딩으로 · 기존 회원이면 홈으로 보낸다.
   
   토큰이 없는 일반 접속 시:
   구글 심사 및 일반 사용자에게 서비스 가치를 알리는 인터랙티브 랜딩페이지를 보여준다. */
const subscribeNothing = () => () => {};

function RootContent() {
  const router = useRouter();
  // 로그인 여부는 브라우저(localStorage)에만 있다. 서버가 그린 HTML 은 "로그아웃"이라, 첫 그리기까지는 같은 값(false)으로 맞추고
  // 그 뒤에 실제 값으로 바꾼다 — 그렇지 않으면 로그인한 채로 열 때 hydration 오류가 난다.
  const loggedIn = useSyncExternalStore(
    subscribeNothing,
    hasSession,
    () => false,
  );
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");

  useEffect(() => {
    if (accessToken) {
      const expiresIn = Number(searchParams.get("expiresIn")) || undefined;
      loginWithAccessToken(accessToken, expiresIn);
      router.replace(
        searchParams.get("initialLogin") === "true" ? "/onboarding" : "/home",
      );
    }
  }, [accessToken, router, searchParams]);

  if (accessToken) {
    return (
      <div className="landing-page min-h-screen flex items-center justify-center bg-white dark:bg-[#111613]">
        <div className="w-8 h-8 border-3 border-[#16a46b]/20 border-t-[#16a46b] rounded-full animate-spin" />
      </div>
    );
  }

  return <LandingPage isLoggedIn={loggedIn} />;
}

export default function RootPage() {
  return (
    <Suspense
      fallback={
        <div className="landing-page min-h-screen flex items-center justify-center bg-white dark:bg-[#111613]">
          <div className="w-8 h-8 border-3 border-[#16a46b]/20 border-t-[#16a46b] rounded-full animate-spin" />
        </div>
      }
    >
      <RootContent />
    </Suspense>
  );
}
