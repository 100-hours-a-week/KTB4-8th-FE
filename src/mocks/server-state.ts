/* Mock 서버 상태 — 프로토타입 js/api/endpoints.js 의 `srv` 를 그대로 옮긴다.
   브라우저에 남는 유일한 "서버"이자, 새로고침해도 이어지도록 localStorage 에 함께 저장한다.
   DEV 패널이 쓰던 forcedError 류는 v1에 없어 걷어냈다 — 대신 데이터 상태만 setMockDataState() 로 남겨 둔다. */
import type {
  CandidateComponent,
  ChatMessage,
  Category,
  CourseSummary,
  OauthAccount,
} from "@/types/api";

const SKEY = "keepgo.mock.server.v1";

/** 분석·동기화 진행률을 흉내 낼 데이터 상태.
    normal 은 srv.sync 의 경과 시간으로 empty → running → done 을 스스로 흘려보낸다(프로토타입과 동일). */
export type MockDataState = "normal" | "noLikes" | "noPlaces" | "analyzing";

export interface SyncState {
  syncId: string;
  state: "QUEUED" | "RUNNING" | "COMPLETED";
  startedAt: number;
}

export interface CollectionItemRecord {
  id: string;
  itemType: "PLACE" | "EVENT";
  itemId: string;
  createdAt: string;
}

/** 보관함에 저장된 코스 — CourseSummary(명세) + 지도/상세에 쓰는 내부 필드 */
export interface StoredCourse extends CourseSummary {
  components: CandidateComponent[];
  startAt: string;
  endAt: string;
  createdAt: string;
}

/** POST /user/recommendations 요청 본문 — 명세에 전용 타입이 없어 목 레이어에서 정의한다 */
export interface RecommendationRequestBody {
  startAt: string;
  endAt: string;
  currentLocation: { latitude: number; longitude: number };
  preferences?: Category[];
}

export interface RecommendationRunRecord {
  runId: string;
  state: "QUEUED" | "RUNNING" | "COMPLETED";
  startedAt: number;
  request: RecommendationRequestBody;
  expiresAt: string;
}

export interface MockUser {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
}

/** PATCH /user/notifications/settings 가 다루는 값 — 공유 타입 NotificationSettings 와 같은 필드명을 쓴다 */
export interface NotificationSettingsState {
  eventReminder: boolean;
  analysisCompleted: boolean;
  marketing: boolean;
}

export interface ServerState {
  seq: number;
  items: CollectionItemRecord[];
  courses: StoredCourse[];
  chat: ChatMessage[];
  runs: Record<string, RecommendationRunRecord>;
  sync: SyncState | null;
  user: MockUser | null;
  account: OauthAccount | null;
  notiRead: Record<string, boolean>;
  notificationSettings: NotificationSettingsState;
  dataState: MockDataState;
}

function baseState(): ServerState {
  return {
    seq: 900,
    items: [],
    courses: [],
    chat: [],
    runs: {},
    sync: null,
    user: null,
    account: null,
    notiRead: {},
    notificationSettings: {
      eventReminder: true,
      analysisCompleted: true,
      marketing: false,
    },
    dataState: "normal",
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function loadSrv(): ServerState {
  const base = baseState();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(SKEY);
    if (!raw) return base;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return base;
    return { ...base, ...(parsed as Partial<ServerState>) };
  } catch {
    return base;
  }
}

let srv: ServerState = loadSrv();

/** srv 변경 뒤에는 항상 이걸 호출한다 — endpoints.js 의 saveSrv() 와 같은 역할 */
export function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SKEY, JSON.stringify(srv));
  } catch {
    /* 프라이빗 모드 등 저장 불가 환경에서도 메모리 상태로는 계속 동작한다 */
  }
}

/** 핸들러가 상태를 읽고/고치는 유일한 통로. 반환값은 참조이므로 고친 뒤 persist() 를 호출한다. */
export function getServerState(): ServerState {
  return srv;
}

export function nextId(): string {
  srv.seq += 1;
  return String(srv.seq);
}

/** 로그인 계정이 바뀔 때 등, endpoints.js 의 resetSrv() 와 동일하게 완전히 새로 만든다 */
export function resetMockServer(): void {
  srv = baseState();
  persist();
}

export function setMockDataState(state: MockDataState): void {
  srv.dataState = state;
  persist();
}

export function getMockDataState(): MockDataState {
  return srv.dataState;
}
