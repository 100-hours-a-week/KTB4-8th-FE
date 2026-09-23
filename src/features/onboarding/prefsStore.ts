"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "@/types/api";

/* 온보딩에서 고른 관심 카테고리.
   사용자별로 저장하는 API가 명세에 없어(백엔드 확인 요청), 프로토타입처럼 이 브라우저에만 남겨 둔다. */

interface PrefsState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      categories: [],
      setCategories: (categories) => set({ categories }),
    }),
    { name: "keepgo.prefs.v1" },
  ),
);
