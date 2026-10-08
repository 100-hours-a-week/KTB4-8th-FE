"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { hasSession, loginWithAccessToken } from "@/features/auth/session";

/* BE 가 Google 로그인에 성공하면 액세스 토큰을 담아 이 주소로 리다이렉트한다
   (예: /?accessToken=...&expiresIn=1800&initialLogin=true). 그 값이 있으면 세션으로 저장하고,
   신규 가입이면 온보딩으로 · 기존 회원이면 홈으로 보낸다. accessToken 이 없으면 기존 세션
   여부로 홈 · 로그인을 가른다.
   useSearchParams 를 쓰는 부분만 Suspense 로 감싸야 정적 렌더링 시 빌드가 통과한다. */
function RootRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    if (accessToken) {
      const expiresIn = Number(searchParams.get("expiresIn")) || undefined;
      loginWithAccessToken(accessToken, expiresIn);
      router.replace(
        searchParams.get("initialLogin") === "true" ? "/onboarding" : "/home",
      );
      return;
    }
    router.replace(hasSession() ? "/home" : "/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 진입 시 한 번만 처리한다
  }, []);

  return null;
}

export default function RootPage() {
  return (
    <Suspense fallback={null}>
      <RootRedirect />
    </Suspense>
  );
}
