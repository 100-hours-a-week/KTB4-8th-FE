"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  Candidate,
  CandidateComponent,
  CollectionItem,
  CourseSummary,
} from "@/types/api";

/* 보관함 화면(목록 · 코스 상세)이 쓰는 조회 훅.
   프로토타입 js/pages/collection.js 의 KG.api 호출을 TanStack Query 로 옮겼다. */

export type ItemFilter = "ALL" | "PLACE" | "EVENT" | "COURSE";

/** 명세의 CourseSummary 에는 components 가 없지만, 보관함 목록(GET /user/collections/me/items) 응답의
    코스 항목엔 경로 표시("A → B → C")용으로 실제 들어있다(백엔드 확인 필요). */
export interface CollectionCourseItem extends CourseSummary {
  components?: { name: string }[];
}

/** GET /user/collections/me/:courseId 응답 — 코스 상세(통계 · 이동 순서)에 필요한 전체 필드 */
export interface CollectionCourseDetail extends CourseSummary {
  components: CandidateComponent[];
  startAt: string;
  endAt: string;
  createdAt: string;
  saved: boolean;
}

export type SaveCollectionItemBody =
  | { itemType: "PLACE" | "EVENT"; itemId: string }
  | { itemType: "COURSE"; itemId: string; course: Candidate };

export const collectionKeys = {
  items: (type: ItemFilter) => ["collections", "items", type] as const,
  course: (courseId: string) => ["collections", "course", courseId] as const,
};

/** GET /user/collections/me/items?type= — 보관함 목록(전체 · 장소 · 이벤트 · 코스) */
export function useCollectionItems(type: ItemFilter) {
  return useQuery({
    queryKey: collectionKeys.items(type),
    queryFn: async () =>
      (await api.get<CollectionItem[]>("/user/collections/me/items", { type }))
        .data,
  });
}

/** GET /user/collections/me/:courseId — 보관한 코스 상세 */
export function useCourseDetail(courseId: string | null) {
  return useQuery({
    queryKey: collectionKeys.course(courseId ?? ""),
    queryFn: async () =>
      (
        await api.get<CollectionCourseDetail>(
          `/user/collections/me/${courseId}`,
        )
      ).data,
    enabled: !!courseId,
  });
}

/** POST /user/collections/me/items — 장소 · 이벤트 · 코스를 보관함에 담는다 */
export function useSaveCollectionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: SaveCollectionItemBody) =>
      (await api.post<CollectionItem>("/user/collections/me/items", body)).data,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["collections", "items"] }),
  });
}

/** DELETE /user/collections/me/items/:itemId — 보관함에서 삭제(코스 상세의 "삭제"가 쓴다) */
export function useDeleteCollectionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      await api.del(`/user/collections/me/items/${itemId}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["collections", "items"] }),
  });
}
