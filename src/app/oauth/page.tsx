"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Avatar, Spinner } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { useLogin } from "@/features/auth/session";
import { MOCK_GOOGLE_ACCOUNTS, type MockGoogleAccount } from "@/mocks/db";

/* 02 · Google OAuth 모의 화면.
   가입·로그인은 구글 OAuth 단일 수단이다. 실제 accounts.google.com 의
   "계정 선택 → 액세스 권한 동의" 흐름을 재현하고, 프론트가 인가 코드를 받아
   POST /user/auth-session 으로 전달하는 구조를 따른다. 프로토타입 js/pages/oauth.js 를 옮겼다. */

type PickedAccount = MockGoogleAccount & { isNew?: boolean };

const NEW_ACCOUNT: PickedAccount = {
  sub: "google-new",
  name: "새 사용자",
  email: "new.user@gmail.com",
  isNew: true,
};

export default function OauthPage() {
  const router = useRouter();
  const login = useLogin();

  const [step, setStep] = useState<"account" | "consent">("account");
  const [picked, setPicked] = useState<PickedAccount | null>(null);
  const [allowing, setAllowing] = useState(false);

  function choose(account: PickedAccount) {
    setPicked(account);
    setStep("consent");
  }

  function handleCancel() {
    toast.warn("로그인을 취소했어요.");
    router.replace("/login");
  }

  function handleDeny() {
    // 인증 예외 처리: 사용자의 인증 취소 → 로그인 화면으로 복귀
    toast.warn(
      "권한 동의를 취소했어요. YouTube 좋아요 목록이 있어야 코스를 추천할 수 있어요.",
    );
    router.replace("/login");
  }

  async function handleAllow() {
    const acc: PickedAccount = picked ?? MOCK_GOOGLE_ACCOUNTS[0];
    setAllowing(true);
    try {
      const session = await login.mutateAsync({
        authorizationCode: "mock-authorization-code",
        account: {
          sub: acc.sub,
          name: acc.name,
          email: acc.email,
          isNew: acc.isNew,
        },
      });
      router.replace(session.isNewUser ? "/onboarding" : "/home");
    } catch (err) {
      setAllowing(false);
      // 인증 실패 · 서버 오류 → 버튼을 되살려 다시 시도할 수 있게 한다
      toast.fromError(err, { noRelogin: true });
    }
  }

  return (
    <section className="goauth">
      {step === "account" ? (
        <Chrome path="/o/oauth2/v2/auth" />
      ) : (
        <Chrome path="/signin/oauth/consent" />
      )}

      <div className="goauth__scroll">
        <div className="goauth__card">
          {step === "account" ? (
            <AccountStep onChoose={choose} />
          ) : (
            <ConsentStep account={picked ?? MOCK_GOOGLE_ACCOUNTS[0]} />
          )}
        </div>
      </div>

      {step === "account" ? (
        <div className="goauth__foot goauth__foot--split">
          <button className="gbtn-text" type="button" onClick={handleCancel}>
            취소
          </button>
        </div>
      ) : (
        <div className="goauth__foot">
          <button className="gbtn-text" type="button" onClick={handleDeny}>
            취소
          </button>
          <button
            className="gbtn-primary"
            type="button"
            disabled={allowing}
            onClick={() => void handleAllow()}
          >
            {allowing ? (
              <>
                <Spinner />
                <span>연결 중</span>
              </>
            ) : (
              "계속"
            )}
          </button>
        </div>
      )}

      <Bottom />
    </section>
  );
}

/* 브라우저 주소창 — 실제 OAuth 는 구글 도메인에서 열린다는 것을 보여준다 */
function Chrome({ path }: { path: string }) {
  return (
    <div className="goauth__chrome">
      <span className="goauth__dots">
        <i />
        <i />
        <i />
      </span>
      <span className="goauth__url">
        <span className="goauth__lock">
          <Icon name="lock" size={12} />
        </span>
        accounts.google.com{path}
      </span>
    </div>
  );
}

