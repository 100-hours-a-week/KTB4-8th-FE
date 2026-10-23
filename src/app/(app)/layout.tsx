"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { TabBar } from "@/components/ui/TabBar";
import { CoursePopup } from "@/features/recommendations/CoursePopup";
import { hasSession } from "@/features/auth/session";

/* 인증된 셸.
   Bearer 헤더 방식이라 Edge Middleware 가 토큰을 읽을 수 없다.
   그래서 가드를 여기(클라이언트 레이아웃)에 둔다 — 2026-09-21 결정.
   비로그인 상태에서는 HTML 셸만 받고 데이터는 서버가 401 로 막는다. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (hasSession()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 서버 렌더 시점엔 세션(localStorage)을 읽을 수 없어 클라이언트 마운트 후에만 판별 가능
      setAllowed(true);
      return;
    }
    router.replace("/login");
  }, [router]);

  if (!allowed) return null;

  return (
    <>
      {children}
      <TabBar />
      {/* 코스 추천은 화면 이동이 아니라 현재 화면 위에 뜨는 팝업이다 */}
      <CoursePopup />
    </>
  );
}
