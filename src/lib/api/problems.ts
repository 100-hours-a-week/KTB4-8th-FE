/* 오류 규약 — RFC 9457 Problem Details.
   화면 분기는 status 가 아니라 code 로 한다. 재시도·폴링 간격은 retryAfterSeconds 를 따른다.
   프로토타입 js/api/errors.js 의 카탈로그를 그대로 이관했다. */

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code: string;
  traceId?: string;
  errors?: { field: string; message: string }[];
  retryAfterSeconds?: number;
  currentState?: string;
}

export interface ProblemSeed {
  status: number;
  type: string;
  title: string;
  detail: string;
  retryAfterSeconds?: number;
}

export const PROBLEMS: Record<string, ProblemSeed> = {
  MALFORMED_REQUEST: {
    status: 400,
    type: "/problems/malformed-request",
    title: "요청 형식이 올바르지 않습니다.",
    detail: "요청 본문을 해석할 수 없습니다.",
  },
  INVALID_RECOMMENDATION_RUN_ID: {
    status: 400,
    type: "/problems/invalid-recommendation-run-id",
    title: "추천 실행 ID 형식이 올바르지 않습니다.",
    detail: "runId는 유효한 추천 실행 식별자여야 합니다.",
  },
  AUTHENTICATION_REQUIRED: {
    status: 401,
    type: "/problems/authentication-required",
    title: "인증이 필요합니다.",
    detail: "유효한 액세스 토큰이 필요합니다.",
  },
  REFRESH_TOKEN_REQUIRED: {
    status: 401,
    type: "/problems/refresh-token-required",
    title: "Refresh Token이 필요합니다.",
    detail: "로그인 세션을 갱신할 수 없습니다. 다시 로그인해 주세요.",
  },
  CSRF_VALIDATION_FAILED: {
    status: 403,
    type: "/problems/csrf-validation-failed",
    title: "요청의 출처를 확인할 수 없습니다.",
    detail: "CSRF 검증에 실패했습니다.",
  },
  RECOMMENDATION_ACCESS_DENIED: {
    status: 403,
    type: "/problems/recommendation-access-denied",
    title: "추천 결과에 접근할 수 없습니다.",
    detail: "해당 추천 실행을 요청한 사용자가 아닙니다.",
  },
  PLACE_NOT_FOUND: {
    status: 404,
    type: "/problems/place-not-found",
    title: "장소를 찾을 수 없습니다.",
    detail: "요청한 장소가 존재하지 않습니다.",
  },
  EVENT_NOT_FOUND: {
    status: 404,
    type: "/problems/event-not-found",
    title: "이벤트를 찾을 수 없습니다.",
    detail: "요청한 이벤트가 존재하지 않습니다.",
  },
  COURSE_NOT_FOUND: {
    status: 404,
    type: "/problems/course-not-found",
    title: "여정 코스를 찾을 수 없습니다.",
    detail: "요청한 여정 코스가 존재하지 않습니다.",
  },
  ADVERTISEMENT_NOT_FOUND: {
    status: 404,
    type: "/problems/advertisement-not-found",
    title: "광고를 찾을 수 없습니다.",
    detail: "요청한 광고가 존재하지 않습니다.",
  },
  OUTING_ITEM_NOT_FOUND: {
    status: 404,
    type: "/problems/outing-item-not-found",
    title: "보관할 항목을 찾을 수 없습니다.",
    detail: "요청한 여정 항목이 존재하지 않습니다.",
  },
  ANALYSIS_RUN_NOT_FOUND: {
    status: 404,
    type: "/problems/analysis-run-not-found",
    title: "영상 분석 작업을 찾을 수 없습니다.",
    detail: "요청한 영상 분석 작업이 존재하지 않습니다.",
  },
  COLLECTION_NOT_FOUND: {
    status: 404,
    type: "/problems/collection-not-found",
    title: "공유 보관함을 찾을 수 없습니다.",
    detail: "요청한 공유 보관함이 존재하지 않습니다.",
  },
  COLLECTION_ACCESS_DENIED: {
    status: 403,
    type: "/problems/collection-access-denied",
    title: "공유 보관함에 접근할 수 없습니다.",
    detail: "해당 공유 보관함의 구성원이 아닙니다.",
  },
  INVITATION_EXPIRED: {
    status: 410,
    type: "/problems/invitation-expired",
    title: "초대 링크가 만료되었습니다.",
    detail: "초대 링크의 24시간 유효기간이 지났습니다.",
  },
  RECOMMENDATION_RUN_NOT_FOUND: {
    status: 404,
    type: "/problems/recommendation-run-not-found",
    title: "추천 실행을 찾을 수 없습니다.",
    detail: "요청한 추천 실행이 존재하지 않습니다.",
  },
  SYNC_ALREADY_IN_PROGRESS: {
    status: 409,
    type: "/problems/sync-already-in-progress",
    title: "동기화가 이미 진행 중입니다.",
    detail: "기존 동기화가 완료된 후 다시 요청해 주세요.",
  },
  RECOMMENDATION_NOT_COMPLETED: {
    status: 409,
    type: "/problems/recommendation-not-completed",
    title: "추천이 아직 완료되지 않았습니다.",
    detail: "추천 결과가 생성된 후 다시 요청해 주세요.",
    retryAfterSeconds: 3,
  },
  USER_VALIDATION_FAILED: {
    status: 422,
    type: "/problems/validation-failed",
    title: "요청값이 유효하지 않습니다.",
    detail: "입력값을 확인해 주세요.",
  },
  COLLECTION_VALIDATION_FAILED: {
    status: 422,
    type: "/problems/validation-failed",
    title: "요청값이 유효하지 않습니다.",
    detail: "입력값을 확인해 주세요.",
  },
  RECOMMENDATION_LIMIT_EXCEEDED: {
    status: 429,
    type: "/problems/rate-limit-exceeded",
    title: "요청 횟수를 초과했습니다.",
    detail: "60초 후 다시 시도해 주세요.",
    retryAfterSeconds: 60,
  },
  TOKEN_REFRESH_LIMIT_EXCEEDED: {
    status: 429,
    type: "/problems/token-refresh-limit-exceeded",
    title: "토큰 재발급 요청이 너무 많습니다.",
    detail: "60초 후 다시 시도해 주세요.",
    retryAfterSeconds: 60,
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    type: "/problems/internal-server-error",
    title: "서버 내부 오류가 발생했습니다.",
    detail: "요청을 처리하는 중 예상하지 못한 오류가 발생했습니다.",
  },
  YOUTUBE_SERVICE_FAILURE: {
    status: 502,
    type: "/problems/external-service-failure",
    title: "외부 서비스 요청에 실패했습니다.",
    detail: "YouTube 서비스와 일시적으로 통신할 수 없습니다.",
  },
  AUTHENTICATION_SERVICE_UNAVAILABLE: {
    status: 503,
    type: "/problems/authentication-service-unavailable",
    title: "인증 서비스를 일시적으로 이용할 수 없습니다.",
    detail: "로그인 세션을 갱신할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    retryAfterSeconds: 30,
  },
  CHAT_SERVICE_UNAVAILABLE: {
    status: 503,
    type: "/problems/service-unavailable",
    title: "서비스를 일시적으로 이용할 수 없습니다.",
    detail: "현재 AI 분석 서비스가 혼잡합니다. 잠시 후 다시 시도해 주세요.",
    retryAfterSeconds: 30,
  },
  RECOMMENDATION_SERVICE_UNAVAILABLE: {
    status: 503,
    type: "/problems/recommendation-service-unavailable",
    title: "추천 서비스를 일시적으로 이용할 수 없습니다.",
    detail: "추천 결과를 조회할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    retryAfterSeconds: 30,
  },
  YOUTUBE_SERVICE_TIMEOUT: {
    status: 504,
    type: "/problems/upstream-timeout",
    title: "연동 서비스의 응답 시간이 초과되었습니다.",
    detail: "연동 서비스가 제한 시간 안에 응답하지 않았습니다.",
  },
};

