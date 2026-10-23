"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getEventStatusBadge } from "@/lib/format";
import { daysUntilStart, describePeriod } from "@/features/wishlist/format";
import { splitRegion } from "@/features/wishlist/eventFilter";
import { resolveItemEmoji } from "@/features/wishlist/itemEmoji";
import type { HomeDummyEvent } from "./dummyEvents";
import { useSavedHomeItems } from "./savedHomeItems";

/* 홈 이벤트 카드(FE 더미) — 대표 이미지가 위에 크게 오는 두 줄 격자 카드. 요약 설명은 목록에 보여 주지 않는다.
   이미지가 없거나 불러오지 못하면 이모지 타일로 대신한다. 탭하면 이벤트 상세(WishlistDetailSheet 의 preset)를 열고,
   이미지 오른쪽 위 책갈피로 요즘 뜨는 곳 카드처럼 보관함에 담고 뺀다. */

/** "2026-10-24" → 그날 0시(로컬)의 ISO 문자열. 날짜 계산 함수들이 ISO 를 받는다 */
const toIso = (day: string) => new Date(`${day}T00:00:00`).toISOString();

export function HomeEventCard({
  event,
  onOpen,
}: {
  event: HomeDummyEvent;
  onOpen: (id: string) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const { saved, toggle } = useSavedHomeItems();
  const isSaved = event.id in saved;
  const glyph = resolveItemEmoji({
    emoji: event.extra.emoji,
    name: event.name,
    description: event.description,
  });
  const period = describePeriod(event.start_date, event.end_date);
  // 아직 열리기 전이면 "OPEN D-N", 열린 뒤에는 마감까지의 D-N · 오늘 마감
  const opensIn = daysUntilStart(event.start_date);
  const status =
    opensIn !== null
      ? { label: `OPEN D-${opensIn}`, tone: "upcoming" as const }
      : getEventStatusBadge(toIso(event.start_date), toIso(event.end_date));
  const gu = splitRegion(event.address_sg).gu;
  const showImage = !!event.image_url && !imageFailed;
  return (
    <div
      className="evcard press"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(event.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(event.id);
        }
      }}
    >
      <span className="evcard__img">
        {showImage ? (
          <>
            {/* 포스터마다 비율이 달라서, 사진을 자르지 않고 통째로 보여 준다. 남는 자리는 같은 사진을 흐리게 깔아 채운다.
                외부(공식 페이지 · 네이버) 이미지라 next/image 최적화 대상이 아니고, 못 열면 이모지 타일로 바꾼다. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="evcard__bg"
              src={event.image_url}
              alt=""
              aria-hidden
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="evcard__photo"
              src={event.image_url}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
            />
          </>
        ) : (
          <span className="evcard__glyph" aria-hidden>
            {glyph ?? "🎫"}
          </span>
        )}
        <button
          className="placecard__save"
          type="button"
          aria-pressed={isSaved}
          aria-label="보관함에 담기"
          onClick={(e) => {
            e.stopPropagation();
            // 책갈피 모양이 바뀌어서 담김 · 해제가 보이므로 토스트는 띄우지 않는다(아이콘을 가린다)
            toggle(event.id);
          }}
        >
          <Icon name={isSaved ? "bookmarkFill" : "bookmark"} size={15} />
        </button>
        {status && (
          <span className={`evcard__badge event-status--${status.tone}`}>
            {status.label}
          </span>
        )}
      </span>
      <span className="evcard__title">{event.name}</span>
      {period && (
        <span className="evcard__date">
          <Icon name="clock" size={12} />
          {period.text}
        </span>
      )}
      <span className="evcard__tags">
        {gu && <span className="chip chip--tag">{gu}</span>}
        <span className="chip chip--tag">{event.category}</span>
      </span>
    </div>
  );
}