function Logo() {
  return (
    <div className="goauth__logo">
      <span className="goauth__wordmark">
        <Icon name="google" size={26} />
        <span>Google</span>
      </span>
    </div>
  );
}

function Bottom() {
  return (
    <div className="goauth__bottom">
      <span>한국어 ▾</span>
      <span>
        <span className="goauth__link">도움말</span>
        <span className="goauth__link">개인정보처리방침</span>
        <span className="goauth__link">약관</span>
      </span>
    </div>
  );
}

function AccountStep({
  onChoose,
}: {
  onChoose: (account: PickedAccount) => void;
}) {
  return (
    <>
      <Logo />
      <h1 className="goauth__title">계정 선택</h1>
      <p className="goauth__sub">
        계속하려면 <b>KeepGo</b>(으)로 이동
      </p>
      <div className="goauth__center">
        <span className="goauth__app">
          <span className="avatar avatar--xs">K</span>KeepGo
        </span>
      </div>

      <div className="goauth__list stagger">
        {MOCK_GOOGLE_ACCOUNTS.map((a, i) => (
          <button
            key={a.email}
            className="goauth__acc"
            type="button"
            onClick={() => onChoose(a)}
          >
            <Avatar
              nickname={a.name}
              size="sm"
              className={`avatar--g${i + 1}`}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="goauth__acc-name">{a.name}</span>
              <span className="goauth__acc-mail">{a.email}</span>
            </span>
          </button>
        ))}
        <button
          className="goauth__acc"
          type="button"
          onClick={() => onChoose(NEW_ACCOUNT)}
        >
          <span className="goauth__acc-icon">
            <Icon name="user" size={20} />
          </span>
          <span className="goauth__acc-name">다른 계정 사용</span>
        </button>
      </div>

      <p className="goauth__note">
        계속하기 위해 Google에서 내 이름, 이메일 주소, 언어 환경설정, 프로필
        사진을 <b>KeepGo</b>과(와) 공유합니다. 앱을 사용하기 전에 KeepGo의{" "}
        <span className="goauth__link">개인정보처리방침</span> 및{" "}
        <span className="goauth__link">서비스 약관</span>을 검토하세요.
      </p>
    </>
  );
}

function ConsentStep({ account }: { account: PickedAccount }) {
  return (
    <>
      <Logo />
      <h1 className="goauth__title">
        KeepGo에서 내 Google 계정에
        <br />
        액세스하려고 합니다
      </h1>
      <div className="goauth__center" style={{ marginTop: 16 }}>
        <span className="goauth__app">
          <Avatar nickname={account.name} size="xs" className="avatar--g1" />
          {account.email}
        </span>
      </div>

      <div className="goauth__scopes">
        <p className="goauth__scope-head">
          KeepGo에서 다음 작업을 수행하려고 합니다
        </p>
        <Scope
          icon={<Icon name="user" size={20} />}
          title="개인정보 보기"
          desc="이름, 이메일 주소, 언어 환경설정, 프로필 사진"
        />
        <Scope
          icon={<Icon name="youtube" size={20} />}
          title="YouTube 계정 보기"
          desc="좋아요 표시한 동영상 목록과 제목 · 설명 등 공개 정보 (읽기 전용)"
        />
      </div>

      <div className="goauth__trust">
        <b>KeepGo을(를) 신뢰할 수 있는지 확인하세요</b>
        민감한 정보를 이 사이트나 앱과 공유해야 할 수도 있습니다. Google 계정
        페이지에서 언제든지 액세스 권한을 확인하거나 삭제할 수 있습니다.
      </div>

      <p className="goauth__note">
        KeepGo의 <span className="goauth__link">개인정보처리방침</span> 및{" "}
        <span className="goauth__link">서비스 약관</span>에서 KeepGo이(가) 내
        데이터를 처리하는 방식을 확인하세요.
      </p>
    </>
  );
}

function Scope({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="goauth__scope">
      <span className="goauth__scope-ico">{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="goauth__scope-title">{title}</span>
        <span className="goauth__scope-desc">{desc}</span>
      </span>
    </div>
  );
}
