import type { WishlistExtra } from "@/features/wishlist/types";

/* 홈 "요즘 뜨는 곳"에 보여 주는 실제 장소 더미 — BE 없이 FE 에 들어 있다(개발 서버에도 그대로 나간다). 이 순서대로 나온다.
   지도에서 보기는 네이버 장소 ID 로 연결하고, 대표 사진은 네이버 지도의 사진 주소를 그대로 가리킨다(내려받아 저장하지 않는다).
   상세는 보관한 장소 상세(WishlistDetailSheet)를 데이터만 넣어 그대로 쓴다. 영상은 쇼츠 영상 ID 만 두고 링크는 화면에서 만든다. */

export interface HomeDummyPlace {
  id: string;
  name: string;
  /** "카페" · "카페,디저트" · "맛집" · "전시" … */
  category: string;
  description: string;
  address_sg: string;
  address_road: string;
  /** 네이버 지도 장소 ID(지도에서 보기) */
  naver_place_id: string;
  /** 목록 카드의 대표 사진 주소 */
  image_url?: string;
  /** 사진을 칸에 맞춰 자를 때 기준 위치(CSS object-position, 예: "50% 56%") — 가운데가 아닌 곳을 보여 줄 때 */
  image_position?: string;
  video_ids: string[];
  /** 이모지(사진을 못 열 때의 타일에 쓴다) */
  extra: WishlistExtra;
}

export const HOME_DUMMY_PLACES: HomeDummyPlace[] = [
  {
    id: "home-place-aroundday",
    name: "어라운드데이",
    category: "카페,디저트",
    description:
      "서울숲 근처의 디저트 카페. 휘낭시에와 토스트, 커피와 음료를 즐길 수 있어요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 서울숲2길 24-1",
    naver_place_id: "1344027015",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260805_2%2F1785904286913ccqGB_JPEG%2F9E00C63A-7F7A-41FC-9F77-7B6DF1EB41EC.jpg",
    image_position: "50% 56%",
    video_ids: [],
    extra: {
      emoji: "🥐",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "20:00" },
          { day: "화", open: "11:00", close: "20:00" },
          { day: "수", open: "11:00", close: "20:00" },
          { day: "목", open: "11:00", close: "20:00" },
          { day: "금", open: "11:00", close: "20:00" },
          { day: "토", open: "11:00", close: "20:00" },
          { day: "일", open: "11:00", close: "20:00" },
        ],
      },
    },
  },
  {
    id: "home-place-sansugapsan",
    name: "산수갑산",
    category: "맛집",
    description:
      "을지로3가역 근처의 순댓국 맛집. 순대국밥과 순대, 국밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 을지로20길 24",
    naver_place_id: "18085955",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20191105_106%2F1572946255018AFiWo_JPEG%2FfQkWDnfRjb2-6zO_8cqXyz8F.jpg",
    video_ids: [],
    extra: {
      emoji: "🍲",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "점심 라스트오더 14:30, 저녁 라스트오더 20:30 · 매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-boan",
    name: "통의동 보안여관",
    category: "전시",
    description: "경복궁 영추문 건너편에서 전시를 볼 수 있는 문화 공간이에요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 효자로 33",
    naver_place_id: "19584832",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250729_232%2F1753770878482iqXnG_JPEG%2F%25BA%25B8%25BE%25C81942_%25BE%25C6%25C6%25AE%25BD%25BA%25C6%25E4%25C0%25CC%25BD%25BA_%25BA%25B8%25BE%25C8_1_%25B3%25BB%25BA%25CE_%25BB%25E7%25C1%25F8_%25BA%25B8%25BE%25C81942_%25C1%25A6%25B0%25F8.jpg",
    video_ids: [],
    extra: {
      emoji: "🖼️",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "12:00", close: "18:00" },
          { day: "수", open: "12:00", close: "18:00" },
          { day: "목", open: "12:00", close: "18:00" },
          { day: "금", open: "12:00", close: "18:00" },
          { day: "토", open: "12:00", close: "18:00" },
          { day: "일", open: "12:00", close: "18:00" },
        ],
      },
    },
  },
  {
    id: "home-place-daerim",
    name: "성수동대림창고갤러리",
    category: "카페",
    description: "정미소를 고친 대형 카페 겸 전시장",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 성수이로 78",
    naver_place_id: "37910590",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220705_23%2F1656959975816l90nE_JPEG%2FKakaoTalk_Photo_2022-07-05-03-39-03_004.jpeg",
    video_ids: [],
    extra: {
      emoji: "🏭",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "22:00", last: "21:30" },
          { day: "화", open: "11:00", close: "22:00", last: "21:30" },
          { day: "수", open: "11:00", close: "22:00", last: "21:30" },
          { day: "목", open: "11:00", close: "22:00", last: "21:30" },
          { day: "금", open: "11:00", close: "22:00", last: "21:30" },
          { day: "토", open: "11:00", close: "22:00", last: "21:30" },
          { day: "일", open: "11:00", close: "22:00", last: "21:30" },
        ],
      },
    },
  },
];
