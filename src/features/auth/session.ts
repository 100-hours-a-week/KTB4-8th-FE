"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, readSession, writeSession } from "@/lib/api/client";
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

/** oauth 화면(계정 선택 모의)에서 고른 계정 — 목 핸들러의 LoginBody.account 와 같은 모양이다 */
export interface LoginAccount {
  sub?: string;
  name: string;
  email: string;
  isNew?: boolean;
}

/** POST /user/auth-session — Google 인증 코드를 토큰으로 바꾼다.
    account 는 실제 OAuth 에는 없는 필드지만, 목 로그인 화면이 고른 계정을 서버(mock)에 알려줘야
    이름 · 이메일 · 신규 가입 여부를 그 계정 기준으로 채울 수 있다(handlers.ts loginHandler 참고). */
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      authorizationCode: string;
      redirectUri?: string;
      account?: LoginAccount;
    }) => (await api.post<AuthSession>("/user/auth-session", body)).data,
    onSuccess: (s) => {
      writeSession({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
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
      try {
        await api.del("/user/auth-session");
      } catch {
        /* 서버가 실패해도 클라이언트 세션은 지운다 */
      }
    },
    onSettled: () => {
      writeSession(null);
      qc.clear();
      useCourseStore.getState().reset();
      useCourseStore.getState().setOpen(false);
      router.replace("/login");
    },
  });
}
