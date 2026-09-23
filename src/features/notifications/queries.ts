"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { AppNotification } from "@/types/api";

/* 알림함 시트가 쓰는 훅 — 프로토타입 js/pages/home.js 의 openNotificationSheet() 를 옮겼다. */

export const notificationKeys = {
  list: ["user", "notifications"] as const,
};

/** GET /user/notifications */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list,
    queryFn: async () =>
      (await api.get<AppNotification[]>("/user/notifications")).data,
  });
}

/** GET /user/notifications/{id} — 읽음 처리 직후 전체 문구를 보여줄 때 한 번만 부른다.
    목록처럼 캐시로 구독할 대상이 아니라 명령형으로 호출하는 조회라 mutation 으로 감쌌다. */
export function useNotificationDetail() {
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.get<AppNotification>(`/user/notifications/${id}`)).data,
  });
}

/** PATCH /user/notifications/{id} — 읽음 처리. 목록 캐시도 그 자리에서 갱신해 안 읽음 점을 바로 지운다. */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/user/notifications/${id}`, { read: true });
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<AppNotification[] | undefined>(
        notificationKeys.list,
        (old) => old?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
  });
}
