"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import { loginWithDevToken } from "@/features/auth/session";
import { GOOGLE_STATE_KEY, googleAuthUrl } from "@/lib/auth/google";

/* 01 · 로그인 — 서비스 진입점. 인증되지 않은 모든 접근이 이 화면으로 유도된다.
   가입·로그인은 구글 OAuth 단일 수단이다. Google 인증 화면으로 이동하고, 돌아오는 /oauth 에서
   인가 코드를 POST /user/auth-session 으로 넘긴다. */
export default function LoginPage() {
  const router = useRouter();
  const [movingToOauth, setMovingToOauth] = useState(false);

  function handleGoogle() {
    const devToken = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN;
    if (devToken) {
      loginWithDevToken(devToken);
      router.push("/home");
      return;
    }

    const state = crypto.randomUUID();
    const url = googleAuthUrl(state);
    if (!url) {
      toast.warn(
        "Google 클라이언트 ID(NEXT_PUBLIC_GOOGLE_CLIENT_ID)가 설정되지 않았어요.",
      );
      return;
    }
    // 첫 클릭 직후 비활성화하고, 인증 화면 이동 표시를 잠깐 보여준다(기능정의서 2-1)
    setMovingToOauth(true);
    sessionStorage.setItem(GOOGLE_STATE_KEY, state);
    window.setTimeout(() => window.location.assign(url), 380);
  }

  return (
    <section className="login">
      <span className="login__orb login__orb--1" />
      <span className="login__orb login__orb--2" />

      <p className="login__brand">KeepGo</p>
      <p className="login__tag">
        저장만 해둔 그곳,
        <br />
        <b>이제 진짜 떠나요</b>
      </p>

      <div className="login__flow">
        <Step icon={<Icon name="play" size={24} />} label="영상 저장" />
        <span className="login__arrow">
          <Icon name="arrowRight" size={16} />
        </span>
        <Step icon={<Icon name="sparkle" size={24} />} label="AI 자동 정리" />
        <span className="login__arrow">
          <Icon name="arrowRight" size={16} />
        </span>
        <Step icon={<Icon name="route" size={24} />} label="코스 추천" />
      </div>

      <div className="login__foot">
        <button
          className="gbtn"
          type="button"
          disabled={movingToOauth}
          onClick={handleGoogle}
        >
          {movingToOauth ? (
            <>
              <span className="spinner" />
              <span>Google로 이동 중…</span>
            </>
          ) : (
            <>
              <Icon name="google" size={20} />
              <span>Google 계정으로 계속하기</span>
            </>
          )}
        </button>
        <p className="login__legal">
          계속하면 KeepGo의 <u>서비스 이용약관</u>과 <u>개인정보처리방침</u>에
          <br />
          동의하게 됩니다.
        </p>
      </div>
    </section>
  );
}

function Step({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="login__step">
      <div className="login__step-icon">{icon}</div>
      <p className="login__step-label">{label}</p>
    </div>
  );
}
