"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { DOW } from "@/lib/format";
import { useCourseStore } from "./courseStore";
import type { TimeOfDay } from "@/types/api";

/* 날짜 · 시간대 바텀시트 — 프로토타입의 sheetDateTime() 을 그대로 옮겼다. */

const TOD_OPTIONS: { value: TimeOfDay; label: string }[] = [
  { value: "MORNING", label: "🌤 오전" },
  { value: "AFTERNOON", label: "☀️ 오후" },
  { value: "EVENING", label: "🌆 저녁" },
];

interface DateTimeSheetProps {
  onClose: () => void;
}

export function DateTimeSheet({ onClose }: DateTimeSheetProps) {
  const slots = useCourseStore((s) => s.slots);
  const patchSlots = useCourseStore((s) => s.patchSlots);

  const initialDate = slots.date
    ? new Date(`${slots.date}T00:00:00+09:00`)
    : null;
  const [year, setYear] = useState(() =>
    (initialDate ?? new Date()).getFullYear(),
  );
  const [month, setMonth] = useState(() =>
    (initialDate ?? new Date()).getMonth(),
  );
  const [day, setDay] = useState<Date | null>(initialDate);
  const [tod, setTod] = useState<TimeOfDay | null>(slots.timeOfDay);

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells: (number | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(d);

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function handleSave() {
    if (!day || !tod) return;
    const p = (n: number) => String(n).padStart(2, "0");
    patchSlots({
      date: `${day.getFullYear()}-${p(day.getMonth() + 1)}-${p(day.getDate())}`,
      timeOfDay: tod,
    });
    onClose();
  }

  return (
    <Sheet
      title="날짜 · 시간대"
      back
      onClose={onClose}
      foot={
        <button
          className="btn btn--block"
          type="button"
          disabled={!(day && tod)}
          onClick={handleSave}
        >
          저장
        </button>
      }
    >
      <div className="calendar__head">
        <button
          className="iconbtn"
          type="button"
          aria-label="이전 달"
          onClick={prevMonth}
        >
          <Icon name="back" size={16} />
        </button>
        <span className="calendar__month">
          {year}년 {month + 1}월
        </span>
        <button
          className="iconbtn"
          type="button"
          aria-label="다음 달"
          onClick={nextMonth}
        >
          <Icon name="chevron" size={16} />
        </button>
      </div>
      <div className="calendar">
        {DOW.map((d) => (
          <span key={d} className="calendar__dow">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d == null) return <span key={`empty-${i}`} />;
          const date = new Date(year, month, d);
          const past = date < todayStart;
          const isToday = date.toDateString() === today.toDateString();
          const on = !!day && day.toDateString() === date.toDateString();
          return (
            <button
              key={d}
              className="calendar__day"
              type="button"
              disabled={past}
              data-today={isToday ? "true" : undefined}
              aria-pressed={on}
              onClick={() => setDay(new Date(year, month, d))}
            >
              {d}
            </button>
          );
        })}
      </div>
      <p className="cond__legend" style={{ marginTop: 18 }}>
        시간대
      </p>
      <div className="seg">
        {TOD_OPTIONS.map((o) => (
          <button
            key={o.value}
            className="chip"
            type="button"
            aria-pressed={tod === o.value}
            onClick={() => setTod(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="field__help" style={{ marginTop: 12 }}>
        단일 선택 · 오전 06–12 / 오후 12–18 / 저녁 18–24
        <br />
        날짜와 시간대를 모두 선택해야 저장이 활성화됩니다.
      </p>
    </Sheet>
  );
}
