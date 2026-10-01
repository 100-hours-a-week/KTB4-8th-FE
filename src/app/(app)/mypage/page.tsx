"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { Avatar, Spinner } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { confirm } from "@/components/ui/Confirm";
import { useAccounts, useLogout, useMe } from "@/features/auth/session";
import { useSyncYoutubeNow } from "@/features/sync/queries";
import { useDisconnectGoogle } from "@/features/user/queries";

/* 09 · 마이페이지 — 프로토타입 js/pages/mypage.js 를 그대로 옮겼다.
   YouTube 연동 상태 · 동기화 상태 · 가입일은 BE 에 아직 조회 API 가 없어 화면에서 뺐다
   (BE 준비되면 다시 추가). */

export default function MyPage() {
  const router = useRouter();

  const meQuery = useMe();
  const accountsQuery = useAccounts();
  const syncNow = useSyncYoutubeNow();
  const disconnectGoogle = useDisconnectGoogle();
  const logout = useLogout();

  const user = meQuery.data;
  const account = accountsQuery.data?.[0];
  // BE 에 GET /user/accounts 가 아직 없다 — 이메일은 GET /user 응답에 같이 들어있어 그쪽을 우선한다
  const email = user?.email ?? account?.email;

  async function handleResync() {
    // BE 에 진행률 조회 API 가 없어, 끝날 때까지(동기 처리) 기다렸다가 성공 여부만 알려준다
    try {
      await syncNow.mutateAsync();
      toast.ok("좋아요 영상을 불러왔어요.");
    } catch (err) {
      toast.fromError(err);
    }
  }

  async function handleDisconnect() {
    const ok = await confirm({
      title: "YouTube 연결을 해제할까요?",
      message: (
        <>
          연결을 해제하면 좋아요 목록을 더 이상 불러올 수 없어요.
          <br />
          정리해 둔 장소와 보관함은 그대로 남습니다.
        </>
      ),
      ok: "연결 해제",
      danger: true,
    });
    if (!ok) return;
    try {
      await disconnectGoogle.mutateAsync();
      toast.ok("YouTube 연결을 해제했어요.");
    } catch (err) {
      toast.fromError(err);
    }
  }

  async function handleLogout() {
    const ok = await confirm({
      title: "로그아웃할까요?",
      ok: "로그아웃",
      cancel: "취소",
    });
    if (ok) logout.mutate();
  }

  return (
    <>
      <AppBar back title="마이페이지" />
      <div className="me__body">
        <div className="me__cover">
          <div className="me__head">
            <Avatar
              nickname={user?.nickname}
              profileImageUrl={user?.profileImageUrl}
              size="lg"
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="me__name">{user?.nickname ?? ""}</span>
              <span className="me__mail">{email ?? ""}</span>
            </span>
            <button
              className="me__edit"
              type="button"
              onClick={() => router.push("/mypage/profile")}
            >
              수정
            </button>
          </div>
        </div>

        <div className="me__group">
          <p className="me__group-title">연동 정보</p>
          <div className="me__rows">
            <div className="me__row">
              <span className="me__row-ico">
                <Icon name="google" size={18} />
              </span>
              <span className="me__row-key">연동 계정</span>
              <span className="me__row-val">{email || "-"}</span>
            </div>
          </div>
        </div>

        <div className="me__group">
          <p className="me__group-title">관리</p>
          <div className="me__rows">
            <button
              className="me__row"
              type="button"
              disabled={syncNow.isPending}
              onClick={() => void handleResync()}
            >
              <span className="me__row-ico">
                <Icon name="youtube" size={18} />
              </span>
              <span className="me__row-key">좋아요 영상 다시 불러오기</span>
              <span className="me__row-val">
                {syncNow.isPending ? (
                  <Spinner />
                ) : (
                  <Icon name="chevron" size={16} />
                )}
              </span>
            </button>
            {account?.youtubeConnected && (
              <button
                className="me__row"
                type="button"
                onClick={() => void handleDisconnect()}
              >
                <span className="me__row-ico">
                  <Icon name="logout" size={18} />
                </span>
                <span className="me__row-key">YouTube 연결 해제</span>
                <span className="me__row-val">
                  <Icon name="chevron" size={16} />
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="me__foot">
          <button
            className="btn btn--ghost btn--block"
            type="button"
            onClick={() => void handleLogout()}
          >
            <Icon name="logout" size={18} />
            <span>로그아웃</span>
          </button>
        </div>
        <div style={{ height: 20 }} />
      </div>
    </>
  );
}
