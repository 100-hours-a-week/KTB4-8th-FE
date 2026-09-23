/* BE-FE · AI API 명세서(2026-09-21) 기준 응답 타입.
   명세에 아직 없어 프론트가 임시로 쓰는 필드는 optional 로 두고 주석을 달았다. */

export type Category =
  | "CAFE"
  | "DESSERT"
  | "RESTAURANT"
  | "BAR"
  | "POPUP"
  | "SELECTSHOP"
  | "EXHIBITION"
  | "PERFORMANCE"
  | "WALK";

export type ItemType = "PLACE" | "EVENT" | "COURSE";

/** 성공 응답은 한 겹 감싸여 온다 */
export interface Envelope<T> {
  data: T;
  page?: Page;
}

export interface Page {
  nextCursor: string | null;
  hasNext: boolean;
}

/* ── 인증 ───────────────────────────────────────────────── */

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  isNewUser?: boolean;
}

export interface User {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
  /** 명세의 GET /user 응답에는 email 이 없다 — GET /user/accounts 로 조회한다 */
}

export interface OauthAccount {
  id: string;
  provider: "GOOGLE";
  email: string;
  youtubeConnected: boolean;
  connectedAt: string;
}

export interface AnalyticsStatistics {
  syncedVideoCount: number;
  pendingVideoCount: number;
  inProgressVideoCount: number;
  completedVideoCount: number;
  failedVideoCount: number;
  extractedGuideCount: number;
}

export interface LikedVideoSync {
  syncId: string;
  state: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  retryAfterSeconds?: number;
}

/* ── 알림 ───────────────────────────────────────────────── */

export type NotificationType =
  "EVENT_REMINDER" | "ANALYSIS_COMPLETED" | "GENERAL";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  eventReminder: boolean;
  analysisCompleted: boolean;
  marketing: boolean;
}

/* ── 장소 · 이벤트 · 광고 ──────────────────────────────── */

export interface Place {
  id: string;
  name: string;
  category: Category;
  description: string | null;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  saved?: boolean;
  /** 명세에 없음 — 카드·상세의 지역 라벨용 (백엔드 확인 요청) */
  region?: string | null;
}

export interface EventItem {
  id: string;
  name: string;
  category: Category;
  description: string | null;
  startAt: string;
  endAt: string;
  imageUrl: string | null;
  placeId: string | null;
  saved?: boolean;
  /** 명세에 없음 — 지역 라벨용 */
  region?: string | null;
}

export interface Advertisement {
  id: string;
  guideId: string;
  title: string;
  summary: string;
  content: string;
  startAt: string;
  endAt: string;
}

/* ── 보관함 ─────────────────────────────────────────────── */

export interface CollectionItem {
  id: string;
  itemType: ItemType;
  itemId: string;
  createdAt: string;
  item?: Place | EventItem | CourseSummary | null;
}

export interface CourseSummary {
  id: string;
  name: string;
  area: string;
  rank?: number;
  componentCount: number;
  estimatedDurationMinutes: number;
  totalTravelMinutes?: number;
}

/* ── 코스 추천 ──────────────────────────────────────────── */

export type TimeOfDay = "MORNING" | "AFTERNOON" | "EVENING";

/** AI 명세: available_time 은 180 · 360 · 540 (분) */
export type AvailableMinutes = 180 | 360 | 540;

export interface RecommendationSlots {
  region?: string | null;
  date?: string | null;
  timeOfDay?: TimeOfDay | null;
  availableMinutes?: AvailableMinutes | null;
  categories?: Category[];
}

export interface RecommendationRequest {
  origin?: { latitude: number; longitude: number } | null;
  region: string;
  datetime: string;
  availableTime: number;
  categories?: Category[];
}

export type RunState = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export interface RecommendationRun {
  runId: string;
  state: RunState;
  retryAfterSeconds?: number;
  expiresAt?: string;
  generatedAt?: string;
  candidates?: Candidate[];
  /** 명세에 없음 — 후보 0개 사유 (백엔드 확인 요청) */
  emptyReason?: EmptyReason | null;
}

export type EmptyReason =
  | "NO_LIKED_VIDEO"
  | "NO_PLACE_VIDEO"
  | "ANALYSIS_IN_PROGRESS"
  | "NO_MATCH"
  | "TOO_NARROW"
  | "VERIFICATION_PENDING";

export interface Candidate {
  candidateId: string;
  rank: number;
  name: string;
  area: string;
  startAt: string;
  endAt: string;
  estimatedDurationMinutes: number;
  /** 명세에 없음 — 후보 카드의 "총 N분 이동" */
  totalTravelMinutes?: number;
  components: CandidateComponent[];
}

export interface CandidateComponent {
  sequence: number;
  guideId: string;
  type: "PLACE" | "EVENT";
  name: string;
  category: Category;
  estimatedArrivalAt: string;
  estimatedStayMinutes: number;
  /** 명세에 없음 — AI 응답에는 존재 */
  travelMinutes?: number;
  reason?: string | null;
  /** 명세에 없음 — 코스 상세 지도 마커용 */
  latitude?: number | null;
  longitude?: number | null;
}

/* ── 챗봇 ───────────────────────────────────────────────── */

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface ChatReply {
  message: ChatMessage;
  /** 명세에 없음 — 조건 카드를 채울 구조화 필드 */
  extractedSlots?: RecommendationSlots;
  /** 명세에 없음 — 선택지 버튼 */
  options?: string[];
}

/* ── 주소 ───────────────────────────────────────────────── */

export interface AddressResult {
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
}
