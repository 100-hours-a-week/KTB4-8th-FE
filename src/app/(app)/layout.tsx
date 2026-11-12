"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";

/* 인증된 셸 — 가드 · 탭바 · 진행 막대 · 코스 추천 팝업은 AppShell 이 맡는다(루트(/)의 앱 홈과 같이 쓴다). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
