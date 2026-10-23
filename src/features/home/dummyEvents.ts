import type { WishlistExtra } from "@/features/wishlist/types";

/* 홈 "지금 열린 이벤트" · "오픈 예정 이벤트"에 보여 주는 실제 이벤트 더미 — BE 없이 FE 에 들어 있다(개발 서버에도 그대로 나간다).
   보관함에 있던 실제 이벤트와 같은 내용이다. 기간이 끝난 이벤트는 홈에서 자동으로 빠지고, 시작 전이면 오픈 예정으로 간다.
   상세는 보관한 이벤트 상세(WishlistDetailSheet)를 데이터만 넣어 그대로 쓴다. 영상은 쇼츠 영상 ID 만 두고 링크는 화면에서 만든다. */

export interface HomeDummyEvent {
  id: string;
  name: string;
  /** "팝업" · "공연" · "레저·스포츠" · "산책" · "축제" … */
  category: string;
  description: string;
  address_sg: string;
  /** 도로명 주소. 없으면 빈 문자열(주소를 펼치는 화살표를 숨긴다) */
  address_road: string;
  /** 네이버 지도 장소 ID. 없으면 빈 문자열(검색으로 연다) */
  naver_place_id: string;
  /** 열리는 장소 이름 */
  place_name: string;
  /** yyyy-MM-dd */
  start_date: string;
  end_date: string;
  /** 목록 카드의 대표 이미지 주소 — 공식 페이지(또는 네이버 지도)의 이미지 주소를 그대로 가리킨다(내려받아 저장하지 않는다). 직접 받은 이미지는 public/event-images/ 에 두고 /event-images/… 로 적는다(/events/ 는 인프라(ALB)가 가로채 503 이 나서 쓰지 않는다). 없으면 이모지 타일 */
  image_url?: string;
  video_ids: string[];
  /** 이모지 · 공식 링크 · 일정표 · 지도 검색어 · 건물 주소 */
  extra: WishlistExtra;
}