export type Tone = "error" | "warn" | "info" | "ok";
export type Effect = "RELOGIN" | "FIELD" | "RETRY" | "RETRY_AFTER";

export interface UiRule {
  tone: Tone;
  text: string;
  effect?: Effect;
  silent?: boolean;
}

export const UI: Record<string, UiRule> = {
  MALFORMED_REQUEST: {
    tone: "error",
    text: "요청 형식이 올바르지 않아요. 입력값을 확인해 주세요.",
  },
  INVALID_RECOMMENDATION_RUN_ID: {
    tone: "error",
    text: "추천 요청 정보를 찾을 수 없어요. 다시 추천받아 주세요.",
  },
  AUTHENTICATION_REQUIRED: {
    tone: "error",
    text: "로그인이 만료되었어요. 다시 로그인해 주세요.",
    effect: "RELOGIN",
  },
  REFRESH_TOKEN_REQUIRED: {
    tone: "error",
    text: "세션을 갱신할 수 없어요. 다시 로그인해 주세요.",
    effect: "RELOGIN",
  },
  CSRF_VALIDATION_FAILED: {
    tone: "error",
    text: "요청 출처를 확인할 수 없어요. 다시 로그인해 주세요.",
    effect: "RELOGIN",
  },
  RECOMMENDATION_ACCESS_DENIED: {
    tone: "error",
    text: "이 추천 결과를 볼 권한이 없어요.",
  },
  PLACE_NOT_FOUND: {
    tone: "warn",
    text: "삭제되었거나 없는 장소예요.",
  },
  EVENT_NOT_FOUND: {
    tone: "warn",
    text: "종료되었거나 없는 이벤트예요.",
  },
  COURSE_NOT_FOUND: {
    tone: "warn",
    text: "삭제된 코스예요. 보관함을 새로고침할게요.",
  },
  ADVERTISEMENT_NOT_FOUND: {
    tone: "warn",
    text: "종료된 광고예요.",
  },
  OUTING_ITEM_NOT_FOUND: {
    tone: "warn",
    text: "이미 삭제된 항목이에요.",
  },
  ANALYSIS_RUN_NOT_FOUND: {
    tone: "warn",
    text: "분석 작업을 찾을 수 없어요.",
  },
  COLLECTION_NOT_FOUND: {
    tone: "warn",
    text: "공유 보관함을 찾을 수 없어요.",
  },
  COLLECTION_ACCESS_DENIED: {
    tone: "error",
    text: "이 공유 보관함의 구성원이 아니에요.",
  },
  INVITATION_EXPIRED: {
    tone: "warn",
    text: "초대 링크가 만료되었어요. 새 링크를 요청해 주세요.",
  },
  RECOMMENDATION_RUN_NOT_FOUND: {
    tone: "warn",
    text: "추천 결과가 만료되었어요. 조건을 다시 확인해 주세요.",
  },
  SYNC_ALREADY_IN_PROGRESS: {
    tone: "warn",
    text: "이미 동기화가 진행 중이에요. 완료된 뒤 다시 시도해 주세요.",
  },
  RECOMMENDATION_NOT_COMPLETED: {
    tone: "info",
    text: "추천을 만들고 있어요.",
    silent: true,
  },
  USER_VALIDATION_FAILED: {
    tone: "error",
    text: "입력값을 확인해 주세요.",
    effect: "FIELD",
  },
  COLLECTION_VALIDATION_FAILED: {
    tone: "error",
    text: "보관함에 추가할 수 없는 항목이에요.",
  },
  RECOMMENDATION_LIMIT_EXCEEDED: {
    tone: "warn",
    text: "추천 요청이 너무 잦아요.",
    effect: "RETRY_AFTER",
  },
  TOKEN_REFRESH_LIMIT_EXCEEDED: {
    tone: "warn",
    text: "잠시 후 다시 시도해 주세요.",
    effect: "RETRY_AFTER",
  },
  INTERNAL_SERVER_ERROR: {
    tone: "error",
    text: "일시적인 오류예요. 잠시 후 다시 시도해 주세요.",
    effect: "RETRY",
  },
  YOUTUBE_SERVICE_FAILURE: {
    tone: "error",
    text: "YouTube와 연결하지 못했어요.",
    effect: "RETRY",
  },
  AUTHENTICATION_SERVICE_UNAVAILABLE: {
    tone: "error",
    text: "인증 서비스를 이용할 수 없어요.",
    effect: "RETRY_AFTER",
  },
  CHAT_SERVICE_UNAVAILABLE: {
    tone: "error",
    text: "AI 분석 서비스가 혼잡해요.",
    effect: "RETRY_AFTER",
  },
  RECOMMENDATION_SERVICE_UNAVAILABLE: {
    tone: "error",
    text: "추천 서비스를 이용할 수 없어요.",
    effect: "RETRY_AFTER",
  },
  YOUTUBE_SERVICE_TIMEOUT: {
    tone: "error",
    text: "YouTube 응답이 지연되고 있어요.",
    effect: "RETRY",
  },
};
