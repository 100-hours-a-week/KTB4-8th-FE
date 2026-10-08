/* 표시 포맷 — 명세는 KST(UTC+9) ISO-8601 문자열을 쓴다. */

export const DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;

const p2 = (n: number) => String(n).padStart(2, "0");

/** Date → 명세 형식 ISO 문자열(KST) */
export function toIso(date: Date) {
  return (
    `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}` +
    `T${p2(date.getHours())}:${p2(date.getMinutes())}:00+09:00`
  );
}

/** 9/26(토) */
export function fmtDate(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}(${DOW[d.getDay()]})`;
}

/** 2026.09.26 */
export function fmtDot(d: Date) {
  return `${d.getFullYear()}.${p2(d.getMonth() + 1)}.${p2(d.getDate())}`;
}

/** 오후 1:12 */
export function fmtTime(iso: string) {
  const d = new Date(iso);
  const h24 = d.getHours();
  const ampm = h24 < 12 ? "오전" : "오후";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${ampm} ${h12}:${p2(d.getMinutes())}`;
}

/** 13:12 */
export function fmtHm(iso: string) {
  const d = new Date(iso);
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

/** 3시간 42분 */
export function fmtDuration(min: number) {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** 이벤트 기간 — 2026.09.18 ~ 2026.09.27 */
export function fmtPeriod(startAt?: string | null, endAt?: string | null) {
  if (!startAt || !endAt) return "";
  return `${fmtDot(new Date(startAt))} ~ ${fmtDot(new Date(endAt))}`;
}

export type EventStatusTone = "today" | "closing" | "normal" | "upcoming";

export interface EventStatusBadge {
  label: string;
  tone: EventStatusTone;
}

function calendarDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** 이벤트 상태 배지 — 시작 예정 / 오늘 마감 / D-X */
export function getEventStatusBadge(
  startAt?: string | null,
  endAt?: string | null,
  now = new Date(),
): EventStatusBadge | null {
  const today = calendarDay(now);

  if (startAt) {
    const start = new Date(startAt);
    if (calendarDay(start) > today) {
      return {
        label: `${start.getMonth() + 1}월 ${start.getDate()}일 시작`,
        tone: "upcoming",
      };
    }
  }

  if (!endAt) return null;
  const days = Math.round((calendarDay(new Date(endAt)) - today) / 86400000);
  if (days < 0) return null;
  if (days === 0) return { label: "오늘 마감", tone: "today" };
  return {
    label: `D-${days}`,
    tone: days <= 10 ? "closing" : "normal",
  };
}

/** 기존 텍스트 사용처를 위한 호환 함수 */
export function fmtDday(endAt?: string | null) {
  return getEventStatusBadge(null, endAt)?.label ?? "";
}

/** 도로명 주소에서 짧은 지역 라벨을 만든다.
    명세의 /addresses 응답에 region 필드가 없어 프론트가 직접 줄인다.
    "서울특별시 성동구 성수이로 77" → "성동구 성수이로" */
export function shortAddress(road?: string | null) {
  if (!road) return "";
  const parts = String(road).trim().split(/\s+/);
  if (parts.length <= 2) return parts.join(" ");
  return parts.slice(1, 3).join(" ");
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name.length <= 2 ? name : name.slice(-2);
}

export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
