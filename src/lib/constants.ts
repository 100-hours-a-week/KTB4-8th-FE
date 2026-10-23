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
  FESTIVAL: "축제",
  SPORTS: "레저·스포츠",
  WALK: "산책",
  SPOT: "명소",
  ETC: "기타",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  CAFE: "☕",
  DESSERT: "🍰",
  RESTAURANT: "🍽️",
  BAR: "🍷",
  POPUP: "🎟️",
  SELECTSHOP: "🛍️",
  EXHIBITION: "🖼️",
  PERFORMANCE: "🎤",
  FESTIVAL: "🎉",
  SPORTS: "🏟️",
  WALK: "🌿",
  SPOT: "📍",
  ETC: "✨",
};

/** 코스 추천 조건 · 보관함 필터에서 고르는 순서 */
export const CATEGORY_ORDER: Category[] = [
  "CAFE",
  "DESSERT",
  "RESTAURANT",
  "BAR",
  "POPUP",
  "SELECTSHOP",
  "EXHIBITION",
  "PERFORMANCE",
  "FESTIVAL",
  "SPORTS",
  "WALK",
  "SPOT",
  "ETC",
];

/** 온보딩에서 고르는 관심 카테고리 — 기타는 관심사로 고를 대상이 아니라 뺀다 */
export const ONBOARDING_CATEGORIES: Category[] = CATEGORY_ORDER.filter(
  (c) => c !== "ETC",
);

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

/** 코스 추천 챗봇 메시지 길이 제한 — BE 저장 컬럼이 VARCHAR(255) 라 넘으면 500 이 난다 */
export const MAX_CHAT_MESSAGE = 255;
/** 이 글자 수부터 입력창 아래에 현재 글자 수를 보여준다 */
export const CHAT_COUNT_SHOW_AT = 200;

/** 지역명 허용 문자 — 한글 · 영문 · 숫자 · 공백 (특수문자 금지) */
export const REGION_DISALLOWED = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9 ]/g;

/** 닉네임 허용 문자 — 띄어쓰기와 특수기호 금지 */
export const NICKNAME_DISALLOWED = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/g;

/** BE 에 아직 없는 기능(보관함 · 좋아요 동기화)을 브라우저 저장소 더미로 채운다.
    BE 가 준비돼 그 API 를 직접 쓰려면 NEXT_PUBLIC_LOCAL_DUMMY=off 로 끈다. */
export const LOCAL_DUMMY = process.env.NEXT_PUBLIC_LOCAL_DUMMY !== "off";

/** 보관함의 장소 · 이벤트 · 코스를 BE v2(/api/v2/member/outing-wishlist) 실제 데이터로 보여준다.
    코스를 담는 것도 이때는 추천 결과의 코스 ID 로 BE 에 보낸다. 꺼져 있으면 브라우저 더미(LOCAL_DUMMY)를 쓴다. */
export const WISHLIST_V2 = process.env.NEXT_PUBLIC_WISHLIST_V2 === "on";

/** 좋아요 영상 분석 진행률(몇 개 중 몇 개 · 남은 시간)을 가짜로 보여 준다. BE 에 진행률 조회 API 가 없어서다.
    API 가 생기면 off 로 끄고 실제 값을 쓴다. */
export const SYNC_PROGRESS_DUMMY =
  process.env.NEXT_PUBLIC_SYNC_PROGRESS_DUMMY !== "off";

/** 챗봇 채팅 전송을 BE v2(POST /api/v2/member/chat-messages, SSE)로 보낸다. 꺼져 있으면 v1(202 + 폴링).
    BE 에 v2 채팅이 배포돼 있을 때만 on 으로 켠다. */
export const CHAT_V2 = process.env.NEXT_PUBLIC_CHAT_V2 === "on";
