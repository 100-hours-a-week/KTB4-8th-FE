"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
  /** 지역을 검색 결과에서 골랐을 때의 주소(예: "서울 마포구 양화로 188"). 대화로 채워진 지역에는 없다 */
  regionAddress?: string | null;
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
  conversationId: string | null;
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
      Omit<CourseState, "set" | "setOpen" | "reset" | "discard" | "patchSlots">
    >,
  ) => void;
  patchSlots: (patch: Partial<Slots>) => void;
  reset: () => void;
  discard: () => void;
}

function newConversationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `course-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** 현재 위치를 알 수 없을 때(권한 거부·시간 초과·한국 밖) 쓰는 기본 출발지 — 실제 현재 위치가 아니다 */
export const defaultOrigin = (): Origin => ({
  label: "강남구 테헤란로",
  latitude: 37.5,
  longitude: 127.0364,
  current: false,
});

export const emptySlots = (): Slots => ({
  region: null,
  regionPoint: null,
  regionAddress: null,
  date: null,
  timeOfDay: null,
  availableMinutes: null,
  categories: [],
});

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      conversationId: null,
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
          conversationId: newConversationId(),
          lines: [],
          phase: "idle",
          options: [],
          // 비워 두면 팝업이 열려 있는 동안 CoursePopup 이 현재 위치를 다시 찾아 채운다
          origin: null,
          slots: emptySlots(),
          runId: null,
          done: null,
        }),
      discard: () =>
        set({
          conversationId: null,
          open: false,
          lines: [],
          phase: "idle",
          options: [],
          origin: null,
          slots: emptySlots(),
          runId: null,
          done: null,
        }),
    }),
    {
      name: "keepgo.course-conversation.v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        conversationId: state.conversationId,
        lines: state.lines,
        options: state.options,
        origin: state.origin,
        slots: state.slots,
        done: state.done,
      }),
    },
  ),
);

/** 추천을 요청할 수 있는 조건이 모였는지 — 지역 · 날짜 · 시간대가 필수 */
export function isReady(slots: Slots) {
  return !!(slots.region && slots.date && slots.timeOfDay);
}
