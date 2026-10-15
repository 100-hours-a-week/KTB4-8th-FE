"use client";

import { useEffect } from "react";

/* Microsoft Clarity — 페이지 히트맵 · 세션 녹화.
   NEXT_PUBLIC_CLARITY_PROJECT_ID 가 없으면 아무 일도 하지 않는다(로컬 개발 환경은 기본적으로 꺼져 있다). */
export function useClarity() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    if (!projectId) return;
    void import("@microsoft/clarity").then(({ default: Clarity }) =>
      Clarity.init(projectId),
    );
  }, []);
}
