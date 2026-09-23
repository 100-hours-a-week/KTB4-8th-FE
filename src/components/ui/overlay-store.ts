"use client";

import { create } from "zustand";

/* 오버레이(시트 · 모달) 개수를 세어 body 스크롤 락과 토스트 위치를 맞춘다.
   프로토타입의 KG.ui.sheet.anyOpen() / kg-lock 을 대신한다. */
interface OverlayState {
  sheets: number;
  modals: number;
  pushSheet: () => void;
  popSheet: () => void;
  pushModal: () => void;
  popModal: () => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  sheets: 0,
  modals: 0,
  pushSheet: () => set((s) => ({ sheets: s.sheets + 1 })),
  popSheet: () => set((s) => ({ sheets: Math.max(0, s.sheets - 1) })),
  pushModal: () => set((s) => ({ modals: s.modals + 1 })),
  popModal: () => set((s) => ({ modals: Math.max(0, s.modals - 1) })),
}));

export const anySheetOpen = () => useOverlayStore.getState().sheets > 0;
