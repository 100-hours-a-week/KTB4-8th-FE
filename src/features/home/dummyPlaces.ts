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
  /** 사진을 칸 안에서 확대하는 배율(1보다 크게, 예: 1.4) — 로고처럼 가운데에 작게 들어 있는 사진을 키울 때. 확대 기준점은 가운데 */
  image_zoom?: number;
  /** "contain" 이면 사진을 자르지 않고 통째로 보여 준다(로고처럼 위아래가 잘리면 안 되는 사진). 남는 자리는 같은 사진을 흐리게 깔아 채운다 */
  image_fit?: "contain";
  /** image_fit 이 contain 일 때 남는 자리를 이 색으로 채운다(없으면 같은 사진을 흐리게 깐다). 흰 배경 로고처럼 흐린 색이 어색할 때 */
  image_bg?: string;
  /** 넷플릭스 "흑백요리사" 참가 셰프의 식당(전체보기 위쪽 "흑백요리사" 필터에 걸린다).
      spoon: 흑수저(black) · 백수저(white) — 상세의 수저 아이콘 색, note: 상세에 보이는 문구(시즌 · 별명 · 셰프 이름) */
  bw_chef?: { spoon: "black" | "white"; note: string };
  video_ids: string[];
  /** 이모지(사진을 못 열 때의 타일에 쓴다) */
  extra: WishlistExtra;
}

