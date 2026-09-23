"use client";

import { create } from "zustand";
import type {
  AvailableMinutes,
  Candidate,
  Category,
  TimeOfDay,
} from "@/types/api";

/* 코스 추천 팝업의 열림 여부와 대화 · 조건 상태.
   팝업은 라우트가 아니라 현재 화면 위에 뜨는 오버레이라서 전역 상태로 둔다
   (프로토타입과 같은 구조 — 결정 기록 참고). */

export interface Origin {
  label: string;
  latitude: number | null;
  longitude: number | null;
  current?: boolean;
}

export interface Slots {
  region: string | null;
  regionPoint?: { latitude: number | null; longitude: number | null } | null;
  date: string | null;
  timeOfDay: TimeOfDay | null;
  availableMinutes: AvailableMinutes | null;
  categories: Category[];
}

export type Phase = "idle" | "sending" | "creating" | "polling";

export interface ChatLine {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
}

export interface DoneCourse {
  course: Candidate;
  itemId: string;
}

interface CourseState {
  open: boolean;
  setOpen: (v: boolean) => void;

  lines: ChatLine[];
  phase: Phase;
  options: string[];
  origin: Origin | null;
  slots: Slots;
  runId: string | null;
  done: DoneCourse | null;

  set: (
    patch: Partial<
      Omit<CourseState, "set" | "setOpen" | "reset" | "patchSlots">
    >,
  ) => void;
  patchSlots: (patch: Partial<Slots>) => void;
  reset: () => void;
}

export const emptySlots = (): Slots => ({
  region: null,
  regionPoint: null,
  date: null,
  timeOfDay: null,
  availableMinutes: null,
  categories: [],
});

export const useCourseStore = create<CourseState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),

  lines: [],
  phase: "idle",
  options: [],
  origin: null,
  slots: emptySlots(),
  runId: null,
  done: null,

  set: (patch) => set(patch as Partial<CourseState>),
  patchSlots: (patch) => set((s) => ({ slots: { ...s.slots, ...patch } })),
  reset: () =>
    set({
      lines: [],
      phase: "idle",
      options: [],
      slots: emptySlots(),
      runId: null,
      done: null,
    }),
}));

/** 추천을 요청할 수 있는 조건이 모였는지 — 지역 · 날짜 · 시간대가 필수 */
export function isReady(slots: Slots) {
  return !!(slots.region && slots.date && slots.timeOfDay);
}
