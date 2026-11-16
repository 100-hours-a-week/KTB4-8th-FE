import { NextRequest, NextResponse } from "next/server";

/* 코스의 장소들을 이은 도보 경로 — GraphHopper Directions API(foot 프로파일, OpenStreetMap 데이터).
   · 키(GRAPHHOPPER_API_KEY)를 브라우저에 노출하지 않으려고 BFF 에서 호출한다. 키가 없으면 503 — 화면은 직선 점선으로 대신한다.
   · 장소 좌표만 받는다. 사용자의 위치(출발지)는 외부로 보내지 않는다 — 출발지 → 1번 구간은 화면에서 직선으로 그린다.
   · 한 코스 = 한 번의 호출(장소가 2~5곳이면 크레딧 1개). 같은 좌표 조합은 한 시간 동안 서버 메모리에 둔다(실패 응답은 두지 않는다).
   · 쿼리: points=위도,경도;위도,경도;… (2~5곳, 한국 안의 좌표만) */

const GRAPHHOPPER_URL = "https://graphhopper.com/api/1/route";
/** 무료 플랜은 한 번에 보낼 수 있는 지점 수가 제한돼서(공식 문서: 플랜마다 다름) 5곳까지만 받는다 */
const MAX_POINTS = 5;
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 500;
/** 한국 안의 좌표만 받아서, 엉뚱한 요청으로 호출량(크레딧)을 쓰지 않게 한다 */
const KOREA = { latMin: 33, latMax: 39, lngMin: 124, lngMax: 132 };

export interface WalkRouteResponse {
  /** [위도, 경도] 의 연속 — 첫 장소에서 마지막 장소까지 이어지는 도보 경로 */
  path: [number, number][];
  distanceM: number;
  timeMs: number;
}

const cache = new Map<string, { at: number; value: WalkRouteResponse }>();

function parsePoints(raw: string | null): [number, number][] | null {
  if (!raw) return null;
  const parts = raw.split(";").filter(Boolean);
  if (parts.length < 2 || parts.length > MAX_POINTS) return null;
  const out: [number, number][] = [];
  for (const part of parts) {
    const [lat, lng] = part.split(",").map(Number);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < KOREA.latMin ||
      lat > KOREA.latMax ||
      lng < KOREA.lngMin ||
      lng > KOREA.lngMax
    ) {
      return null;
    }
    // 소수 다섯째 자리(약 1m)까지만 — 같은 장소는 같은 캐시 키가 되게 한다
    out.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  }
  return out;
}

/** GraphHopper 의 points — points_encoded=false 이면 [경도,위도] 목록이거나 그것을 coordinates 로 가진 객체 */
function toLatLngPath(points: unknown): [number, number][] | null {
  const coords = Array.isArray(points)
    ? points
    : (points as { coordinates?: unknown } | null)?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const path: [number, number][] = [];
  for (const c of coords) {
    if (!Array.isArray(c)) return null;
    const [lng, lat] = c as number[];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    path.push([lat, lng]);
  }
  return path;
}

export async function GET(request: NextRequest) {
  const points = parsePoints(request.nextUrl.searchParams.get("points"));
  if (!points) {
    return NextResponse.json({ error: "INVALID_POINTS" }, { status: 400 });
  }

  const key = process.env.GRAPHHOPPER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "GRAPHHOPPER_API_KEY_MISSING" },
      { status: 503 },
    );
  }

  const cacheKey = points.map((p) => p.join(",")).join(";");
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.value, {
      headers: { "Cache-Control": "private, max-age=3600" },
    });
  }

  const params = new URLSearchParams({
    key,
    profile: "foot",
    points_encoded: "false",
    instructions: "false",
    // 고도 데이터를 쓰면 별도 출처 표기가 필요해서 끈다
    elevation: "false",
  });
  for (const [lat, lng] of points) params.append("point", `${lat},${lng}`);

  try {
    const res = await fetch(
      `${process.env.GRAPHHOPPER_API_URL || GRAPHHOPPER_URL}?${params}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) {
      // 429 = 하루 · 분당 한도를 다 썼다. 화면은 직선으로 대신하니 상태만 그대로 알린다.
      return NextResponse.json(
        { error: "GRAPHHOPPER_FAILED", status: res.status },
        { status: res.status === 429 ? 429 : 502 },
      );
    }
    const json = (await res.json()) as {
      paths?: { points?: unknown; distance?: number; time?: number }[];
    };
    const best = json.paths?.[0];
    const path = toLatLngPath(best?.points);
    if (!best || !path) {
      return NextResponse.json({ error: "NO_ROUTE" }, { status: 502 });
    }
    const value: WalkRouteResponse = {
      path,
      distanceM: best.distance ?? 0,
      timeMs: best.time ?? 0,
    };
    if (cache.size >= CACHE_MAX) {
      // 가장 오래된 것부터 비운다(Map 은 넣은 순서를 지킨다)
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(cacheKey, { at: Date.now(), value });
    return NextResponse.json(value, {
      headers: { "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "GRAPHHOPPER_FAILED" }, { status: 502 });
  }
}
