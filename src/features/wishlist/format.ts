import { CATEGORY_LABEL } from "@/lib/constants";
import { fmtDot, getDdayBadge } from "@/lib/format";
import type { Category } from "@/types/api";

/** 코스의 구성 요소 묶음(stops)에서 항목만 펴서 돌려준다.
    BE 가 묶음 배열(`[{count, items}]`)로도, 묶음 하나(`{count, items}`)로도 주고 있어 둘 다 받는다
    (상세 응답이 배열에서 객체로 바뀌면서 `.flatMap` 이 깨졌었다). */
export function courseStopItems<T>(
  stops: { items?: T[] | null }[] | { items?: T[] | null } | null | undefined,
): T[] {
  const groups = Array.isArray(stops) ? stops : stops ? [stops] : [];
  return groups.flatMap((g) => (Array.isArray(g?.items) ? g.items : []));
}

/** "카페,디저트" · "카페 · 디저트" · "카페/디저트" 처럼 오는 분류 문자열을 배지용 목록으로 나눈다 */
export function splitCategories(category: string | null | undefined): string[] {
  // "레저·스포츠"는 가운데점까지가 이름이라 나누지 않는다
  return (category ?? "")
    .replace(/레저·스포츠/g, "레저\u0000스포츠")
    .split(/[,·/]/)
    .map((c) => c.trim().replace("\u0000", "·"))
    .filter(Boolean);
}

/** 네이버 지도 링크. 장소 ID 가 있으면 그 장소의 정보창이 바로 열린다.
    없으면 장소명 + 도로명 주소로 검색한다 — 같은 이름이 둘 이상이면 목록이 먼저 나온다. */
export function naverMapUrl(
  name: string,
  addressRoad?: string | null,
  naverPlaceId?: string | null,
) {
  if (naverPlaceId && /^\d+$/.test(naverPlaceId)) {
    return `https://map.naver.com/p/entry/place/${naverPlaceId}`;
  }
  return naverMapSearchUrl(name, addressRoad);
}

function naverMapSearchUrl(name: string, addressRoad?: string | null) {
  const query = [name, addressRoad].filter(Boolean).join(" ");
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

export interface YoutubeLink {
  url: string;
  /** 영상 ID(11자) — 제목 · 채널을 조회할 때 쓴다. 못 뽑으면 null */
  id: string | null;
  /** 화면에 보이는 짧은 주소(youtube.com/watch?v=... 처럼) */
  label: string;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

/** shorts/{id} · watch?v={id} · youtu.be/{id} · watch/{id} 에서 영상 ID 를 뽑는다 */
function youtubeVideoId(u: URL): string | null {
  const candidate =
    u.searchParams.get("v") ??
    u.pathname.match(/^\/(?:shorts|watch|embed|live)\/([\w-]+)/)?.[1] ??
    (u.hostname === "youtu.be" ? u.pathname.slice(1) : null);
  return candidate && /^[\w-]{11}$/.test(candidate) ? candidate : null;
}

/** BE 가 준 영상 링크 중 유튜브 주소만 남긴다. 다른 주소나 형식이 깨진 값은 버린다(링크로 열지 않는다). */
export function toYoutubeLinks(
  raw: string[] | null | undefined,
): YoutubeLink[] {
  const out: YoutubeLink[] = [];
  for (const value of raw ?? []) {
    try {
      const u = new URL(value);
      if (u.protocol !== "https:" || !YOUTUBE_HOSTS.has(u.hostname)) continue;
      // BE 가 영상 ID 로 만든 링크는 youtube.com/watch/{id} 형태일 수 있다 — 유튜브가 여는 형식(watch?v={id})으로 고친다
      const watchPath = u.pathname.match(/^\/watch\/([\w-]+)$/);
      if (watchPath) {
        u.pathname = "/watch";
        u.search = `?v=${watchPath[1]}`;
      }
      const short = `${u.hostname.replace(/^www\./, "")}${u.pathname}${u.search}`;
      out.push({
        url: u.toString(),
        id: youtubeVideoId(u),
        label: short.length > 38 ? `${short.slice(0, 37)}…` : short,
      });
    } catch {
      /* 주소 형식이 아니면 건너뛴다 */
    }
  }
  return out;
}

/** "2026-10-15" → "2026.10.15" */
export function fmtSaveDate(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "" : fmtDot(d);
}

const CATEGORY_BY_LABEL: Record<string, Category> = {
  ...(Object.fromEntries(
    Object.entries(CATEGORY_LABEL).map(([key, label]) => [label, key]),
  ) as Record<string, Category>),
  식당: "RESTAURANT",
  셀렉트샵: "SELECTSHOP",
};

/** 분류가 여러 개면 맨 앞의 것을 대표로 쓴다. 정해진 카테고리에 없는 분류면 null(기본 아이콘). */
export function primaryCategory(
  category: string | null | undefined,
): Category | null {
  const first = splitCategories(category)[0];
  return (first && CATEGORY_BY_LABEL[first]) || null;
}

/** "2026-10-16" ~ "2026-10-22" → { text: "2026.10.16 ~ 2026.10.22", dday: D-N 배지(마감 전일 때만) }. 날짜가 하나라도 없으면 null */
export function describePeriod(
  start: string | null | undefined,
  end: string | null | undefined,
): { text: string; dday: ReturnType<typeof ddayOf> } | null {
  if (!start || !end) return null;
  const s = new Date(`${start.slice(0, 10)}T00:00:00`);
  const e = new Date(`${end.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  // 하루짜리 행사는 날짜를 한 번만 보여 준다
  const text =
    s.getTime() === e.getTime() ? fmtDot(s) : `${fmtDot(s)} ~ ${fmtDot(e)}`;
  return { text, dday: ddayOf(end) };
}

export type EventStatus = "ongoing" | "ended";

/** 이벤트 진행 상태. 오늘이 기간 안이면 ongoing, 종료일이 지났으면 ended.
    시작 전이거나 종료일을 모르면 null(배지를 달지 않는다). */
export function eventStatus(
  start: string | null | undefined,
  end: string | null | undefined,
  now = new Date(),
): EventStatus | null {
  if (!end) return null;
  const day = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00`).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const e = day(end);
  if (Number.isNaN(e)) return null;
  if (e < today.getTime()) return "ended";
  if (start && day(start) > today.getTime()) return null;
  return "ongoing";
}

/** 아직 시작 전인 이벤트가 열리기까지 남은 날 수(내일 시작이면 1). 이미 시작했거나 시작일을 모르면 null */
export function daysUntilStart(
  start: string | null | undefined,
  now = new Date(),
): number | null {
  if (!start) return null;
  const s = new Date(`${start.slice(0, 10)}T00:00:00`).getTime();
  if (Number.isNaN(s)) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((s - today.getTime()) / 86_400_000);
  return days > 0 ? days : null;
}

/** 목록용 D-N 배지 — "2026-10-22" 같은 종료 날짜 기준 */
export function ddayOf(end: string | null | undefined) {
  if (!end) return null;
  const e = new Date(`${end.slice(0, 10)}T00:00:00`);
  return Number.isNaN(e.getTime()) ? null : getDdayBadge(e.toISOString());
}
