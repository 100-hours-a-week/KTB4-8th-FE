/* Mock 더미 데이터 — 프로토타입 js/api/mock-db.js 를 그대로 옮긴다.
   실제 백엔드가 붙으면 이 파일과 handlers.ts 만 걷어내면 된다. */
import type {
  AddressResult,
  Advertisement,
  AnalyticsStatistics,
  AppNotification,
  Category,
  EventItem,
  NotificationType,
  OauthAccount,
  Place,
} from "@/types/api";

/* ── 로컬 확장 타입 ────────────────────────────────────────────
   공유 타입(@/types/api)에는 없지만 목 레이어 내부에서만 쓰는 필드는
   여기서 확장해 둔다. 화면이 이 타입을 직접 import 하지 않는 한
   @/types/api 자체는 건드리지 않는다. */

/** Place 명세에는 imageUrl 이 없다 — 보관함 카드 썸네일용으로 내부에만 들고 있는다. */
export interface MockPlace extends Place {
  imageUrl: string | null;
}

/** AppNotification 명세에는 이벤트 참조가 없다 — 알림 → 이벤트 상세 이동에 필요(백엔드 확인 요청). */
export interface MockNotification extends AppNotification {
  eventId: string | null;
}

export interface ProfileImagePreset {
  id: string;
  grad: string;
  emoji: string;
}

/** Google 계정 선택 화면(OAuth 모의)에 쓰는 더미 계정 */
export interface MockGoogleAccount {
  sub: string;
  name: string;
  email: string;
}

/** /addresses 검색용 원본 — keyword/region 은 검색·필터 내부용이라 응답에는 내려주지 않는다. */
export interface AddressSeed extends AddressResult {
  keyword: string;
  region: string;
}

/** 추천 후보 원형(추천 생성 시점에 시각·이동시간을 계산해 Candidate 로 변환한다).
    travelMinutes / reason 은 BE-FE 명세의 components[] 에는 없고 AI 응답에만 있다.
    백엔드 전달을 요청한 상태라, 목 레이어에서는 화면 검증을 위해 채워 둔다. */
export interface CandidateSeedComponent {
  sequence: number;
  guideId: string;
  type: "PLACE" | "EVENT";
  name: string;
  category: Category;
  estimatedStayMinutes: number;
  travelMinutes: number;
  reason: string;
}

export interface CandidateSeed {
  candidateId: string;
  rank: number;
  name: string;
  area: string;
  estimatedDurationMinutes: number;
  components: CandidateSeedComponent[];
}

/* ── 장소 · 이벤트 ─────────────────────────────────────────── */

/** GET /places?sort=trending — 요즘 뜨는 곳 */
export const places: MockPlace[] = [
  {
    id: "701",
    name: "어라운드 성수",
    category: "CAFE",
    region: "서울 성동구",
    description: "성수동 골목 안쪽, 층고 높은 로스터리 카페",
    imageUrl: null,
    googlePlaceId: "ChIJ_around_seongsu",
    latitude: 37.5445,
    longitude: 127.056,
  },
  {
    id: "702",
    name: "을지로 골라디짐",
    category: "RESTAURANT",
    region: "서울 중구",
    description: "노포 감성 그대로인 을지로 노가리 골목 맛집",
    imageUrl: null,
    googlePlaceId: "ChIJ_euljiro",
    latitude: 37.5663,
    longitude: 126.991,
  },
  {
    id: "703",
    name: "보안여관",
    category: "EXHIBITION",
    region: "서울 종로구",
    description: "1940년대 여관을 고쳐 만든 복합 문화 공간",
    imageUrl: null,
    googlePlaceId: "ChIJ_boan",
    latitude: 37.5765,
    longitude: 126.972,
  },
  {
    id: "704",
    name: "성수연방",
    category: "POPUP",
    region: "서울 성동구",
    description: "팝업·편집샵이 모인 복합 문화 공장",
    imageUrl: null,
    googlePlaceId: "ChIJ_yeonbang",
    latitude: 37.5424,
    longitude: 127.0565,
  },
  {
    id: "705",
    name: "대림창고",
    category: "CAFE",
    region: "서울 성동구",
    description: "정미소를 고친 대형 카페 겸 전시장",
    imageUrl: null,
    googlePlaceId: "ChIJ_daerim",
    latitude: 37.5432,
    longitude: 127.0543,
  },
  {
    id: "706",
    name: "카페 온화",
    category: "CAFE",
    region: "서울 성동구",
    description: "조용한 창가 자리가 있는 디저트 카페",
    imageUrl: null,
    googlePlaceId: "ChIJ_onhwa",
    latitude: 37.5451,
    longitude: 127.0521,
  },
];

