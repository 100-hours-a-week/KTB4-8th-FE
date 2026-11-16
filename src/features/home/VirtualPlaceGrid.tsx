"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import type { HomeDummyPlace } from "./dummyPlaces";
import { HomePlaceCard } from "./HomePlaceCard";

/* 요즘 뜨는 곳 전체보기 격자 — 화면에 보이는 줄(과 위아래 몇 줄)만 그린다.
   이 화면은 자체 스크롤 영역이 없고 문서(window) 스크롤이라 window 기준 가상화를 쓴다.
   카드는 2열이라 두 장씩 한 줄로 묶어 줄 단위로 가상화한다. 카드 높이는 제목 줄바꿈 · 태그 수로 달라서
   줄마다 실제 높이를 재고(measureElement), 재기 전에는 어림값을 쓴다. */

const COLUMNS = 2;
/** 재기 전의 줄 높이(카드 + 아래 간격) — 틀려도 그린 뒤 실제 높이로 바로잡힌다 */
const ESTIMATE_ROW_HEIGHT = 235;
/** 화면 밖 미리 렌더링 줄 수 — 스크롤 시 이미지가 미리 다운로드되도록 8줄(16장)로 여유 있게 설정 */
const OVERSCAN_ROWS = 8;

export interface PlaceGridItem {
  place: HomeDummyPlace;
  /** 홈의 원래 순서(필터로 걸러도 그대로) */
  rank: number;
}

export function VirtualPlaceGrid({
  items,
  onOpen,
}: {
  items: PlaceGridItem[];
  onOpen: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  // 문서 맨 위에서 목록 시작까지의 거리 — 위쪽 앱바 · 필터 줄만큼 줄 위치를 보정한다
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () =>
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: Math.ceil(items.length / COLUMNS),
    estimateSize: () => ESTIMATE_ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
    scrollMargin,
  });

  return (
    <div
      ref={listRef}
      style={{
        position: "relative",
        width: "100%",
        height: virtualizer.getTotalSize(),
      }}
    >
      {virtualizer.getVirtualItems().map((row) => (
        <div
          key={row.key}
          ref={virtualizer.measureElement}
          data-index={row.index}
          className="evgrid"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${row.start - scrollMargin}px)`,
            // 줄 사이 세로 간격 — 한 줄짜리 격자라 .evgrid 의 row-gap 이 없다
            paddingBottom: "var(--s-4)",
          }}
        >
          {items
            .slice(row.index * COLUMNS, row.index * COLUMNS + COLUMNS)
            .map(({ place, rank }) => (
              <HomePlaceCard
                key={place.id}
                place={place}
                rank={rank}
                onOpen={onOpen}
                grid
              />
            ))}
        </div>
      ))}
    </div>
  );
}
