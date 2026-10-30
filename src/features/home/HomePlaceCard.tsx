"use client";

import { useState } from "react";
import { BwChefMark } from "@/components/ui/BwChefMark";
import { MichelinMark } from "@/components/ui/MichelinMark";
import { Icon } from "@/components/ui/Icon";
import { Thumb } from "@/components/ui/Primitives";
import { splitRegion } from "@/features/wishlist/eventFilter";
import { splitCategories, primaryCategory } from "@/features/wishlist/format";
import { resolveItemEmoji } from "@/features/wishlist/itemEmoji";
import { resolveMichelin } from "@/features/wishlist/michelin";
import type { HomeDummyPlace } from "./dummyPlaces";
import { useSavedHomeItems } from "./savedHomeItems";

/* 요즘 뜨는 곳 카드(FE 더미) — 기존 장소 카드(PlaceCard)와 같은 가로 스크롤 카드인데, 그라데이션 대신 장소 사진이 들어간다.
   사진을 못 열면 분류 색 타일 + 이모지로 바꾼다. 탭하면 장소 상세(WishlistDetailSheet 의 preset)를 열고,
   오른쪽 위 책갈피로 보관함에 담고 뺀다. */

export function HomePlaceCard({
  place,
  rank,
  onOpen,
  ariaHidden,
  grid,
}: {
  place: HomeDummyPlace;
  rank?: number;
  onOpen: (id: string) => void;
  /** 끝에서 처음으로 이어 붙이는 복제 카드 — 화면에만 보이고 접근성 트리와 탭 이동에서는 뺀다 */
  ariaHidden?: boolean;
  /** 전체보기 격자에서 쓰는 모양(칸 폭에 맞추고 사진을 4:5 로) */
  grid?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const { saved, toggle } = useSavedHomeItems();
  const isSaved = place.id in saved;
  const { sido, gu } = splitRegion(place.address_sg);
  // 미쉐린 가이드 서울 선정 여부 — 이름으로 자동 매칭(데이터에 직접 적은 값이 우선)
  const michelin = resolveMichelin(place.name, place.extra.michelin)?.michelin;
  const showImage = !!place.image_url && !imageFailed;

  const save = (
    <button
      className="placecard__save"
      type="button"
      aria-pressed={isSaved}
      aria-label="보관함에 담기"
      onClick={(e) => {
        e.stopPropagation();
        // 책갈피 모양이 바뀌어서 담김 · 해제가 보이므로 토스트는 띄우지 않는다(아이콘을 가린다)
        toggle(place.id);
      }}
    >
      <Icon name={isSaved ? "bookmarkFill" : "bookmark"} size={13} />
    </button>
  );

  return (
    <div
      className={`placecard card--tap press${grid ? " placecard--grid" : ""}`}
      role="button"
      tabIndex={ariaHidden ? -1 : 0}
      aria-hidden={ariaHidden || undefined}
      onClick={() => onOpen(place.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(place.id);
        }
      }}
    >
      {showImage ? (
        <div
          className="thumb thumb--wide placecard__photo"
          style={place.image_bg ? { background: place.image_bg } : undefined}
        >
          {/* 외부(네이버 지도) 이미지라 next/image 최적화 대상이 아니다. 못 열면 타일로 바꾼다. */}
          {place.image_fit === "contain" && !place.image_bg && (
            // 통째로 보여 줄 때 남는 양옆은 같은 사진을 흐리게 깔아 채운다
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="placecard__bg"
              src={place.image_url}
              alt=""
              aria-hidden
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={
              place.image_fit === "contain"
                ? "placecard__img--contain"
                : undefined
            }
            src={place.image_url}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            style={
              place.image_position || place.image_zoom
                ? {
                    objectPosition: place.image_position,
                    transform: place.image_zoom
                      ? `scale(${place.image_zoom})`
                      : undefined,
                  }
                : undefined
            }
            onError={() => setImageFailed(true)}
          />
          {rank != null && <span className="placecard__rank">{rank}</span>}
          {save}
        </div>
      ) : (
        <Thumb
          className="thumb--wide"
          category={primaryCategory(place.category) ?? "ETC"}
          glyph={resolveItemEmoji({
            emoji: place.extra.emoji,
            name: place.name,
            description: place.description,
          })}
        >
          {rank != null && <span className="placecard__rank">{rank}</span>}
          {save}
        </Thumb>
      )}
      <p className="placecard__name">{place.name}</p>
      <p className="placecard__meta">{[sido, gu].filter(Boolean).join(" ")}</p>
      <p className="placecard__tags">
        {splitCategories(place.category).map((c) => (
          <span key={c} className="chip chip--tag chip--brand">
            {c}
          </span>
        ))}
        {michelin && <MichelinMark michelin={michelin} size={14} />}
        {place.bw_chef && <BwChefMark size={16} />}
      </p>
    </div>
  );
}