/** GET /events/{eventId} */
export const events: EventItem[] = [
  {
    id: "801",
    name: "성수 팝업 위크",
    category: "POPUP",
    placeId: "704",
    region: "서울 성동구",
    description: "12개 브랜드가 참여하는 주말 팝업 페스티벌",
    startAt: "2026-09-18T11:00:00+09:00",
    endAt: "2026-09-27T20:00:00+09:00",
    imageUrl: null,
  },
  {
    id: "802",
    name: "보안여관 기획전 〈밤의 기록〉",
    category: "EXHIBITION",
    placeId: "703",
    region: "서울 종로구",
    description: "사진·설치 작업 20여 점을 모은 기획 전시",
    startAt: "2026-09-05T11:00:00+09:00",
    endAt: "2026-10-12T19:00:00+09:00",
    imageUrl: null,
  },
];

/** GET /advertisements */
export const advertisements: Advertisement[] = [
  {
    id: "1301",
    guideId: "801",
    title: "성수 팝업 위크 진행 중",
    summary: "이번 주말까지, 12개 브랜드 참여",
    content: "현장 방문객을 위한 할인 안내입니다.",
    startAt: "2026-09-18T00:00:00+09:00",
    endAt: "2026-09-27T23:59:59+09:00",
  },
];

/* ── 동기화·분석 집계 ──────────────────────────────────────────
   명세에 동기화 상태 조회 API가 없어 이 수치로 진행률을 대신한다(확인 필요). */
export const analytics: Record<
  "empty" | "running" | "done" | "noPlace",
  AnalyticsStatistics
> = {
  empty: {
    syncedVideoCount: 0,
    pendingVideoCount: 0,
    inProgressVideoCount: 0,
    completedVideoCount: 0,
    failedVideoCount: 0,
    extractedGuideCount: 0,
  },
  running: {
    syncedVideoCount: 120,
    pendingVideoCount: 46,
    inProgressVideoCount: 8,
    completedVideoCount: 66,
    failedVideoCount: 0,
    extractedGuideCount: 41,
  },
  done: {
    syncedVideoCount: 120,
    pendingVideoCount: 0,
    inProgressVideoCount: 0,
    completedVideoCount: 120,
    failedVideoCount: 0,
    extractedGuideCount: 87,
  },
  noPlace: {
    syncedVideoCount: 38,
    pendingVideoCount: 0,
    inProgressVideoCount: 0,
    completedVideoCount: 38,
    failedVideoCount: 0,
    extractedGuideCount: 0,
  },
};

/** GET /user/accounts — 로그인 전 기본값(로그인하면 handlers 가 srv.account 로 덮어쓴다) */
export const account: OauthAccount = {
  id: "201",
  provider: "GOOGLE",
  email: "jiwoo.kim27@gmail.com",
  youtubeConnected: true,
  connectedAt: "2026-09-01T10:00:00+09:00",
};

/** Google 계정 선택 화면(oauth 모의 페이지)에 쓰는 더미 계정 */
export const googleAccounts: MockGoogleAccount[] = [
  { sub: "google-101", name: "김지우", email: "jiwoo.kim27@gmail.com" },
  { sub: "google-102", name: "이서준", email: "seojun.dev@gmail.com" },
];

/** oauth 화면의 계정 선택기가 그대로 쓰는 export 이름 */
export const MOCK_GOOGLE_ACCOUNTS = googleAccounts;

