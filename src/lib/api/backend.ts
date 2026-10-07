/* 백엔드(KTB4-8th-BE) 어댑터.
   BE 는 아직 명세(2026-09-21)의 { data } envelope · Problem Details 를 따르지 않고 DTO 를 snake_case 로 그대로 돌려준다.
   실서버로 보내는 API 는 여기 표에 등록하고, 요청 · 응답을 FE 도메인 타입으로 옮겨 화면은 그대로 둔다.
   */
import type {
  Advertisement,
  Candidate,
  Category,
  Place,
  RecommendationRun,
  User,
} from "@/types/api";

interface BackendRoute {
  /** "GET /places" — API_BASE 를 뺀 경로 */
  key: string;
  /** BE 가 필수로 요구하지만 FE 에는 없는 쿼리를 덧붙인다 */
  search?: string;
  response: (raw: unknown) => unknown;
}

interface BeAdvertisement {
  attached_image_url?: string;
  title?: string;
  description?: string;
}

interface BeHotPlace {
  attached_image_url?: string;
  name?: string;
  location?: string;
  category?: string;
}

interface BeMember {
  nickname?: string;
  email?: string;
  profile_image_url?: string | null;
}

export const CATEGORY_BY_LABEL: Record<string, Category> = {
  카페: "CAFE",
  디저트: "DESSERT",
  맛집: "RESTAURANT",
  식당: "RESTAURANT",
  술집: "BAR",
  팝업: "POPUP",
  셀렉트샵: "SELECTSHOP",
  전시: "EXHIBITION",
  공연: "PERFORMANCE",
  산책: "WALK",
};

function toAdvertisements(raw: unknown): Advertisement[] {
  const list = (raw as { advertisements?: BeAdvertisement[] } | null)
    ?.advertisements;
  return (list ?? []).map((a, i) => ({
    id: `be-ad-${i}`,
    // 대상 이벤트가 없어 상세로 이어지지 않는다(AdCard 가 준비 중 안내를 띄운다)
    guideId: "",
    title: a.title ?? "",
    summary: a.description ?? "",
    content: a.description ?? "",
    startAt: "",
    endAt: "",
  }));
}

function toPlaces(raw: unknown): Place[] {
  const list = (raw as { hot_places?: BeHotPlace[] } | null)?.hot_places;
  return (list ?? []).map((p, i) => ({
    id: `be-place-${i}`,
    name: p.name ?? "",
    category: CATEGORY_BY_LABEL[p.category ?? ""] ?? "CAFE",
    description: null,
    googlePlaceId: null,
    imageUrl: null,
    latitude: null,
    longitude: null,
    region: p.location ?? null,
  }));
}

function toUser(raw: unknown): User {
  const m = (raw ?? {}) as BeMember;
  return {
    // BE 응답에 회원 id 가 없다 — 화면은 캐시 키 용도로만 쓰고 실제 식별엔 안 쓴다
    id: "me",
    nickname: m.nickname ?? "",
    profileImageUrl: m.profile_image_url ?? null,
    email: m.email,
    // BE 에 알림 설정 · 가입일 조회 API 가 아직 없다 — 화면이 기본값으로 동작하도록 채운다
    eventNotificationAgreed: true,
    analysisNotificationAgreed: true,
    createdAt: "",
  };
}

function toPatchUserResponse(raw: unknown) {
  const m = (raw ?? {}) as BeMember;
  return {
    nickname: m.nickname ?? "",
    profileImageUrl: m.profile_image_url ?? null,
  };
}

interface BeRecommendationItem {
  sequence?: number;
  name?: string;
  category?: string;
  /** BE 버그 — 설명이 아니라 이전 장소에서의 이동 시간(분)이 문자열로 들어있다 */
  description?: string;
  lat?: number | null;
  lng?: number | null;
}

interface BeRecommendationDetail {
  title?: string;
  total_travel_time?: number;
  items?: BeRecommendationItem[];
}

