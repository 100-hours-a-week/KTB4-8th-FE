import type { ExtraScheduleRow } from "./types";

/* 일정표(상반기 · 하반기 같은 묶음)를 탭으로 나누고, 오늘이 속한 묶음 · 주차를 고르는 순수 함수들 */

export interface ScheduleGroup {
  /** 탭 글자 — "하반기" */
  label: string;
  /** 탭 아래에 보이는 기간 — "9.6 ~ 10.25" */
  range: string;
  rows: ExtraScheduleRow[];
}

/** group 은 묶음의 첫 행에만 적혀 있으니, 다음 group 이 나올 때까지 같은 묶음으로 본다.
    "하반기 · 9.6 ~ 10.25" → { label: "하반기", range: "9.6 ~ 10.25" }. 묶음 표시가 없으면 한 묶음. */
export function groupSchedule(rows: ExtraScheduleRow[]): ScheduleGroup[] {
  const groups: ScheduleGroup[] = [];
  for (const row of rows) {
    if (row.group || groups.length === 0) {
      const [label = "", range = ""] = (row.group ?? "").split(" · ");
      groups.push({ label, range, rows: [] });
    }
    groups[groups.length - 1].rows.push(row);
  }
  return groups;
}

const DAY = 86_400_000;

function midnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function dateOf(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).getTime();
}

/** 오늘이 이 행이 속한 주인지 — 행의 날짜(그 주 일요일)까지 6일 안(월~일)이면 그 주다 */
export function isCurrentWeek(
  date: string | undefined,
  today: Date = new Date(),
): boolean {
  if (!date) return false;
  const diff = (dateOf(date) - midnight(today)) / DAY;
  return diff >= 0 && diff <= 6;
}

/** 처음 보여 줄 탭 — 아직 끝나지 않은 첫 묶음(진행 중이거나 곧 시작). 모두 지났으면 마지막 묶음 */
export function pickDefaultGroup(
  groups: ScheduleGroup[],
  today: Date = new Date(),
): number {
  const now = midnight(today);
  // 날짜가 있는 묶음이 하나도 없으면(라인업 · 시간표처럼 종류로 나눈 탭) 맨 앞 탭부터 보여 준다
  if (!groups.some((g) => g.rows.some((r) => r.date))) return 0;
  const idx = groups.findIndex((g) => {
    const dates = g.rows.flatMap((r) => (r.date ? [dateOf(r.date)] : []));
    return dates.length > 0 && Math.max(...dates) >= now;
  });
  return idx >= 0 ? idx : Math.max(0, groups.length - 1);
}
