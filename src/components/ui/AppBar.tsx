"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

/* 상단 헤더.
   brand → 메인 화면의 KeepGo 로고 헤더
   back  → 뒤로가기 버튼
   action → 우측 버튼 */
export function AppBar({
  title,
  sub,
  back,
  brand,
  plain,
  action,
  onBack,
}: {
  title?: string;
  sub?: string;
  back?: boolean;
  brand?: boolean;
  plain?: boolean;
  action?: ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  const goBack = onBack || (() => router.back());

  if (brand) {
    return (
      <header className="appbar appbar--plain">
        <p className="appbar__brand">KeepGo</p>
        <div className="appbar__actions">{action}</div>
      </header>
    );
  }

  return (
    <header className={`appbar${plain ? " appbar--plain" : ""}`}>
      <div className="appbar__lead">
        {back && (
          <button
            className="appbar__btn"
            type="button"
            aria-label="뒤로가기"
            onClick={goBack}
          >
            <Icon name="back" />
          </button>
        )}
      </div>
      <div className="appbar__center">
        <h1 className="appbar__title">{title}</h1>
        {sub && <span className="appbar__sub">{sub}</span>}
      </div>
      <div className="appbar__actions">{action}</div>
    </header>
  );
}