const RAW_PLACES: HomeDummyPlace[] = [
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
  {
    id: "home-place-hanjeongseon",
    name: "한정선",
    category: "카페,디저트",
    description:
      "성수 연무장길의 디저트 카페. 요거트 찹쌀떡 같은 한정 수량 디저트를 맛볼 수 있어요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 연무장길 43-1 1층",
    naver_place_id: "1353954221",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240606_60%2F1717643751457xvHHR_JPEG%2FIMG_3230.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍡",
      hours: {
        week: [
          { day: "월", open: "09:00", close: "22:00" },
          { day: "화", open: "09:00", close: "22:00" },
          { day: "수", open: "09:00", close: "22:00" },
          { day: "목", open: "09:00", close: "22:00" },
          { day: "금", open: "09:00", close: "22:30" },
          { day: "토", open: "09:00", close: "22:30" },
          { day: "일", open: "09:00", close: "22:30" },
        ],
      },
    },
  },
  {
    id: "home-place-betong-seongsu",
    name: "베통 성수",
    category: "카페,디저트",
    description: "성수의 베이커리 카페. 소금빵을 맛볼 수 있어요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 연무장7가길 8",
    naver_place_id: "365858525",
    image_url: "/event-images/betong-seongsu.jpg",
    video_ids: [],
    extra: {
      emoji: "🥐",
      hours: {
        week: [
          { day: "월", open: "09:00", close: "18:30" },
          { day: "화", open: "09:00", close: "18:30" },
          { day: "수", open: "09:00", close: "18:30" },
          { day: "목", open: "09:00", close: "18:30" },
          { day: "금", open: "09:00", close: "18:30" },
          { day: "토", open: "09:00", close: "18:30" },
          { day: "일", open: "09:00", close: "18:30" },
        ],
      },
    },
  },
  {
    id: "home-place-soyi-yeonnam",
    name: "소이연남 연남동본점",
    category: "맛집",
    description:
      "연남동의 태국 음식 맛집이에요. 점심과 저녁 사이 브레이크타임이 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 동교로 267 1층",
    naver_place_id: "35402809",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260702_269%2F1782965814551SwKGr_JPEG%2Flogo.jpg",
    image_fit: "contain",
    image_bg: "#ffffff",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          { day: "토", open: "11:00", close: "21:20", last: "20:50" },
          { day: "일", open: "11:00", close: "21:20", last: "20:50" },
        ],
      },
    },
  },
  {
    id: "home-place-pangyo-myeonhak",
    name: "판교면학",
    category: "맛집",
    description:
      "판교 유스페이스의 일본식 라면 맛집. 백면, 홍면, 장면, 청면과 교자를 맛볼 수 있어요.",
    address_sg: "경기도 성남시",
    address_road: "경기도 성남시 분당구 대왕판교로 670 유스페이스2 A동 103호",
    naver_place_id: "1551742227",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240704_261%2F1720053680221VsrIv_JPEG%2F%25B9%25E9%25B8%25E9.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "화",
            open: "11:00",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "수",
            open: "11:00",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "목",
            open: "11:00",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "금",
            open: "11:00",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
          },
          { day: "토", open: "11:00", close: "20:00" },
          { day: "일", open: "00:00", close: "00:00", closed: true },
        ],
      },
    },
  },
  {
    id: "home-place-geumdwaeji",
    name: "금돼지식당",
    category: "맛집",
    description:
      "중구 다산로의 돼지고기구이 맛집. 본삼겹, 눈꽃목살, 등목살과 통돼지 김치찌개를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 다산로 149 1층",
    naver_place_id: "37869877",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220802_101%2F1659370765037AXLjm_JPEG%2FDD07CF1D-8EA2-4102-909C-B1733368C6E8.jpeg",
    video_ids: [],
    extra: {
      emoji: "🐖",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "23:00" },
          { day: "화", open: "11:30", close: "23:00" },
          { day: "수", open: "11:30", close: "23:00" },
          { day: "목", open: "11:30", close: "23:00" },
          { day: "금", open: "11:30", close: "23:00" },
          { day: "토", open: "11:30", close: "23:00" },
          { day: "일", open: "11:30", close: "23:00" },
        ],
      },
    },
  },
  {
    id: "home-place-ore-no-ramen",
    name: "오레노라멘 본점",
    category: "맛집",
    description:
      "마포구 독막로의 일본식 라멘 맛집. 토리빠이탄 라멘, 카라빠이탄 라멘, 쯔꾸네를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 독막로8길 16 1층",
    naver_place_id: "814481697",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260403_256%2F1775192312791NG8F9_JPEG%2F%25C5%25E4%25B8%25AE%25BA%25FC%25C0%25CC%25C5%25BA.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
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
  {
    id: "home-place-jinjung-niuroumian",
    name: "진중 우육면관 본점",
    category: "맛집",
    description:
      "청계천로의 우육면 맛집. 우육면과 수교, 흑돼지 탕수육을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 청계천로 75-2",
    naver_place_id: "1124361834",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260616_168%2F17816003961997NDKT_JPEG%2F%25BF%25EC%25BA%25BB%25B0%25F8%25B0%25A3%25B9%25CC%25BD%25A6%25B8%25B03.jpg",
    image_position: "50% 85%",
    video_ids: [],
    extra: {
      emoji: "🍲",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "21:40", last: "20:50" },
          { day: "화", open: "11:00", close: "21:40", last: "20:50" },
          { day: "수", open: "11:00", close: "21:40", last: "20:50" },
          { day: "목", open: "11:00", close: "21:40", last: "20:50" },
          { day: "금", open: "11:00", close: "21:40", last: "20:50" },
          { day: "토", open: "11:00", close: "21:40", last: "20:50" },
          { day: "일", open: "11:00", close: "21:40", last: "20:50" },
        ],
      },
    },
  },
  {
    id: "home-place-dayrit-yongsan",
    name: "데이릿 용산점",
    category: "맛집",
    description:
      "용산의 한식 맛집. 직화족발누들, 잠봉크림누들, 갈비만두 라자냐를 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로44길 6 2층",
    naver_place_id: "1095041623",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251106_168%2F1762421896303vkmLe_PNG%2Fb.png",
    video_ids: [],
    extra: {
      emoji: "🍝",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "21:30", last: "20:30" },
          { day: "화", open: "11:30", close: "21:30", last: "20:30" },
          { day: "수", open: "11:30", close: "21:30", last: "20:30" },
          { day: "목", open: "11:30", close: "21:30", last: "20:30" },
          { day: "금", open: "11:30", close: "21:30", last: "20:30" },
          { day: "토", open: "11:30", close: "21:30", last: "20:30" },
          { day: "일", open: "11:30", close: "21:30", last: "20:30" },
        ],
      },
    },
  },
  {
    id: "home-place-shonino",
    name: "쇼니노",
    category: "맛집",
    description:
      "용산의 양식 맛집. 브런치와 디너 메뉴, 홍합찜을 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로21길 17-18 1층",
    naver_place_id: "1612635732",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231207_245%2F1701914815666HQHDH_JPEG%2F%25BC%25EE%25BF%25C0%25B4%25CF%25C0%25CC_%25B3%25EB%25BF%25C0.jpg",
    bw_chef: { spoon: "black", note: "흑백요리사 1 캠핑맨 (박재현)" },
    video_ids: [],
    extra: {
      emoji: "🍳",
      hours: {
        week: [
          {
            day: "월",
            open: "10:00",
            close: "22:00",
            break: { start: "16:00", end: "18:00" },
          },
          {
            day: "화",
            open: "10:00",
            close: "22:00",
            break: { start: "16:00", end: "18:00" },
          },
          {
            day: "수",
            open: "10:00",
            close: "22:00",
            break: { start: "16:00", end: "18:00" },
          },
          {
            day: "목",
            open: "10:00",
            close: "22:00",
            break: { start: "16:00", end: "18:00" },
          },
          {
            day: "금",
            open: "10:00",
            close: "22:00",
            break: { start: "16:00", end: "18:00" },
          },
          {
            day: "토",
            open: "10:00",
            close: "22:00",
            break: { start: "17:30", end: "18:00" },
          },
          {
            day: "일",
            open: "10:00",
            close: "22:00",
            break: { start: "17:30", end: "18:00" },
          },
        ],
      },
    },
  },
  {
    id: "home-place-maison-leblanc",
    name: "메종 루블랑",
    category: "맛집",
    description:
      "용산의 프랑스 음식점. 해산물 스파게티, 부이야베스, 수비드 삼겹살을 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로15길 19-22 1층",
    naver_place_id: "34250671",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190521_283%2F1558432638569Sf7i8_JPEG%2F6IKHch8e_zT38lrH-ECq3DgL.jpg",
    video_ids: [],
    extra: {
      emoji: "🥖",
      hours: {
        week: [
          { day: "월", open: "00:00", close: "00:00", closed: true },
          {
            day: "화",
            open: "11:30",
            close: "22:00",
            break: { start: "14:30", end: "17:00" },
            last: "21:00",
          },
          {
            day: "수",
            open: "11:30",
            close: "22:00",
            break: { start: "14:30", end: "17:00" },
            last: "21:00",
          },
          {
            day: "목",
            open: "11:30",
            close: "22:00",
            break: { start: "14:30", end: "17:00" },
            last: "21:00",
          },
          {
            day: "금",
            open: "11:30",
            close: "22:00",
            break: { start: "14:30", end: "17:00" },
            last: "21:00",
          },
          {
            day: "토",
            open: "11:30",
            close: "22:00",
            break: { start: "14:30", end: "17:00" },
            last: "21:00",
          },
          {
            day: "일",
            open: "11:30",
            close: "22:00",
            break: { start: "14:30", end: "17:00" },
            last: "21:00",
          },
        ],
      },
    },
  },
  {
    id: "home-place-maplestory-escape",
    name: "메이플스토리 이스케이프",
    category: "기타",
    description:
      "홍대 와우산로의 방탈출 카페예요. 메이플스토리를 주제로 한 방탈출을 즐길 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 와우산로 90 1층",
    naver_place_id: "2033655966",
    image_url: "/event-images/maplestory-escape-logo.jpg",
    video_ids: [],
    extra: {
      emoji: "🗝️",
      links: [
        { type: "official", url: "https://maplestoryescape.com/" },
        {
          type: "instagram",
          url: "https://www.instagram.com/maplestory.escape/",
        },
      ],
      booking_url:
        "https://ticket.yes24.com/New/Genre/GenreBridge.aspx?genre=15460&id=1563",
      themes: {
        title: "방탈출 테마",
        items: [
          {
            name: "커닝시티, 사라진 사람들",
            description:
              "사라진 주민들, 그리고 커닝시티 곳곳에서 발생하는 이상현상.",
            genre: "스릴러",
            minutes: 60,
            fear: 2,
            difficulty: 2,
            image: "https://maplestoryescape.com/images/theme/a7f3c9d8.jpg",
            times: [
              "10:00",
              "10:40",
              "11:20",
              "12:40",
              "13:20",
              "14:00",
              "15:20",
              "16:00",
              "16:40",
              "18:00",
              "18:40",
              "19:20",
              "20:40",
              "21:20",
              "22:00",
            ],
          },
          {
            name: "도전! 무릉도장!",
            description: "무릉도장에 도전할 용기가 있는 자는 나를 찾아오시오.",
            genre: "아케이드",
            minutes: 60,
            fear: 0,
            difficulty: 4,
            image: "https://maplestoryescape.com/images/theme/d28b4f96.jpg",
            times: [
              "10:20",
              "11:00",
              "11:40",
              "13:00",
              "13:40",
              "14:20",
              "15:40",
              "16:20",
              "17:00",
              "18:20",
              "19:00",
              "19:40",
              "21:00",
              "21:40",
              "22:20",
            ],
          },
          {
            name: "헌티드 맨션으로 초대합니다",
            description:
              "요즘… 이곳을 찾는 용사분들이 헌티드 맨션 안에서 자꾸 사라지고 있어요. 혹시 이 편지를 보신다면 맨션을 조사하러 와주실 수 있나요?",
            genre: "미스터리",
            minutes: 60,
            fear: 2,
            difficulty: 2,
            image: "https://maplestoryescape.com/images/theme/7e91c4a6.jpg",
            times: [
              "10:30",
              "11:10",
              "11:50",
              "13:10",
              "13:50",
              "14:30",
              "15:50",
              "16:30",
              "17:10",
              "18:30",
              "19:10",
              "19:50",
              "21:10",
              "21:50",
              "22:30",
            ],
          },
          {
            name: "에델슈타인 더 비기닝",
            description:
              "에델슈타인의 사람들이 하나씩 실종되고 있다는 소문이 들려온다. 이 마을엔 대체 어떤 사건이 일어나고 있는 걸까….",
            genre: "잠입",
            minutes: 60,
            fear: 0,
            difficulty: 3,
            image: "https://maplestoryescape.com/images/theme/c5a84e19.jpg",
            times: [
              "09:55",
              "10:35",
              "11:15",
              "12:35",
              "13:15",
              "13:55",
              "15:15",
              "15:55",
              "16:35",
              "17:55",
              "18:35",
              "19:15",
              "20:35",
              "21:15",
              "21:55",
            ],
          },
          {
            name: "뒤죽박죽 루디브리엄",
            description:
              "루디브리엄에 비상 상황이 발생했습니다. 믿을 수 있는 동료들과 힘을 합하여 루디브리엄을 구해주세요!",
            genre: "협동",
            minutes: 60,
            fear: 0,
            difficulty: 3,
            image: "https://maplestoryescape.com/images/theme/91f6d3b8.jpg",
            times: [
              "10:10",
              "10:50",
              "11:30",
              "12:50",
              "13:30",
              "14:10",
              "15:30",
              "16:10",
              "16:50",
              "18:10",
              "18:50",
              "19:30",
              "20:50",
              "21:30",
              "22:10",
            ],
          },
        ],
      },
      hours: {
        week: [
          { day: "월", open: "09:00", close: "23:00" },
          { day: "화", open: "09:00", close: "23:00" },
          { day: "수", open: "09:00", close: "23:00" },
          { day: "목", open: "09:00", close: "23:00" },
          { day: "금", open: "09:00", close: "23:00" },
          { day: "토", open: "09:00", close: "23:00" },
          { day: "일", open: "09:00", close: "23:00" },
        ],
      },
    },
  },
  {
    id: "home-place-godiva-lotteworldmall",
    name: "고디바 롯데월드몰점",
    category: "카페,디저트",
    description:
      "롯데월드몰 지하 1층의 초콜릿 전문점. 초코 와플컵 젤라또와 아몬드 프랄린 모찌 같은 초콜릿 디저트를 맛볼 수 있어요.",
    address_sg: "서울특별시 송파구",
    address_road: "서울특별시 송파구 올림픽로 300 롯데월드몰 지하1층",
    naver_place_id: "2059823946",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260903_43%2F1788432243029iHt6H_JPEG%2F%25B7%25B9%25C0%25CC%25B5%25F0_%25B0%25ED%25B5%25F0%25B9%25D9_%25B7%25CE%25B0%25ED_%2528%25BA%25EA%25B6%25F3%25BF%25EE%2529.jpg",
    video_ids: [],
    extra: {
      emoji: "🍫",
      hours: {
        week: [
          { day: "월", open: "10:30", close: "22:00" },
          { day: "화", open: "10:30", close: "22:00" },
          { day: "수", open: "10:30", close: "22:00" },
          { day: "목", open: "10:30", close: "22:00" },
          { day: "금", open: "10:30", close: "22:00" },
          { day: "토", open: "10:30", close: "22:00" },
          { day: "일", open: "10:30", close: "22:00" },
        ],
      },
    },
  },
  {
    id: "home-place-onryu-seongsu",
    name: "온류 성수",
    category: "맛집",
    description:
      "서울숲 아뜰리에길의 퓨전 한식 다이닝. 냉제육, 김부각 롤 김밥, 청유자 국밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 서울숲2길 14-8 2층",
    naver_place_id: "1167065844",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240919_295%2F1726673568437eIpuc_JPEG%2FIMG_2900.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍚",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          {
            day: "화",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "토",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "일",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
        ],
        note: "점심 라스트오더 14:00, 저녁 라스트오더 20:00 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-wangsimni-dakdori",
    name: "왕십리닭내장탕집",
    category: "맛집",
    description:
      "양지사거리의 50년 전통을 내세우는 닭내장탕집. 닭내장탕과 오징어무침을 맛볼 수 있어요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 무학로2길 11",
    naver_place_id: "11835789",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251216_196%2F1765829315999VpWcY_JPEG%2F7609.jpg",
    video_ids: [],
    extra: {
      emoji: "🍲",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "22:00", last: "21:00" },
          { day: "화", open: "11:30", close: "22:00", last: "21:00" },
          { day: "수", open: "11:30", close: "22:00", last: "21:00" },
          { day: "목", open: "11:30", close: "22:00", last: "21:00" },
          { day: "금", open: "11:30", close: "22:00", last: "21:00" },
          { day: "토", open: "11:30", close: "22:00", last: "21:00" },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 21:00 · 매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-popolo-pizza",
    name: "포폴로피자",
    category: "맛집",
    description:
      "일산 정발산의 나폴리 피자 전문점. 뽀모도로 부라타와 카프레제 샐러드를 맛볼 수 있어요.",
    address_sg: "경기도 고양시",
    address_road:
      "경기도 고양시 일산동구 정발산로 43-20 센트럴플라자 102호, 103호",
    naver_place_id: "38491290",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250503_4%2F1746254592200S3nOF_JPEG%2FIMG_8392.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍕",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          {
            day: "화",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          { day: "토", open: "11:30", close: "21:30", last: "20:30" },
          { day: "일", open: "11:30", close: "21:30", last: "20:30" },
        ],
        note: "점심 라스트오더 14:30, 저녁 라스트오더 20:30 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-jinhyang-pangyo",
    name: "진향",
    category: "맛집",
    description:
      "분당 중앙공원로의 중식당. 자장면, 삼선짬뽕, 크림새우, 탕수육을 맛볼 수 있어요.",
    address_sg: "경기도 성남시",
    address_road: "경기도 성남시 분당구 중앙공원로 35 1층 111-B호",
    naver_place_id: "1864202313",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240507_297%2F1715062729722Y076r_JPEG%2FKakaoTalk_20240507_135726297_11.jpg",
    video_ids: [],
    extra: {
      emoji: "🥢",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:00",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:00",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:00",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:00",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:00",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:00",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "일",
            open: "11:00",
            close: "21:00",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
        ],
        note: "라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-chiikawa-yongsan",
    name: "치이카와샵 아이파크몰 용산점",
    category: "기타",
    description:
      "아이파크몰 용산 리빙파크 3층의 치이카와 공식 스토어. 한국 첫 정규 매장이에요.",
    address_sg: "서울특별시 용산구",
    address_road:
      "서울특별시 용산구 한강대로23길 55 리빙파크 3F 도파민 스테이션",
    naver_place_id: "2014160760",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20260210_217%2F1770704724248NPgSw_JPEG%2F0204_%25BE%25F7%25B7%25CE%25B5%25E5%25C0%25CC%25B9%25CC%25C1%25F6.jpg",
    video_ids: [],
    extra: {
      emoji: "🛍️",
      hours: {
        week: [
          { day: "월", open: "10:30", close: "22:00" },
          { day: "화", open: "10:30", close: "22:00" },
          { day: "수", open: "10:30", close: "22:00" },
          { day: "목", open: "10:30", close: "22:00" },
          { day: "금", open: "10:30", close: "22:00" },
          { day: "토", open: "10:30", close: "22:00" },
          { day: "일", open: "10:30", close: "22:00" },
        ],
      },
    },
  },
  {
    id: "home-place-keulljun-pangyo",
    name: "클준빛날영",
    category: "맛집",
    description:
      "판교역 근처의 일본식 라멘집. 파이탄 · 매운 · 쇼유 라멘과 차슈덮밥을 맛볼 수 있어요.",
    address_sg: "경기도 성남시",
    address_road: "경기도 성남시 분당구 판교역로 240",
    naver_place_id: "1730451139",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220816_13%2F1660656665920xOVxb_JPEG%2FScreenshot_20220816-223059_Instagram.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "20:00",
            break: { start: "14:00", end: "17:00" },
            last: "19:30",
          },
          {
            day: "화",
            open: "11:30",
            close: "20:00",
            break: { start: "14:00", end: "17:00" },
            last: "19:30",
          },
          {
            day: "수",
            open: "11:30",
            close: "20:00",
            break: { start: "14:00", end: "17:00" },
            last: "19:30",
          },
          {
            day: "목",
            open: "11:30",
            close: "20:00",
            break: { start: "14:00", end: "17:00" },
            last: "19:30",
          },
          {
            day: "금",
            open: "11:30",
            close: "20:00",
            break: { start: "14:00", end: "17:00" },
            last: "19:30",
          },
          { day: "토", open: "", close: "", closed: true },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 19:30 · 매주 토 · 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-flink-pangyo",
    name: "플링크 판교",
    category: "카페,디저트",
    description:
      "판교역 앞의 베이커리. 크루아상, 팽오쇼콜라, 시나몬롤, 에그타르트를 맛볼 수 있어요.",
    address_sg: "경기도 성남시",
    address_road: "경기도 성남시 분당구 판교역로 166 1층 12호",
    naver_place_id: "1016513873",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260110_238%2F1768044515819mI9Qe_JPEG%2FKakaoTalk_20260110_202702660_04.jpg",
    video_ids: [],
    extra: {
      emoji: "🥐",
      hours: {
        week: [
          { day: "월", open: "07:30", close: "19:00" },
          { day: "화", open: "07:30", close: "19:00" },
          { day: "수", open: "07:30", close: "19:00" },
          { day: "목", open: "07:30", close: "19:00" },
          { day: "금", open: "07:30", close: "19:00" },
          { day: "토", open: "09:00", close: "18:00" },
          { day: "일", open: "09:00", close: "18:00" },
        ],
      },
    },
  },
  {
    id: "home-place-gorogoro-yongsan",
    name: "고로고로 용산",
    category: "맛집",
    description:
      "용산의 카이센동 전문점. 다진 회를 밥에 올린 고로고로와 스테이크 장어덮밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로11길 27 1층",
    naver_place_id: "2063373063",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fnaverbooking-phinf.pstatic.net%2F20250710_48%2F1752121466813hXpfD_JPEG%2Fimage.jpg",
    video_ids: [],
    extra: {
      emoji: "🍣",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "화",
            open: "11:30",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "수",
            open: "11:30",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "목",
            open: "11:30",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "금",
            open: "11:30",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          { day: "토", open: "11:30", close: "21:00" },
          { day: "일", open: "11:30", close: "21:00" },
        ],
      },
    },
  },
  {
    id: "home-place-le-mekong-pangyo",
    name: "르메콩",
    category: "맛집",
    description:
      "판교 유스페이스의 베트남 · 동남아 음식점. 금요일은 14:30까지, 토 · 일요일은 쉬어요.",
    address_sg: "경기도 성남시",
    address_road: "경기도 성남시 분당구 대왕판교로 670 유스페이스2 218호",
    naver_place_id: "1000106291",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220917_4%2F1663342796149NFHiv_JPEG%2FAA110D09-299E-4C15-B989-B94555249CBD.jpeg",
    image_zoom: 1.5,
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "20:00",
            break: { start: "15:00", end: "17:00" },
            last: "19:30",
          },
          {
            day: "화",
            open: "11:00",
            close: "20:00",
            break: { start: "15:00", end: "17:00" },
            last: "19:30",
          },
          {
            day: "수",
            open: "11:00",
            close: "20:00",
            break: { start: "15:00", end: "17:00" },
            last: "19:30",
          },
          {
            day: "목",
            open: "11:00",
            close: "20:00",
            break: { start: "15:00", end: "17:00" },
            last: "19:30",
          },
          { day: "금", open: "11:00", close: "14:30", last: "14:00" },
          { day: "토", open: "", close: "", closed: true },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 19:30 · 매주 토 · 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-montan",
    name: "몽탄",
    category: "맛집",
    description:
      "용산 삼각지의 고기구이집. 우대갈비, 짚불항정살, 몽탄육회를 맛볼 수 있고 쉬는 시간 없이 이어서 운영해요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 백범로99길 50",
    naver_place_id: "1810277002",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190118_58%2F1547774525170WiHRr_JPEG%2FLQR4NdfTZrK-FNfGCrcUVhVn.jpg",
    video_ids: [],
    extra: {
      emoji: "🥩",
      hours: {
        week: [
          { day: "월", open: "12:00", close: "22:00", last: "21:00" },
          { day: "화", open: "12:00", close: "22:00", last: "21:00" },
          { day: "수", open: "12:00", close: "22:00", last: "21:00" },
          { day: "목", open: "12:00", close: "22:00", last: "21:00" },
          { day: "금", open: "12:00", close: "22:00", last: "21:00" },
          { day: "토", open: "12:00", close: "22:00", last: "21:00" },
          { day: "일", open: "12:00", close: "22:00", last: "21:00" },
        ],
        note: "라스트오더 21:00",
      },
    },
  },
  {
    id: "home-place-kkoger-yongsan",
    name: "꺼거",
    category: "맛집",
    description:
      "용산의 홍콩 노포 콘셉트 중식당. 불향 가득한 홍콩식 요리와 크림 새우를 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로48길 10",
    naver_place_id: "1610612866",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240219_186%2F1708323724103GBQlT_JPEG%2FIMG_3633_%25281%2529.jpg",
    video_ids: [],
    extra: {
      emoji: "🥟",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:30",
          },
          {
            day: "화",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:30",
          },
          { day: "토", open: "11:30", close: "21:30", last: "20:30" },
          { day: "일", open: "11:30", close: "21:30", last: "20:30" },
        ],
        note: "점심 라스트오더 14:00, 저녁 라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-bermuda-samgakji",
    name: "버뮤다삼각지",
    category: "맛집",
    description:
      "용리단길의 멕시칸 · 양식 퓨전 다이닝. 폭립 플래터, 엔칠라다, 치미창가를 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로52길 19 1,2층",
    naver_place_id: "36994512",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250501_162%2F174609571440770yfb_PNG%2F%25B9%25F6%25B9%25C2%25B4%25D9_%25C0%25BD%25BD%25C4%25BB%25E7%25C1%25F8.png",
    video_ids: [],
    extra: {
      emoji: "🌮",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "화",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "수",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "목",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "금",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          { day: "토", open: "11:30", close: "23:00", last: "22:00" },
          { day: "일", open: "11:30", close: "23:00", last: "22:00" },
        ],
        note: "라스트오더 22:00",
      },
    },
  },
  {
    id: "home-place-tapacopa-yongsan",
    name: "타파코파 용산본점",
    category: "맛집",
    description:
      "삼각지역 근처의 스페인 타파스바. 와인과 함께 뽈뽀, 꿀대구 같은 스페인 요리를 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로54길 29 1층",
    naver_place_id: "1572223081",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220628_179%2F1656423067116H7uH8_JPEG%2FIMG_8942.jpg",
    video_ids: [],
    extra: {
      emoji: "🍷",
      hours: {
        week: [
          { day: "월", open: "16:30", close: "22:30" },
          { day: "화", open: "16:30", close: "22:30" },
          { day: "수", open: "16:30", close: "22:30" },
          { day: "목", open: "16:30", close: "22:30" },
          { day: "금", open: "16:30", close: "22:30" },
          { day: "토", open: "12:00", close: "22:30" },
          { day: "일", open: "12:00", close: "22:30" },
        ],
      },
    },
  },
  {
    id: "home-place-fwv-yongsan",
    name: "에프더블유브이 용산점",
    category: "맛집",
    description:
      "용리단길의 피자 전문점. 마리나라, 마르게리타, 초리조 피자를 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로52길 25-8 224-1호",
    naver_place_id: "1240748899",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250424_30%2F1745492507842wuUBu_JPEG%2FKakaoTalk_Photo_2025-04-24-20-01-25.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍕",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "22:00", last: "21:00" },
          { day: "화", open: "11:00", close: "22:00", last: "21:00" },
          { day: "수", open: "11:00", close: "22:00", last: "21:00" },
          { day: "목", open: "11:00", close: "22:00", last: "21:00" },
          { day: "금", open: "11:00", close: "22:00", last: "21:00" },
          { day: "토", open: "11:00", close: "22:00", last: "21:00" },
          { day: "일", open: "11:00", close: "22:00", last: "21:00" },
        ],
        note: "라스트오더 21:00",
      },
    },
  },
  {
    id: "home-place-hwayang-lamb-kondae",
    name: "화양양꼬치 건대점",
    category: "맛집",
    description:
      "건대 양꼬치 골목의 양꼬치집. 양꼬치, 양갈비살, 마라양꼬치를 맛볼 수 있어요.",
    address_sg: "서울특별시 광진구",
    address_road: "서울특별시 광진구 아차산로29길 44 화양양꼬치",
    naver_place_id: "19372325",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240217_252%2F1708102748755Aiejh_JPEG%2FKakaoTalk_20240216_233630758_06.jpg",
    video_ids: [],
    extra: {
      emoji: "🍢",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "13:00", close: "01:00", last: "00:30" },
          { day: "수", open: "13:00", close: "01:00", last: "00:30" },
          { day: "목", open: "13:00", close: "01:00", last: "00:30" },
          { day: "금", open: "13:00", close: "01:00", last: "00:30" },
          { day: "토", open: "13:00", close: "01:00", last: "00:30" },
          { day: "일", open: "12:00", close: "24:00", last: "23:30" },
        ],
        note: "라스트오더 00:30 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-songhwa-lamb",
    name: "송화양꼬치",
    category: "맛집",
    description:
      "건대 양꼬치 거리의 양꼬치집. 오리지널 양꼬치, 양갈비살, 소꼬치를 맛볼 수 있어요.",
    address_sg: "서울특별시 광진구",
    address_road: "서울특별시 광진구 동일로18길 70",
    naver_place_id: "12966607",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190109_217%2F1547001171239kW0PW_JPEG%2F5CaaUBIzvBMCkf-GpmldL05j.jpg",
    video_ids: [],
    extra: {
      emoji: "🍢",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "01:30" },
          { day: "화", open: "11:00", close: "01:30" },
          { day: "수", open: "11:00", close: "01:30" },
          { day: "목", open: "11:00", close: "01:30" },
          { day: "금", open: "11:00", close: "01:30" },
          { day: "토", open: "11:00", close: "01:30" },
          { day: "일", open: "11:00", close: "01:30" },
        ],
      },
    },
  },
  {
    id: "home-place-hunchun-lamb",
    name: "훈춘양꼬치",
    category: "맛집",
    description:
      "건대 근처의 양꼬치집. 특대 양꼬치와 마라양꼬치, 송아지갈비살을 맛볼 수 있어요.",
    address_sg: "서울특별시 광진구",
    address_road: "서울특별시 광진구 아차산로34길 38",
    naver_place_id: "37350325",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20170502_73%2F1493684509356gVN6D_JPEG%2F1.jpg",
    video_ids: [],
    extra: {
      emoji: "🍢",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "01:30" },
          { day: "화", open: "11:00", close: "01:30" },
          { day: "수", open: "11:00", close: "01:30" },
          { day: "목", open: "11:00", close: "01:30" },
          { day: "금", open: "11:00", close: "01:30" },
          { day: "토", open: "11:00", close: "01:30" },
          { day: "일", open: "11:00", close: "01:30" },
        ],
      },
    },
  },
  {
    id: "home-place-yeonok-lamb",
    name: "연옥양꼬치",
    category: "맛집",
    description:
      "건대 양꼬치 거리의 양꼬치집. 양꼬치, 마라양꼬치, 양갈비살을 맛볼 수 있어요.",
    address_sg: "서울특별시 광진구",
    address_road: "서울특별시 광진구 동일로18길 42 연옥양꼬치",
    naver_place_id: "599370022",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250403_50%2F1743646680010uQB2T_JPEG%2FA04A9340.jpg",
    video_ids: [],
    extra: {
      emoji: "🍢",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "24:00" },
          { day: "화", open: "11:00", close: "24:00" },
          { day: "수", open: "11:00", close: "24:00" },
          { day: "목", open: "11:00", close: "24:00" },
          { day: "금", open: "11:00", close: "24:00" },
          { day: "토", open: "11:00", close: "24:00" },
          { day: "일", open: "11:00", close: "24:00" },
        ],
      },
    },
  },
  {
    id: "home-place-perejil-seongsu",
    name: "페레힐",
    category: "맛집",
    description:
      "성수 연무장길의 스페인 레스토랑. 홍새우 비스크 파스타, 닭고기 사프란 빠에야, 갈리시아 뿔뽀를 맛볼 수 있어요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 연무장길 37-22 1층 페레힐",
    naver_place_id: "2087524275",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260719_255%2F1784464434304q26W8_JPEG%2F%25B3%25D7%25C0%25CC%25B9%25F6_%25C7%25C3%25B7%25B9%25C0%25CC%25BD%25BA_%25B8%25DE%25C0%25CE_%25BB%25E7%25C1%25F8.jpg",
    video_ids: [],
    extra: {
      emoji: "🥘",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "22:30",
            break: { start: "14:30", end: "16:00" },
            last: "21:30",
          },
          {
            day: "화",
            open: "11:30",
            close: "22:30",
            break: { start: "14:30", end: "16:00" },
            last: "21:30",
          },
          {
            day: "수",
            open: "11:30",
            close: "22:30",
            break: { start: "14:30", end: "16:00" },
            last: "21:30",
          },
          {
            day: "목",
            open: "11:30",
            close: "22:30",
            break: { start: "14:30", end: "16:00" },
            last: "21:30",
          },
          {
            day: "금",
            open: "11:30",
            close: "22:30",
            break: { start: "14:30", end: "16:00" },
            last: "21:30",
          },
          {
            day: "토",
            open: "11:30",
            close: "22:30",
            break: { start: "14:30", end: "16:00" },
            last: "21:30",
          },
          {
            day: "일",
            open: "11:30",
            close: "22:30",
            break: { start: "14:30", end: "16:00" },
            last: "21:30",
          },
        ],
        note: "점심 라스트오더 13:30, 저녁 라스트오더 21:30",
      },
    },
  },
  {
    id: "home-place-appie-eddie",
    name: "아삐에디",
    category: "맛집",
    description:
      "삼선교의 이탈리안 레스토랑. 포르치니 버섯 크림 파파르델레와 로마식 카르보나라를 맛볼 수 있어요.",
    address_sg: "서울특별시 성북구",
    address_road: "서울특별시 성북구 삼선교로10길 26 1층(삼선동1가)",
    naver_place_id: "1583730037",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220811_129%2F1660188905463RbWJk_JPEG%2F1660188849062.jpg",
    video_ids: [],
    extra: {
      emoji: "🍝",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "화",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "토",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 20:30 · 매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-mogran",
    name: "목란",
    category: "맛집",
    description:
      "연희동의 중식당. 동파육과 멘보샤를 맛볼 수 있고, 식사류만은 주문할 수 없어 요리를 함께 시켜야 해요.",
    address_sg: "서울특별시 서대문구",
    address_road: "서울특별시 서대문구 연희로15길 21",
    naver_place_id: "11880458",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150831_62%2F1440992706193nR2Iy_JPEG%2F11880458_2.jpg",
    video_ids: [],
    extra: {
      emoji: "🥢",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          {
            day: "화",
            open: "11:30",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:35",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:35",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:35",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:35",
          },
          {
            day: "토",
            open: "11:30",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:35",
          },
          {
            day: "일",
            open: "11:30",
            close: "21:20",
            break: { start: "15:00", end: "17:00" },
            last: "20:35",
          },
        ],
        note: "라스트오더 20:35 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-dorang",
    name: "도량",
    category: "맛집",
    description:
      "서촌의 한국식 중식당. 도량 훠궈 정식, 양고기튀김, 동파육을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 자하문로6길 6 2, 3층",
    naver_place_id: "1817207066",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240124_173%2F1706070692450Mscn8_PNG%2F3.png",
    bw_chef: { spoon: "black", note: "흑백요리사 1 철가방 요리사 (임태훈)" },
    video_ids: [],
    extra: {
      emoji: "🍲",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          {
            day: "화",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "일",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
        ],
        note: "점심 라스트오더 13:30, 저녁 라스트오더 20:30 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-neuru-yeonsinnae",
    name: "느루",
    category: "맛집",
    description:
      "연신내의 숙성 사시미 이자카야. 대방어 사시미, 고등어봉초밥, 후토마끼를 맛볼 수 있고 새벽 3시까지 영업해요.",
    address_sg: "서울특별시 은평구",
    address_road: "서울특별시 은평구 통일로83길 18 1층 느루",
    naver_place_id: "1652671059",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240816_62%2F1723791294878dKuxR_JPEG%2Ffoodon09921.jpg",
    video_ids: [],
    extra: {
      emoji: "🍶",
      hours: {
        week: [
          { day: "월", open: "18:00", close: "03:00", last: "02:00" },
          { day: "화", open: "18:00", close: "03:00", last: "02:00" },
          { day: "수", open: "18:00", close: "03:00", last: "02:00" },
          { day: "목", open: "18:00", close: "03:00", last: "02:00" },
          { day: "금", open: "18:00", close: "03:00", last: "02:00" },
          { day: "토", open: "18:00", close: "03:00", last: "02:00" },
          { day: "일", open: "18:00", close: "03:00", last: "02:00" },
        ],
        note: "라스트오더 02:00",
      },
    },
  },
  {
    id: "home-place-badahoesarang-seogyo",
    name: "바다회사랑 서교점",
    category: "맛집",
    description:
      "서교동의 생선회 전문점. 대방어, 광어, 연어, 참돔을 골라 모둠으로 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 동교로 143",
    naver_place_id: "35523842",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260303_133%2F1772543032976qTzq7_PNG%2F1000016787.png",
    video_ids: [],
    extra: {
      emoji: "🐟",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "16:00", close: "22:30", last: "22:00" },
          { day: "수", open: "16:00", close: "22:30", last: "22:00" },
          { day: "목", open: "16:00", close: "22:30", last: "22:00" },
          { day: "금", open: "16:00", close: "23:30", last: "23:00" },
          { day: "토", open: "16:00", close: "23:30", last: "23:00" },
          { day: "일", open: "16:00", close: "22:30", last: "22:00" },
        ],
        note: "라스트오더 22:00 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-yeonnam-toma",
    name: "연남토마 본점",
    category: "맛집",
    description:
      "연남동의 퓨전 덮밥 · 파스타집. 명란바질오일파스타와 차돌중화크림파스타를 맛볼 수 있고 쉬는 시간 없이 운영해요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 월드컵북로6길 61 연남토마",
    naver_place_id: "1229825670",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250908_258%2F1757315667237uTqXK_JPEG%2F%25C2%25F7%25B5%25B9.jpg",
    video_ids: [],
    extra: {
      emoji: "🍝",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "21:30", last: "20:30" },
          { day: "화", open: "11:30", close: "21:30", last: "20:30" },
          { day: "수", open: "11:30", close: "21:30", last: "20:30" },
          { day: "목", open: "11:30", close: "21:30", last: "20:30" },
          { day: "금", open: "11:30", close: "21:30", last: "20:30" },
          { day: "토", open: "11:30", close: "21:30", last: "20:30" },
          { day: "일", open: "11:30", close: "21:30", last: "20:30" },
        ],
        note: "라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-mippeudong",
    name: "미쁘동",
    category: "맛집",
    description:
      "서울숲 근처의 일식 덮밥집. 성게알과 해산물을 올린 미쁘동, 연어소바를 맛볼 수 있어요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 서울숲2길 11-12 2층",
    naver_place_id: "1115969228",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230417_114%2F1681710796893JkLyf_JPEG%2F1681563742056.jpg",
    video_ids: [],
    extra: {
      emoji: "🍚",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "21:00", last: "20:00" },
          { day: "화", open: "11:00", close: "21:00", last: "20:00" },
          { day: "수", open: "11:00", close: "21:00", last: "20:00" },
          { day: "목", open: "11:00", close: "21:00", last: "20:00" },
          { day: "금", open: "11:00", close: "21:00", last: "20:00" },
          { day: "토", open: "11:00", close: "21:00", last: "20:00" },
          { day: "일", open: "11:00", close: "21:00", last: "20:00" },
        ],
        note: "라스트오더 20:00",
      },
    },
  },
  {
    id: "home-place-hakata-naka",
    name: "하카타나카",
    category: "맛집",
    description:
      "홍대 와우산로의 큐슈 정식 전문점. Mr.타나카 정식, 치킨난반 정식, 카라아게 정식을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 와우산로23길 50 2F",
    naver_place_id: "13160647",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20171116_19%2F1510809403141ftaeD_JPEG%2FcEsmCwGKsc5aPZDOFlZYS9SF.JPG.jpg",
    video_ids: [],
    extra: {
      emoji: "🍱",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:00",
          },
          { day: "수", open: "", close: "", closed: true },
          {
            day: "목",
            open: "11:00",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "일",
            open: "11:00",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:00",
          },
        ],
        note: "점심 라스트오더 15:00, 저녁 라스트오더 20:00 · 매주 수요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-chocho-hongdae",
    name: "쵸쵸 홍대",
    category: "맛집",
    description:
      "홍대의 카이센동 전문점. 스페셜 카이센동, 이꾸라 · 우니 · 관자동, 장어덮밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 와우산로29길 45 성암빌딩 1층",
    naver_place_id: "19882161",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260428_232%2F1777362043472JUAhQ_JPEG%2F1000038121.jpg",
    video_ids: [],
    extra: {
      emoji: "🍣",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "20:30", last: "20:00" },
          { day: "화", open: "11:30", close: "16:00", last: "15:30" },
          { day: "수", open: "11:30", close: "20:30", last: "20:00" },
          { day: "목", open: "11:30", close: "20:30", last: "20:00" },
          { day: "금", open: "11:30", close: "20:30", last: "20:00" },
          { day: "토", open: "11:30", close: "20:30", last: "20:00" },
          { day: "일", open: "11:30", close: "20:30", last: "20:00" },
        ],
        note: "라스트오더 20:00",
      },
    },
  },
  {
    id: "home-place-original-chicago-pizza-hongdae",
    name: "오리지널시카고피자 홍대본점",
    category: "맛집",
    description:
      "홍대 · 상수 사이의 시카고 피자 전문점. 딥디쉬 스타일의 마일드 마스카포네, 베이컨 체다 크리미 피자를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 독막로7길 51 3층 CHICAGO",
    naver_place_id: "35554133",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20200417_133%2F1587080963906DOBxM_JPEG%2Fe7kOAnfmPpog8GLli1wu-pU4.jpg",
    video_ids: [],
    extra: {
      emoji: "🍕",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "22:00", last: "21:00" },
          { day: "화", open: "11:30", close: "22:00", last: "21:00" },
          { day: "수", open: "11:30", close: "22:00", last: "21:00" },
          { day: "목", open: "11:30", close: "22:00", last: "21:00" },
          { day: "금", open: "11:30", close: "23:00", last: "22:00" },
          { day: "토", open: "11:00", close: "23:00", last: "22:00" },
          { day: "일", open: "11:00", close: "22:00", last: "21:00" },
        ],
        note: "라스트오더 21:00",
      },
    },
  },
  {
    id: "home-place-gyeongju-sikdang-hongdae",
    name: "경주식당 홍대본점",
    category: "맛집",
    description:
      "상수동의 정식집. 목살정식, 숯불보쌈정식, 목살카레덮밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 와우산로13길 49-7 1층 경주식당",
    naver_place_id: "31469248",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230730_289%2F1690681722986gGDCr_JPEG%2F4DE52B0F-7A04-487B-9235-0EC7BE6E3149.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍖",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "23:00",
            break: { start: "15:30", end: "17:30" },
            last: "22:00",
          },
          {
            day: "화",
            open: "11:30",
            close: "23:00",
            break: { start: "15:30", end: "17:30" },
            last: "22:00",
          },
          {
            day: "수",
            open: "11:30",
            close: "23:00",
            break: { start: "15:30", end: "17:30" },
            last: "22:00",
          },
          {
            day: "목",
            open: "11:30",
            close: "23:00",
            break: { start: "15:30", end: "17:30" },
            last: "22:00",
          },
          {
            day: "금",
            open: "11:30",
            close: "23:00",
            break: { start: "15:30", end: "17:30" },
            last: "22:00",
          },
          {
            day: "토",
            open: "11:30",
            close: "23:00",
            break: { start: "15:30", end: "17:30" },
            last: "22:00",
          },
          {
            day: "일",
            open: "11:30",
            close: "23:00",
            break: { start: "15:30", end: "17:30" },
            last: "22:00",
          },
        ],
        note: "라스트오더 22:00",
      },
    },
  },
  {
    id: "home-place-doragon-sangsu",
    name: "도라곤",
    category: "맛집",
    description:
      "상수동의 일식집. 규카츠, 스테이크동, 사케동을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 독막로15길 5 1층 102호",
    naver_place_id: "1935156964",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260714_220%2F1784014493719jYwGJ_JPEG%2F%25B5%25B5%25B6%25F3%25B0%25EF%25B7%25CE%25B0%25ED%25B0%25ED%25B0%25ED12.jpg",
    video_ids: [],
    extra: {
      emoji: "🥩",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          {
            day: "화",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
          {
            day: "일",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "16:30" },
            last: "20:30",
          },
        ],
        note: "라스트오더 20:30 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-suzy-and-pasta",
    name: "수지앤파스타",
    category: "맛집",
    description:
      "상수역 근처의 양식집. 직접 만드는 감자뇨끼와 트러플 파케리, 라자냐를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 독막로15길 3-18 지하 1층",
    naver_place_id: "37192534",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260222_179%2F1771731831579ycS43_JPEG%2F4873.jpg",
    video_ids: [],
    extra: {
      emoji: "🍝",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:10",
          },
          {
            day: "화",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:10",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:10",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:10",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:10",
          },
          {
            day: "토",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:10",
          },
          {
            day: "일",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:10",
          },
        ],
        note: "라스트오더 20:10",
      },
    },
  },
  {
    id: "home-place-huchu-point-gangnam",
    name: "후추포인트",
    category: "맛집",
    description:
      "강남 봉은사로의 양식집. 초당옥수수 뇨끼, 클래식 라자냐, 투움바 파스타를 맛볼 수 있어요.",
    address_sg: "서울특별시 강남구",
    address_road: "서울특별시 강남구 봉은사로6길 30 1층",
    naver_place_id: "1007886570",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231006_26%2F16965713505793lmMx_JPEG%2F%25C8%25C4%25C3%25DF%25C6%25F7%25C0%25CE%25C6%25AE_%25C3%25CA%25B4%25E7.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍝",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "22:00",
            break: { start: "16:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "화",
            open: "11:00",
            close: "22:00",
            break: { start: "16:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "수",
            open: "11:00",
            close: "22:00",
            break: { start: "16:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "목",
            open: "11:00",
            close: "22:00",
            break: { start: "16:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "금",
            open: "11:00",
            close: "22:00",
            break: { start: "16:00", end: "17:00" },
            last: "21:00",
          },
          { day: "토", open: "11:00", close: "22:00", last: "21:00" },
          { day: "일", open: "11:00", close: "22:00", last: "21:00" },
        ],
        note: "라스트오더 21:00",
      },
    },
  },
  {
    id: "home-place-pho-hang-jongno",
    name: "베트남쌀국수PhoHang",
    category: "맛집",
    description:
      "종로의 베트남 쌀국수집. 쇠고기 쌀국수, 반미, 월남쌈을 맛볼 수 있고 새벽 2시까지 영업해요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 종로 309-3",
    naver_place_id: "1136049424",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20210528_31%2F1622190692898fENWL_JPEG%2FgM60G5tmKtsSuLu5ZABpftQg.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "02:00" },
          { day: "화", open: "11:00", close: "02:00" },
          { day: "수", open: "11:00", close: "02:00" },
          { day: "목", open: "11:00", close: "02:00" },
          { day: "금", open: "11:00", close: "02:00" },
          { day: "토", open: "11:00", close: "02:00" },
          { day: "일", open: "11:00", close: "02:00" },
        ],
      },
    },
  },
  {
    id: "home-place-cheonha-bossam",
    name: "천하보쌈",
    category: "맛집",
    description:
      "창덕궁 근처의 보쌈집. 보쌈 정식, 쟁반국수, 불고기정식을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 창덕궁1길 8 천하보쌈",
    naver_place_id: "13575188",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20210515_73%2F1621061980882bfPQy_JPEG%2FeFDOAqWiU03tfN2YqUC6USwU.jpeg.jpg",
    video_ids: [],
    extra: {
      emoji: "🥬",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "일",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
        ],
        note: "라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-anam-bukchon",
    name: "안암",
    category: "맛집",
    description:
      "북촌의 돼지국밥집. 돼지 안심 튀김과 고수를 더한 안암 국밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 북촌로5길 10 안암",
    naver_place_id: "1580604511",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240401_287%2F1711979330990gOdOp_JPEG%2F%25BE%25C8%25BE%25CF_%25C0%25BD%25BD%25C4_015.jpg",
    video_ids: [],
    extra: {
      emoji: "🍲",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:10",
          },
          {
            day: "화",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:10",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:10",
          },
          { day: "목", open: "11:30", close: "21:00", last: "20:10" },
          { day: "금", open: "11:30", close: "21:00", last: "20:10" },
          { day: "토", open: "11:30", close: "21:00", last: "20:10" },
          { day: "일", open: "11:30", close: "21:00", last: "20:10" },
        ],
        note: "라스트오더 20:10",
      },
    },
  },
  {
    id: "home-place-jinsim-seochon",
    name: "진심",
    category: "맛집",
    description:
      "서촌의 일식 덮밥집. 연어덮밥, 생연어 · 아부리덮밥, 육회소고기덮밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 필운대로 42-1 1층",
    naver_place_id: "1739279755",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260318_67%2F1773812120802DLYRc_PNG%2Ffile_0000000057ec72069de7b87dbd07eae2.png",
    video_ids: [],
    extra: {
      emoji: "🍣",
      hours: {
        week: [
          {
            day: "월",
            open: "11:40",
            close: "20:00",
            break: { start: "15:00", end: "17:10" },
          },
          { day: "화", open: "11:40", close: "15:00" },
          {
            day: "수",
            open: "11:40",
            close: "20:00",
            break: { start: "15:00", end: "17:10" },
          },
          {
            day: "목",
            open: "11:40",
            close: "20:00",
            break: { start: "15:00", end: "17:10" },
          },
          {
            day: "금",
            open: "11:40",
            close: "20:00",
            break: { start: "15:00", end: "17:10" },
          },
          {
            day: "토",
            open: "12:00",
            close: "20:00",
            break: { start: "15:00", end: "17:10" },
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-aloy-makmak",
    name: "알로이막막",
    category: "맛집",
    description:
      "서촌의 태국 음식점. 옥수수 쏨땀과 소고기 쌀국수, 팟타이를 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 자하문로7길 30 1,2층",
    naver_place_id: "1422397263",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220207_78%2F1644212431509HKd19_PNG%2F375411FB-03F7-47FD-9AC0-F67CF5817653.png",
    video_ids: [],
    extra: {
      emoji: "🥗",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "21:00", last: "20:00" },
          { day: "화", open: "11:30", close: "21:00", last: "20:00" },
          { day: "수", open: "11:30", close: "21:00", last: "20:00" },
          { day: "목", open: "11:30", close: "21:00", last: "20:00" },
          { day: "금", open: "11:30", close: "21:00", last: "20:00" },
          { day: "토", open: "11:30", close: "21:00", last: "20:00" },
          { day: "일", open: "11:30", close: "21:00", last: "20:00" },
        ],
        note: "라스트오더 20:00",
      },
    },
  },
  {
    id: "home-place-gwanghwamun-mijin",
    name: "광화문미진",
    category: "맛집",
    description:
      "광화문의 메밀국수집. 1950년대부터 이어온 냉메밀과 온메밀, 비빔메밀을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 종로 19 르메이에르종로타운1 1층",
    naver_place_id: "11680222",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240723_19%2F1721737944632b2tCb_JPEG%2FKakaoTalk_20240723_171426051_01.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          { day: "월", open: "10:30", close: "21:00", last: "20:30" },
          { day: "화", open: "10:30", close: "21:00", last: "20:30" },
          { day: "수", open: "10:30", close: "21:00", last: "20:30" },
          { day: "목", open: "10:30", close: "21:00", last: "20:30" },
          { day: "금", open: "10:30", close: "21:00", last: "20:30" },
          { day: "토", open: "10:30", close: "21:00", last: "20:30" },
          { day: "일", open: "10:30", close: "21:00", last: "20:30" },
        ],
        note: "라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-la-cantina-euljiro",
    name: "라칸티나",
    category: "맛집",
    description:
      "을지로입구의 이탈리안 레스토랑. 정통 이탈리아 요리와 스파게티 봉골레를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 을지로 19 삼성빌딩 지하1층",
    naver_place_id: "11724317",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150831_248%2F1441029587727TuiYu_JPEG%2F156155406251607_0.jpg",
    video_ids: [],
    extra: {
      emoji: "🍝",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "화",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "수",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "목",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "금",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "토",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "점심 라스트오더 13:50, 저녁 라스트오더 20:50 · 매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-hyogye-euljiro",
    name: "효계 을지로점",
    category: "맛집",
    description:
      "을지로의 숯불 닭갈비집. 모듬, 다리살 소금구이와 양념구이를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 을지로12길 17 1층",
    naver_place_id: "1970041528",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240829_164%2F17249302605092QfYo_JPEG%2F20240829_153649.jpg",
    video_ids: [],
    extra: {
      emoji: "🍗",
      hours: {
        week: [
          { day: "월", open: "17:00", close: "23:30", last: "22:30" },
          { day: "화", open: "17:00", close: "23:30", last: "22:30" },
          { day: "수", open: "17:00", close: "23:30", last: "22:30" },
          { day: "목", open: "17:00", close: "23:30", last: "22:30" },
          { day: "금", open: "17:00", close: "23:30", last: "22:30" },
          { day: "토", open: "16:00", close: "23:30", last: "22:30" },
          { day: "일", open: "16:00", close: "23:30", last: "22:30" },
        ],
        note: "라스트오더 22:30",
      },
    },
  },
  {
    id: "home-place-sarangbang-kalguksu",
    name: "사랑방칼국수",
    category: "맛집",
    description:
      "충무로의 1969년 개업 한식당. 닭 육수 칼국수와 백숙백반 한상을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로27길 46",
    naver_place_id: "11720161",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250716_191%2F1752666128484ejl8D_JPEG%2FKakaoTalk_20250716_203956695_01.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          { day: "월", open: "10:00", close: "21:40" },
          { day: "화", open: "10:00", close: "21:40" },
          { day: "수", open: "10:00", close: "21:40" },
          { day: "목", open: "10:00", close: "21:40" },
          { day: "금", open: "10:00", close: "21:40" },
          { day: "토", open: "10:00", close: "21:00" },
          { day: "일", open: "10:00", close: "21:00" },
        ],
        note: "매달 첫째 일요일 휴무",
      },
    },
  },
  {
    id: "home-place-oldies-taco-euljiro",
    name: "올디스타코 을지로 본점",
    category: "맛집",
    description:
      "을지로의 작은 타코집. 올디스타코, 비리아타코, 타코라이스를 맛볼 수 있고 연중무휴예요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 충무로4길 3 1층 (한신빌딩)",
    naver_place_id: "1253387841",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250407_272%2F1743961263090CnqxV_JPEG%2FKakaoTalk_20241202_214920733.jpg",
    video_ids: [],
    extra: {
      emoji: "🌮",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "21:00" },
          { day: "화", open: "11:30", close: "21:00" },
          { day: "수", open: "11:30", close: "21:00" },
          { day: "목", open: "11:30", close: "21:00" },
          { day: "금", open: "11:30", close: "21:00" },
          { day: "토", open: "11:30", close: "21:00" },
          { day: "일", open: "11:30", close: "21:00" },
        ],
      },
    },
  },
  {
    id: "home-place-hwayukgye",
    name: "화육계",
    category: "맛집",
    description:
      "힙지로의 숯불 닭발 · 족발집. 무뼈닭발, 트러플닭발, 몬스터 계란말이를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 을지로14길 21 1층",
    naver_place_id: "1101323127",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230112_30%2F1673502572454FQYTR_JPEG%2F2.jpg",
    video_ids: [],
    extra: {
      emoji: "🔥",
      hours: {
        week: [
          { day: "월", open: "16:00", close: "22:30", last: "21:00" },
          { day: "화", open: "16:00", close: "22:30", last: "21:00" },
          { day: "수", open: "16:00", close: "22:30", last: "21:00" },
          { day: "목", open: "16:00", close: "22:30", last: "21:00" },
          { day: "금", open: "16:00", close: "22:30", last: "21:00" },
          { day: "토", open: "15:00", close: "23:00", last: "21:30" },
          { day: "일", open: "15:00", close: "23:00", last: "21:30" },
        ],
        note: "라스트오더 21:00",
      },
    },
  },
  {
    id: "home-place-jaya-chungmuro",
    name: "자야",
    category: "맛집",
    description:
      "충무로의 호프집. 감자튀김과 제육, 마늘간장닭튀김, 돈까스와 김치나베를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 충무로 42 1층",
    naver_place_id: "1063757405",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230711_294%2F16890875802734cu6f_JPEG%2FKakaoTalk_20230711_235324766_05.jpg",
    video_ids: [],
    extra: {
      emoji: "🍺",
      hours: {
        week: [
          { day: "월", open: "11:30", close: "24:00", last: "23:00" },
          { day: "화", open: "11:30", close: "24:00", last: "23:00" },
          { day: "수", open: "11:30", close: "24:00", last: "23:00" },
          { day: "목", open: "11:30", close: "24:00", last: "23:00" },
          { day: "금", open: "11:30", close: "24:00", last: "23:00" },
          { day: "토", open: "12:00", close: "24:00", last: "23:00" },
          { day: "일", open: "12:00", close: "24:00", last: "23:00" },
        ],
        note: "라스트오더 23:00",
      },
    },
  },
  {
    id: "home-place-seven-point-eight-euljiro",
    name: "7.8 을지로",
    category: "맛집",
    description:
      "을지로의 막걸리 술집. 바질감자전, 등심크림떡볶이, 항정수육 같은 한식 퓨전 안주를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 창경궁로8길 22-7",
    naver_place_id: "1015130692",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231005_20%2F1696476226529eOEcQ_JPEG%2FIMG_1699.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍶",
      hours: {
        week: [
          { day: "월", open: "17:00", close: "24:00" },
          { day: "화", open: "17:00", close: "24:00" },
          { day: "수", open: "17:00", close: "24:00" },
          { day: "목", open: "17:00", close: "24:00" },
          { day: "금", open: "17:00", close: "24:00" },
          { day: "토", open: "16:00", close: "24:00" },
          { day: "일", open: "17:00", close: "24:00" },
        ],
      },
    },
  },
  {
    id: "home-place-jeonjabang-pildong",
    name: "전자방 필동점",
    category: "맛집",
    description:
      "필동의 중식당. 곱창탕면, 쉬림프 차우멘, 삼선짬뽕을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로44길 21 1층",
    naver_place_id: "2032433763",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260507_44%2F1778121515220U0JVt_JPEG%2F1758702796052.jpg",
    video_ids: [],
    extra: {
      emoji: "🥢",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:30",
            break: { start: "14:30", end: "17:00" },
            last: "20:30",
          },
          { day: "토", open: "12:00", close: "21:00", last: "20:00" },
          { day: "일", open: "12:00", close: "21:00", last: "20:00" },
        ],
        note: "라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-heehee-katsu-chungmuro",
    name: "희희카츠 충무로점",
    category: "맛집",
    description:
      "충무로의 일식 돈까스 · 소바 전문점. 소바 등심세트와 안심세트, 치즈세트를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로36길 36 1층 희희카츠",
    naver_place_id: "1294003190",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250404_107%2F1743696126055eQd0N_JPEG%2F1743696057855.jpg",
    video_ids: [],
    extra: {
      emoji: "🍱",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "화",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "수",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "목",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "금",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          {
            day: "토",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "점심 라스트오더 14:30 · 매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-pildong-katsu",
    name: "필동카츠",
    category: "맛집",
    description:
      "충무로 필동의 프리미엄 카츠동 전문점. 직접 숙성한 돈까스를 올린 덮밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 필동로 7-3 1층",
    naver_place_id: "1414550429",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241003_137%2F1727925340783kBbA4_JPEG%2FKakaoTalk_20231230_134232918_01.jpg",
    video_ids: [],
    extra: {
      emoji: "🍱",
      hours: {
        week: [
          { day: "월", open: "10:30", close: "21:00", last: "20:20" },
          { day: "화", open: "10:30", close: "21:00", last: "20:20" },
          { day: "수", open: "10:30", close: "21:00", last: "20:20" },
          { day: "목", open: "10:30", close: "21:00", last: "20:20" },
          { day: "금", open: "10:30", close: "21:00", last: "20:20" },
          {
            day: "토",
            open: "10:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:20",
          },
          {
            day: "일",
            open: "10:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:20",
          },
        ],
        note: "라스트오더 20:20",
      },
    },
  },
  {
    id: "home-place-pildong-myeonok",
    name: "필동면옥",
    category: "맛집",
    description:
      "남산골한옥마을 근처의 평양냉면집. 냉면과 평양식 만두, 편육을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 서애로 26",
    naver_place_id: "11678838",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220815_107%2F1660543682523qkdYr_JPEG%2FScreenshot_20220813-201908_Instagram.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "19:50",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "화",
            open: "11:00",
            close: "19:50",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "수",
            open: "11:00",
            close: "19:50",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "목",
            open: "11:00",
            close: "19:50",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "금",
            open: "11:00",
            close: "19:50",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "토",
            open: "11:00",
            close: "19:50",
            break: { start: "15:00", end: "17:00" },
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-taehwaru",
    name: "태화루",
    category: "맛집",
    description:
      "퇴계로의 중식당. 잡채밥, 잡탕밥, 삼선볶음밥, 삼선울면을 맛볼 수 있고 평일 점심에만 운영해요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로50길 37",
    naver_place_id: "1700640711",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190607_97%2F1559916257380Nh61e_PNG%2FZ2tDtgpOoMWhN4-ZR8V9tZ82.png",
    video_ids: [],
    extra: {
      emoji: "🥢",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "15:30", last: "14:50" },
          { day: "화", open: "11:00", close: "15:30", last: "14:50" },
          { day: "수", open: "11:00", close: "15:30", last: "14:50" },
          { day: "목", open: "11:00", close: "15:30", last: "14:50" },
          { day: "금", open: "11:00", close: "15:30", last: "14:50" },
          { day: "토", open: "", close: "", closed: true },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 14:50 · 매주 토 · 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-susanna-apron",
    name: "수잔나의 앞치마",
    category: "카페,디저트",
    description:
      "을지로의 베이커리 카페. 아트와 베이커리, 커피가 한 공간에 어우러진 복합문화공간이에요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로49길 24",
    naver_place_id: "1804950881",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20251119_36%2F17635367794915S2n9_JPEG%2FKakaoTalk_20251119_161139296.jpg",
    image_fit: "contain",
    image_bg: "#ffffff",
    video_ids: [],
    extra: {
      emoji: "🥐",
      hours: {
        week: [
          { day: "월", open: "08:00", close: "22:00" },
          { day: "화", open: "08:00", close: "22:00" },
          { day: "수", open: "08:00", close: "22:00" },
          { day: "목", open: "08:00", close: "22:00" },
          { day: "금", open: "08:00", close: "22:00" },
          { day: "토", open: "08:00", close: "22:00" },
          { day: "일", open: "08:00", close: "22:00" },
        ],
      },
    },
  },
  {
    id: "home-place-conde-pepe",
    name: "콘드에뻬뻬",
    category: "맛집",
    description:
      "장충동의 낮에는 브런치바, 저녁에는 와인바로 운영하는 곳. 프렌치토스트와 토마토 부라타 샐러드를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 장충단로8길 21 1층",
    naver_place_id: "1777182536",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20230502_85%2F1683038580467Jwqrt_JPEG%2FA885E121-12AF-4856-A8A3-DD8A3B5337E6.jpeg",
    video_ids: [],
    extra: {
      emoji: "🥂",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:00",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:00",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:00",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:00",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:00",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:00",
          },
          {
            day: "일",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:00",
          },
        ],
        note: "라스트오더 20:00 · 이용시간 최대 2시간",
      },
    },
  },
  {
    id: "home-place-pyongyang-myeonok",
    name: "평양면옥",
    category: "맛집",
    description:
      "장충동에서 3대째 이어온 평양냉면집. 냉면, 비빔냉면, 온면을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 장충단로 207",
    naver_place_id: "13578191",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260909_25%2F1788953027880522gx_JPEG%2F1._%25C7%25C3%25B7%25B9%25C0%25CC%25BD%25BA_%25BD%25E6%25B3%25D7%25C0%25CF_v2.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "11:00", close: "21:30", last: "21:00" },
          { day: "수", open: "11:00", close: "21:30", last: "21:00" },
          { day: "목", open: "11:00", close: "21:30", last: "21:00" },
          { day: "금", open: "11:00", close: "21:30", last: "21:00" },
          { day: "토", open: "11:00", close: "21:30", last: "21:00" },
          { day: "일", open: "11:00", close: "21:30", last: "21:00" },
        ],
        note: "라스트오더 21:00 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-mokmyeok-sanbang",
    name: "목멱산방",
    category: "맛집",
    description:
      "남산 아래의 비빔밥집. 산방 비빔밥, 투뿔 한우 육회 비빔밥, 치즈 김치전을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로20길 71 1층 목멱산방",
    naver_place_id: "13573290",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190208_292%2F1549607629901nLwo5_JPEG%2FOy8UmpFqERqgcAnWA5zOIdVE.jpg",
    video_ids: [],
    extra: {
      emoji: "🍚",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "20:00", last: "19:20" },
          { day: "화", open: "11:00", close: "20:00", last: "19:20" },
          { day: "수", open: "11:00", close: "20:00", last: "19:20" },
          { day: "목", open: "11:00", close: "20:00", last: "19:20" },
          { day: "금", open: "11:00", close: "20:00", last: "19:20" },
          { day: "토", open: "11:00", close: "20:00", last: "19:20" },
          { day: "일", open: "11:00", close: "20:00", last: "19:20" },
        ],
        note: "라스트오더 19:20",
      },
    },
  },
  {
    id: "home-place-coin-myeongdong-1",
    name: "코인 명동1호점",
    category: "카페,디저트",
    description:
      "1993년 문을 연 명동의 앤티크 카페. 코인블랜드커피와 밀크티빙수, 와플을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 명동6길 10",
    naver_place_id: "31575946",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220114_101%2F1642156778932XseSV_JPEG%2FPageCommunity-06-min.jpg",
    video_ids: [],
    extra: {
      emoji: "☕",
      hours: {
        week: [
          { day: "월", open: "09:30", close: "22:30" },
          { day: "화", open: "09:30", close: "23:00" },
          { day: "수", open: "09:30", close: "23:00" },
          { day: "목", open: "09:30", close: "23:00" },
          { day: "금", open: "09:30", close: "23:00" },
          { day: "토", open: "09:30", close: "23:00" },
          { day: "일", open: "09:30", close: "22:30" },
        ],
      },
    },
  },
  {
    id: "home-place-lanzhou-kalmyeon",
    name: "란주칼면",
    category: "맛집",
    description:
      "명동의 도삭면 전문 중식당. 수제 탕수만두, 꿔바로우, 간자장 도삭면을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 소공로 64 1층 란주칼면",
    naver_place_id: "13063884",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20241014_222%2F1728889255844LWuBo_PNG%2F%25BD%25BA%25C5%25A9%25B8%25B0%25BC%25A6_2024-10-14_160045.png",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "21:20", last: "20:30" },
          { day: "화", open: "11:00", close: "21:20", last: "20:30" },
          { day: "수", open: "11:00", close: "21:20", last: "20:30" },
          { day: "목", open: "11:00", close: "21:20", last: "20:30" },
          { day: "금", open: "11:00", close: "21:20", last: "20:30" },
          { day: "토", open: "11:00", close: "21:20", last: "20:30" },
          { day: "일", open: "11:00", close: "21:20", last: "20:30" },
        ],
        note: "라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-jeongdon-daehakro",
    name: "정돈 대학로본점",
    category: "맛집",
    description:
      "대학로의 돈카츠 전문점. 등심돈카츠와 A · B · C 세트를 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 대학로9길 12 지층",
    naver_place_id: "37126807",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250313_144%2F1741859214238k8DKH_JPEG%2F%2528%25B3%25D7%25C0%25CC%25B9%25F6%2529%25C1%25A4%25B5%25B7_%25BD%25BA%25C5%25C4%25B4%25D9%25B5%25E5_%25B7%25CE%25B0%25ED_%25281%2529.jpg",
    video_ids: [],
    extra: {
      emoji: "🍱",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "화",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "토",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "일",
            open: "11:30",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
        ],
        note: "점심 라스트오더 14:30, 저녁 라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-santyome-seorae",
    name: "산쪼메 서래본점",
    category: "맛집",
    description:
      "서래마을의 일본 라멘집. 돈코츠라멘, 쇼유라멘, 시오버터라멘을 맛볼 수 있어요.",
    address_sg: "서울특별시 서초구",
    address_road: "서울특별시 서초구 서래로7길 15 102호",
    naver_place_id: "1671923943",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250625_17%2F1750838980264Yw4WL_JPEG%2FIMG_0586.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "21:00", last: "20:20" },
          { day: "화", open: "11:00", close: "21:00", last: "20:20" },
          { day: "수", open: "11:00", close: "21:00", last: "20:20" },
          { day: "목", open: "11:00", close: "21:00", last: "20:20" },
          { day: "금", open: "11:00", close: "21:00", last: "20:20" },
          { day: "토", open: "11:00", close: "21:00", last: "20:20" },
          { day: "일", open: "11:00", close: "21:00", last: "20:20" },
        ],
        note: "라스트오더 20:20",
      },
    },
  },
  {
    id: "home-place-samcheongdong-sujebi",
    name: "삼청동수제비",
    category: "맛집",
    description:
      "삼청동의 수제비집. 수제비와 찹쌀새알옹심이, 파전을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 삼청로 101-1",
    naver_place_id: "11569605",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20160203_208%2F1454484609178txceK_JPEG%2F176153566028054_0.jpg",
    video_ids: [],
    extra: {
      emoji: "🍲",
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
    id: "home-place-woo-lae-oak",
    name: "우래옥",
    category: "맛집",
    description:
      "1946년 문을 연 평양냉면 노포. 평양냉면, 비빔냉면, 온면을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 창경궁로 62-29",
    naver_place_id: "11679381",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150831_131%2F1441017839808DchkO_JPEG%2F11679381_0.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "11:30", close: "21:00", last: "20:20" },
          { day: "수", open: "11:30", close: "21:00", last: "20:20" },
          { day: "목", open: "11:30", close: "21:00", last: "20:20" },
          { day: "금", open: "11:30", close: "21:00", last: "20:20" },
          { day: "토", open: "11:30", close: "21:00", last: "20:20" },
          { day: "일", open: "11:30", close: "21:00", last: "20:20" },
        ],
        note: "라스트오더 20:20 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-jungin-myeonok",
    name: "정인면옥 본점",
    category: "맛집",
    description:
      "여의도의 평양냉면집. 한우 아롱사태 수육, 암퇘지 편육, 접시만두를 맛볼 수 있고 휴무 없이 매일 열어요.",
    address_sg: "서울특별시 영등포구",
    address_road:
      "서울특별시 영등포구 국회대로76길 10 기독교침례회총회빌딩 1층",
    naver_place_id: "34883067",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150817_194%2F1439805575421MQFMH_JPEG%2F166767588953726_0.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
          {
            day: "일",
            open: "11:00",
            close: "21:00",
            break: { start: "15:30", end: "17:00" },
            last: "20:30",
          },
        ],
        note: "라스트오더 21:00",
      },
    },
  },
  {
    id: "home-place-jinjin-hapjeong",
    name: "진진",
    category: "맛집",
    description:
      "합정역 근처의 중식당. 대게살볶음, 깐풍기, 멘보샤, 마파두부를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 월드컵북로1길 60 1층 진진",
    naver_place_id: "36202928",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220318_112%2F1647591501689rhuOO_JPEG%2F%25B8%25E0%25BA%25B8%25BB%25FE.jpg",
    video_ids: [],
    extra: {
      emoji: "🥢",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "화",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "수",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "목",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "금",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "토",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
          },
          {
            day: "일",
            open: "12:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
          },
        ],
        note: "점심 라스트오더 14:30",
      },
    },
  },
  {
    id: "home-place-okdol-hyeonok",
    name: "옥돌현옥",
    category: "맛집",
    description:
      "송파의 평양냉면집. 자가제분 메밀면의 평양 물냉면과 돼지곰탕, 어복쟁반을 맛볼 수 있어요.",
    address_sg: "서울특별시 송파구",
    address_road: "서울특별시 송파구 법원로 55 송파아이파크 D존 1층 옥돌현옥",
    naver_place_id: "1101561233",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260714_143%2F1784010578077X6wwA_JPEG%2F1784010329380.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "화",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "수",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "목",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "금",
            open: "11:00",
            close: "21:30",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "토",
            open: "11:00",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "21:00",
          },
          {
            day: "일",
            open: "11:00",
            close: "21:30",
            break: { start: "15:30", end: "17:00" },
            last: "21:00",
          },
        ],
        note: "라스트오더 21:00",
      },
    },
  },
  {
    id: "home-place-jaha-son-mandu",
    name: "자하손만두",
    category: "맛집",
    description:
      "인왕산과 북악산 사이의 만두 전문점. 만두국, 떡만두국, 만두전골을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 백석동길 12",
    naver_place_id: "11688084",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150831_6%2F1441020098030SFeGV_JPEG%2F11688084_0.jpg",
    video_ids: [],
    extra: {
      emoji: "🥟",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "11:00", close: "21:00", last: "20:15" },
          { day: "수", open: "11:00", close: "21:00", last: "20:15" },
          { day: "목", open: "11:00", close: "21:00", last: "20:15" },
          { day: "금", open: "11:00", close: "21:00", last: "20:15" },
          { day: "토", open: "11:00", close: "21:00", last: "20:15" },
          { day: "일", open: "11:00", close: "21:00", last: "20:15" },
        ],
        note: "라스트오더 20:15 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-halmaejip-sajik",
    name: "할매집",
    category: "맛집",
    description: "사직동의 족발 · 감자탕집. 족발과 감자탕을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 사직로12길 1-5",
    naver_place_id: "19489992",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220825_206%2F1661416460729UCqPC_JPEG%2F20220823_172634.jpg",
    video_ids: [],
    extra: {
      emoji: "🍖",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "17:00", close: "21:00" },
          {
            day: "수",
            open: "11:50",
            close: "21:00",
            break: { start: "14:00", end: "17:00" },
          },
          {
            day: "목",
            open: "11:50",
            close: "21:00",
            break: { start: "14:00", end: "17:00" },
          },
          {
            day: "금",
            open: "11:50",
            close: "21:00",
            break: { start: "14:00", end: "17:00" },
          },
          {
            day: "토",
            open: "11:50",
            close: "21:00",
            break: { start: "14:00", end: "17:00" },
          },
          {
            day: "일",
            open: "11:50",
            close: "21:00",
            break: { start: "14:00", end: "17:00" },
          },
        ],
        note: "매주 월요일 정기휴무 · 화요일은 저녁만 영업",
      },
    },
  },
  {
    id: "home-place-hwangsaengga-kalguksu",
    name: "황생가칼국수",
    category: "맛집",
    description:
      "북촌의 칼국수 · 만두 전문점. 사골칼국수와 왕만두, 콩국수를 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 북촌로5길 78",
    naver_place_id: "11679429",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150831_243%2F1441017851923x0Ai7_PNG%2F11679429_0.png",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "21:30", last: "20:30" },
          { day: "화", open: "11:00", close: "21:30", last: "20:30" },
          { day: "수", open: "11:00", close: "21:30", last: "20:30" },
          { day: "목", open: "11:00", close: "21:30", last: "20:30" },
          { day: "금", open: "11:00", close: "21:30", last: "20:30" },
          { day: "토", open: "11:00", close: "21:30", last: "20:30" },
          { day: "일", open: "11:00", close: "21:30", last: "20:30" },
        ],
        note: "라스트오더 20:30",
      },
    },
  },
  {
    id: "home-place-sarukame-yeonnam",
    name: "사루카메",
    category: "맛집",
    description:
      "연남동의 라멘집. 꽃게 바지락 라멘과 명물 바지락 라멘, 클리어 멸치 라멘을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 연남로 15 1층",
    naver_place_id: "1763607050",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260826_203%2F1787709157089osYsG_JPEG%2FIMG_2668.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:00",
          },
          {
            day: "화",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:00",
          },
          {
            day: "수",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:00",
          },
          {
            day: "목",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:00",
          },
          {
            day: "금",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:00",
          },
          {
            day: "토",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:00",
          },
          {
            day: "일",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:30" },
            last: "20:00",
          },
        ],
        note: "점심 라스트오더 14:30, 저녁 라스트오더 20:00 · 영업 여부는 가게 인스타그램 공지 확인",
      },
    },
  },
  {
    id: "home-place-gaeseong-mandu-koong",
    name: "개성만두 궁",
    category: "맛집",
    description:
      "인사동의 개성 만두 전문점. 전통 한옥에서 고기만두전골, 김치만두전골, 조랭이떡 만두국을 맛볼 수 있어요.",
    address_sg: "서울특별시 종로구",
    address_road: "서울특별시 종로구 인사동10길 11-3",
    naver_place_id: "11590805",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150831_202%2F1441000925399V9SHE_JPEG%2F11590805_0.jpg",
    video_ids: [],
    extra: {
      emoji: "🥟",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "20:00",
            break: { start: "14:20", end: "16:00" },
            last: "19:10",
          },
          {
            day: "화",
            open: "11:30",
            close: "20:00",
            break: { start: "14:20", end: "16:00" },
            last: "19:10",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "16:00" },
            last: "20:40",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "16:00" },
            last: "20:40",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:30",
            break: { start: "15:00", end: "16:00" },
            last: "20:40",
          },
          { day: "토", open: "11:30", close: "21:30", last: "20:40" },
          { day: "일", open: "11:30", close: "20:00", last: "19:10" },
        ],
        note: "라스트오더 19:10",
      },
    },
  },
  {
    id: "home-place-neungdong-minari-sinyongsan",
    name: "능동미나리 신용산점",
    category: "맛집",
    description:
      "신용산의 곰탕집. 미나리를 올린 곰탕과 육회 비빔밥을 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로40길 28 1, 2층",
    naver_place_id: "1036043935",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20221219_147%2F1671413977277kfr7A_JPEG%2FIMG_6672.jpg",
    video_ids: [],
    extra: {
      emoji: "🍲",
      hours: {
        week: [
          { day: "월", open: "10:00", close: "23:00" },
          { day: "화", open: "10:00", close: "23:00" },
          { day: "수", open: "10:00", close: "23:00" },
          { day: "목", open: "10:00", close: "23:00" },
          { day: "금", open: "10:00", close: "23:00" },
          { day: "토", open: "09:30", close: "23:00" },
          { day: "일", open: "09:30", close: "23:00" },
        ],
      },
    },
  },
  {
    id: "home-place-damtaek-hapjeong",
    name: "담택",
    category: "맛집",
    description:
      "합정역 근처의 시오 라멘집. 시오라멘, 유자시오라멘, 와사비라멘을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 동교로12안길 51 1층",
    naver_place_id: "1068351637",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240621_87%2F1718932410349D9ACn_JPEG%2FF482F18E-8E01-4C71-846F-DCD0CD730DCA.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "화",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "토",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
          {
            day: "일",
            open: "11:30",
            close: "21:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:30",
          },
        ],
        note: "라스트오더 20:30 · 휴무일은 가게 인스타그램 달력 확인",
      },
    },
  },
  {
    id: "home-place-mapo-ok",
    name: "마포옥",
    category: "맛집",
    description:
      "마포의 설렁탕 · 곰탕집. 한우 양지탕과 한우 차돌탕을 맛볼 수 있고 아침 7시부터 열어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 토정로 312 1층 마포옥",
    naver_place_id: "11707372",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220802_1%2F1659396909271VwEfH_JPEG%2FC491A3B6-33C3-4CD7-8FCE-6781E41AF831.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍲",
      hours: {
        week: [
          { day: "월", open: "07:00", close: "21:00" },
          { day: "화", open: "07:00", close: "21:00" },
          { day: "수", open: "07:00", close: "21:00" },
          { day: "목", open: "07:00", close: "21:00" },
          { day: "금", open: "07:00", close: "21:00" },
          { day: "토", open: "07:00", close: "17:00" },
          { day: "일", open: "07:00", close: "17:00" },
        ],
      },
    },
  },
  {
    id: "home-place-lamant-secret-lescape",
    name: "레스케이프 라망 시크레",
    category: "맛집",
    description:
      "레스케이프 호텔 26층의 파인다이닝. 셰프 테이스팅 코스와 와인 페어링을 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로 67 레스케이프 호텔 26층",
    naver_place_id: "1282957326",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220620_4%2F1655718144444Mn9yn_JPEG%2F631_2222614544469344.jpg",
    bw_chef: { spoon: "white", note: "흑백요리사 2 손종원" },
    video_ids: [],
    extra: {
      emoji: "🍷",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          {
            day: "화",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          {
            day: "수",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          {
            day: "목",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          {
            day: "금",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          {
            day: "토",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "매주 월 · 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-eatanic-garden-chosun-palace",
    name: "조선 팰리스 이타닉 가든",
    category: "맛집",
    description:
      "조선 팰리스 36층의 한식 다이닝. 런치와 디너 코스를 맛볼 수 있어요.",
    address_sg: "서울특별시 강남구",
    address_road: "서울특별시 강남구 테헤란로 231 조선 팰리스 36층",
    naver_place_id: "1464664976",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220722_82%2F1658448529919dMIaC_JPEG%2F%25C4%25AB%25BF%25EE%25C5%25CDby%25C5%25C2%25C8%25A3cp.jpg",
    bw_chef: { spoon: "white", note: "흑백요리사 2 손종원" },
    video_ids: [],
    extra: {
      emoji: "🌿",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "", close: "", closed: true },
          {
            day: "수",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          {
            day: "목",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          {
            day: "금",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          {
            day: "토",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
          {
            day: "일",
            open: "12:00",
            close: "22:00",
            break: { start: "15:00", end: "18:00" },
          },
        ],
        note: "매주 월 · 화요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-pono-buono",
    name: "포노 부오노",
    category: "맛집",
    description:
      "도산대로의 양식 바. 포노 브레드를 맛볼 수 있고 저녁 6시부터 자정까지 영업해요.",
    address_sg: "서울특별시 강남구",
    address_road: "서울특별시 강남구 도산대로45길 8-7 2층",
    naver_place_id: "1283188906",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240417_227%2F1713322051268uTngp_PNG%2FIMG_3784.png",
    bw_chef: { spoon: "black", note: "흑백요리사 1 히든 천재 (김태성)" },
    video_ids: [],
    extra: {
      emoji: "🍷",
      hours: {
        week: [
          { day: "월", open: "18:00", close: "24:00", last: "21:45" },
          { day: "화", open: "18:00", close: "24:00", last: "21:45" },
          { day: "수", open: "18:00", close: "24:00", last: "21:45" },
          { day: "목", open: "18:00", close: "24:00", last: "21:45" },
          { day: "금", open: "18:00", close: "24:00", last: "21:45" },
          { day: "토", open: "18:00", close: "24:00", last: "21:45" },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 21:45 · 매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-fabri-kitchen",
    name: "파브리키친",
    category: "맛집",
    description:
      "언주로의 이탈리안 레스토랑. 파브리치오 페라리 셰프의 이탈리아 요리와 와인을 맛볼 수 있어요.",
    address_sg: "서울특별시 강남구",
    address_road: "서울특별시 강남구 언주로152길 14 2층",
    naver_place_id: "1775308300",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260726_295%2F17850500816446IwBh_JPEG%2F%25C6%25C4%25BA%25EA%25B8%25AE%25C5%25B0%25C4%25A3_%25B7%25CE%25B0%25ED.jpg",
    image_fit: "contain",
    image_bg: "#fff",
    video_ids: [],
    extra: {
      emoji: "🍝",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          {
            day: "화",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "18:00" },
            last: "20:45",
          },
          {
            day: "수",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "18:00" },
            last: "20:45",
          },
          {
            day: "목",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "18:00" },
            last: "20:45",
          },
          {
            day: "금",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "18:00" },
            last: "20:45",
          },
          {
            day: "토",
            open: "11:30",
            close: "21:30",
            break: { start: "14:30", end: "18:00" },
            last: "20:45",
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 20:45 · 매주 월 · 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-deepin-toegyero",
    name: "디핀",
    category: "맛집",
    description:
      "퇴계로의 다이닝 와인바. 음식과 와인, 음악을 함께 즐길 수 있고 저녁에만 열어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로 411 1층 디핀",
    naver_place_id: "1647309508",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20200615_244%2F15922088328893sxdB_JPEG%2FOy7UbLdcy3tyrvgpvfUjOjFr.jpg",
    video_ids: [],
    extra: {
      emoji: "🍷",
      hours: {
        week: [
          { day: "월", open: "18:00", close: "24:00" },
          { day: "화", open: "", close: "", closed: true },
          { day: "수", open: "18:00", close: "24:00" },
          { day: "목", open: "18:00", close: "24:00" },
          { day: "금", open: "18:00", close: "24:00" },
          { day: "토", open: "17:30", close: "24:00" },
          { day: "일", open: "17:30", close: "24:00" },
        ],
        note: "매주 화요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-brick-happy-food-hannam",
    name: "벽돌해피푸드 한남점",
    category: "맛집",
    description:
      "한남의 아메리칸 차이니즈 레스토랑. 마라탕면, 마라샹궈, 크림새우를 맛볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 이태원로 238 제2호 지하 1층",
    naver_place_id: "1193854870",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250916_280%2F1757993363771E3oh5_GIF%2FIMG_8038.gif",
    video_ids: [],
    extra: {
      emoji: "🥡",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "화",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "수",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "목",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "금",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "토",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
          {
            day: "일",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "20:50",
          },
        ],
        note: "라스트오더 20:50",
      },
    },
  },
  {
    id: "home-place-alfedo-itaewon",
    name: "알페도",
    category: "카페,디저트",
    description:
      "이태원의 터키 베이커리. 터키 전통 보렉과 카이막 세트를 맛볼 수 있고 24시간 열어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 이태원로 174 1층 4-5호",
    naver_place_id: "1233086327",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20200617_284%2F1592387272801zxGle_JPEG%2FtnJxU9Mnc-SlL27KYxXW_cQQ.jpeg.jpg",
    video_ids: [],
    extra: {
      emoji: "🥐",
      hours: {
        week: [
          { day: "월", open: "00:00", close: "24:00" },
          { day: "화", open: "00:00", close: "24:00" },
          { day: "수", open: "00:00", close: "24:00" },
          { day: "목", open: "00:00", close: "24:00" },
          { day: "금", open: "00:00", close: "24:00" },
          { day: "토", open: "00:00", close: "24:00" },
          { day: "일", open: "00:00", close: "24:00" },
        ],
      },
    },
  },
  {
    id: "home-place-ujeong-sindang",
    name: "우정",
    category: "맛집",
    description:
      "신당동 떡볶이 타운의 즉석떡볶이집. 즉석떡볶이, 해물떡볶이, 치즈떡볶이를 맛볼 수 있고 새벽 2시 반까지 열어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로76길 55",
    naver_place_id: "33878641",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20181226_26%2F1545831870337iMLS1_JPEG%2F__xIxpa_ZWWc1BXvQgzL-QY8.JPG.jpg",
    video_ids: [],
    extra: {
      emoji: "🍢",
      hours: {
        week: [
          { day: "월", open: "12:00", close: "02:30" },
          { day: "화", open: "12:00", close: "02:30" },
          { day: "수", open: "", close: "", closed: true },
          { day: "목", open: "12:00", close: "02:30" },
          { day: "금", open: "12:00", close: "02:30" },
          { day: "토", open: "12:00", close: "02:30" },
          { day: "일", open: "12:00", close: "02:30" },
        ],
        note: "매주 수요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-mabokrim-halmeoni",
    name: "마복림할머니집",
    category: "맛집",
    description:
      "신당동 떡볶이 골목의 떡볶이집. 2인 · 3인 · 4인 세트와 훈제계란 사리를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 다산로35길 5",
    naver_place_id: "38405139",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231225_212%2F1703468172520VQMek_JPEG%2FKakaoTalk_20231225_103343760.jpg",
    video_ids: [],
    extra: {
      emoji: "🍢",
      hours: {
        week: [
          { day: "월", open: "09:00", close: "22:50" },
          { day: "화", open: "09:00", close: "22:50" },
          { day: "수", open: "09:00", close: "22:50" },
          { day: "목", open: "09:00", close: "22:50" },
          { day: "금", open: "09:00", close: "22:50" },
          { day: "토", open: "09:00", close: "22:50" },
          { day: "일", open: "09:00", close: "22:50" },
        ],
      },
    },
  },
  {
    id: "home-place-brickhouse-toegyero",
    name: "브릭하우스",
    category: "카페,디저트",
    description:
      "퇴계로의 카페. 플레인 스콘과 파운드케이크를 맛볼 수 있고 아침 8시부터 밤 11시까지 열어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 퇴계로 456 1,2층",
    naver_place_id: "36939793",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20150930_214%2F14435960320377Ionk_JPEG%2FSUBMIT_1443596028661_36939793.jpg",
    video_ids: [],
    extra: {
      emoji: "☕",
      hours: {
        week: [
          { day: "월", open: "08:00", close: "23:00" },
          { day: "화", open: "08:00", close: "23:00" },
          { day: "수", open: "08:00", close: "23:00" },
          { day: "목", open: "08:00", close: "23:00" },
          { day: "금", open: "08:00", close: "23:00" },
          { day: "토", open: "08:00", close: "23:00" },
          { day: "일", open: "08:00", close: "23:00" },
        ],
      },
    },
  },
  {
    id: "home-place-aejeong-kalguksu",
    name: "애정칼국수",
    category: "맛집",
    description:
      "황학동의 칼국수집. 들깨옹심이, 멸치칼국수, 얼큰차돌칼국수를 맛볼 수 있어요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 난계로 179 1층",
    naver_place_id: "1939229375",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260919_294%2F17897916439475T4Gt_JPEG%2F816107D5-F0F0-4235-94D0-AC246F733581.jpg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "10:00",
            close: "21:00",
            break: { start: "15:00", end: "16:00" },
            last: "20:40",
          },
          {
            day: "화",
            open: "10:00",
            close: "21:00",
            break: { start: "15:00", end: "16:00" },
            last: "20:40",
          },
          {
            day: "수",
            open: "10:00",
            close: "21:00",
            break: { start: "15:00", end: "16:00" },
            last: "20:40",
          },
          {
            day: "목",
            open: "10:00",
            close: "21:00",
            break: { start: "15:00", end: "16:00" },
            last: "20:40",
          },
          {
            day: "금",
            open: "10:00",
            close: "21:00",
            break: { start: "15:00", end: "16:00" },
            last: "20:40",
          },
          { day: "토", open: "10:00", close: "21:00", last: "20:40" },
          { day: "일", open: "10:00", close: "21:00", last: "20:40" },
        ],
        note: "라스트오더 20:40",
      },
    },
  },
  {
    id: "home-place-heki-mangwon",
    name: "헤키",
    category: "맛집",
    description:
      "망원동의 콜드스모크 숙성 카츠 레스토랑. 히레카츠정식과 토리카츠정식을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 동교로9길 33 1층 헤키",
    naver_place_id: "1532303105",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190314_179%2F1552492720723gc5NW_JPEG%2FSwe4t4AkLSDTcfGCsvxJSy1u.jpg",
    image_position: "50% 78%",
    video_ids: [],
    extra: {
      emoji: "🍱",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "", close: "", closed: true },
          {
            day: "수",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "목",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "금",
            open: "11:30",
            close: "20:30",
            break: { start: "15:00", end: "17:00" },
            last: "20:00",
          },
          { day: "토", open: "11:30", close: "21:00", last: "20:30" },
          { day: "일", open: "11:30", close: "21:00", last: "20:30" },
        ],
        note: "점심 라스트오더 14:30, 저녁 라스트오더 20:00 · 매주 월 · 화요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-padong-mangwon",
    name: "파동",
    category: "맛집",
    description:
      "망원동의 일식집. 후토마끼, 바질소바, 마제소바를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 월드컵로17길 47 지하1층",
    naver_place_id: "1837278176",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240717_165%2F17212165408490hhVG_JPEG%2FIMG_1372.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍣",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "11:30", close: "21:00" },
          { day: "수", open: "11:30", close: "21:00" },
          { day: "목", open: "11:30", close: "21:00" },
          { day: "금", open: "11:30", close: "21:00" },
          { day: "토", open: "11:30", close: "21:00" },
          { day: "일", open: "11:30", close: "21:00" },
        ],
        note: "매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-ungjang-mangwon",
    name: "웅장",
    category: "맛집",
    description:
      "망리단길의 작은 중식 주점. 동파육, 어향가지새우, 마파두부를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 포은로 73 1층",
    naver_place_id: "1335794325",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20220606_270%2F16544948717080eNzR_JPEG%2F3F8F9F90-B534-4CAE-B47F-8153CC5DB386.jpeg",
    video_ids: [],
    extra: {
      emoji: "🥢",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "18:00", close: "24:00", last: "23:00" },
          { day: "수", open: "18:00", close: "24:00", last: "23:00" },
          { day: "목", open: "18:00", close: "24:00", last: "23:00" },
          { day: "금", open: "18:00", close: "24:00", last: "23:00" },
          { day: "토", open: "17:00", close: "24:00", last: "23:00" },
          { day: "일", open: "17:00", close: "24:00", last: "23:00" },
        ],
        note: "라스트오더 23:00 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-ichizen-mangwon",
    name: "이치젠",
    category: "맛집",
    description:
      "망원동의 텐동집. 주문과 동시에 튀겨 내는 이치젠텐동, 에비텐동, 아나고텐동을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 포은로 109",
    naver_place_id: "993406814",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20200323_131%2F1584894112549mbd0V_JPEG%2FCAfjdAzoaspJVcpDBNP9BwB-.jpeg.jpg",
    video_ids: [],
    extra: {
      emoji: "🍤",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          {
            day: "화",
            open: "12:00",
            close: "21:00",
            break: { start: "15:30", end: "17:30" },
            last: "20:30",
          },
          {
            day: "수",
            open: "12:00",
            close: "21:00",
            break: { start: "15:30", end: "17:30" },
            last: "20:30",
          },
          {
            day: "목",
            open: "12:00",
            close: "21:00",
            break: { start: "15:30", end: "17:30" },
            last: "20:30",
          },
          {
            day: "금",
            open: "12:00",
            close: "21:00",
            break: { start: "15:30", end: "17:30" },
            last: "20:30",
          },
          {
            day: "토",
            open: "12:00",
            close: "21:00",
            break: { start: "15:30", end: "17:30" },
            last: "20:30",
          },
          { day: "일", open: "12:00", close: "17:00", last: "16:30" },
        ],
        note: "점심 라스트오더 15:00, 저녁 라스트오더 20:30 · 매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-tacodot-mangwon-market",
    name: "타코닷 망원시장본점",
    category: "맛집",
    description:
      "망원시장 근처의 멕시칸 타코집. 오너 셰프의 타코를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 월드컵로19길 51 1층",
    naver_place_id: "1703442977",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20240425_91%2F171402769814088YvK_JPEG%2F%25B4%25DC%25C3%25BC_2.jpg",
    video_ids: [],
    extra: {
      emoji: "🌮",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "화",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "수",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "목",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "금",
            open: "11:30",
            close: "22:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:00",
          },
          {
            day: "토",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:00",
          },
          {
            day: "일",
            open: "11:30",
            close: "21:00",
            break: { start: "16:00", end: "17:00" },
            last: "20:00",
          },
        ],
        note: "점심 라스트오더 14:00, 저녁 라스트오더 21:00",
      },
    },
  },
  {
    id: "home-place-tamnaneun-don-hwayang",
    name: "탐나는돈 화양본점",
    category: "맛집",
    description:
      "건대 화양동의 고기집. 한우 뒷고기와 근고기, 오겹살을 맛볼 수 있어요.",
    address_sg: "서울특별시 광진구",
    address_road: "서울특별시 광진구 광나루로12길 22 1층 탐나는돈",
    naver_place_id: "31940962",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20190529_19%2F1559140153982RexvE_JPEG%2FE-HEDcUKIzrm_xdtrbxK84SL.jpg",
    video_ids: [],
    extra: {
      emoji: "🥩",
      hours: {
        week: [
          { day: "월", open: "16:30", close: "24:00" },
          { day: "화", open: "16:30", close: "24:00" },
          { day: "수", open: "16:30", close: "24:00" },
          { day: "목", open: "16:30", close: "24:00" },
          { day: "금", open: "16:30", close: "24:00" },
          { day: "토", open: "16:30", close: "24:00" },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-tea-nomad-mangwon",
    name: "티노마드",
    category: "카페,디저트",
    description:
      "망원동의 찻집. 말차 · 호지차 · 노마드차 세트와 2인 차빙세트를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 포은로 112 2층",
    naver_place_id: "1407848569",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20201008_141%2F1602146631107cqC8E_JPEG%2FyWLYLcVCmalg14g3bz4n4BDj.jpg",
    video_ids: [],
    extra: {
      emoji: "🍵",
      hours: {
        week: [
          { day: "월", open: "13:00", close: "20:30", last: "19:30" },
          { day: "화", open: "", close: "", closed: true },
          { day: "수", open: "13:00", close: "20:30", last: "19:30" },
          { day: "목", open: "", close: "", closed: true },
          { day: "금", open: "13:00", close: "20:30", last: "19:30" },
          { day: "토", open: "13:00", close: "20:30", last: "19:30" },
          { day: "일", open: "13:00", close: "20:30", last: "19:30" },
        ],
        note: "라스트오더 19:30 · 매주 화 · 목요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-beuno-mangwon",
    name: "베우노",
    category: "맛집",
    description:
      "망원동의 스페인 음식점. 빤 꼰 토마떼, 크로케따, 초리소와 튀긴 알감자를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 포은로8길 9 1층",
    naver_place_id: "1825365017",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20211212_153%2F1639316080193624Wi_JPEG%2F4DA2BB2B-1775-4EFC-A49F-C5AFA99B5934.jpeg",
    video_ids: [],
    extra: {
      emoji: "🥘",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "", close: "", closed: true },
          {
            day: "수",
            open: "12:00",
            close: "23:30",
            break: { start: "16:00", end: "18:00" },
            last: "21:30",
          },
          {
            day: "목",
            open: "12:00",
            close: "23:30",
            break: { start: "16:00", end: "18:00" },
            last: "21:30",
          },
          {
            day: "금",
            open: "12:00",
            close: "23:30",
            break: { start: "16:00", end: "18:00" },
            last: "21:30",
          },
          {
            day: "토",
            open: "12:00",
            close: "23:30",
            break: { start: "16:00", end: "18:00" },
            last: "21:30",
          },
          {
            day: "일",
            open: "12:00",
            close: "23:30",
            break: { start: "16:00", end: "18:00" },
            last: "21:30",
          },
        ],
        note: "라스트오더 21:30 · 매주 월 · 화요일 정기휴무 · 식사시간 2시간(뒤 예약이 없으면 제한 없음)",
      },
    },
  },
  {
    id: "home-place-pasado-mangwon",
    name: "파사도 망원",
    category: "카페,디저트",
    description:
      "망원동의 루프탑 갤러리 카페. 그릭요거트와 피그 라떼를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 포은로6길 9 파사도 망원",
    naver_place_id: "1367658278",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250326_24%2F1742935638827khpGO_JPEG%2FKakaoTalk_20250325_223613206_02.jpg",
    video_ids: [],
    extra: {
      emoji: "☕",
      hours: {
        week: [
          { day: "월", open: "12:00", close: "23:00" },
          { day: "화", open: "12:00", close: "23:00" },
          { day: "수", open: "12:00", close: "23:00" },
          { day: "목", open: "12:00", close: "23:00" },
          { day: "금", open: "12:00", close: "23:00" },
          { day: "토", open: "12:00", close: "23:00" },
          { day: "일", open: "12:00", close: "23:00" },
        ],
      },
    },
  },
  {
    id: "home-place-witwins-mangwon",
    name: "위트윈스",
    category: "카페,디저트",
    description:
      "망원동에서 쌍둥이 형제가 운영하는 카페. 직접 만든 바스크 치즈케이크를 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 월드컵로13길 55-26 1층 카페 witwins",
    naver_place_id: "2083218246",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20250912_252%2F1757657134328iSDCm_JPEG%2FIMG_0762.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍰",
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
        note: "라스트오더 21:30",
      },
    },
  },
  {
    id: "home-place-muksarang-mangwon",
    name: "묵사랑",
    category: "맛집",
    description:
      "망원동의 수제 도토리묵 가게. 당일 직접 쑨 도토리묵과 컵묵밥, 김치묵무침을 맛볼 수 있어요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 망원로 7-1 1층",
    naver_place_id: "2081662251",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260818_67%2F1787021439893rgh5c_JPEG%2FIMG_8849.jpg",
    video_ids: [],
    extra: {
      emoji: "🌰",
      hours: {
        week: [
          { day: "월", open: "", close: "", closed: true },
          { day: "화", open: "11:00", close: "17:00" },
          { day: "수", open: "11:00", close: "17:00" },
          { day: "목", open: "11:00", close: "17:00" },
          { day: "금", open: "11:00", close: "17:00" },
          { day: "토", open: "11:00", close: "17:00" },
          { day: "일", open: "11:00", close: "17:00" },
        ],
        note: "매주 월요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-pangz-songridan",
    name: "팡즈",
    category: "맛집",
    description:
      "송리단길의 아메리칸 차이니즈 음식점. 유포멘, 차오멘, 완탕멘, 비빔탄탄멘을 맛볼 수 있어요.",
    address_sg: "서울특별시 송파구",
    address_road: "서울특별시 송파구 백제고분로41길 27 103호, 104호",
    naver_place_id: "1024716440",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20231122_113%2F17006185810209R9Xs_JPEG%2FIMG_5278.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍜",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:50",
          },
          {
            day: "화",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:50",
          },
          {
            day: "수",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:50",
          },
          {
            day: "목",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:50",
          },
          {
            day: "금",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "21:50",
          },
          { day: "토", open: "11:30", close: "23:00", last: "21:50" },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 21:50 · 매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-nishikasai-songridan",
    name: "니시카사이",
    category: "맛집",
    description:
      "송리단길의 일본식 중화요리점. 창케라멘, 마파두부, 챠항, 오므라이스를 맛볼 수 있어요.",
    address_sg: "서울특별시 송파구",
    address_road: "서울특별시 송파구 백제고분로45길 5 1층",
    naver_place_id: "2017373651",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260326_105%2F1774495165328RkiGr_JPEG%2FIMG_6557.jpeg",
    video_ids: [],
    extra: {
      emoji: "🥢",
      hours: {
        week: [
          {
            day: "월",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "화",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "수",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "목",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "금",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          {
            day: "토",
            open: "11:30",
            close: "23:00",
            break: { start: "15:00", end: "17:00" },
            last: "22:00",
          },
          { day: "일", open: "", close: "", closed: true },
        ],
        note: "라스트오더 22:00 · 매주 일요일 정기휴무",
      },
    },
  },
  {
    id: "home-place-homies-pizza-main",
    name: "호미스피자 본점",
    category: "맛집",
    description:
      "분당 내정로의 피자집. 주문을 받으면 바로 만드는 피자를 맛볼 수 있고, 단체 주문은 하루 전에 예약해야 해요.",
    address_sg: "경기도 성남시",
    address_road: "경기도 성남시 분당구 내정로129번길 9 1층 Homies",
    naver_place_id: "1608815366",
    image_url:
      "https://static.wixstatic.com/media/8aa618_16128f57ea5544b382f426bccc5d0799~mv2.jpg/v1/fill/w_574,h_574,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/8aa618_16128f57ea5544b382f426bccc5d0799~mv2.jpg",
    video_ids: [],
    extra: {
      emoji: "🍕",
      hours: {
        week: [
          { day: "월", open: "11:00", close: "23:00" },
          { day: "화", open: "11:00", close: "23:00" },
          { day: "수", open: "11:00", close: "23:00" },
          { day: "목", open: "11:00", close: "23:00" },
          { day: "금", open: "11:00", close: "23:00" },
          { day: "토", open: "11:00", close: "23:00" },
          { day: "일", open: "11:00", close: "23:00" },
        ],
      },
    },
  },
];

/** 요즘 화제인 정도(0~100, 클수록 위) — 홈 "요즘 뜨는 곳"의 순서를 정하는 점수.
    특정 장소를 앞이나 뒤에 못박지 않고, 모든 장소를 같은 점수표로 줄 세운다. 순서를 바꾸고 싶으면 점수만 고친다.
    점수 = 네이버 지도 장소 페이지의 숫자(2026-10-26 확인)로 계산한 값:
      · 인기(70점 만점): 방문자 리뷰 수(60%)와 블로그 리뷰 수(40%)를 로그로 줄여서 반영
      · 평점(10점 만점): 네이버 방문자 평점(평점이 없는 곳은 중간값)
      · 미쉐린 가이드 서울 2026: 1스타 +8 · 빕 구르망 +5 · 선정(Plate) +2
      · 네이버가 "새로 오픈"으로 표시한 곳 +20
    리뷰 수는 쌓인 총량이라 오래된 곳이 유리하다. 그래서 최근 기사 · 입소문 · 신규 오픈 근거가 따로 있는 4곳(한정선, 고디바, 쇼니노,
    메이플스토리 이스케이프)은 위 계산값보다 낮지 않게 최소 점수를 정해 두었다(기존 편집 판단). 점수가 없는 장소는 0점으로 맨 뒤에 붙는다
    (같은 점수면 위 RAW_PLACES 순서). 새 장소를 넣을 때는 같은 기준으로 점수를 한 줄 추가한다. */
const PLACE_BUZZ: Record<string, number> = {
  "home-place-hanjeongseon": 95, // 한정선
  "home-place-godiva-lotteworldmall": 90, // 고디바 롯데월드몰점
  "home-place-woo-lae-oak": 76, // 우래옥
  "home-place-mippeudong": 75, // 미쁘동
  "home-place-samcheongdong-sujebi": 75, // 삼청동수제비
  "home-place-shonino": 74, // 쇼니노
  "home-place-gwanghwamun-mijin": 73, // 광화문미진
  "home-place-maplestory-escape": 72, // 메이플스토리 이스케이프
  "home-place-jinjung-niuroumian": 70, // 진중 우육면관 본점
  "home-place-pildong-myeonok": 70, // 필동면옥
  "home-place-geumdwaeji": 69, // 금돼지식당
  "home-place-ore-no-ramen": 69, // 오레노라멘 본점
  "home-place-jeongdon-daehakro": 69, // 정돈 대학로본점
  "home-place-montan": 68, // 몽탄
  "home-place-hwangsaengga-kalguksu": 68, // 황생가칼국수
  "home-place-neungdong-minari-sinyongsan": 68, // 능동미나리 신용산점
  "home-place-popolo-pizza": 66, // 포폴로피자
  "home-place-jungin-myeonok": 66, // 정인면옥 본점
  "home-place-betong-seongsu": 65, // 베통 성수
  "home-place-tapacopa-yongsan": 65, // 타파코파 용산본점
  "home-place-perejil-seongsu": 65, // 페레힐
  "home-place-huchu-point-gangnam": 65, // 후추포인트
  "home-place-pyongyang-myeonok": 65, // 평양면옥
  "home-place-lanzhou-kalmyeon": 65, // 란주칼면
  "home-place-mabokrim-halmeoni": 65, // 마복림할머니집
  "home-place-yeonnam-toma": 64, // 연남토마 본점
  "home-place-mokmyeok-sanbang": 64, // 목멱산방
  "home-place-jaha-son-mandu": 64, // 자하손만두
  "home-place-tacodot-mangwon-market": 64, // 타코닷 망원시장본점
  "home-place-tea-nomad-mangwon": 64, // 티노마드
  "home-place-soyi-yeonnam": 63, // 소이연남 연남동본점
  "home-place-bermuda-samgakji": 63, // 버뮤다삼각지
  "home-place-susanna-apron": 63, // 수잔나의 앞치마
  "home-place-mogran": 61, // 목란
  "home-place-sarangbang-kalguksu": 61, // 사랑방칼국수
  "home-place-ujeong-sindang": 61, // 우정
  "home-place-pangz-songridan": 61, // 팡즈
  "home-place-daerim": 60, // 성수동대림창고갤러리
  "home-place-oldies-taco-euljiro": 60, // 올디스타코 을지로 본점
  "home-place-heehee-katsu-chungmuro": 60, // 희희카츠 충무로점
  "home-place-damtaek-hapjeong": 60, // 담택
  "home-place-padong-mangwon": 60, // 파동
  "home-place-fwv-yongsan": 59, // 에프더블유브이 용산점
  "home-place-gyeongju-sikdang-hongdae": 59, // 경주식당 홍대본점
  "home-place-anam-bukchon": 59, // 안암
  "home-place-hwayukgye": 59, // 화육계
  "home-place-sarukame-yeonnam": 59, // 사루카메
  "home-place-gaeseong-mandu-koong": 59, // 개성만두 궁
  "home-place-jinjin-hapjeong": 58, // 진진
  "home-place-sansugapsan": 57, // 산수갑산
  "home-place-hwayang-lamb-kondae": 57, // 화양양꼬치 건대점
  "home-place-yeonok-lamb": 57, // 연옥양꼬치
  "home-place-badahoesarang-seogyo": 57, // 바다회사랑 서교점
  "home-place-kkoger-yongsan": 56, // 꺼거
  "home-place-mapo-ok": 56, // 마포옥
  "home-place-lamant-secret-lescape": 56, // 레스케이프 라망 시크레
  "home-place-alfedo-itaewon": 56, // 알페도
  "home-place-ichizen-mangwon": 56, // 이치젠
  "home-place-gorogoro-yongsan": 54, // 고로고로 용산
  "home-place-original-chicago-pizza-hongdae": 54, // 오리지널시카고피자 홍대본점
  "home-place-halmaejip-sajik": 54, // 할매집
  "home-place-heki-mangwon": 54, // 헤키
  "home-place-suzy-and-pasta": 53, // 수지앤파스타
  "home-place-cheonha-bossam": 53, // 천하보쌈
  "home-place-conde-pepe": 53, // 콘드에뻬뻬
  "home-place-brick-happy-food-hannam": 53, // 벽돌해피푸드 한남점
  "home-place-aroundday": 52, // 어라운드데이
  "home-place-pasado-mangwon": 52, // 파사도 망원
  "home-place-maison-leblanc": 51, // 메종 루블랑
  "home-place-jinsim-seochon": 51, // 진심
  "home-place-okdol-hyeonok": 51, // 옥돌현옥
  "home-place-songhwa-lamb": 50, // 송화양꼬치
  "home-place-flink-pangyo": 49, // 플링크 판교
  "home-place-aloy-makmak": 49, // 알로이막막
  "home-place-nishikasai-songridan": 49, // 니시카사이
  "home-place-dorang": 48, // 도량
  "home-place-hakata-naka": 48, // 하카타나카
  "home-place-la-cantina-euljiro": 48, // 라칸티나
  "home-place-eatanic-garden-chosun-palace": 48, // 조선 팰리스 이타닉 가든
  "home-place-seven-point-eight-euljiro": 46, // 7.8 을지로
  "home-place-coin-myeongdong-1": 46, // 코인 명동1호점
  "home-place-fabri-kitchen": 46, // 파브리키친
  "home-place-pildong-katsu": 45, // 필동카츠
  "home-place-hyogye-euljiro": 44, // 효계 을지로점
  "home-place-dayrit-yongsan": 43, // 데이릿 용산점
  "home-place-aejeong-kalguksu": 43, // 애정칼국수
  "home-place-chiikawa-yongsan": 41, // 치이카와샵 아이파크몰 용산점
  "home-place-boan": 40, // 통의동 보안여관
  "home-place-pangyo-myeonhak": 40, // 판교면학
  "home-place-beuno-mangwon": 40, // 베우노
  "home-place-hunchun-lamb": 39, // 훈춘양꼬치
  "home-place-chocho-hongdae": 39, // 쵸쵸 홍대
  "home-place-taehwaru": 39, // 태화루
  "home-place-deepin-toegyero": 39, // 디핀
  "home-place-brickhouse-toegyero": 39, // 브릭하우스
  "home-place-muksarang-mangwon": 39, // 묵사랑
  "home-place-neuru-yeonsinnae": 38, // 느루
  "home-place-pho-hang-jongno": 38, // 베트남쌀국수PhoHang
  "home-place-onryu-seongsu": 37, // 온류 성수
  "home-place-doragon-sangsu": 37, // 도라곤
  "home-place-keulljun-pangyo": 36, // 클준빛날영
  "home-place-wangsimni-dakdori": 35, // 왕십리닭내장탕집
  "home-place-jinhyang-pangyo": 35, // 진향
  "home-place-santyome-seorae": 35, // 산쪼메 서래본점
  "home-place-jeonjabang-pildong": 34, // 전자방 필동점
  "home-place-ungjang-mangwon": 34, // 웅장
  "home-place-le-mekong-pangyo": 33, // 르메콩
  "home-place-tamnaneun-don-hwayang": 33, // 탐나는돈 화양본점
  "home-place-witwins-mangwon": 33, // 위트윈스
  "home-place-jaya-chungmuro": 32, // 자야
  "home-place-pono-buono": 27, // 포노 부오노
  "home-place-homies-pizza-main": 25, // 호미스피자 본점
  "home-place-appie-eddie": 19, // 아삐에디
};

export const HOME_DUMMY_PLACES: HomeDummyPlace[] = [...RAW_PLACES].sort(
  (a, b) => (PLACE_BUZZ[b.id] ?? 0) - (PLACE_BUZZ[a.id] ?? 0),
);
