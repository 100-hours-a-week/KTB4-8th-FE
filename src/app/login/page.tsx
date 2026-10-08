"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { loginWithAccessToken } from "@/features/auth/session";

/* 01 · 로그인 — 서비스 진입점. 인증되지 않은 모든 접근이 이 화면으로 유도된다.
   가입·로그인은 구글 OAuth 단일 수단이고, BE(Spring Security oauth2Login)가 전담한다.
   버튼은 BE 의 로그인 시작 경로로 브라우저를 통째로 이동시킬 뿐이다.

   로그인 성공 후 BE(OidcLoginSuccessHandler)가 accessToken 을 쿼리로 붙여
   앱 루트(/)로 리다이렉트한다 — 그 값을 받아 세션에 저장하는 쪽은 src/app/page.tsx 다.
   Google Cloud Console 의 승인된 리디렉션 URI 에 BE 의 콜백 주소가 등록돼 있어야 동작한다. */
export default function LoginPage() {
  const router = useRouter();
  const [movingToOauth, setMovingToOauth] = useState(false);

  function handleGoogle() {
    const devToken = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN;
    if (devToken) {
      loginWithAccessToken(devToken);
      router.push("/home");
      return;
    }
    // 첫 클릭 직후 비활성화하고, 이동 표시를 잠깐 보여준다(기능정의서 2-1)
    setMovingToOauth(true);
    window.setTimeout(() => {
      // Next.js 라우트가 아니라 프록시로 BE 에 그대로 넘어가는 경로라 router.push 를 쓰면 안 된다
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/oauth2/authorization/google");
    }, 380);
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
              <span>Google 계정으로 로그인하는 중…</span>
            </>
          ) : (
            <>
              <Icon name="google" size={20} />
              <span>Google 계정으로 로그인</span>
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
