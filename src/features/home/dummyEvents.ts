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
  /** 종료일. 정해진 끝이 없는 상시 운영이면 빈 문자열 */
  end_date: string;
  /** 카드에 날짜 대신 보여 줄 글 — 끝이 없는 상시 운영처럼 시작일 ~ 종료일로 못 쓸 때만 */
  period_text?: string;
  /** 목록 카드의 대표 이미지 주소 — 공식 페이지(또는 네이버 지도)의 이미지 주소를 그대로 가리킨다(내려받아 저장하지 않는다). 직접 받은 이미지는 public/event-images/ 에 두고 /event-images/… 로 적는다(/events/ 는 인프라(ALB)가 가로채 503 이 나서 쓰지 않는다). 없으면 이모지 타일 */
  image_url?: string;
  /** 카드보다 긴 사진에서 어느 쪽을 남길지(CSS object-position). 기본은 위쪽을 남긴다 — 아래쪽 글자를 살리려면 "center bottom" */
  image_position?: string;
  /** "contain" 이면 사진을 자르지 않고 통째로 보여 준다(가로로 긴 포스터가 양옆이 잘릴 때). 남는 자리는 같은 사진을 흐리게 깔아 채운다 */
  image_fit?: "contain";
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
    // TODO: BE 의 유튜브 원본 콘텐츠 조회가 구현되면 ["OTebiyheYIA"] 로 되돌린다(지금은 상세에 YouTube 구역이 안 보이게 비워 둔다)
    video_ids: [],
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
  {
    id: "home-t1-seoulsky",
    name: "T1 X 서울스카이 전시",
    category: "전시",
    description:
      "T1과 서울스카이가 함께하는 콜라보 전시예요. 롯데월드타워 서울스카이에서 만날 수 있어요.",
    address_sg: "서울특별시 송파구",
    address_road: "서울특별시 송파구 올림픽로 300 롯데월드타워 서울스카이",
    naver_place_id: "1668410327",
    place_name: "서울스카이(롯데월드타워)",
    start_date: "2026-09-11",
    end_date: "2026-11-29",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNjA4MjZfMjQ4%2FMDAxNzg3NzI1MzQ4MzY3.JH9T5bQDsE64cbzQNwhf6IhQGDsolnb2K0adJuf0n6Eg.DmUOqcROQ32O4GqaRjNYI3907Hp-0cbIa4WLRrmY0aYg.JPEG%2Fgame.jpg%3Ftype%3Dw2",
    image_position: "center bottom",
    video_ids: [],
    extra: {
      emoji: "🎮",
      links: [
        {
          type: "official",
          url: "https://seoulsky.lotteworld.com/enjoy/event/detail?seq=23",
        },
      ],
      map_query: "서울스카이",
    },
  },
  {
    id: "home-mallink-malang",
    name: "몰링크 말랑이 팝업스토어",
    category: "팝업",
    description:
      "더현대 서울 본관 지하 2층에서 여는 몰링크 말랑이 팝업스토어예요.",
    address_sg: "서울특별시 영등포구",
    address_road: "서울특별시 영등포구 여의대로 108 더현대 서울 본관 지하2층",
    naver_place_id: "2023405938",
    place_name: "더현대 서울 본관 지하 2층",
    start_date: "2026-10-22",
    end_date: "2026-10-28",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20261015_232%2F1792060797734vR077_JPEG%2Fedited-1792060795968-17.jpg",
    video_ids: [],
    extra: {
      emoji: "🧸",
      map_query: "더현대 서울 본관 지하 2층",
    },
  },
  {
    id: "home-gemini-campus",
    name: "스낵이 제미나이 캠퍼스",
    category: "팝업",
    description:
      "유튜브 '전과자'와 Google Gemini가 함께 만든 팝업스토어예요. 리얼 학과 리뷰어 '전과자'가 되어 전공 수업 체험부터 동아리 가입, 연애 상담까지 Gemini와 스마트한 캠퍼스 라이프를 경험할 수 있어요. 전과자 X Gemini 한정판 굿즈를 판매하고, 외부 초청 강사와 함께하는 선택 교양 수업도 열려요. 10월 30일(금)부터 11월 1일(일)까지 단 3일간만 열려요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 연무장7길 16 1~2F",
    naver_place_id: "2035754366",
    place_name: "성수 연무장7길 팝업 공간",
    start_date: "2026-10-30",
    end_date: "2026-11-01",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20261015_38%2F1792066556467HEEiS_JPEG%2Fedited-1792066557914-0.jpg",
    image_fit: "contain",
    video_ids: [],
    extra: {
      emoji: "🎓",
      links: [
        {
          type: "official",
          url: "https://blog.google/intl/ko-kr/company-news/inside-google/gemini-seongsu-meetup-oct-kr/",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/p/DeynIidkmq0/",
        },
      ],
      map_query: "성수 연무장7길 팝업 공간",
    },
  },
  {
    id: "home-toystory",
    name: "토이 스토리 팝업 - 하우스 오브 토이스토리",
    category: "팝업",
    description:
      "성수 LECT HOUSE에서 만나는 하우스 오브 토이스토리 팝업이에요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 연무장3길 8-9 LECT HOUSE",
    naver_place_id: "1749055358",
    place_name: "성수 LECT HOUSE",
    start_date: "2026-09-04",
    end_date: "2026-10-31",
    image_url: "/event-images/toystory-house-newseason.jpg",
    image_position: "center bottom",
    video_ids: [],
    extra: {
      emoji: "🤠",
      links: [
        {
          type: "instagram",
          url: "https://www.instagram.com/p/Dc-dVL4EzzT/",
        },
      ],
      map_query: "성수 LECT HOUSE",
    },
  },
  {
    id: "home-dweather",
    name: "디웨더 팝업스토어 용산 아이파크몰",
    category: "팝업",
    description: "용산 아이파크몰 3층 패션파크에서 여는 디웨더 팝업스토어예요.",
    address_sg: "서울특별시 용산구",
    address_road: "서울특별시 용산구 한강대로23길 55 3층 패션파크",
    naver_place_id: "2031485501",
    place_name: "용산 아이파크몰 패션파크",
    start_date: "2026-10-23",
    end_date: "2026-11-05",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20261016_129%2F1792141409355NHhtR_JPEG%2Fedited-1792141410521-0.jpg",
    video_ids: [],
    extra: {
      emoji: "👗",
      links: [
        {
          type: "instagram",
          url: "https://www.instagram.com/dweather.official/",
        },
      ],
      map_query: "용산 아이파크몰 패션파크",
    },
  },
  {
    id: "home-moomin",
    name: "무민팝업스토어",
    category: "팝업",
    description:
      "용산 아이파크몰 3층 도파민스테이션에서 여는 무민 팝업스토어예요.",
    address_sg: "서울특별시 용산구",
    address_road:
      "서울특별시 용산구 한강대로23길 55 용산아이파트몰 3층 도파민스테이션",
    naver_place_id: "2082705464",
    place_name: "용산 아이파크몰 도파민스테이션",
    start_date: "2026-10-12",
    end_date: "2026-11-01",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260921_145%2F1789979086952zBtJY_JPEG%2Fedited-1789979086933-0.jpg",
    video_ids: [],
    extra: {
      emoji: "🦛",
      links: [
        {
          type: "instagram",
          url: "https://www.instagram.com/p/DdvO9iiiaWY/",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/reel/DebOUHzOiA5/",
        },
      ],
      map_query: "용산 아이파크몰 도파민스테이션",
    },
  },
  {
    id: "home-wave-to-earth",
    name: "wave to earth POP-UP EVENT",
    category: "팝업",
    description:
      "더현대 서울 지하 2층 센트럴에서 여는 wave to earth 팝업 이벤트예요.",
    address_sg: "서울특별시 영등포구",
    address_road: "서울특별시 영등포구 여의대로 108 더현대 서울 지하2층 센트럴",
    naver_place_id: "2039386160",
    place_name: "더현대 서울 지하 2층 센트럴",
    start_date: "2026-10-22",
    end_date: "2026-10-28",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20261001_50%2F1790828892708sbsBx_JPEG%2Fedited-1790828892520-0.jpg",
    video_ids: [],
    extra: {
      emoji: "🌊",
      links: [
        {
          type: "instagram",
          url: "https://www.instagram.com/p/DeMCnMoj2DL/",
        },
      ],
      map_query: "더현대 서울 지하 2층 센트럴",
    },
  },
  {
    id: "home-nb-runhub",
    name: "뉴발란스 여의도 런 허브 팝업 스토어",
    category: "팝업",
    description:
      "이랜드 이크루즈 1터미널 2층에 있는 뉴발란스 런 허브 여의도 팝업 스토어예요.",
    address_sg: "서울특별시 영등포구",
    address_road:
      "서울특별시 영등포구 여의동로 280 이랜드 이크루즈 1터미널 2층 뉴발란스 런허브 여의도점",
    naver_place_id: "2095207347",
    place_name: "뉴발란스 런허브 여의도점",
    start_date: "2026-05-09",
    end_date: "2026-11-14",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260619_194%2F17818635100997NHpm_JPEG%2F%25BF%25A9%25C0%25C7%25B5%25B5_%25B7%25B1%25C7%25E3%25BA%25EA_%25C1%25A4%25B8%25E9.jpg",
    video_ids: [],
    extra: {
      emoji: "👟",
      links: [
        {
          type: "instagram",
          url: "https://www.instagram.com/nb_runhub__yeoido",
        },
      ],
      map_query: "뉴발란스 런허브 여의도점",
    },
  },
  {
    id: "home-modernhouse-xmas",
    name: "모던하우스 매지컬 크리스마스 팝업",
    category: "팝업",
    description:
      "IFC몰과 파크원 사이 지하 공공보도에서 여는 모던하우스 크리스마스 팝업이에요.",
    address_sg: "서울특별시 영등포구",
    address_road:
      "서울특별시 영등포구 국제금융로 15 IFC몰~파크원간 지하공공보도",
    naver_place_id: "2069899164",
    place_name: "IFC몰~파크원 지하공공보도",
    start_date: "2026-11-04",
    end_date: "2026-12-25",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20261012_240%2F1791778403717pflAw_JPEG%2Fedited-1791778402919-0.jpg",
    video_ids: [],
    extra: {
      emoji: "🎄",
      links: [
        {
          type: "blog",
          url: "https://blog.naver.com/mhmagazine/224447416411",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/reel/DespzObzYHK/",
        },
      ],
      map_query: "IFC몰~파크원 지하공공보도",
    },
  },
  {
    id: "home-snoopy-unicef",
    name: "탐정 스누피의 잃어버린 단서 in 유니세프 정원",
    category: "팝업",
    description:
      "서울숲 유니세프 정원에서 스누피와 함께 잃어버린 단서를 찾는 팝업이에요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 뚝섬로 273 서울숲",
    naver_place_id: "1781729448",
    place_name: "서울숲 유니세프 정원",
    start_date: "2026-09-10",
    end_date: "2026-11-16",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNjA5MDdfMjUz%2FMDAxNzg4NzU5NjE3Mjk5.YHBKQ9DqZKZqgBtwyqVtVAsYyH1HnO7DBjw5j7gh5jcg.L6aLuXqxLelH3-sojaiBxWJcYTgo2vWMzg21Kfqyub0g.JPEG%2F102a099b-e539-4a2f-b170-cc59fbc28dbd_1788513943211_thumbnail_MAIN_W480.jpg%3Ftype%3Dw2",
    video_ids: [],
    extra: {
      emoji: "🐶",
      links: [
        {
          type: "instagram",
          url: "https://www.instagram.com/p/DdGdu_smaLs/",
        },
      ],
      map_query: "서울숲 유니세프 정원",
    },
  },
  {
    id: "home-jjk-cafe",
    name: "주술회전 콜라보 카페",
    category: "팝업",
    description: "홍대 AK PLAZA 3층에서 만나는 주술회전 콜라보 카페예요.",
    address_sg: "서울특별시 마포구",
    address_road: "서울특별시 마포구 양화로 188 홍대 AK PLAZA 3층",
    naver_place_id: "1988545646",
    place_name: "홍대 AK PLAZA 3층",
    start_date: "2026-09-23",
    end_date: "2026-12-01",
    image_url:
      "https://search.pstatic.net/common/?src=https%3A%2F%2Fpostfiles.pstatic.net%2FMjAyNjA5MTdfMjky%2FMDAxNzg5NTc1MzI5NTQy.f3wXUFtjjsvlYYKhz-jzBg_6e2FJbpc9QCKvS9IVGGwg.guBu0952mqiqrO5iGDHuvvl4FrrPlEuf0anlATSPIPMg.JPEG%2FIMG%25EF%25BC%25BF9009.jpg%3Ftype%3Dw2",
    video_ids: [],
    extra: {
      emoji: "☕",
      links: [
        {
          type: "instagram",
          url: "https://www.instagram.com/p/DdU_Ooaj_JR/",
        },
      ],
      map_query: "홍대 AK PLAZA 3층",
    },
  },
  {
    id: "home-busan-fireworks",
    name: "부산 불꽃축제",
    category: "축제",
    description:
      "광안리해수욕장·이기대·동백섬 일원에서 열리는 제21회 부산불꽃축제예요. 낮 1시 불꽃 스트릿에 이어 저녁 6시 프롤로그로 시작해, 7시부터 해외초청불꽃쇼와 부산멀티불꽃쇼가 펼쳐져요.",
    address_sg: "부산광역시 수영구",
    address_road: "부산광역시 수영구 광안해변로 219",
    naver_place_id: "37830270",
    place_name: "광안리해수욕장",
    start_date: "2026-11-07",
    end_date: "2026-11-07",
    image_url:
      "https://busanfireworks.com/data/bf_overview/ov_overview_20260822210000.jpg",
    video_ids: [],
    extra: {
      emoji: "🎆",
      links: [
        {
          type: "official",
          url: "https://www.busanfireworks.com/",
        },
      ],
      map_query: "광안리해수욕장",
      schedule: {
        title: "프로그램 일정",
        rows: [
          {
            tag: "13:00",
            title: "불꽃 스트릿",
            meta: "13:00 ~ 16:00",
            group: "11.7(토) 프로그램",
          },
          { tag: "18:00", title: "불꽃 프롤로그", meta: "18:00 ~ 18:50" },
          { tag: "18:50", title: "개막 세리머니", meta: "18:50 ~ 19:00" },
          { tag: "19:00", title: "해외초청불꽃쇼", meta: "19:00 ~ 19:15" },
          { tag: "19:15", title: "인터미션", meta: "19:15 ~ 19:25" },
          { tag: "19:25", title: "부산멀티불꽃쇼", meta: "19:25 ~ 19:55" },
          { tag: "19:55", title: "커튼콜 불꽃", meta: "19:55 ~ 20:00" },
        ],
      },
    },
  },
  {
    id: "home-seoul-designweek",
    name: "2026 서울디자인위크",
    category: "전시",
    description:
      "DDP 디자인페어, 컨퍼런스, 특별전시, 디자인마켓, 서울디자인로드 등을 만날 수 있는 서울의 디자인 축제예요.",
    address_sg: "서울특별시 중구",
    address_road: "서울특별시 중구 을지로 281",
    naver_place_id: "18063223",
    place_name: "동대문디자인플라자(DDP)",
    start_date: "2026-10-14",
    end_date: "2026-10-25",
    image_url: "/event-images/seoul-designweek-2026-poster.jpg",
    video_ids: [],
    extra: {
      emoji: "🎨",
      links: [
        {
          type: "official",
          url: "https://www.seoul-designweek.or.kr/",
        },
      ],
      map_query: "동대문디자인플라자",
    },
  },
  {
    id: "home-mungyeong-apple",
    name: "문경사과축제",
    category: "축제",
    description:
      "문경새재도립공원 일원에서 10월 17일(토)부터 11월 1일(일)까지 16일간 열리는 문경사과 축제예요. 개막식은 10월 17일 오후 2시 야외공연장에서 열리고, 사과 특별판매장과 사과·감홍사과 전시, 무대 참여 행사, 무료 체험 프로그램을 즐길 수 있어요.",
    address_sg: "경상북도 문경시",
    address_road: "경상북도 문경시 문경읍 새재로 932",
    naver_place_id: "11491525",
    place_name: "문경새재도립공원 일원",
    start_date: "2026-10-17",
    end_date: "2026-11-01",
    image_url:
      "https://kfescdn.visitkorea.or.kr/kfes/upload/contents/db/7a070fe4-2f67-41a5-8fbe-683c27db20b9_18.jpeg",
    video_ids: [],
    extra: {
      emoji: "🍎",
      links: [
        {
          type: "official",
          url: "https://www.mgapple.or.kr/",
        },
      ],
      map_query: "문경새재도립공원",
      schedule: {
        title: "행사 프로그램",
        rows: [
          {
            tag: "개막식",
            title: "개막식 + 축하공연",
            meta: "10.17(토) 14:00 · 야외공연장 · 박지현, 경서, 에스플라바, 태권도시범단, 노부스심포니오케스트라",
            date: "2026-10-18",
            group: "공식·특별행사",
          },
          {
            tag: "애플데이",
            title: "문경농협과 함께하는 애플데이",
            meta: "10.23(금) · 야외공연장",
            date: "2026-10-25",
          },
          {
            tag: "나눔",
            title: "문경사과 나눔행사",
            meta: "11.1(일) · 관람객 선착순 게릴라 이벤트, 장소는 당일 무대 앞 장내방송으로 안내",
            date: "2026-11-01",
          },
          {
            tag: "판매",
            title: "문경사과 온·오프라인 특별판매장",
            meta: "30개 농가 참여 · 옛길박물관 앞",
            group: "판매·전시",
          },
          {
            tag: "판매",
            title: "문경농특산물 판매장",
            meta: "문경 관내 34개 업체 참여 · 제1관문 앞",
          },
          {
            tag: "전시",
            title: "문경사과 포토존 · 별별사과 전시",
            meta: "품종별 사과 전시 · 문경사과 품평회 입상작 전시",
          },
          {
            tag: "전시",
            title: "감홍사과명품관 · 감홍사과브랜드관",
            meta: "사과가공품전시관",
          },
          {
            tag: "참여",
            title: "사과 빨리 먹기",
            meta: "각자 고른 사과를 빠르게 먹는 사람이 승리",
            group: "무대 참여",
          },
          {
            tag: "참여",
            title: "사과 빨리 쪼개기",
            meta: "각자 고른 사과를 빠르게 쪼개는 사람이 승리",
          },
          {
            tag: "참여",
            title: "사과껍질 길게 깎기",
            meta: "사과껍질을 끊김없이 길게 깎은 사람이 승리",
          },
          {
            tag: "참여",
            title: "문경사과 바구니 게임",
            meta: "2인 1조로 사과모형을 던지고 받는 게임으로 많이 받는 팀이 승리",
          },
          {
            tag: "참여",
            title: "사과 높이 쌓기",
            meta: "정해진 사과를 이용하여 가장 높이 쌓아 올린 사람이 승리",
          },
          {
            tag: "퀴즈",
            title: "기본상식 OX퀴즈",
            meta: "체험행사",
            group: "체험",
          },
          {
            tag: "퀴즈",
            title: "문경을 알리는 문경퀴즈 진행방식",
            meta: "체험행사",
          },
          { tag: "퀴즈", title: "특별이벤트 패자부활전", meta: "체험행사" },
          { tag: "퀴즈", title: "문경사과축제 왕중왕전", meta: "체험행사" },
          {
            tag: "체험",
            title: "문경사과 친환경 나무 놀이터",
            meta: "무료 체험 · 45분 운영, 15분 정비",
          },
          {
            tag: "체험",
            title: "사과 숲속 백설공주 인생네컷",
            meta: "무료 체험 · 45분 운영, 15분 정비",
          },
          {
            tag: "체험",
            title: "애플 스티커 타투",
            meta: "무료 체험 · 45분 운영, 15분 정비",
          },
          {
            tag: "체험",
            title: "사과숲속 감홍 노래방",
            meta: "무료 체험 · 45분 운영, 15분 정비",
          },
          {
            tag: "체험",
            title: "사과모자 만들기 체험",
            meta: "무료 체험 · 45분 운영, 15분 정비",
          },
          {
            tag: "체험",
            title: "콘홀 던지기 게임",
            meta: "무료 체험 · 45분 운영, 15분 정비",
          },
        ],
      },
      images: [
        {
          title: "행사장 안내도",
          src: "/event-images/mungyeong-apple-sitemap.jpg",
        },
      ],
    },
  },
  {
    id: "home-hp-forbidden-forest",
    name: "해리 포터™: 금지된 숲 체험",
    category: "산책",
    description:
      "어두운 숲을 걸으며 마법 생물을 만나고 인터랙티브 마법 주문을 체험하는 야외 조명 트레일이에요. 약 60~90분 걸리고 2026년 12월 17일부터 상시 운영해요.",
    address_sg: "제주특별자치도 서귀포시",
    address_road: "제주특별자치도 서귀포시 안덕면 일주서로 1836 루나폴",
    naver_place_id: "1823167512",
    place_name: "루나폴",
    start_date: "2026-12-17",
    end_date: "",
    period_text: "2026.12.17 ~ 상시 운영",
    image_url:
      "https://applications-media.feverup.com/image/upload/f_auto/fever2/plan/photo/a568c2c4-03de-11f0-810e-3ef3894b60ba.jpg",
    video_ids: [],
    extra: {
      emoji: "🪄",
      links: [
        {
          type: "official",
          url: "https://hpforbiddenforestexperience.com/jeju-si/",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/reel/DeMJAOklZvt/",
        },
      ],
      map_query: "루나폴",
    },
  },
  {
    id: "home-hangang-outdoor-library",
    name: "책 읽는 한강공원",
    category: "산책",
    description:
      "서울시가 여의도 한강공원 멀티플라자에서 여는 야외 도서관이에요. 한강 풍경 속에서 책을 읽으며 쉬어 갈 수 있어요. 9월 12일부터 10월 31일까지 열리고, 개막식부터 요가·재즈페스타·도서교환까지 날짜별 특별 프로그램이 있어요.",
    address_sg: "서울특별시 영등포구",
    address_road: "서울특별시 영등포구 여의동로 343",
    naver_place_id: "32340849",
    place_name: "여의도 한강공원 멀티플라자",
    start_date: "2026-09-12",
    end_date: "2026-10-31",
    image_url: "/event-images/hangang-outdoor-library-poster.jpg",
    video_ids: [],
    extra: {
      emoji: "📚",
      links: [
        {
          type: "official",
          url: "https://www.hangangoutdoorlib.seoul.kr/",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/hangang.outdoorlib/",
        },
      ],
      map_query: "여의도한강공원 멀티플라자",
      schedule: {
        title: "하반기 운영 일정",
        rows: [
          {
            tag: "9.12",
            title: "개막식 + 노란우산 동시 그림대회",
            meta: "9.12(토) · 여의도 한강공원",
            date: "2026-09-13",
            group: "하반기 운영 일정",
          },
          {
            tag: "9.19",
            title: "한강 노을빛 힐링요가",
            meta: "9.19(토) · 여의도 한강공원",
            date: "2026-09-20",
          },
          {
            tag: "9.27",
            title: "세대공감 한가위 축제",
            meta: "9.27(일) · 여의도 한강공원",
            date: "2026-09-27",
          },
          {
            tag: "10.3",
            title: "북꾸 데이",
            meta: "10.3(토) · 여의도 한강공원",
            date: "2026-10-04",
          },
          {
            tag: "10.10",
            title: "한글날 기념 한석봉 챌린지",
            meta: "10.10(토) · 여의도 한강공원",
            date: "2026-10-11",
          },
          {
            tag: "10.17",
            title: "한강 어럿 재즈페스타",
            meta: "10.17(토) · 여의도 한강공원",
            date: "2026-10-18",
          },
          {
            tag: "10.24",
            title: "한강 독서 도서교환 (새책줄께 헌책다오) 행사",
            meta: "10.24(토) · 여의도 한강공원",
            date: "2026-10-25",
          },
          {
            tag: "10.31",
            title: "폐막식",
            meta: "10.31(토) · 여의도 한강공원",
            date: "2026-10-31",
          },
        ],
      },
    },
  },
  {
    id: "home-folk-ghostplay",
    name: "한국민속촌 - 귀신사바 귀신놀이",
    category: "축제",
    description:
      "한국민속촌에서 가을밤 귀신 마을을 거닐며 즐기는 'The Ghost World, Ghost Play' 이벤트예요. 2026년 9월 1일부터 11월 15일까지 열려요.",
    address_sg: "경기도 용인시",
    address_road: "경기도 용인시 기흥구 민속촌로 90",
    naver_place_id: "",
    place_name: "한국민속촌",
    start_date: "2026-09-01",
    end_date: "2026-11-15",
    image_url: "/event-images/koreanfolk-ghostplay-poster.jpg",
    video_ids: [],
    extra: {
      emoji: "👻",
      links: [
        {
          type: "official",
          url: "https://www.koreanfolk.co.kr/home/promotion/event/53",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/reel/DdL_7dLzs0z/",
        },
      ],
      map_query: "한국민속촌",
      schedule: {
        title: "행사 프로그램",
        rows: [
          {
            tag: "입장",
            title: "마을 회관",
            meta: "월~목 12:00~18:00 · 금~일·공휴일 12:00~21:00 · 평석교 입구",
            group: "입장·미션",
          },
          {
            tag: "미션",
            title: "속촌리 금줄목",
            meta: "월~목 12:00~18:00 · 금~일·공휴일 12:00~21:00 · 민속마을 36호 관아 앞 공터",
          },
          {
            tag: "미션",
            title: "속촌리 비석골",
            meta: "월~목 12:00~18:00 · 금~일·공휴일 12:00~21:00 · 내삼문 정면 오솔길",
          },
          {
            tag: "미션",
            title: "귀물 찾기",
            meta: "월~목 12:00~18:00 · 금~일·공휴일 12:00~21:00 · 상설체험장 정자",
          },
          {
            tag: "미션",
            title: "귀신걸음",
            meta: "월~목 12:00~18:00 · 금~일·공휴일 12:00~21:00 · 관아 옥사",
          },
          {
            tag: "미션",
            title: "숨겨진 진실",
            meta: "월~목 운영 안 함 · 금~일·공휴일 16:00~21:00 · 민속마을 31호",
          },
          {
            tag: "미션",
            title: "뒤뜰에서",
            meta: "월~목 운영 안 함 · 금~일·공휴일 16:00~21:00 · 민속마을 15호",
          },
          {
            tag: "공연",
            title: "귀신 술래잡기",
            meta: "월~목 16:30 · 금~일·공휴일 16:30, 20:40 · 공연장 옆 공터",
            group: "스페셜",
          },
          {
            tag: "공연",
            title: "신출귀몰 춤사위",
            meta: "월~목 17:30 · 금~일·공휴일 19:00 · 공연장 옆 공터",
          },
          { tag: "상시", title: "이상한 숲", meta: "상시 · 민속마을 곳곳" },
          {
            tag: "스페셜",
            title: "수상한 주민들",
            meta: "월~목 12:00~18:00 · 금~일·공휴일 12:00~21:30 · 민속마을 곳곳",
          },
          {
            tag: "스페셜",
            title: "축원당",
            meta: "월~목 12:00~18:00 · 금~일·공휴일 12:00~21:30 · 상설체험장 앞",
          },
          {
            tag: "체험",
            title: "분장체험",
            meta: "월~목 12:00~17:00 · 금~일·공휴일 12:00~19:30 · 상설체험장 앞",
            group: "체험·포토존",
          },
          {
            tag: "체험",
            title: "의상체험",
            meta: "월~목 12:00~18:00 · 금~일·공휴일 12:00~20:00 · 상설체험장",
          },
          {
            tag: "체험",
            title: "축원 뱃지 만들기",
            meta: "매일 12:00~18:00 · 상설체험장",
          },
          {
            tag: "체험",
            title: "'귀'묘한 풍경 만들기",
            meta: "매일 12:00~18:00 · 상설체험장",
          },
          { tag: "포토", title: "귀면 보관소", meta: "상시 · 상설체험장 옆" },
          { tag: "포토", title: "시선집중", meta: "상시 · 양반가 앞" },
        ],
      },
      images: [
        {
          title: "행사 지도",
          src: "/event-images/koreanfolk-ghostplay-map.jpg",
        },
      ],
    },
  },
  {
    id: "home-everland-bloodcity",
    name: "에버랜드 - 블러드시티 제로: 지옥의 문",
    category: "축제",
    description:
      "광기의 과학자 다크X가 좀비 바이러스로 도시를 장악하고, 화이트Z 대원들이 맞서는 에버랜드의 좀비 테마 할로윈 축제예요. 도시 입구가 거대한 '지옥의 문'으로 바뀌었고, 오후 4시부터 만날 수 있어요. 9월 12일부터 11월 22일까지 열려요.",
    address_sg: "경기도 용인시",
    address_road: "경기도 용인시 처인구 포곡읍 에버랜드로 199",
    naver_place_id: "",
    place_name: "에버랜드 블러드시티",
    start_date: "2026-09-12",
    end_date: "2026-11-22",
    image_url:
      "https://www.everland.com/contents/ia/contents/banner/2af6acc466f643b5bba9363bf89bff61.jpg",
    video_ids: [],
    extra: {
      emoji: "🧟",
      links: [
        {
          type: "official",
          url: "https://web.everland.com/pick/2026/blood-city-zero/story.html",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/reel/Ddx6uhbFJtk/",
        },
      ],
      map_query: "에버랜드",
    },
  },
  {
    id: "home-lotte-strange-world",
    name: "롯데월드 - 기묘한 세계의 초대",
    category: "축제",
    description:
      "일본 호러 애니메이션 '이토 준지 컬렉션'과 손잡은 롯데월드 어드벤처의 가을 축제예요. 몰입형 포토존과 AR 체험, 컬래버 상품과 식음 메뉴를 만날 수 있고, 포토존은 매일 오전 11시 30분부터 오후 8시 30분까지 운영해요. 9월 19일부터 11월 15일까지 열려요.",
    address_sg: "서울특별시 송파구",
    address_road: "서울특별시 송파구 올림픽로 240",
    naver_place_id: "",
    place_name: "롯데월드 어드벤처",
    start_date: "2026-09-19",
    end_date: "2026-11-15",
    image_url:
      "https://img.sportsworldi.com/content/image/2026/09/04/20260904503838.jpg",
    video_ids: [],
    extra: {
      emoji: "🌀",
      links: [
        {
          type: "official",
          url: "https://adventure.lotteworld.com/enjoy/festival/view",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/reel/DeYzv-zAqzF/",
        },
      ],
      map_query: "롯데월드 어드벤처",
    },
  },
  {
    id: "home-shinchan-spacetime",
    name: "짱구는 못말려! - 놀자! 시공간 대모험!",
    category: "전시",
    description:
      "짱구와 친구들, 가족을 구출하는 대작전을 직접 체험하는 인터랙티브 체험전이에요. 성수에서 2026년 10월 17일부터 2027년 1월 24일까지 열려요.",
    address_sg: "서울특별시 성동구",
    address_road: "서울특별시 성동구 연무장5길 9-29",
    naver_place_id: "2050310056",
    place_name: "스테이지 비밀 성수",
    start_date: "2026-10-17",
    end_date: "2027-01-24",
    image_url: "/event-images/shinchan-spacetime-poster.jpg",
    video_ids: [],
    extra: {
      emoji: "🚀",
      links: [
        {
          type: "official",
          url: "https://be-mill.com/products/view/AK9G084N1H",
        },
        {
          type: "instagram",
          url: "https://www.instagram.com/shinchan_spacetime_kr/",
        },
      ],
      map_query: "스테이지 비밀 성수",
    },
  },
];
