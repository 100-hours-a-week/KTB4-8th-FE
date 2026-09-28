"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  api,
  readSession,
  setIntentionalLogout,
  writeSession,
} from "@/lib/api/client";
import { useCourseStore } from "@/features/recommendations/courseStore";
import type { AuthSession, OauthAccount, User } from "@/types/api";

export const userKeys = {
  me: ["user"] as const,
  accounts: ["user", "accounts"] as const,
  stats: ["user", "analytics-statistics"] as const,
  notifications: ["user", "notifications"] as const,
};

export function hasSession() {
  return !!readSession()?.accessToken;
}

/** GET /user — 명세상 email 은 없다(→ useAccounts) */
export function useMe(enabled = true) {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: async () => (await api.get<User>("/user")).data,
    enabled,
  });
}

/** GET /user/accounts — 연동된 Google 계정(이메일 · YouTube 연동 여부) */
export function useAccounts(enabled = true) {
  return useQuery({
    queryKey: userKeys.accounts,
    queryFn: async () => (await api.get<OauthAccount[]>("/user/accounts")).data,
    enabled,
  });
}

/** 로컬 개발용 — BE 로그인(Google 인증 코드 교환)이 동작하기 전까지 env 의 JWT 로 세션을 만든다 */
export function loginWithDevToken(token: string) {
  setIntentionalLogout(false);
  writeSession({
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: 3600,
    issuedAt: Date.now(),
  });
}

/** POST /user/auth-session — Google 인증 코드를 토큰으로 바꾼다 */
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      authorizationCode: string;
      redirectUri: string;
    }) => (await api.post<AuthSession>("/user/auth-session", body)).data,
    onSuccess: (s) => {
      setIntentionalLogout(false);
      writeSession({
        accessToken: s.accessToken,
        tokenType: s.tokenType,
        expiresIn: s.expiresIn,
        issuedAt: Date.now(),
      });
      qc.clear();
    },
  });
}

/** DELETE /user/auth-session — 로그아웃 */
export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      // 화면에 남아 있는 사용자/계정/통계 요청부터 멈추고, 이후 401은 의도적인 로그아웃으로 처리한다.
      setIntentionalLogout(true);
      await qc.cancelQueries();
      try {
        await api.del("/user/auth-session");
      } catch {
        /* 서버가 실패해도 클라이언트 세션은 지운다 */
      }
    },
    onSettled: () => {
      writeSession(null);
      qc.clear();
      useCourseStore.getState().discard();
      router.replace("/login");
    },
  });
}