export const HOME_DUMMY_EVENTS: HomeDummyEvent[] = [
  {
    id: "home-romand",
    name: "[롬앤 10주년] Dear Bestie Party 핑크오피스 팝업",
    category: "팝업",
    description:
      "롬앤 브랜드 론칭 10주년을 맞아 성수 핑크오피스에서 여는 생일파티 팝업",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 연무장길 88",
    naver_place_id: "1334329898",
    place_name: "롬앤 핑크오피스",
    start_date: "2026-10-12",
    end_date: "2026-11-10",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20261013_109%2F17918307863249HAsW_PNG%2F63d99958-cac7-4d88-b529-cad88ebc42a4.png",
    video_ids: ["OTebiyheYIA"],
    extra: {
      emoji: "💄",
      links: [
        {
          type: "instagram",
          url: "https://www.instagram.com/romand_pinkoffice/",
        },
      ],
    },
  },
  {
    id: "home-litmat",
    name: "리트와 메트 팝업스토어",
    category: "팝업",
    description:
      "리센느(RESCENE)와 함께하는 리트와 메트 팝업스토어. 무료 입장이고 예약 없이 둘러볼 수 있어요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로23길 55",
    naver_place_id: "1361022009",
    place_name: "용산 아이파크몰 더팝업",
    start_date: "2026-10-16",
    end_date: "2026-10-22",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNjEwMDJfMjg5%2FMDAxNzkwOTExMzQwOTc3.PtDY81AmA3Q9cZVxFq0hRaz6SjjU-F4No6DJ4qEomjAg.TX1DnHchCvmWKlr5JaNTo5_T0rSnPGIp4MEo0sbOj5Yg.JPEG%2F900_Internet_20261002_122045_1.jpeg%3Ftype%3Dw2",
    video_ids: ["hM1xgh1orgc"],
    extra: {
      emoji: "🧸",
      links: [
        {
          type: "official",
          url: "https://services.namanecard.com/popup/litmat_20261016_yongsan_ipark_rescene_official/",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/p/Dd8wUFalBsY",
        },
      ],
      address_detail: "용산 아이파크몰 4층 더팝업",
    },
  },
  {
    id: "home-smf",
    name: "2026 서울뮤직페스티벌",
    category: "공연",
    description:
      "서울이 들려주는 좋은 음악 이야기. 한국대중음악상 수상·후보 아티스트부터 레전드까지 노들섬에서 하루 동안 만나요. 메인 공연은 17:00~21:00에 열리고, 서울특별시가 주최해요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 양녕로 302-146",
    naver_place_id: "",
    place_name: "노들섬",
    start_date: "2026-10-24",
    end_date: "2026-10-24",
    image_url: "/event-images/seoulmusicfestival-poster.jpg",
    video_ids: [],
    extra: {
      emoji: "🎶",
      links: [
        {
          type: "official",
          url: "https://seoulmusicfestival.co.kr/2026/index.php",
        },
      ],
      map_query: "노들섬",
      schedule: {
        title: "공연 · 프로그램",
        rows: [
          {
            tag: "메인",
            title: "폴킴",
            meta: "감성 아티스트 · 대표곡 '너를 만나', '비'",
            group: "라인업",
          },
          { tag: "메인", title: "권진아", meta: "섬세한 보컬의 싱어송라이터" },
          { tag: "메인", title: "옥상달빛", meta: "따뜻한 멜로디의 여성 듀오" },
          { tag: "메인", title: "너드커넥션", meta: "팝적인 록 사운드의 밴드" },
          {
            tag: "메인",
            title: "추다혜차지스",
            meta: "소리꾼 추다혜 중심 · 2026 한국대중음악상 올해의 음반·최우수 R&B&소울 노래 수상",
          },
          {
            tag: "메인",
            title: "김창완밴드",
            meta: "'산울림' 김창완이 이끄는 한국 록의 전설",
          },
          {
            tag: "사전",
            title: "글(GLL)",
            meta: "사전공연 · 싱어송라이터 · 2022 <청춘스타> TOP3",
          },
          {
            tag: "12:00",
            title: "시민체험 프로그램",
            meta: "12:00 ~ 18:00 · 음반전시 · 청음존 · 노래방 · 포토부스 · 해치 포토존",
            group: "시간표",
          },
          {
            tag: "12:00",
            title: "SMF 푸드존",
            meta: "12:00 ~ 20:00 · 푸드트럭 및 파라솔존",
          },
          { tag: "12:00", title: "티켓 교환처", meta: "12:00 ~ 18:00" },
          {
            tag: "12:00",
            title: "종합안내 및 응급 부스",
            meta: "12:00 ~ 21:00",
          },
          {
            tag: "13:30",
            title: "버스킹 · 쓰다",
            meta: "13:30 ~ 14:00 · 버스킹 공연",
          },
          {
            tag: "14:15",
            title: "한대음 토크쇼",
            meta: "14:15 ~ 14:45 · 버스킹 & 토크쇼 존",
          },
          {
            tag: "15:00",
            title: "버스킹 · 올디 벗 구디",
            meta: "15:00 ~ 15:30 · 버스킹 공연",
          },
          {
            tag: "17:00",
            title: "메인 공연",
            meta: "17:00 ~ 21:00 · 메인 무대",
          },
        ],
      },
      images: [
        { title: "행사장 안내도", src: "/event-images/smf-sitemap.jpg" },
      ],
    },
  },
  {
    id: "home-superrace",
    name: "2026 오네(O-NE) 슈퍼레이스 챔피언십",
    category: "레저·스포츠",
    description:
      "국내 최고의 모터스포츠 대회, 슈퍼레이스 챔피언십의 최종전 더블라운드(7·8라운드)가 에버랜드 스피드웨이에서 열려요.",
    address_sg: "경기도 용인시",
    address_road: "경기도 용인시 처인구 포곡읍 에버랜드로 199",
    naver_place_id: "",
    place_name: "에버랜드 스피드웨이",
    start_date: "2026-10-24",
    end_date: "2026-10-25",
    image_url: "/event-images/superrace-golden-moments.jpg",
    video_ids: [],
    extra: {
      emoji: "🏎️",
      links: [
        {
          type: "official",
          url: "https://www.super-race.com/super_race/info_superrace",
        },
      ],
      map_query: "에버랜드 스피드웨이",
      schedule: {
        title: "대회일정",
        rows: [
          {
            tag: "R1·2",
            title: "개막전 더블라운드",
            meta: "4월 18일(토) ~ 19일(일) · 에버랜드 스피드웨이",
          },
          {
            tag: "R3",
            title: "아시아 모터스포츠 카니발",
            meta: "5월 24일(일) · 코리아인터내셔널서킷",
          },
          {
            tag: "R4",
            title: "나이트 레이스",
            meta: "7월 18일(토) · 인제 스피디움",
          },
          {
            tag: "R5",
            title: "나이트 레이스",
            meta: "8월 22일(토) · 에버랜드 스피드웨이",
          },
          {
            tag: "R6",
            title: "전남 GT",
            meta: "9월 12일(토) ~ 13일(일) · 코리아인터내셔널서킷",
          },
          {
            tag: "R7·8",
            title: "최종전 더블라운드",
            meta: "10월 24일(토) ~ 25일(일) · 에버랜드 스피드웨이",
            current: true,
          },
        ],
      },
    },
  },
  {
    id: "home-ddooddoo",
    name: "2026 차 없는 잠수교 뚜벅뚜벅 축제",
    category: "산책",
    description:
      "매주 일요일, 차가 사라진 잠수교와 반포한강공원에서 여는 한강 축제예요. 매주 다른 특별 프로그램이 열려요. 하반기(9.6~10.25)는 14:00~22:00에 운영하고 입장은 무료예요(일부 프로그램 유료).",
    address_sg: "서울특별시 서초구",
    address_road: "",
    naver_place_id: "",
    place_name: "반포한강공원 · 잠수교",
    start_date: "2026-04-26",
    end_date: "2026-10-25",
    image_url: "/event-images/ddooddoo-poster.jpg",
    video_ids: [],
    extra: {
      emoji: "🌉",
      links: [
        {
          type: "official",
          url: "https://www.festa-ddooddoo.com/",
        },
      ],
      map_query: "반포한강공원 잠수교",
      schedule: {
        title: "매주 프로그램",
        rows: [
          {
            group: "상반기 · 4.26 ~ 6.14",
            tag: "8주",
            title: "선셋요가-나마스테 한강!",
            date: "2026-06-14",
            meta: "6.14(일) 17:00~19:50 · 잠수교 특설무대 2곳",
          },
          {
            tag: "7주",
            title: "서울 플라주 바캉스",
            date: "2026-06-07",
            meta: "6.7(일) 13:00~20:30 · 반포한강공원 수변무대 일원 · 워터 스플래시, 선셋 비치",
          },
          {
            tag: "6주",
            title: "잠수교 썸머 시네마",
            date: "2026-05-31",
            meta: "5.31(일) 19:00~20:40 · 잠수교 일대(26~28번 교각)",
          },
          {
            tag: "5주",
            title: "낭만한강 기타 플래시몹",
            date: "2026-05-24",
            meta: "5.24(일) 공연 17:30~18:30 · 잠수교 위",
          },
          {
            tag: "4주",
            title: "잠수교 봄 운동회",
            date: "2026-05-17",
            meta: "5.17(일) 13:00~21:00 · 잠수교 및 반포한강공원 일원",
          },
          {
            tag: "3주",
            title: "레인보우 라이브 스테이지 : 봄",
            date: "2026-05-10",
            meta: "5.10(일) 19:00~20:30 · 잠수교 동측 수변무대",
          },
          {
            tag: "2주",
            title: "뚜벅뚜벅 퍼레이드",
            date: "2026-05-03",
            meta: "5.3(일) 16:00 / 19:00 · 잠수교 및 반포한강공원 일원",
          },
          {
            tag: "1주",
            title: "쉬엄쉬엄 모닝",
            date: "2026-04-26",
            meta: "4.26(일) · 자세한 내용은 공식 홈페이지에서 확인해요",
          },
          {
            group: "하반기 · 9.6 ~ 10.25",
            tag: "8주",
            title: "잠수교 치킨 데이 뚜치뚜치",
            date: "2026-10-25",
            meta: "10.25(일) 14:00~22:00 · 반포한강공원 및 잠수교 일원",
          },
          {
            tag: "7주",
            title: "달빛 잠수교",
            date: "2026-10-18",
            meta: "10.18(일) 19:00~22:00 · 잠수교 일원(28~25번 교각) · 빛과 미디어아트",
          },
          {
            tag: "6주",
            title: "잠수교 리프레쉬 데이",
            date: "2026-10-11",
            meta: "10.11(일) 14:30~19:00 · 반포한강공원 수변무대",
          },
          {
            tag: "5주",
            title: "잠수교 미식로드",
            date: "2026-10-04",
            meta: "10.4(일) 14:00~22:00 · 잠수교 일원 · 디저트부터 세계 각국 먹거리",
          },
          {
            tag: "4주",
            title: "달빛 한가위 한마당",
            date: "2026-09-27",
            meta: "9.27(일) 15:00~16:00, 17:00~18:00 · 반포한강공원 달빛광장 · 전통공연과 민속무용",
          },
          {
            tag: "3주",
            title: "잠수교 가을 운동회",
            date: "2026-09-20",
            meta: "9.20(일) 14:00~22:00 · 잠수교 일대(31~26번 교각)",
          },
          {
            tag: "2주",
            title: "뚜뚜게더 X 서울 동아리 ON",
            date: "2026-09-13",
            meta: "9.13(일) 14:00~20:00 · 잠수교 일원 · 대학생 공연과 체험",
          },
          {
            tag: "1주",
            title: "잠수교 워터워즈",
            date: "2026-09-06",
            meta: "9.6(일) 14:00~17:00 · 반포한강공원 내 수변무대",
          },
        ],
      },
    },
  },
  {
    id: "home-gimbap",
    name: "2026 김천김밥축제",
    category: "축제",
    description:
      "김밥을 주제로 한 가을 소풍 축제예요. 로컬·이색 김밥, 체험, 공연을 김밥광장·김밥천국·이벤트 김밥존·김밥놀이터 4가지 테마로 즐겨요. 금 10:00~18:00, 토·일 09:00~18:00 운영해요.",
    address_sg: "경상북도 김천시",
    address_road: "",
    naver_place_id: "",
    place_name: "직지문화공원",
    start_date: "2026-10-23",
    end_date: "2026-10-25",
    image_url: "https://gimbapcity.kr/images/about-png.webp?t=3",
    video_ids: [],
    extra: {
      emoji: "🍙",
      links: [
        {
          type: "official",
          url: "https://gimbapcity.kr/main/main.html",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/gc_gimbapcity",
        },
      ],
      map_query: "김천 직지문화공원",
      schedule: {
        title: "공연 라인업",
        rows: [
          {
            tag: "10.23",
            title: "바비킴",
            meta: "금 16:00 · 김밥광장 축하공연",
          },
          {
            tag: "10.24",
            title: "자두",
            meta: "토 16:00 · MC 박영진",
          },
          {
            tag: "10.25",
            title: "치즈",
            meta: "일 16:00",
          },
          {
            tag: "매일",
            title: "동미자전거음악단",
            meta: "10.23~25 13:30, 15:30",
          },
        ],
      },
    },
  },
  {
    id: "home-fireworks",
    name: "한화와 함께하는 서울세계불꽃축제",
    category: "축제",
    description:
      "한국·영국·미국의 세계 정상급 불꽃 연출팀이 여의도 한강공원에서 펼치는 가을밤 불꽃쇼예요. 2026년 행사는 9월 5일(토)에 끝났고, 다음 행사는 2027년에 열려요.",
    address_sg: "서울특별시 영등포구",
    address_road: "",
    naver_place_id: "",
    place_name: "여의도 한강공원",
    start_date: "2026-09-05",
    end_date: "2026-09-05",
    video_ids: [],
    extra: {
      emoji: "🎆",
      links: [
        {
          type: "official",
          url: "https://hanwhafireworks.com/",
        },
      ],
      map_query: "여의도 한강공원",
    },
  },
];