/** GET /addresses?query= */
export const addresses: AddressSeed[] = [
  {
    keyword: "성수",
    roadAddress: "서울특별시 성동구 성수이로 77",
    jibunAddress: "서울특별시 성동구 성수동2가 315-8",
    region: "성동구 성수동",
    latitude: 37.5445,
    longitude: 127.056,
  },
  {
    keyword: "성수",
    roadAddress: "서울특별시 성동구 연무장길 33",
    jibunAddress: "서울특별시 성동구 성수동2가 322-2",
    region: "성동구 연무장길",
    latitude: 37.5424,
    longitude: 127.0565,
  },
  {
    keyword: "강남",
    roadAddress: "서울특별시 강남구 테헤란로 152",
    jibunAddress: "서울특별시 강남구 역삼동 737",
    region: "강남구 역삼동",
    latitude: 37.5,
    longitude: 127.0364,
  },
  {
    keyword: "강남",
    roadAddress: "서울특별시 강남구 삼성로 212",
    jibunAddress: "서울특별시 강남구 삼성동 159",
    region: "강남구 삼성동",
    latitude: 37.5088,
    longitude: 127.063,
  },
  {
    keyword: "강남",
    roadAddress: "서울특별시 강남구 도산대로 402",
    jibunAddress: "서울특별시 강남구 청담동 4-2",
    region: "강남구 청담동",
    latitude: 37.5254,
    longitude: 127.0525,
  },
  {
    keyword: "을지로",
    roadAddress: "서울특별시 중구 을지로 100",
    jibunAddress: "서울특별시 중구 을지로2가 199",
    region: "중구 을지로",
    latitude: 37.5663,
    longitude: 126.991,
  },
  {
    keyword: "종로",
    roadAddress: "서울특별시 종로구 효자로 33",
    jibunAddress: "서울특별시 종로구 통의동 2-1",
    region: "종로구 통의동",
    latitude: 37.5765,
    longitude: 126.972,
  },
  {
    keyword: "연남",
    roadAddress: "서울특별시 마포구 동교로 254",
    jibunAddress: "서울특별시 마포구 연남동 227-15",
    region: "마포구 연남동",
    latitude: 37.5626,
    longitude: 126.925,
  },
];

/** 알림함 — GET /user/notifications */
export const notifications: MockNotification[] = [
  {
    id: "601",
    type: "EVENT_REMINDER" as NotificationType,
    title: "이벤트가 곧 시작됩니다.",
    body: "성수 팝업 위크가 이번 주말 종료돼요.",
    eventId: "801",
    read: false,
    createdAt: "2026-09-21T09:00:00+09:00",
  },
  {
    id: "602",
    type: "ANALYSIS_COMPLETED" as NotificationType,
    title: "분석이 끝났어요.",
    body: "좋아요 영상 120개에서 장소 87곳을 정리했어요.",
    eventId: null,
    read: false,
    createdAt: "2026-09-21T08:30:00+09:00",
  },
  {
    id: "603",
    type: "EVENT_REMINDER" as NotificationType,
    title: "이벤트가 곧 시작됩니다.",
    body: "보안여관 기획전이 다음 주 종료돼요.",
    eventId: "802",
    read: true,
    createdAt: "2026-09-20T18:00:00+09:00",
  },
];

/** 프로필 이미지 — PATCH /user 는 profileImageUrl 이 아니라 profileImageId 를 받는다.
    업로드 엔드포인트가 명세에 없어, 프리셋에만 id 를 부여해 두었다(확인 필요). */
export const profileImages: ProfileImagePreset[] = [
  { id: "301", grad: "g1", emoji: "🧡" },
  { id: "302", grad: "g2", emoji: "🌙" },
  { id: "303", grad: "g3", emoji: "🌿" },
  { id: "304", grad: "g4", emoji: "☀️" },
  { id: "305", grad: "g5", emoji: "🍒" },
  { id: "306", grad: "g6", emoji: "🗺️" },
  { id: "307", grad: "g1", emoji: "☕️" },
  { id: "308", grad: "g2", emoji: "🎈" },
];

/** 챗봇이 조건을 여러 지역으로 되물을 때 쓰는 후보 */
export const ambiguousRegions: Record<string, string[]> = {
  중구: ["서울 중구", "부산 중구", "대구 중구", "대전 중구", "울산 중구"],
  성수: ["서울 성동구 성수동1가", "서울 성동구 성수동2가"],
};

