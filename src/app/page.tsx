"use client";

import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { hasSession, loginWithAccessToken } from "@/features/auth/session";
import { subscribeSession } from "@/lib/api/client";
import { LandingPage } from "@/components/landing/LandingPage";
import { LANDING_ENABLED } from "@/lib/constants";
import { HOME_PATH } from "@/lib/routes";

/* BE 가 Google 로그인에 성공하면 액세스 토큰을 담아 이 주소로 리다이렉트한다
   (예: /?accessToken=...&expiresIn=1800&initialLogin=true). 그 값이 있으면 세션으로 저장하고,
   신규 가입이면 온보딩으로 · 기존 회원이면 홈으로 보낸다.
   
   토큰이 없는 일반 접속 시:
   구글 심사 및 일반 사용자에게 서비스 가치를 알리는 인터랙티브 랜딩페이지를 보여준다. */
const subscribeNothing = () => () => {};

// 앱 홈은 로그인한 사용자만 쓰므로 따로 불러온다(랜딩 방문자의 첫 다운로드가 커지지 않는다). 서버에서는 그리지 않는다.
const RootHome = dynamic(() => import("@/components/app/RootHome"), {
  ssr: false,
  loading: () => (
    <div className="landing-page min-h-screen flex items-center justify-center bg-white dark:bg-[#111613]">
      <div className="w-8 h-8 border-3 border-[#16a46b]/20 border-t-[#16a46b] rounded-full animate-spin" />
    </div>
  ),
});

/** 랜딩이 꺼진 환경에서 / 를 /login 으로 보낸다 */
function LoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return (
    <div className="landing-page min-h-screen flex items-center justify-center bg-white dark:bg-[#111613]">
      <div className="w-8 h-8 border-3 border-[#16a46b]/20 border-t-[#16a46b] rounded-full animate-spin" />
    </div>
  );
}

function RootContent() {
  const router = useRouter();
  // 로그인 여부는 브라우저(localStorage)에만 있다. 서버가 그린 HTML 은 "로그아웃"이라, 첫 그리기까지는 같은 값(false)으로 맞추고
  // 그 뒤에 실제 값으로 바꾼다 — 그렇지 않으면 로그인한 채로 열 때 hydration 오류가 난다.
  // 구독해 두어야 랜딩의 "시작하기"가 토큰을 저장했을 때(개발용 토큰 · 같은 주소 / 로 이동) 화면이 앱 홈으로 바뀐다
  const loggedIn = useSyncExternalStore(
    subscribeSession,
    hasSession,
    () => false,
  );
  // 첫 그리기(하이드레이션) 뒤에 true — 그 전에는 서버와 같은 값(false)을 써서 불일치를 피한다
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");

  useEffect(() => {
    if (accessToken) {
      const expiresIn = Number(searchParams.get("expiresIn")) || undefined;
      loginWithAccessToken(accessToken, expiresIn);
      router.replace(
        searchParams.get("initialLogin") === "true" ? "/onboarding" : HOME_PATH,
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

  // 로그인 여부는 브라우저에만 있어서 서버가 그린 HTML 은 알 수 없다. 첫 그리기(하이드레이션)가 끝나기 전에는
  // 랜딩 · 앱 홈 어느 쪽도 그리지 않고 로딩 표시만 둔다 — 로그인한 사람이 랜딩을 잠깐 보는 깜빡임을 막는다.
  if (!mounted) {
    return (
      <div className="landing-page min-h-screen flex items-center justify-center bg-white dark:bg-[#111613]">
        <div className="w-8 h-8 border-3 border-[#16a46b]/20 border-t-[#16a46b] rounded-full animate-spin" />
      </div>
    );
  }

  // 로그인한 사용자는 keepgo.kr/ 에서 바로 앱 홈을 본다(예전 주소 /home 도 그대로 열린다). 로그인 전에는 랜딩.
  if (loggedIn) {
    return <RootHome />;
  }

  // 랜딩이 꺼진 환경(dev 서버)에서는 로그인 전 방문자를 바로 로그인 화면으로 보낸다
  if (!LANDING_ENABLED) return <LoginRedirect />;

  return <LandingPage isLoggedIn={false} />;
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
