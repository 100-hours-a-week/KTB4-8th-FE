/* BE v2 보관함(/api/v2/member/outing-wishlist) 응답 — FE-BE (v2) 명세와 BE develop 의 응답 DTO 기준.
   BE 전체가 SNAKE_CASE 라 필드 이름도 그대로 받는다. */

export interface WishlistPlaceSummary {
  place_id: number;
  name: string;
  /** "카페" 또는 "카페,디저트"처럼 오는 분류 문자열 */
  category: string;
  description: string | null;
  /** 시·군·구까지의 주소(예: "서울 성동구") */
  address_sg: string;
  extra?: WishlistExtra | null;
}

export interface WishlistPlaceList {
  next_cursor: string | null;
  places: WishlistPlaceSummary[];
}

export interface WishlistPlaceDetail {
  place_id: number;
  name: string;
  category: string;
  description: string | null;
  address_sg: string;
  address_road: string | null;
  coordinate: { lat: number; lng: number } | null;
  /** 이 장소가 나온 유튜브 영상 링크. 제목·채널 같은 영상 정보는 BE 가 아직 내려주지 않는다. */
  videos_featured_link: string[] | null;
  /** yyyy-MM-dd */
  save_date: string | null;
  /** 네이버 지도 장소 ID. BE 가 아직 내려주지 않으면 없다. */
  naver_place_id?: string | null;
  extra?: WishlistExtra | null;
}

export interface WishlistEventSummary {
  event_id: number;
  name: string;
  category: string;
  description: string | null;
  /** yyyy-MM-dd */
  start_date: string | null;
  end_date: string | null;
  /** place.name 은 지금 BE 가 null 로 내려준다 */
  place: { name: string | null; address_sg: string } | null;
  extra?: WishlistExtra | null;
}

export interface WishlistEventList {
  next_cursor: string | null;
  events: WishlistEventSummary[];
}

export interface WishlistEventDetail {
  event_id: number;
  name: string;
  category: string;
  description: string | null;
  videos_featured_link: string[] | null;
  save_date: string | null;
  start_date: string | null;
  end_date: string | null;
  place: {
    name: string | null;
    address_sg: string;
    address_road: string | null;
    coordinate: { lat: number; lng: number } | null;
  } | null;
  naver_place_id?: string | null;
  extra?: WishlistExtra | null;
}

/* ── 표시용 추가 값(extra) ─────────────────────────────────
   공식 링크 · 일정표 · 이모지 · 지도 검색어는 BE 명세에 아직 없다. 로컬 BE 가 응답에 `extra` 로 실어 주면 그대로 쓰고,
   실제(개발) 서버는 보내지 않으므로 모두 없는 것으로 보고 해당 구역을 그리지 않는다. */
/** 방탈출 카페 같은 곳의 테마 하나 — 펼치면 소개 · 포스터 · 시간표가 나온다 */
export interface ExtraTheme {
  name: string;
  /** 줄거리 · 소개 */
  description: string;
  /** "스릴러" · "협동" … */
  genre: string;
  /** 플레이 시간(분) */
  minutes: number;
  /** 공포도 · 난이도(0~5) */
  fear: number;
  difficulty: number;
  /** 포스터 주소 */
  image: string;
  /** 예약 시간(= 사전 콘텐츠 시작 시간) "10:00". 테마 시작은 +10분, 종료는 시작 + minutes 로 계산한다 */
  times: string[];
}

/** 미쉐린 가이드 선정 — 스타 1~3개 또는 빕 구르망("bib"). 카테고리 배지 오른쪽에 아이콘으로 보여 준다 */
export type Michelin = 1 | 2 | 3 | "bib";

