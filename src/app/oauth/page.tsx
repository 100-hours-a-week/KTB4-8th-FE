"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { useLogin } from "@/features/auth/session";
import { GOOGLE_STATE_KEY, oauthRedirectUri } from "@/lib/auth/google";

/* 02 · Google 인증 콜백 — Google 이 돌려준 인가 코드를 POST /user/auth-session 으로 전달한다. */
export default function OauthPage() {
  const router = useRouter();
  const login = useLogin();
  const started = useRef(false);

  useEffect(() => {
    // StrictMode 가 effect 를 두 번 돌려도 인가 코드는 한 번만 쓸 수 있다
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const expected = sessionStorage.getItem(GOOGLE_STATE_KEY);
    sessionStorage.removeItem(GOOGLE_STATE_KEY);

    if (params.get("error") || !code) {
      toast.warn("로그인을 취소했어요.");
      router.replace("/login");
      return;
    }
    if (!expected || params.get("state") !== expected) {
      toast.warn("인증 정보가 올바르지 않아요. 다시 로그인해 주세요.");
      router.replace("/login");
      return;
    }

    login
      .mutateAsync({ authorizationCode: code, redirectUri: oauthRedirectUri() })
      .then((session) =>
        router.replace(session.isNewUser ? "/onboarding" : "/home"),
      )
      .catch((err) => {
        toast.fromError(err, { noRelogin: true });
        router.replace("/login");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 콜백은 마운트 시 한 번만 처리한다
  }, []);

  return (
    <section className="goauth">
      <div
        className="goauth__scroll"
        style={{ display: "grid", placeItems: "center" }}
      >
        <Spinner />
      </div>
    </section>
  );
}
