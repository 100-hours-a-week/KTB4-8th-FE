"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Primitives";
import type { AllState, SelectMode } from "./useCollectionSelection";

/* 보관함 선택 모드의 화면 조각 — 위쪽 헤더, 전체 선택 줄, 아래쪽 실행 버튼. */

const MODE_TITLE: Record<SelectMode, string> = {
  delete: "삭제",
};

/** 선택 모드의 위쪽 헤더 — 왼쪽 [취소], 가운데에 지금 하는 일(삭제) */
export function SelectionHeader({
  mode,
  onCancel,
}: {
  mode: SelectMode;
  onCancel: () => void;
}) {
  return (
    <header className="appbar selhead">
      <button className="selhead__cancel" type="button" onClick={onCancel}>
        취소
      </button>
      <h1 className="appbar__title">{MODE_TITLE[mode]}</h1>
      <span aria-hidden />
    </header>
  );
}

/** 필터 줄 — 왼쪽에 전체 선택 체크박스와 "N개 선택", 오른쪽에 필터 버튼(children) */
export function SelectAllRow({
  state,
  count,
  loading,
  danger,
  onToggle,
  children,
}: {
  state: AllState;
  count: number;
  /** 뒤쪽 페이지를 불러오는 중 */
  loading: boolean;
  danger?: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="selrow">
      <button
        className="selrow__all"
        type="button"
        role="checkbox"
        aria-checked={
          state === "all" ? true : state === "part" ? "mixed" : false
        }
        aria-label="목록 전체 선택"
        disabled={loading}
        onClick={onToggle}
      >
        <SelectBox state={state} danger={danger} />
        <span className="selrow__count" aria-live="polite">
          {loading ? "불러오는 중…" : `${count}개 선택`}
        </span>
        {loading && <Spinner />}
      </button>
      {children}
    </div>
  );
}

/** 선택 원 — 비어 있음 · 일부(―) · 전부(✓) */
export function SelectBox({
  state,
  danger,
}: {
  state: AllState | "on" | "off";
  danger?: boolean;
}) {
  const checked = state === "all" || state === "on";
  const mixed = state === "part";
  return (
    <span
      className={`selbox${checked ? " is-on" : ""}${mixed ? " is-mixed" : ""}${danger ? " is-danger" : ""}`}
      aria-hidden
    >
      {checked && <Icon name="check" size={13} strokeWidth={2.8} />}
      {mixed && <i />}
    </span>
  );
}

/** 탭바 자리를 덮는 아래쪽 실행 버튼 */
export function SelectionActionBar({
  label,
  disabled,
  danger,
  busy,
  onRun,
}: {
  label: string;
  disabled: boolean;
  danger?: boolean;
  busy?: boolean;
  onRun: () => void;
}) {
  return (
    <div className="selact">
      <button
        className={`btn btn--block${danger ? " btn--danger" : ""}`}
        type="button"
        disabled={disabled || busy}
        onClick={onRun}
      >
        {busy ? "처리하는 중…" : label}
      </button>
    </div>
  );
}
