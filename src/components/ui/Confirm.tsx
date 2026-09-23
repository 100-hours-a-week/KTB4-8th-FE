"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { create } from "zustand";
import { useOverlayStore } from "./overlay-store";

/* 확인 팝업 — 로그아웃 확인, 대화 초기화 확인 등.
   프로토타입의 KG.ui.confirm(Promise) 과 같은 사용감을 유지한다:
     if (await confirm({ title, message, ok, danger })) { ... } */

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  cancel?: string;
  ok?: string;
  danger?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
  id: number;
  resolve: (v: boolean) => void;
}

interface ConfirmState {
  current: ConfirmRequest | null;
  ask: (o: ConfirmOptions) => Promise<boolean>;
  settle: (v: boolean) => void;
}

let seq = 1;

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  current: null,
  ask: (o) =>
    new Promise<boolean>((resolve) => {
      set({ current: { ...o, id: seq++, resolve } });
    }),
  settle: (v) => {
    const cur = get().current;
    set({ current: null });
    cur?.resolve(v);
  },
}));

export const confirm = (o: ConfirmOptions) => useConfirmStore.getState().ask(o);

export function ConfirmHost() {
  const current = useConfirmStore((s) => s.current);
  const settle = useConfirmStore((s) => s.settle);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const pushModal = useOverlayStore((s) => s.pushModal);
  const popModal = useOverlayStore((s) => s.popModal);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 포털 대상 DOM은 서버 렌더에 없어 마운트 후에만 조회 가능
    setHost(document.getElementById("overlays"));
  }, []);

  useEffect(() => {
    if (!current) return;
    pushModal();
    document.body.classList.add("kg-lock");
    return () => {
      popModal();
      const st = useOverlayStore.getState();
      if (st.sheets === 0 && st.modals === 0)
        document.body.classList.remove("kg-lock");
    };
  }, [current, pushModal, popModal]);

  const onCancel = useCallback(() => settle(false), [settle]);

  if (!host || !current) return null;

  return createPortal(
    <div
      className="scrim"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal">
        <p className="modal__title">{current.title}</p>
        {current.message && <p className="modal__msg">{current.message}</p>}
        <div className="modal__actions">
          <button className="btn btn--ghost" type="button" onClick={onCancel}>
            {current.cancel || "취소"}
          </button>
          <button
            className={`btn${current.danger ? " btn--danger" : ""}`}
            type="button"
            autoFocus
            onClick={() => settle(true)}
          >
            {current.ok || "확인"}
          </button>
        </div>
      </div>
    </div>,
    host,
  );
}
