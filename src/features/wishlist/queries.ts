"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiV2 } from "@/lib/api/client";
import type {
  WishlistEventDetail,
  WishlistEventList,
  WishlistPlaceDetail,
  WishlistPlaceList,
} from "./types";

/* 보관함(BE v2) 조회 훅 — 장소 목록 · 상세. 이벤트 · 코스 · 삭제 API 는 BE 가 아직 없어 연결하지 않았다. */

export const wishlistKeys = {
  places: ["wishlist", "places"] as const,
  place: (placeId: string) => ["wishlist", "places", placeId] as const,
  events: ["wishlist", "events"] as const,
  event: (eventId: string) => ["wishlist", "events", eventId] as const,
};

/** GET /outing-wishlist/places?cursor= — 커서로 이어서 불러온다 */
export function useWishlistPlaces(enabled = true) {
  return useInfiniteQuery({
    queryKey: wishlistKeys.places,
    enabled,
    initialPageParam: "",
    queryFn: async ({ pageParam }) =>
      (
        await apiV2.get<WishlistPlaceList>("/outing-wishlist/places", {
          cursor: pageParam,
        })
      ).data,
    getNextPageParam: (last) => last.next_cursor || undefined,
  });
}

/** GET /outing-wishlist/places/{placeId} */
export function useWishlistPlace(placeId: string | null) {
  return useQuery({
    queryKey: wishlistKeys.place(placeId ?? ""),
    queryFn: async () =>
      (
        await apiV2.get<WishlistPlaceDetail>(
          `/outing-wishlist/places/${encodeURIComponent(placeId ?? "")}`,
        )
      ).data,
    enabled: !!placeId,
  });
}

/** DELETE /outing-wishlist/places/{placeId} — 보관한 장소 제거 */
export function useDeleteWishlistPlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (placeId: string) => {
      await apiV2.del(`/outing-wishlist/places/${encodeURIComponent(placeId)}`);
    },
    // 지운 항목의 상세는 다시 불러오지 않고(404) 캐시에서 지우고, 목록만 새로 받는다
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: wishlistKeys.place(id) });
      return qc.invalidateQueries({
        queryKey: wishlistKeys.places,
        exact: true,
      });
    },
  });
}

/** GET /outing-wishlist/events?cursor= */
export function useWishlistEvents(enabled = true) {
  return useInfiniteQuery({
    queryKey: wishlistKeys.events,
    enabled,
    initialPageParam: "",
    queryFn: async ({ pageParam }) =>
      (
        await apiV2.get<WishlistEventList>("/outing-wishlist/events", {
          cursor: pageParam,
        })
      ).data,
    getNextPageParam: (last) => last.next_cursor || undefined,
  });
}

/** GET /outing-wishlist/events/{eventId} */
export function useWishlistEvent(eventId: string | null) {
  return useQuery({
    queryKey: wishlistKeys.event(eventId ?? ""),
    queryFn: async () =>
      (
        await apiV2.get<WishlistEventDetail>(
          `/outing-wishlist/events/${encodeURIComponent(eventId ?? "")}`,
        )
      ).data,
    enabled: !!eventId,
  });
}

/** DELETE /outing-wishlist/events/{eventId} — 보관한 이벤트 제거 */
export function useDeleteWishlistEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      await apiV2.del(`/outing-wishlist/events/${encodeURIComponent(eventId)}`);
    },
    // 지운 항목의 상세는 다시 불러오지 않고(404) 캐시에서 지우고, 목록만 새로 받는다
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: wishlistKeys.event(id) });
      return qc.invalidateQueries({
        queryKey: wishlistKeys.events,
        exact: true,
      });
    },
  });
}
