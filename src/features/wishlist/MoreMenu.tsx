"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

/* 보관함 헤더 오른쪽 ⋯ 메뉴 — 내보내기 · 삭제.
   쓸 수 없는 항목은 흐리게 두고 이유를 아래에 적는다. */

export interface MoreMenuItem {
  key: string;
  label: string;
  desc: string;
  icon: IconName;
  danger?: boolean;
  /** 쓸 수 없을 때 desc 대신 보여 줄 이유 */
  disabledReason?: string;
  onSelect: () => void;
}

export function MoreMenu({ items }: { items: MoreMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="moremenu" ref={wrap}>
      <button
        className="appbar__btn"
        type="button"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="more" />
      </button>
      {open && (
        <div className="moremenu__pop" role="menu">
          {items.map((it) => (
            <button
              key={it.key}
              className={`moremenu__item${it.danger ? " is-danger" : ""}`}
              type="button"
              role="menuitem"
              disabled={!!it.disabledReason}
              onClick={() => {
                setOpen(false);
                it.onSelect();
              }}
            >
              <Icon name={it.icon} size={19} />
              <span>
                <b>{it.label}</b>
                <small>{it.disabledReason ?? it.desc}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