export interface WishlistExtra {
  /** 미쉐린 가이드(서울) 선정 여부 */
  michelin?: Michelin;
  /** 보관함 목록 아이콘에 올릴, 이 항목의 특성에 맞춘 이모지 */
  emoji?: string;
  /** 공식 홈페이지 · 인스타그램 링크 — 있는 것만 "공식 링크" 구역에 칩으로 보여 준다 */
  links?: ExtraLink[];
  /** 도로명 주소 뒤에 붙는 건물 · 층 · 상호 — "…한강대로23길 55 용산 아이파크몰 4층 더팝업" 처럼 이어서 보여 준다 */
  address_detail?: string;
  /** BE 가 준 도로명 주소 대신 쓸 값(빈 문자열이면 주소를 펼치는 화살표를 숨긴다) */
  address_road?: string;
  /** 지도에서 보기를 장소 ID 없이 검색으로 열 때 쓰는 검색어(이벤트명보다 장소명이 정확할 때) */
  map_query?: string;
  /** 대회 · 축제처럼 일정이 여러 개인 이벤트의 일정표(공연 라인업, 매주 프로그램 등) */
  schedule?: { title: string; rows: ExtraScheduleRow[] };
  /** 예약 · 예매 페이지 — 있으면 공식 링크 위에 "예약하기" 줄을 보여 준다(https 주소만 연결) */
  booking_url?: string;
  /** 방탈출 테마 목록 — 테마마다 펼침 줄로 보여 준다 */
  themes?: { title: string; items: ExtraTheme[] };
  /** 요일별 영업시간 — 장소 상세의 "영업 중 · 11:00 - 22:00" 줄 */
  hours?: BusinessHours;
  /** 행사장 안내도 같은 안내 이미지 — 제목 아래에 크게 보여 주고, 누르면 원본을 연다 */
  images?: ExtraImage[];
}

export interface BusinessHoursDay {
  day: "월" | "화" | "수" | "목" | "금" | "토" | "일";
  /** "11:00" */
  open: string;
  /** "22:00" */
  close: string;
  /** 라스트오더 "21:30" */
  last?: string;
  /** 브레이크타임 — 이 시간에는 영업하지 않는다 */
  break?: { start: string; end: string };
  /** 쉬는 날 */
  closed?: boolean;
}

export interface BusinessHours {
  week: BusinessHoursDay[];
  /** 요일 표 아래에 덧붙이는 안내 — 예: "점심 라스트오더 14:30" */
  note?: string;
}

export interface ExtraImage {
  title: string;
  /** 이미지 주소 — 앱 안의 /events/… 파일이거나 https 주소 */
  src: string;
}

export interface ExtraLink {
  type: "official" | "instagram" | "blog";
  url: string;
}

export interface ExtraScheduleRow {
  /** 왼쪽 알약에 보이는 짧은 글자 — "R7·8", "8주", "10.23" */
  tag: string;
  /** 굵은 글씨 — 프로그램 이름 */
  title: string;
  /** 연한 글씨 — 날짜 · 시간 · 장소 */
  meta: string;
  /** 묶음(탭) 이름 — "하반기 · 9.6 ~ 10.25". 묶음의 첫 행에만 적고 다음 묶음이 나올 때까지 이어진다 */
  group?: string;
  /** yyyy-MM-dd — 있으면 오늘이 그 주(월~일, 날짜는 일요일)일 때 초록으로 강조한다 */
  date?: string;
  /** 날짜와 상관없이 이 이벤트에 해당하는 일정이라 늘 강조(대회 최종전 등) */
  current?: boolean;
}

/* ── 코스 (BE v2 /outing-wishlist/outing-courses) ───────────────────────── */

/** 코스 목록의 구성 요소. 장소 · 이벤트가 순서대로 온다 */
export interface WishlistCourseItem {
  /** 0부터 시작하는 순서 */
  sequence: number;
  stop_id: number;
  name: string;
  /** "place" | "event" */
  type: string;
  /** "카페" 처럼 한글 분류 */
  category: string;
  /** yyyy-MM-dd — 이벤트일 때만 */
  start_date?: string | null;
  end_date?: string | null;
}

export interface WishlistCourseSummary {
  /** 보관함에 담긴 항목의 ID — 상세 조회 · 삭제에 이 값을 쓴다(추천 코스의 ID 와 다르다) */
  course_id: number;
  name: string;
  /** 추천을 받은 지역 이름("용산역" 등) */
  address_sg: string | null;
  /** 이름은 hours 지만 BE 가 총 소요시간(분)을 담아 준다 */
  duration_hours: number | null;
  /** yyyy-MM-dd */
  save_date: string | null;
  /** 지금 BE 는 구성 요소 전체를 한 묶음(stop) 안에 담아 준다 */
  stops: { count: number; items: WishlistCourseItem[] }[];
}

export interface WishlistCourseList {
  next_cursor: string | null;
  courses: WishlistCourseSummary[];
}

export interface WishlistCourseDetailItem {
  sequence: number;
  stop_id: number;
  name: string;
  type: string;
  category: string;
  coordinate: { lat: number | null; lng: number | null } | null;
  /** 지금 이용할 수 있는지(영업 중 · 진행 중) */
  is_available: boolean | null;
}

export interface WishlistCourseDetail {
  course_id: number;
  name: string;
  duration_hours: number | null;
  stops: { count: number; items: WishlistCourseDetailItem[] }[];
}
