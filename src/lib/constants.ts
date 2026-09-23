import type { AvailableMinutes, Category, TimeOfDay } from "@/types/api";

export const CATEGORY_LABEL: Record<Category, string> = {
  CAFE: "카페",
  DESSERT: "디저트",
  RESTAURANT: "맛집",
  BAR: "술집",
  POPUP: "팝업",
  SELECTSHOP: "편집샵",
  EXHIBITION: "전시",
  PERFORMANCE: "공연",
  WALK: "산책",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  CAFE: "☕",
  DESSERT: "🍰",
  RESTAURANT: "🍜",
  BAR: "🍻",
  POPUP: "🛍️",
  SELECTSHOP: "🧦",
  EXHIBITION: "🖼️",
  PERFORMANCE: "🎭",
  WALK: "🌿",
};

/** 온보딩 · 조건 편집에서 고르는 순서 */
export const CATEGORY_ORDER: Category[] = [
  "CAFE",
  "DESSERT",
  "RESTAURANT",
  "BAR",
  "POPUP",
  "SELECTSHOP",
  "EXHIBITION",
  "PERFORMANCE",
  "WALK",
];

export const TIME_OF_DAY_LABEL: Record<TimeOfDay, string> = {
  MORNING: "오전",
  AFTERNOON: "오후",
  EVENING: "저녁",
};

/** AI 명세: available_time 은 분 단위 3택 */
export const AVAILABLE_OPTIONS: {
  value: AvailableMinutes;
  label: string;
  desc: string;
}[] = [
  { value: 180, label: "3시간", desc: "가볍게 두 곳 정도" },
  { value: 360, label: "6시간", desc: "반나절 코스" },
  { value: 540, label: "9시간", desc: "하루 종일" },
];

/** 이름 · 지역명 입력 제한 (기능정의서) */
export const MAX_NICKNAME = 10;
export const MAX_REGION = 30;

/** 지역명 허용 문자 — 한글 · 영문 · 숫자 · 공백 (특수문자 금지) */
export const REGION_DISALLOWED = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9 ]/g;

/** 닉네임 허용 문자 — 띄어쓰기와 특수기호 금지 */
export const NICKNAME_DISALLOWED = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/g;

export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
