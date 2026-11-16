import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { WalkRouteResponse } from "@/app/bff/route/walk/route";

/* 코스의 장소들을 이은 도보 경로 — BFF(/bff/route/walk)가 GraphHopper 에서 받아 온다.
   장소 좌표만 보낸다(출발지는 보내지 않는다). 경로를 못 받으면 null — 지도는 직선 점선으로 대신한다.
   후보 목록이 나오면 후보마다 미리 받아 두어서(usePrefetchWalkingRoutes), 후보를 눌렀을 때 바로 도보 경로가 그려진다. */

export interface LatLng {
  lat: number;
  lng: number;
}

/** BFF 가 받는 지점 수 범위 */
const MIN_POINTS = 2;
const MAX_POINTS = 5;
/** 목록이 나올 때 미리 받아 두는 후보 수 — 하루 호출 한도(무료 플랜)를 아끼려고 앞쪽 후보만 */
const PREFETCH_LIMIT = 4;

/** 장소 좌표(모르면 null)를 BFF 에 보낼 지점 문자열로. 받을 수 있는 개수가 아니면 null */
function walkPointsOf(stops: (LatLng | null)[]): string | null {
  const known = stops.filter((p): p is LatLng => p !== null);
  if (known.length < MIN_POINTS || known.length > MAX_POINTS) return null;
  return known.map((p) => `${p.lat},${p.lng}`).join(";");
}

async function fetchWalkPath(points: string): Promise<LatLng[] | null> {
  try {
    const res = await fetch(
      `/bff/route/walk?${new URLSearchParams({ points })}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as WalkRouteResponse;
    return json.path.map(([lat, lng]) => ({ lat, lng }));
  } catch {
    return null;
  }
}

/** 같은 코스를 다시 열 때마다 호출하지 않는다 — 하루 호출 한도(무료 플랜)를 아낀다 */
function walkQueryOptions(points: string) {
  return {
    queryKey: ["walk-route", points] as const,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
    queryFn: () => fetchWalkPath(points),
  };
}

/** stops: 코스의 장소를 순서대로(좌표를 모르면 null). path: 받은 도보 경로(없으면 null), loading: 아직 받는 중 */
export function useWalkingRouteState(stops: (LatLng | null)[]): {
  path: LatLng[] | null;
  loading: boolean;
} {
  const points = walkPointsOf(stops);
  const { data, isLoading } = useQuery({
    ...walkQueryOptions(points ?? ""),
    enabled: points !== null,
    refetchOnWindowFocus: false,
  });
  return { path: data ?? null, loading: points !== null && isLoading };
}

export function useWalkingRoute(stops: (LatLng | null)[]): LatLng[] | null {
  return useWalkingRouteState(stops).path;
}

/** 후보 목록이 보일 때 후보마다 도보 경로를 미리 받아 둔다(앞쪽 PREFETCH_LIMIT 개). 이미 받은 것은 다시 받지 않는다 */
export function usePrefetchWalkingRoutes(courses: (LatLng | null)[][]) {
  const client = useQueryClient();
  const keys = courses
    .slice(0, PREFETCH_LIMIT)
    .map(walkPointsOf)
    .filter((p): p is string => p !== null)
    .join("|");
  useEffect(() => {
    if (!keys) return;
    for (const points of keys.split("|")) {
      void client.prefetchQuery(walkQueryOptions(points));
    }
  }, [client, keys]);
}
