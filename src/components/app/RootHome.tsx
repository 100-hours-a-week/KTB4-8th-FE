"use client";

import HomePage from "@/app/(app)/home/page";
import { AppShell } from "./AppShell";

/* 로그인한 사용자가 루트(/)에서 보는 앱 홈 — 인증 셸(AppShell) + 홈 화면.
   루트 페이지가 next/dynamic 으로 불러서, 로그인 전 방문자(랜딩)는 앱 홈 코드를 내려받지 않는다. */
export default function RootHome() {
  return (
    <AppShell>
      <HomePage />
    </AppShell>
  );
}
