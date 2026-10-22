"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { BusinessHours as Hours, BusinessHoursDay } from "./types";

/* 장소 상세의 영업시간 줄 — "영업 중 · 11:00 - 22:00 ⌄ · LAST 21:30".
   펼치면 오늘부터 요일별 시간이 나오고 오늘 줄은 굵게 보인다. 영업 상태는 지금 시각과 오늘 시간표로 정한다. */

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const minutes = (hhmm: string) => {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
};

export type OpenStatus = "open" | "break" | "closed" | "off";

/** 지금 영업 중인지. 쉬는 날이면 "off", 영업시간 밖이면 "closed", 브레이크타임이면 "break". 자정을 넘기는 시간(22:00 ~ 02:00)도 본다. */
export function openStatus(today: BusinessHoursDay, now: Date): OpenStatus {
  if (today.closed) return "off";
  const t = now.getHours() * 60 + now.getMinutes();
  const open = minutes(today.open);
  const close = minutes(today.close);
  const inside = close > open ? t >= open && t < close : t >= open || t < close;
  if (!inside) return "closed";
  if (
    today.break &&
    t >= minutes(today.break.start) &&
    t < minutes(today.break.end)
  ) {
    return "break";
  }
  return "open";
}

const STATUS_LABEL: Record<OpenStatus, string> = {
  open: "영업 중",
  break: "브레이크타임",
  closed: "영업 종료",
  off: "휴무",
};

export function BusinessHours({
  hours,
  now = new Date(),
}: {
  hours: Hours;
  now?: Date;
}) {
  const [open, setOpen] = useState(false);
  const todayName = DAYS[now.getDay()];
  const todayIdx = hours.week.findIndex((d) => d.day === todayName);
  if (todayIdx < 0) return null;
  const today = hours.week[todayIdx];
  const status = openStatus(today, now);
  // 오늘부터 한 주를 돌려서 보여 준다
  const ordered = [
    ...hours.week.slice(todayIdx),
    ...hours.week.slice(0, todayIdx),
  ];

  return (
    <div className="wl__hours">
      <div className="wl__hours-row">
        <span className="wl__hours-ico">
          <Icon name="clock" size={18} />
        </span>
        <span className={`wl__hours-status wl__hours-status--${status}`}>
          {STATUS_LABEL[status]}
        </span>
        <button
          className="wl__hours-time"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span>
            {today.closed ? "오늘 쉬어요" : `${today.open} - ${today.close}`}
          </span>
          <span className={`wl__yt-chev${open ? " is-open" : ""}`}>
            <Icon name="chevronDown" size={16} />
          </span>
        </button>
        {status === "open" && today.last && (
          <span className="wl__hours-last">
            <span className="wl__hours-lastchip">LAST</span>
            {today.last}
          </span>
        )}
      </div>
      {open && (
        <>
          <ul className="wl__hours-list">
            {ordered.map((d, i) => (
              <li key={d.day} className={i === 0 ? "is-today" : undefined}>
                <span>{d.day}</span>
                <span>
                  {d.closed ? (
                    "휴무"
                  ) : (
                    <>
                      {d.open} - {d.close}
                      {d.break && (
                        <small>
                          {d.break.start} - {d.break.end} 브레이크타임
                        </small>
                      )}
                    </>
                  )}
                </span>
                <span>{d.last ? `${d.last} 라스트오더` : ""}</span>
              </li>
            ))}
          </ul>
          {hours.note && <p className="wl__hours-note">{hours.note}</p>}
        </>
      )}
    </div>
  );
}
