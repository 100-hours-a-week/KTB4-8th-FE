"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Advertisement, EventItem, Place } from "@/types/api";

/* 홈 · 더보기 목록 · 장소/이벤트 상세가 쓰는 조회 훅.
   프로토타입 js/pages/home.js 의 KG.api.get 호출을 TanStack Query 로 옮겼다. */

export const placeKeys = {
  trending: (size: number) => ["places", "trending", size] as const,
  detail: (placeId: string) => ["places", placeId] as const,
  event: (eventId: string) => ["events", eventId] as const,
  ads: ["advertisements"] as const,
};

/** GET /places?sort=trending — 요즘 뜨는 곳 (홈 가로 스크롤 · 더보기 목록이 함께 쓴다) */
export function useTrendingPlaces(size = 10) {
  return useQuery({
    queryKey: placeKeys.trending(size),
    queryFn: async () =>
      (await api.get<Place[]>("/places", { sort: "trending", size })).data,
  });
}

/** GET /places/{placeId} */
export function usePlace(placeId: string | null) {
  return useQuery({
    queryKey: placeKeys.detail(placeId ?? ""),
    queryFn: async () => (await api.get<Place>(`/places/${placeId}`)).data,
    enabled: !!placeId,
  });
}

/** GET /events/{eventId} */
export function useEvent(eventId: string | null) {
  return useQuery({
    queryKey: placeKeys.event(eventId ?? ""),
    queryFn: async () => (await api.get<EventItem>(`/events/${eventId}`)).data,
    enabled: !!eventId,
  });
}

/** GET /advertisements — 지금 열린 이벤트(광고 배너) */
export function useAdvertisements() {
  return useQuery({
    queryKey: placeKeys.ads,
    queryFn: async () =>
      (await api.get<Advertisement[]>("/advertisements")).data,
  });
}
