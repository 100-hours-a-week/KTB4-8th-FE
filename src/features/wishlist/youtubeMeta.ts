"use client";

import { useQuery } from "@tanstack/react-query";

/* 원본 콘텐츠(유튜브 영상)의 제목 · 채널 — BE 가 영상 ID 만 저장해서, 화면을 열 때 BFF(/bff/youtube/videos)로 읽는다.
   저장하지 않고 이 화면의 메모리 캐시에만 둔다. 날짜는 보여 주지 않는다. */

export type VideoMeta =
  | { state: "ok"; title: string; channel: string }
  | { state: "unavailable" }
  | { state: "unknown" };

/** 영상 ID → 정보. 조회 전 · 조회 실패는 항목이 없다(화면은 영상 N + 주소로 대신 보여 준다). */
export function useYoutubeMeta(ids: string[]) {
  const key = [...new Set(ids)].slice(0, 10);
  return useQuery({
    queryKey: ["youtube-meta", key],
    enabled: key.length > 0,
    staleTime: 10 * 60_000,
    retry: false,
    queryFn: async (): Promise<Record<string, VideoMeta>> => {
      const res = await fetch(
        `/bff/youtube/videos?ids=${encodeURIComponent(key.join(","))}`,
      );
      if (!res.ok) return {};
      const body = (await res.json()) as { videos?: Record<string, VideoMeta> };
      return body.videos ?? {};
    },
  });
}
