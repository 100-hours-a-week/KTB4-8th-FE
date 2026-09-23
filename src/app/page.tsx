"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasSession } from "@/features/auth/session";

/** 진입점 — 세션이 있으면 홈, 없으면 로그인으로 보낸다 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasSession() ? "/home" : "/login");
  }, [router]);

  return null;
}
