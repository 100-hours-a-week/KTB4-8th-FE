"use client";

import { useState } from "react";
import { Sheet, useSheet } from "@/components/ui/Sheet";
import {
  EVENT_CATEGORIES,
  type CategoryOption,
  type EventFilter,
  type RegionOption,
} from "./eventFilter";

/* 이벤트 · 장소 탭의 "카테고리 · 지역" 하단 시트 — 카테고리 한 개, 지역(시·도 → 구·군)을 고르고 [적용하기]로 반영한다.
   고르는 동안은 시트 안에서만 바뀌고, 적용하기를 눌러야 목록에 반영된다. */

export interface EventFilterSheetProps {
  value: EventFilter;
  /** 고를 수 있는 카테고리(없으면 이벤트 분류 전체) */
  categories?: readonly CategoryOption[];
  /** 시트 제목(기본 "카테고리 · 지역") — 코스처럼 지역만 고르면 "지역" */
  title?: string;
  regions: RegionOption[];
  onApply: (next: {
    category: string | null;
    sido: string | null;
    gu: string | null;
  }) => void;
  onClose: () => void;
}

export function EventFilterSheet({
  value,
  categories = EVENT_CATEGORIES,
  title = "카테고리 · 지역",
  regions,
  onApply,
  onClose,
}: EventFilterSheetProps) {
  const [category, setCategory] = useState(value.category);
  const [sido, setSido] = useState(value.sido);
  const [gu, setGu] = useState(value.gu);
  const gus = regions.find((r) => r.sido === sido)?.gus ?? [];

  return (
    <Sheet
      title={title}
      compact
      onClose={onClose}
      foot={
        <FilterFoot
          onReset={() => {
            setCategory(null);
            setSido(null);
            setGu(null);
          }}
          onApply={() => onApply({ category, sido, gu })}
        />
      }
    >
      {categories.length > 0 && (
        <>
          <p className="evf__sec">카테고리</p>
          <div className="evf__opts">
            {categories.map((c) => (
              <button
                key={c.label}
                className="evf__opt"
                type="button"
                aria-pressed={category === c.label}
                onClick={() =>
                  setCategory(category === c.label ? null : c.label)
                }
              >
                {c.emoji && <span aria-hidden>{c.emoji}</span>}
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}

      {regions.length > 0 && (
        <>
          {categories.length > 0 && <p className="evf__sec">지역</p>}
          <div className="evf__opts">
            {regions.map((r) => (
              <button
                key={r.sido}
                className="evf__opt"
                type="button"
                aria-pressed={sido === r.sido}
                onClick={() => {
                  setSido(sido === r.sido ? null : r.sido);
                  setGu(null);
                }}
              >
                {r.sido}
                <small>{r.count}</small>
              </button>
            ))}
          </div>
          {gus.length > 0 && (
            <div className="evf__sub">
              {gus.map((g) => (
                <button
                  key={g.gu}
                  className="evf__opt"
                  type="button"
                  aria-pressed={gu === g.gu}
                  onClick={() => setGu(gu === g.gu ? null : g.gu)}
                >
                  {g.gu}
                  <small>{g.count}</small>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}

/** 시트 하단 버튼 — 적용하면 시트를 닫는다(닫힘 동작은 Sheet 가 맡는다) */
function FilterFoot({
  onReset,
  onApply,
}: {
  onReset: () => void;
  onApply: () => void;
}) {
  const { close } = useSheet();
  return (
    <div className="wl__foot evf__act">
      <button className="btn btn--ghost" type="button" onClick={onReset}>
        초기화
      </button>
      <button
        className="btn"
        type="button"
        onClick={() => {
          onApply();
          close();
        }}
      >
        적용하기
      </button>
    </div>
  );
}
