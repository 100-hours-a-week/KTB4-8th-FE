"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
} from "@/lib/constants";
import { useCourseStore } from "./courseStore";
import type { Category } from "@/types/api";

/* 카테고리 다중 선택 바텀시트 — 프로토타입의 sheetCategory() 를 옮겼다.
   프로토타입은 CAFE/POPUP/EXHIBITION/RESTAURANT/ETC 5개만 보여줬지만, v1 의 Category 타입에는
   ETC 가 없고 대신 9개 카테고리가 모두 정의돼 있어 CATEGORY_ORDER 전체를 보여준다. */

interface CategorySheetProps {
  onClose: () => void;
}

export function CategorySheet({ onClose }: CategorySheetProps) {
  const slots = useCourseStore((s) => s.slots);
  const patchSlots = useCourseStore((s) => s.patchSlots);
  const [picks, setPicks] = useState<Category[]>(slots.categories);

  function toggle(c: Category) {
    setPicks((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function handleSave() {
    patchSlots({ categories: picks });
    onClose();
  }

  return (
    <Sheet
      title="카테고리"
      sub="복수 선택 가능 · 선택 안 하면 전체 카테고리 대상"
      back
      onClose={onClose}
      foot={
        <button className="btn btn--block" type="button" onClick={handleSave}>
          저장
        </button>
      }
    >
      <div
        className="pickgrid"
        style={{ gridTemplateColumns: "repeat(2, 1fr)", marginTop: 4 }}
      >
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            className="chip"
            type="button"
            aria-pressed={picks.includes(c)}
            style={{ justifyContent: "center", minHeight: 48 }}
            onClick={() => toggle(c)}
          >
            {CATEGORY_EMOJI[c]} {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <p className="field__help" style={{ marginTop: 14 }}>
        선택한 항목은 채팅 표시 · 재검색 시 유지됩니다.
        <br />
        카드 표기는 3개 초과 시 “카페 외 2개”로 축약됩니다.
      </p>
    </Sheet>
  );
}
