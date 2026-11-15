import { useQuery } from "@tanstack/react-query";
import type { WalkRouteResponse } from "@/app/bff/route/walk/route";

/* 코스의 장소들을 이은 도보 경로 — BFF(/bff/route/walk)가 GraphHopper 에서 받아 온다.
   장소 좌표만 보낸다(출발지는 보내지 않는다). 경로를 못 받으면 null — 지도는 직선 점선으로 대신한다. */

export interface LatLng {
  lat: number;
  lng: number;
}

/** BFF 가 받는 지점 수 범위 */
const MIN_POINTS = 2;
const MAX_POINTS = 5;

/** stops: 코스의 장소를 순서대로(좌표를 모르면 null) */
export function useWalkingRoute(stops: (LatLng | null)[]): LatLng[] | null {
  const known = stops.filter((p): p is LatLng => p !== null);
  const usable = known.length >= MIN_POINTS && known.length <= MAX_POINTS;
  const points = known.map((p) => `${p.lat},${p.lng}`).join(";");

  const { data } = useQuery({
    queryKey: ["walk-route", points],
    enabled: usable,
    // 같은 코스를 다시 열 때마다 호출하지 않는다 — 하루 호출 한도(무료 플랜)를 아낀다
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<LatLng[] | null> => {
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
    },
  });
  return data ?? null;
}
