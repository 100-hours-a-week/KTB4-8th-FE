import type { TimeOfDay } from "@/types/api";

/* 채팅 응답의 날짜 · 시각(datetime)을 조건 카드가 쓰는 값으로 바꾼다.
   AI 와 BE 는 시각을 모를 때 00:00 을 보낸다(AI 슬롯 스키마 주석: "00:00 은 시간 모름, 백엔드와 합의").
   그래서 00:00 이면 시간대를 비워 두고, 시각이 있으면 오전 · 오후 · 저녁으로 바꿔 채운다. */

/** "오전/오후"를 말하지 않은 1~9시는 오후 시각으로 본다(3시 → 15:00, 8시 → 20:00).
    AI 가 "3시"를 03:00 으로 내는 경우를 막는 임시 안전장치다 — AI 프롬프트가 오전/오후를 직접 정하게 되면 끈다(0 으로).
    트레이드오프: 사용자가 "오전 8시"라고 분명히 말해 AI 가 08:00 을 보내도 저녁 8시로 읽는다. */
export const PM_CORRECTION_MAX_HOUR = 9;

export interface ParsedSlotTime {
  /** "yyyy-MM-dd" */
  date: string | null;
  /** 안전장치까지 적용한 "HH:mm". 시각을 모르면 null */
  time: string | null;
  timeOfDay: TimeOfDay | null;
}

/** 시(hour) → 시간대. 정의서 구간: 오전 6~12, 오후 12~18, 저녁 18~24 (그 밖의 새벽은 오전으로 묶는다) */
export function timeOfDayOfHour(hour: number): TimeOfDay {
  if (hour >= 18) return "EVENING";
  if (hour >= 12) return "AFTERNOON";
  return "MORNING";
}

const DATETIME =
  /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?/;

/** "yyyy-MM-dd" · "yyyy-MM-ddTHH:mm:ss" · "yyyy-MM-dd HH:mm:ss" 를 읽는다. 시간대 표기(Z · +09:00)는 시각 숫자만 쓴다. */
export function parseSlotDatetime(
  value: string | null | undefined,
): ParsedSlotTime {
  const match = value?.match(DATETIME);
  if (!match) return { date: null, time: null, timeOfDay: null };
  const [, date, hh, mm] = match;
  if (hh == null || mm == null) return { date, time: null, timeOfDay: null };
  let hour = Number(hh);
  const minute = Number(mm);
  // 00:00 은 "시간 모름"
  if (hour === 0 && minute === 0) return { date, time: null, timeOfDay: null };
  if (hour >= 1 && hour <= PM_CORRECTION_MAX_HOUR) hour += 12;
  return {
    date,
    time: `${String(hour).padStart(2, "0")}:${mm}`,
    timeOfDay: timeOfDayOfHour(hour),
  };
}