interface BeRecommendationMetadata {
  location?: string;
  scheduled_time?: string;
}

/** BE 는 추천을 202+폴링이 아니라 한 번의 POST 로 동기 처리해서 바로 돌려주고,
    필드명도 FE 가 쓰던 candidates/emptyReason 이 아니라 metadata/snippets/details 다
    (게다가 BE 전체가 SNAKE_CASE 라 total_travel_time 처럼 받는다).
    snippets 는 details 와 같은 순서 · 같은 정보를 요약한 것뿐이라 details 만 쓴다.
    BE 응답엔 후보별 candidateId · 코스 전체 소요시간 · 장소별 도착시각/머무름시간이 아예
    없다 — 억지로 숫자를 만들어내지 않고 없는 채로 둔다(화면이 있을 때만 보여준다). */
/** AI 가 코스 이름 앞에 붙이기도 하는 "[코스 1]" 같은 순번 표시를 뗀다(순위는 화면에 따로 나온다). */
function cleanCourseTitle(title: string | undefined): string {
  const raw = title ?? "";
  return raw.replace(/^\s*\[\s*코스\s*\d+\s*\]\s*/, "") || raw;
}

function toRecommendationRun(raw: unknown): RecommendationRun {
  const r = (raw ?? {}) as {
    metadata?: BeRecommendationMetadata;
    details?: BeRecommendationDetail[];
  };
  const area = r.metadata?.location ?? "";
  const scheduledTime = r.metadata?.scheduled_time ?? "";
  const details = r.details ?? [];

  const candidates: Candidate[] = details.map((d, i) => ({
    candidateId: `be-candidate-${i}`,
    rank: i + 1,
    name: cleanCourseTitle(d.title),
    area,
    startAt: scheduledTime,
    endAt: scheduledTime,
    totalTravelMinutes: d.total_travel_time,
    components: (d.items ?? []).map((item, j) => {
      const travelMinutes = item.description ? Number(item.description) : NaN;
      return {
        // BE 순번은 0부터 오므로 그대로 쓰지 않고 목록 순서대로 1부터 매긴다
        sequence: j + 1,
        guideId: `be-candidate-${i}-place-${j}`,
        type: "PLACE" as const,
        name: item.name ?? "",
        category: CATEGORY_BY_LABEL[item.category ?? ""] ?? "CAFE",
        travelMinutes: Number.isFinite(travelMinutes)
          ? travelMinutes
          : undefined,
        latitude: item.lat ?? null,
        longitude: item.lng ?? null,
      };
    }),
  }));

  return {
    runId: "sync",
    state: "COMPLETED",
    candidates,
  };
}

export const BACKEND_ROUTES: BackendRoute[] = [
  { key: "GET /user", response: toUser },
  { key: "PATCH /user", response: toPatchUserResponse },
  { key: "GET /advertisements", response: toAdvertisements },
  // BE 는 cursor 를 필수 파라미터로 받는다(빈 값이면 첫 페이지)
  { key: "GET /places", search: "cursor=", response: toPlaces },
  { key: "POST /user/recommendation", response: toRecommendationRun },
];

/** 이 요청을 어댑터가 맡는지 */
export function backendRoute(method: string, path: string) {
  const key = `${method} ${path}`;
  return BACKEND_ROUTES.find((r) => r.key === key) ?? null;
}

/** BE 가 Problem Details 없이 status 만 돌려줄 때 FE 오류 코드로 옮긴다 */
export function codeFromStatus(status: number): string {
  if (status === 400) return "MALFORMED_REQUEST";
  // 403 은 인증 실패가 아니다 — BE 가 처리 못 한 예외도 빈 403 으로 떨어져 refresh · 로그아웃 루프가 된다
  if (status === 401) return "AUTHENTICATION_REQUIRED";
  return "INTERNAL_SERVER_ERROR";
}
