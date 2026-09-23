"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { AVAILABLE_OPTIONS } from "@/lib/constants";
import { useCourseStore } from "./courseStore";
import type { AvailableMinutes } from "@/types/api";

/* 외출 가능 시간 바텀시트 — AI 명세의 available_time 은 180 · 360 · 540분 3택뿐이다.
   프로토타입의 sheetAvailable() 을 그대로 옮겼다. */

interface AvailableSheetProps {
  onClose: () => void;
}

export function AvailableSheet({ onClose }: AvailableSheetProps) {
  const slots = useCourseStore((s) => s.slots);
  const patchSlots = useCourseStore((s) => s.patchSlots);
  const [value, setValue] = useState<AvailableMinutes | null>(
    slots.availableMinutes,
  );

  function handleSave() {
    patchSlots({ availableMinutes: value });
    onClose();
  }

  return (
    <Sheet
      title="외출 가능 시간"
      back
      onClose={onClose}
      foot={
        <button className="btn btn--block" type="button" onClick={handleSave}>
          저장
        </button>
      }
    >
      {AVAILABLE_OPTIONS.map((o) => (
        <button
          key={o.value}
          className="optrow"
          type="button"
          aria-pressed={value === o.value}
          onClick={() => setValue((v) => (v === o.value ? null : o.value))}
        >
          {o.value === 540 ? "9시간 이상" : o.label}
          <span className="optrow__mark">
            <Icon name="check" size={18} />
          </span>
        </button>
      ))}
      <p className="field__help">
        단일 선택 · 선택 해제 시 “미입력”으로 복귀
        <br />
        AI 명세의 available_time 은 180 · 360 · 540분 중 하나예요.
      </p>
    </Sheet>
  );
}