/** 추천 후보 원형 — buildResult() 가 실제 Candidate 로 변환한다. */
export const candidateSeeds: CandidateSeed[] = [
  {
    candidateId: "candidate-1",
    rank: 1,
    name: "성수 감성 카페 투어",
    area: "성수동",
    estimatedDurationMinutes: 222,
    components: [
      {
        sequence: 1,
        guideId: "706",
        type: "PLACE",
        name: "카페 온화",
        category: "CAFE",
        estimatedStayMinutes: 60,
        travelMinutes: 12,
        reason: "좋아요한 쇼츠 2편에 등장한 조용한 디저트 카페예요.",
      },
      {
        sequence: 2,
        guideId: "705",
        type: "PLACE",
        name: "대림창고",
        category: "CAFE",
        estimatedStayMinutes: 70,
        travelMinutes: 15,
        reason: "도보 15분 거리라 동선이 끊기지 않아요.",
      },
      {
        sequence: 3,
        guideId: "704",
        type: "EVENT",
        name: "성수연방",
        category: "POPUP",
        estimatedStayMinutes: 50,
        travelMinutes: 15,
        reason: "요청한 팝업 조건에 맞고 오후 8시까지 열어요.",
      },
    ],
  },
  {
    candidateId: "candidate-2",
    rank: 2,
    name: "팝업 스토어 집중 코스",
    area: "성수동",
    estimatedDurationMinutes: 138,
    components: [
      {
        sequence: 1,
        guideId: "704",
        type: "EVENT",
        name: "성수연방",
        category: "POPUP",
        estimatedStayMinutes: 60,
        travelMinutes: 9,
        reason: "팝업 위크 기간이라 이번 주말까지만 볼 수 있어요.",
      },
      {
        sequence: 2,
        guideId: "801",
        type: "EVENT",
        name: "성수 팝업 위크",
        category: "POPUP",
        estimatedStayMinutes: 60,
        travelMinutes: 9,
        reason: "한 블록 거리에서 12개 브랜드를 함께 볼 수 있어요.",
      },
    ],
  },
  {
    candidateId: "candidate-3",
    rank: 3,
    name: "카페 + 팝업 혼합 코스",
    area: "성수동",
    estimatedDurationMinutes: 295,
    components: [
      {
        sequence: 1,
        guideId: "706",
        type: "PLACE",
        name: "카페 온화",
        category: "CAFE",
        estimatedStayMinutes: 50,
        travelMinutes: 12,
        reason: "출발지에서 가장 가까운 좋아요 장소예요.",
      },
      {
        sequence: 2,
        guideId: "704",
        type: "EVENT",
        name: "성수연방",
        category: "POPUP",
        estimatedStayMinutes: 60,
        travelMinutes: 14,
        reason: "팝업 조건을 채우는 지점이에요.",
      },
      {
        sequence: 3,
        guideId: "705",
        type: "PLACE",
        name: "대림창고",
        category: "CAFE",
        estimatedStayMinutes: 60,
        travelMinutes: 16,
        reason: "늦은 오후에도 자리가 여유로운 편이에요.",
      },
      {
        sequence: 4,
        guideId: "701",
        type: "PLACE",
        name: "어라운드 성수",
        category: "CAFE",
        estimatedStayMinutes: 50,
        travelMinutes: 13,
        reason: "마무리하기 좋은 로스터리 카페로 골랐어요.",
      },
    ],
  },
];

/** 목록에서 id 로 하나 찾기 — 문자열 비교로 통일(경로 파라미터는 항상 string) */
export function byId<T extends { id: string }>(
  list: T[],
  id: string | undefined | null,
): T | null {
  if (id == null) return null;
  return list.find((item) => item.id === String(id)) ?? null;
}

/** 추천 컴포넌트가 가리키는 장소/이벤트의 좌표 — 코스 상세 지도 마커용(명세 미정, 백엔드 확인 요청).
    endpoints.js 의 guidePoint() 와 동일한 조회 순서를 그대로 쓴다: type 에 맞는 목록을 먼저 보고,
    없으면 장소 → 이벤트 순으로 다시 찾는다. 이벤트 원형에는 좌표 필드가 없어서, EVENT 컴포넌트는
    프로토타입과 마찬가지로 좌표 없이 내려간다(이벤트에 좌표를 붙일지는 백엔드 확인 필요). */
export function guidePoint(
  guideId: string,
  type: "PLACE" | "EVENT",
): { latitude: number | null; longitude: number | null } | null {
  const primary =
    type === "EVENT"
      ? (byId(events, guideId) as unknown)
      : (byId(places, guideId) as unknown);
  const found =
    primary ??
    (byId(places, guideId) as unknown) ??
    (byId(events, guideId) as unknown);
  if (!found) return null;
  const coords = found as {
    latitude?: number | null;
    longitude?: number | null;
  };
  return {
    latitude: coords.latitude ?? null,
    longitude: coords.longitude ?? null,
  };
}
