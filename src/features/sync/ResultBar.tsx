"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { barCopy, type BarAction, type BarTone } from "./resultBarCopy";
import type { SyncBar } from "./syncStore";

/* 홈이 아닌 화면에서 불러오기가 끝났을 때 탭바 위에 남는 결과 막대.
   진행 중의 막대(.rsbar)와 같은 자리 · 같은 모양이고, 닫기(✕)를 누르거나 홈으로 가기 전까지 남는다. */

const TONE_ICON: Record<BarTone, IconName> = {
  ok: "check",
  warn: "alert",
  info: "info",
  error: "alert",
};

export function ResultBar({
  bar,
  onClose,
  onAction,
}: {
  bar: SyncBar;
  onClose: () => void;
  onAction: (kind: BarAction) => void;
}) {
  const copy = barCopy(bar);
  return (
    <div
      className={`rsbar rsbar--result rsbar--${copy.tone}`}
      role="status"
      aria-live="polite"
    >
      <div className="rsbar__row">
        <span className="rsbar__ico" aria-hidden>
          <Icon name={TONE_ICON[copy.tone]} size={14} />
        </span>
        <p className="rsbar__title">{copy.title}</p>
        <button
          type="button"
          className="rsbar__x"
          aria-label="닫기"
          onClick={onClose}
        >
          <Icon name="close" size={12} />
        </button>
      </div>
      <div className="rsbar__body">
        <p className="rsbar__msg">
          {copy.lines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </p>
        {copy.action && (
          <button
            type="button"
            className="rsbar__act"
            onClick={() => onAction(copy.action!.kind)}
          >
            {copy.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
