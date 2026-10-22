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
  /** 채팅으로 정해진 정확한 시각 "HH:mm" — 있으면 BE 에 시간대 대표 시각 대신 이 시각을 보낸다. 시간대를 직접 고르면 지워진다 */
  time?: string | null;
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

/** 예전에 현재 위치를 못 찾을 때 임시로 깔아 두던 기본 출발지(강남구 테헤란로). 지금은 쓰지 않는다 —
    출발지가 정해지지 않았는데 정해진 것처럼 보이면 안 돼서, 위치를 못 찾으면 "미지정"으로 둔다.
    이미 브라우저(세션)에 저장돼 있을 수 있어서, 같은 값이면 미지정으로 되돌리는 데만 쓴다. */
export const isLegacyDefaultOrigin = (o: Origin | null): boolean =>
  !!o &&
  !o.current &&
  o.label === "강남구 테헤란로" &&
  o.latitude === 37.5 &&
  o.longitude === 127.0364;

export const emptySlots = (): Slots => ({
  region: null,
  regionPoint: null,
  regionAddress: null,
  date: null,
  timeOfDay: null,
  time: null,
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

/** 추천을 요청할 수 있는 조건이 모였는지 — 지역 · 날짜 · 시간대가 필수이고, 출발지(좌표)도 정해져 있어야 한다 */
export function isReady(slots: Slots, origin?: Origin | null) {
  return !!(slots.region && slots.date && slots.timeOfDay && origin);
}

/** 아직 못 채운 필수 조건 이름들 — 추천 버튼이 꺼져 있는 이유를 알려 줄 때 쓴다 */
export function missingRequired(slots: Slots, origin?: Origin | null) {
  const missing: string[] = [];
  if (!slots.region) missing.push("지역");
  if (!slots.date) missing.push("날짜");
  else if (!slots.timeOfDay) missing.push("시간대");
  if (!origin) missing.push("출발지");
  return missing;
}
