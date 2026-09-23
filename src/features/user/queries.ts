"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { userKeys } from "@/features/auth/session";
import type { NotificationSettings } from "@/types/api";

/* 마이페이지 · 프로필 수정이 쓰는 사용자 정보 변경 훅.
   프로토타입 js/pages/mypage.js, js/pages/profile-edit.js 의 KG.api 호출을 TanStack Query 로 옮겼다. */

export interface PatchUserBody {
  nickname?: string;
  /** 프리셋 id(AVATAR_PRESETS) 또는 'upload:<dataURL>' — 명세: PATCH /user 는 profileImageUrl 이 아니라 profileImageId 를 받는다 */
  profileImageId?: string | null;
}

export interface PatchUserResponse {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  updatedAt: string;
}

/** PATCH /user — 닉네임 · 프로필 사진 저장 */
export function usePatchUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: PatchUserBody) =>
      (await api.patch<PatchUserResponse>("/user", body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me }),
  });
}

/** PATCH /user/notifications/settings — 알림 설정 스위치.
    명세엔 현재 값을 읽는 GET 이 없어(백엔드 확인 필요) 화면은 서버 기본값(모두 켜짐)으로 초기화한 뒤
    토글마다 이 훅으로 저장하고, 실패하면 화면이 직접 스위치를 되돌린다. */
export function usePatchNotificationSettings() {
  return useMutation({
    mutationFn: async (body: Partial<NotificationSettings>) =>
      (
        await api.patch<NotificationSettings>(
          "/user/notifications/settings",
          body,
        )
      ).data,
  });
}

/** DELETE /user/oauth-connections/google — YouTube 연결 해제 */
export function useDisconnectGoogle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.del("/user/oauth-connections/google");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.accounts }),
  });
}
