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
  /** "contain" 이면 사진을 자르지 않고 통째로 보여 준다(로고처럼 위아래가 잘리면 안 되는 사진). 남는 자리는 같은 사진을 흐리게 깔아 채운다 */
  image_fit?: "contain";
  /** image_fit 이 contain 일 때 남는 자리를 이 색으로 채운다(없으면 같은 사진을 흐리게 깐다). 흰 배경 로고처럼 흐린 색이 어색할 때 */
  image_bg?: string;
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
];

/** 요즘 화제인 정도(0~100, 클수록 위) — 홈 "요즘 뜨는 곳"의 순서를 정하는 점수.
    특정 장소를 앞이나 뒤에 못박지 않고, 모든 장소를 같은 점수표로 줄 세운다. 순서를 바꾸고 싶으면 점수만 고친다.
    근거: 최근 기사 · 입소문(한정선, 고디바, 쇼니노), 웨이팅(소이연남, 금돼지식당), 최근 오픈(메이플스토리 이스케이프 2026.9.21),
    그 밖에는 편집 판단이다. 점수가 없는 장소는 0점으로 맨 뒤에 붙는다(같은 점수면 위 RAW_PLACES 순서). */
const PLACE_BUZZ: Record<string, number> = {
  "home-place-hanjeongseon": 95,
  "home-place-godiva-lotteworldmall": 90,
  "home-place-betong-seongsu": 80,
  "home-place-soyi-yeonnam": 78,
  "home-place-geumdwaeji": 76,
  "home-place-shonino": 74,
  "home-place-maplestory-escape": 72,
  "home-place-ore-no-ramen": 70,
  "home-place-maison-leblanc": 68,
  "home-place-jinjung-niuroumian": 66,
  "home-place-dayrit-yongsan": 60,
  "home-place-aroundday": 55,
  "home-place-pangyo-myeonhak": 50,
  "home-place-daerim": 45,
  "home-place-sansugapsan": 40,
  "home-place-boan": 35,
};

export const HOME_DUMMY_PLACES: HomeDummyPlace[] = [...RAW_PLACES].sort(
  (a, b) => (PLACE_BUZZ[b.id] ?? 0) - (PLACE_BUZZ[a.id] ?? 0),
);
