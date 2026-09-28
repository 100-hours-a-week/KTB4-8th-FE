/* 백엔드(KTB4-8th-BE) 어댑터.
   BE 는 아직 명세(2026-09-21)의 { data } envelope · Problem Details 를 따르지 않고 DTO 를 snake_case 로 그대로 돌려준다.
   실서버로 보내는 API 는 여기 표에 등록하고, 요청 · 응답을 FE 도메인 타입으로 옮겨 화면은 그대로 둔다.
   */
import type { Advertisement, Category, Place } from "@/types/api";

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

const CATEGORY_BY_LABEL: Record<string, Category> = {
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

export const BACKEND_ROUTES: BackendRoute[] = [
  { key: "GET /advertisements", response: toAdvertisements },
  // BE 는 cursor 를 필수 파라미터로 받는다(빈 값이면 첫 페이지)
  { key: "GET /places", search: "cursor=", response: toPlaces },
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
