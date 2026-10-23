"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { HOME_DUMMY_PLACES } from "@/features/home/dummyPlaces";
import { splitRegion } from "@/features/wishlist/eventFilter";
import { splitCategories } from "@/features/wishlist/format";
import { WishlistDetailSheet } from "@/features/wishlist/WishlistDetailSheet";

/* 더보기 — 요즘 뜨는 곳 전체 목록(FE 더미, 홈 카드와 같은 순서). 행을 탭하면 이 시트 위에 장소 상세를 쌓고,
   상세를 닫으면 이 목록으로 돌아온다. */

export interface PlaceListSheetProps {
  title?: string;
  sub?: string;
  onClose: () => void;
}

export function PlaceListSheet({
  title = "요즘 뜨는 곳",
  sub = "이번 주 저장이 많았던 장소",
  onClose,
}: PlaceListSheetProps) {
  const [detailId, setDetailId] = useState<string | null>(null);

  return (
    <>
      <Sheet title={title} sub={sub} compact tall expandable onClose={onClose}>
        <div className="stagger">
          {HOME_DUMMY_PLACES.map((p, i) => {
            const { sido, gu } = splitRegion(p.address_sg);
            return (
              <button
                key={p.id}
                className="plist__row press"
                type="button"
                onClick={() => setDetailId(p.id)}
              >
                <span className="plist__rank">{i + 1}</span>
                <span className="plist__body">
                  <span className="plist__name">{p.name}</span>
                  <span className="plist__meta">
                    {splitCategories(p.category).join(" · ")} ·{" "}
                    {[sido, gu].filter(Boolean).join(" ")}
                  </span>
                </span>
                <span style={{ color: "var(--ink-4)" }}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
            );
          })}
        </div>
      </Sheet>

      {detailId && (
        <WishlistDetailSheet
          kind="place"
          id={detailId}
          preset={HOME_DUMMY_PLACES.find((p) => p.id === detailId)}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}
