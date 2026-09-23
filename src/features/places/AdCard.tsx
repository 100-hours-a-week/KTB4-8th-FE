"use client";

import { Icon } from "@/components/ui/Icon";
import { Thumb } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { fmtDday, fmtPeriod } from "@/lib/format";
import { useEvent } from "./queries";
import type { Advertisement } from "@/types/api";

/* 지금 열린 이벤트 배너 — 프로토타입 js/components/cards.js 의 ad() 를 그대로 옮겼다.
   ad.guideId 가 실제 이벤트를 가리키면 탭해서 이벤트 상세를 열고, 아니면(장소를 가리키거나
   대상이 사라졌으면) 준비 중 안내만 띄운다 — endpoints.js 의 KG.db.byId(events, guideId) 조회와 동일. */

export interface AdCardProps {
  ad: Advertisement;
  onOpenEvent: (eventId: string) => void;
}

export function AdCard({ ad, onOpenEvent }: AdCardProps) {
  const event = useEvent(ad.guideId);
  const e = event.data;

  const period = e
    ? fmtPeriod(e.startAt, e.endAt)
    : fmtPeriod(ad.startAt, ad.endAt);
  const dday = e ? fmtDday(e.endAt) : fmtDday(ad.endAt);

  function handleClick() {
    if (e) onOpenEvent(e.id);
    else toast.info("준비 중인 기능입니다.");
  }

  return (
    <button
      className="card card--tap adcard press"
      type="button"
      onClick={handleClick}
    >
      <Thumb category={e?.category ?? "POPUP"} />
      <div className="adcard__body">
        <div className="adcard__head">
          <span className="adcard__title">{ad.title}</span>
          <span className="chip chip--tag">광고</span>
        </div>
        <p className="adcard__desc">{ad.summary}</p>
        <p className="adcard__period">
          <Icon name="clock" size={13} />
          <span>
            {period}
            {dday ? ` · ${dday}` : ""}
          </span>
        </p>
      </div>
    </button>
  );
}
