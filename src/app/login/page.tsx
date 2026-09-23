"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

/* 01 · 로그인 — 서비스 진입점. 인증되지 않은 모든 접근이 이 화면으로 유도된다.
   프로토타입 js/pages/login.js 를 그대로 옮겼다. 가입·로그인은 구글 OAuth 단일 수단이라
   여기서는 실제 SDK를 붙이지 않고 모의 인증 화면(/oauth)으로 이동만 한다. */
export default function LoginPage() {
  const router = useRouter();
  const [movingToOauth, setMovingToOauth] = useState(false);

  function handleGoogle() {
    // 첫 클릭 직후 비활성화하고, 인증 화면 이동 애니메이션을 잠깐 보여준다(기능정의서 2-1)
    setMovingToOauth(true);
    window.setTimeout(() => router.push("/oauth"), 380);
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
