"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Thumb } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { splitRegion } from "@/features/wishlist/eventFilter";
import { splitCategories, primaryCategory } from "@/features/wishlist/format";
import { resolveItemEmoji } from "@/features/wishlist/itemEmoji";
import type { HomeDummyPlace } from "./dummyPlaces";
import { useSavedHomeItems } from "./savedHomeItems";

/* 요즘 뜨는 곳 카드(FE 더미) — 기존 장소 카드(PlaceCard)와 같은 가로 스크롤 카드인데, 그라데이션 대신 장소 사진이 들어간다.
   사진을 못 열면 분류 색 타일 + 이모지로 바꾼다. 탭하면 장소 상세(WishlistDetailSheet 의 preset)를 열고,
   오른쪽 위 책갈피로 보관함에 담고 뺀다. */

export function HomePlaceCard({
  place,
  rank,
  onOpen,
}: {
  place: HomeDummyPlace;
  rank?: number;
  onOpen: (id: string) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const { saved, toggle } = useSavedHomeItems();
  const isSaved = place.id in saved;
  const { sido, gu } = splitRegion(place.address_sg);
  const showImage = !!place.image_url && !imageFailed;

  const save = (
    <button
      className="placecard__save"
      type="button"
      aria-pressed={isSaved}
      aria-label="보관함에 담기"
      onClick={(e) => {
        e.stopPropagation();
        if (toggle(place.id)) toast.ok("보관함에 담았어요.", "저장 완료");
        else toast.info("보관함에서 삭제했어요.");
      }}
    >
      <Icon name={isSaved ? "bookmarkFill" : "bookmark"} size={15} />
    </button>
  );

  return (
    <div
      className="placecard card--tap press"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(place.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(place.id);
        }
      }}
    >
      {showImage ? (
        <div className="thumb thumb--wide placecard__photo">
          {/* 외부(네이버 지도) 이미지라 next/image 최적화 대상이 아니다. 못 열면 타일로 바꾼다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={place.image_url}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            style={
              place.image_position
                ? { objectPosition: place.image_position }
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
      </p>
    </div>
  );
}
