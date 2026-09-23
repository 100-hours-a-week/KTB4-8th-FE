/* MSW v2 핸들러 — 프로토타입 js/api/endpoints.js 의 라우팅 테이블을 그대로 옮긴다.
   프로토타입의 KG.api.transport() 가 하던 일(지연 시간, 인증 검사, 라우트 매칭)을
   여기서는 msw 가 대신하고, 각 라우트의 로직만 이 파일에 남는다. */
import { HttpResponse, delay, http } from "msw";
import { API_BASE, makeProblem } from "@/lib/api/client";
import type { Problem } from "@/lib/api/problems";
import { toIso, uid } from "@/lib/format";
import * as db from "./db";
import { analyze } from "./nlu";
import {
  getServerState,
  nextId,
  persist,
  resetMockServer,
  type CollectionItemRecord,
  type MockUser,
  type RecommendationRunRecord,
  type StoredCourse,
} from "./server-state";
import type {
  AddressResult,
  AnalyticsStatistics,
  AuthSession,
  Candidate,
  CandidateComponent,
  Category,
  ChatMessage,
  ChatReply,
  CollectionItem,
  EmptyReason,
  LikedVideoSync,
  OauthAccount,
  RecommendationRun,
  RecommendationSlots,
  User,
} from "@/types/api";

const LATENCY_MS = 320; // KG.api.config.latencyMs 와 동일
const GENERATION_MS = 4000; // KG.api.config.generationMs 와 동일(코스 추천 생성 시간)

const nowIso = () => toIso(new Date());

/** Problem Details 본문을 status 코드와 함께 응답으로 만든다 */
function problemResponse(
  code: string,
  instance: string,
  extra?: Partial<Problem>,
) {
  const problem = makeProblem(code, instance, extra);
  return HttpResponse.json(problem, { status: problem.status });
}

/** 인증이 필요한 라우트에서 Authorization 헤더 유무만 검사한다(목 서버는 토큰 내용을 해석하지 않는다) */
function requireAuth(request: Request, instance: string) {
  if (!request.headers.get("authorization")) {
    return problemResponse("AUTHENTICATION_REQUIRED", instance);
  }
  return null;
}

/** 본문 파싱 실패(빈 본문 등)도 null 로 받아 각 핸들러가 MALFORMED_REQUEST 로 응답하게 한다 */
async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** 장소/이벤트 응답에 saved 플래그를 붙인다 — endpoints.js 의 decorate() */
function decorate<T extends { id: string }>(
  item: T,
  itemType: "PLACE" | "EVENT",
): T & { saved: boolean } {
  const srv = getServerState();
  const saved = srv.items.some(
    (i) => i.itemType === itemType && i.itemId === item.id,
  );
  return { ...item, saved };
}

/** 데이터 상태 → 추천 결과가 비어야 하는 사유. normal/analyzing 은 정상적으로 후보를 만든다. */
function emptyReasonFor(
  state: ReturnType<typeof getServerState>["dataState"],
): EmptyReason | null {
  if (state === "noLikes") return "NO_LIKED_VIDEO";
  if (state === "noPlaces") return "NO_PLACE_VIDEO";
  return null;
}

/** 추천 후보 원형(candidateSeeds) → 실제 Candidate 로 변환한다 — endpoints.js 의 buildResult() */
function buildRecommendationResult(
  run: RecommendationRunRecord,
): RecommendationRun {
  const start = new Date(run.request.startAt);
  const prefs = run.request.preferences ?? [];

  let seeds = db.candidateSeeds;
  if (prefs.length) {
    const scored = seeds.filter((s) =>
      s.components.some((c) => prefs.includes(c.category)),
    );
    if (scored.length) seeds = scored;
  }

  const candidates: Candidate[] = seeds.map((seed) => {
    let cursor = new Date(start);
    const components: CandidateComponent[] = seed.components.map((c) => {
      cursor = new Date(cursor.getTime() + c.travelMinutes * 60000);
      const estimatedArrivalAt = toIso(cursor);
      cursor = new Date(cursor.getTime() + c.estimatedStayMinutes * 60000);
      const point = db.guidePoint(c.guideId, c.type);
      return {
        sequence: c.sequence,
        guideId: c.guideId,
        type: c.type,
        name: c.name,
        category: c.category,
        estimatedArrivalAt,
        estimatedStayMinutes: c.estimatedStayMinutes,
        travelMinutes: c.travelMinutes,
        reason: c.reason,
        latitude: point?.latitude ?? null,
        longitude: point?.longitude ?? null,
      };
    });
    const totalTravelMinutes = seed.components.reduce(
      (sum, c) => sum + c.travelMinutes,
      0,
    );
    return {
      candidateId: seed.candidateId,
      rank: seed.rank,
      name: seed.name,
      area: seed.area,
      startAt: toIso(start),
      endAt: toIso(cursor),
      estimatedDurationMinutes: Math.round(
        (cursor.getTime() - start.getTime()) / 60000,
      ),
      totalTravelMinutes,
      components,
    };
  });

  return {
    runId: run.runId,
    state: "COMPLETED",
    generatedAt: nowIso(),
    expiresAt: run.expiresAt,
    candidates,
  };
}

/** profileImageId → 화면이 쓸 URL. 프리셋은 'preset:<그라데이션>:<이모지>', 업로드는 dataURL 그대로. */
function resolveProfileImage(id: string | null): string | null {
  if (!id) return null;
  if (id.indexOf("upload:") === 0) return id.slice(7);
  const preset = db.profileImages.find((p) => p.id === id);
  return preset ? `preset:${preset.grad}:${preset.emoji}` : null;
}

/* ── 인증 ──────────────────────────────────────────────────────── */

interface LoginAccount {
  sub?: string;
  name: string;
  email: string;
  isNew?: boolean;
}

interface LoginBody {
  authorizationCode?: unknown;
  redirectUri?: unknown;
  account?: LoginAccount;
}

const loginHandler = http.post(
  `${API_BASE}/user/auth-session`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const body = (await readJson(request)) as LoginBody | null;
    if (!body || typeof body.authorizationCode !== "string") {
      return problemResponse("MALFORMED_REQUEST", "/user/auth-session");
    }

    const picked = body.account ?? db.MOCK_GOOGLE_ACCOUNTS[0];
    const isNew = !!body.account?.isNew;
    const srv = getServerState();
    const switched = !srv.account || srv.account.email !== picked.email;

    const current: MockUser = srv.user ?? {
      id: "101",
      nickname: picked.name,
      profileImageUrl: null,
      createdAt: nowIso(),
    };
    // 계정이 바뀌면(또는 신규 가입이면) 이름 · 사진 · 가입일을 새 계정 기준으로 다시 잡는다.
    // 같은 계정이면 프로필 수정으로 바꾼 값을 유지한다.
    if (switched || isNew) {
      current.nickname = picked.name;
      current.profileImageUrl = null;
      current.createdAt = nowIso();
    }
    srv.user = current;

    srv.account = {
      id: "201",
      provider: "GOOGLE",
      email: picked.email,
      youtubeConnected: true,
      connectedAt: nowIso(),
    };

    // 로그인할 때마다 동기화 상태를 비워, 홈의 "시작하기 — 좋아요 영상 불러오기" 카드부터 흐름을 볼 수 있게 한다.
    srv.sync = null;
    persist();

    const data: AuthSession = {
      accessToken: `mock.${uid("at")}`,
      tokenType: "Bearer",
      expiresIn: 3600,
      isNewUser: isNew,
    };
    return HttpResponse.json({ data }, { status: 201 });
  },
);

const refreshHandler = http.post(
  `${API_BASE}/user/auth-session/refresh`,
  async () => {
    await delay(LATENCY_MS);
    const data: AuthSession = {
      accessToken: `mock.${uid("at")}`,
      tokenType: "Bearer",
      expiresIn: 900,
    };
    return HttpResponse.json({ data });
  },
);

const logoutHandler = http.delete(
  `${API_BASE}/user/auth-session`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/auth-session");
    if (authErr) return authErr;
    // 실제 백엔드가 없는 Mock 환경에서는 로그아웃 = 계정 초기화다.
    // 이걸 안 하면 대화 · 보관함 등 이전 상태가 localStorage 에 남아,
    // 다시 로그인해도 이전 세션의 흔적이 그대로 보인다.
    resetMockServer();
    return new HttpResponse(null, { status: 204 });
  },
);

/* ── 사용자 ────────────────────────────────────────────────────── */

const getUserHandler = http.get(`${API_BASE}/user`, async ({ request }) => {
  await delay(LATENCY_MS);
  const authErr = requireAuth(request, "/user");
  if (authErr) return authErr;

  const srv = getServerState();
  const u = srv.user;
  // 명세의 GET /user 응답에는 email 이 없다 — 화면은 GET /user/accounts 의 email 을 쓴다.
  const data: User = {
    id: u?.id ?? "101",
    nickname: u?.nickname ?? "여행자",
    profileImageUrl: u?.profileImageUrl ?? null,
    createdAt: u?.createdAt ?? "2026-09-07T10:00:00+09:00",
  };
  return HttpResponse.json({ data });
});

interface PatchUserBody {
  nickname?: unknown;
  profileImageId?: unknown;
}

const patchUserHandler = http.patch(`${API_BASE}/user`, async ({ request }) => {
  await delay(LATENCY_MS);
  const authErr = requireAuth(request, "/user");
  if (authErr) return authErr;

  const body = (await readJson(request)) as PatchUserBody | null;
  if (!body) return problemResponse("MALFORMED_REQUEST", "/user");
  const hasName = Object.prototype.hasOwnProperty.call(body, "nickname");
  const hasPhoto = Object.prototype.hasOwnProperty.call(body, "profileImageId");
  if (!hasName && !hasPhoto)
    return problemResponse("MALFORMED_REQUEST", "/user");

  const srv = getServerState();
  const current: MockUser = srv.user ?? {
    id: "101",
    nickname: "여행자",
    profileImageUrl: null,
    createdAt: nowIso(),
  };

  if (hasName) {
    if (typeof body.nickname !== "string")
      return problemResponse("MALFORMED_REQUEST", "/user");
    const name = body.nickname.trim();
    // 기능정의서: 닉네임은 1~10자, 띄어쓰기·특수기호 불가
    if (name.length < 1 || name.length > 10) {
      return problemResponse("USER_VALIDATION_FAILED", "/user", {
        errors: [
          { field: "name", message: "사용자 이름은 10자 이하여야 합니다." },
        ],
      });
    }
    if (/[^가-힣a-zA-Z0-9]/.test(name)) {
      return problemResponse("USER_VALIDATION_FAILED", "/user", {
        errors: [
          { field: "name", message: "띄어쓰기와 특수기호는 쓸 수 없습니다." },
        ],
      });
    }
    current.nickname = name;
  }

  if (hasPhoto) {
    const v = body.profileImageId;
    if (v !== null && typeof v !== "string") {
      return problemResponse("USER_VALIDATION_FAILED", "/user", {
        errors: [
          {
            field: "profileImageId",
            message: "프로필 이미지 형식이 올바르지 않습니다.",
          },
        ],
      });
    }
    if (typeof v === "string" && v.length > 700000) {
      return problemResponse("USER_VALIDATION_FAILED", "/user", {
        errors: [
          { field: "profileImageId", message: "이미지 용량이 너무 큽니다." },
        ],
      });
    }
    current.profileImageUrl = resolveProfileImage(
      typeof v === "string" ? v : null,
    );
  }

  srv.user = current;
  persist();

  return HttpResponse.json({
    data: {
      id: current.id,
      nickname: current.nickname,
      profileImageUrl: current.profileImageUrl,
      updatedAt: nowIso(),
    },
  });
});

const analyticsHandler = http.get(
  `${API_BASE}/user/analytics-statistics`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/analytics-statistics");
    if (authErr) return authErr;

    const srv = getServerState();
    if (srv.dataState === "noLikes")
      return HttpResponse.json({ data: db.analytics.empty });
    if (srv.dataState === "noPlaces")
      return HttpResponse.json({ data: db.analytics.noPlace });
    if (srv.dataState === "analyzing")
      return HttpResponse.json({ data: db.analytics.running });

    // 명세에 동기화 상태 조회 API가 없어 이 수치로 진행률을 대신한다(백엔드 확인 요청).
    if (!srv.sync) return HttpResponse.json({ data: db.analytics.empty });

    const elapsed = Date.now() - srv.sync.startedAt;
    const total = db.analytics.done.syncedVideoCount;
    const ratio = Math.min(1, elapsed / 6000);
    if (ratio >= 1) {
      srv.sync.state = "COMPLETED";
      persist();
      return HttpResponse.json({ data: db.analytics.done });
    }
    srv.sync.state = "RUNNING";
    persist();
    const completed = Math.floor(total * ratio);
    const data: AnalyticsStatistics = {
      syncedVideoCount: total,
      pendingVideoCount: total - completed - 4,
      inProgressVideoCount: 4,
      completedVideoCount: completed,
      failedVideoCount: 0,
      extractedGuideCount: Math.floor(
        db.analytics.done.extractedGuideCount * ratio,
      ),
    };
    return HttpResponse.json({ data });
  },
);

const accountsHandler = http.get(
  `${API_BASE}/user/accounts`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/accounts");
    if (authErr) return authErr;
    const srv = getServerState();
    const data: OauthAccount[] = [srv.account ?? db.account];
    return HttpResponse.json({ data });
  },
);

const startSyncHandler = http.post(
  `${API_BASE}/user/liked-video-syncs`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/liked-video-syncs");
    if (authErr) return authErr;

    const srv = getServerState();
    if (
      srv.sync &&
      srv.sync.state !== "COMPLETED" &&
      Date.now() - srv.sync.startedAt < 12000
    ) {
      return problemResponse(
        "SYNC_ALREADY_IN_PROGRESS",
        "/user/liked-video-syncs",
      );
    }
    const syncId = nextId();
    srv.sync = { syncId, state: "QUEUED", startedAt: Date.now() };
    persist();

    const data: LikedVideoSync = { syncId, state: "QUEUED" };
    return HttpResponse.json({ data }, { status: 202 });
  },
);

interface PatchSettingsBody {
  eventReminder?: unknown;
  analysisCompleted?: unknown;
  marketing?: unknown;
}

const patchSettingsHandler = http.patch(
  `${API_BASE}/user/notifications/settings`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/notifications/settings");
    if (authErr) return authErr;

    const body = (await readJson(request)) as PatchSettingsBody | null;
    if (!body)
      return problemResponse(
        "MALFORMED_REQUEST",
        "/user/notifications/settings",
      );
    const has = (k: keyof PatchSettingsBody) =>
      Object.prototype.hasOwnProperty.call(body, k);
    if (
      !has("eventReminder") &&
      !has("analysisCompleted") &&
      !has("marketing")
    ) {
      return problemResponse(
        "MALFORMED_REQUEST",
        "/user/notifications/settings",
      );
    }

    const srv = getServerState();
    if (has("eventReminder"))
      srv.notificationSettings.eventReminder = !!body.eventReminder;
    if (has("analysisCompleted"))
      srv.notificationSettings.analysisCompleted = !!body.analysisCompleted;
    if (has("marketing")) srv.notificationSettings.marketing = !!body.marketing;
    persist();

    return HttpResponse.json({ data: { ...srv.notificationSettings } });
  },
);

const disconnectGoogleHandler = http.delete(
  `${API_BASE}/user/oauth-connections/google`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/oauth-connections/google");
    if (authErr) return authErr;

    const srv = getServerState();
    if (!srv.account)
      return problemResponse(
        "COLLECTION_NOT_FOUND",
        "/user/oauth-connections/google",
      );
    srv.account = { ...srv.account, youtubeConnected: false };
    srv.sync = null;
    persist();
    return new HttpResponse(null, { status: 204 });
  },
);

/* ── 알림함 ────────────────────────────────────────────────────── */

const notificationListHandler = http.get(
  `${API_BASE}/user/notifications`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/notifications");
    if (authErr) return authErr;
    const srv = getServerState();
    const data = db.notifications.map((n) => ({
      ...n,
      read: srv.notiRead[n.id] ?? n.read,
    }));
    return HttpResponse.json({
      data,
      page: { nextCursor: null, hasNext: false },
    });
  },
);

const notificationDetailHandler = http.get(
  `${API_BASE}/user/notifications/:notificationId`,
  async ({ request, params }) => {
    await delay(LATENCY_MS);
    const id = String(params.notificationId);
    const authErr = requireAuth(request, `/user/notifications/${id}`);
    if (authErr) return authErr;

    const n = db.notifications.find((x) => x.id === id);
    if (!n)
      return problemResponse(
        "ANALYSIS_RUN_NOT_FOUND",
        `/user/notifications/${id}`,
      );
    const srv = getServerState();
    return HttpResponse.json({
      data: { ...n, read: srv.notiRead[n.id] ?? n.read },
    });
  },
);

interface PatchNotificationBody {
  read?: unknown;
}

const notificationReadHandler = http.patch(
  `${API_BASE}/user/notifications/:notificationId`,
  async ({ request, params }) => {
    await delay(LATENCY_MS);
    const id = String(params.notificationId);
    const authErr = requireAuth(request, `/user/notifications/${id}`);
    if (authErr) return authErr;

    const n = db.notifications.find((x) => x.id === id);
    if (!n)
      return problemResponse(
        "ANALYSIS_RUN_NOT_FOUND",
        `/user/notifications/${id}`,
      );

    const body = (await readJson(request)) as PatchNotificationBody | null;
    const srv = getServerState();
    srv.notiRead[id] = !!body?.read;
    persist();
    return new HttpResponse(null, { status: 204 });
  },
);

/* ── 장소 · 이벤트 · 광고 ──────────────────────────────────────── */

const listPlacesHandler = http.get(
  `${API_BASE}/places`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const url = new URL(request.url);
    const sort = url.searchParams.get("sort");
    if (sort && sort !== "trending")
      return problemResponse("MALFORMED_REQUEST", "/places");

    const srv = getServerState();
    const data =
      srv.dataState === "noPlaces"
        ? []
        : db.places.map((p) => decorate(p, "PLACE"));
    return HttpResponse.json({
      data,
      page: { nextCursor: null, hasNext: false },
    });
  },
);

const getPlaceHandler = http.get(
  `${API_BASE}/places/:placeId`,
  async ({ params }) => {
    await delay(LATENCY_MS);
    const id = String(params.placeId);
    const p = db.byId(db.places, id);
    if (!p) return problemResponse("PLACE_NOT_FOUND", `/places/${id}`);
    return HttpResponse.json({ data: decorate(p, "PLACE") });
  },
);

const getEventHandler = http.get(
  `${API_BASE}/events/:eventId`,
  async ({ params }) => {
    await delay(LATENCY_MS);
    const id = String(params.eventId);
    const e = db.byId(db.events, id);
    if (!e) return problemResponse("EVENT_NOT_FOUND", `/events/${id}`);
    return HttpResponse.json({ data: decorate(e, "EVENT") });
  },
);

const listAdsHandler = http.get(`${API_BASE}/advertisements`, async () => {
  await delay(LATENCY_MS);
  return HttpResponse.json({
    data: db.advertisements,
    page: { nextCursor: null, hasNext: false },
  });
});

const getAdHandler = http.get(
  `${API_BASE}/advertisements/:advertisementId`,
  async ({ params }) => {
    await delay(LATENCY_MS);
    const id = String(params.advertisementId);
    const a = db.byId(db.advertisements, id);
    if (!a)
      return problemResponse(
        "ADVERTISEMENT_NOT_FOUND",
        `/advertisements/${id}`,
      );
    return HttpResponse.json({ data: a });
  },
);

/* ── 주소 검색 ─────────────────────────────────────────────────── */

const searchAddressHandler = http.get(
  `${API_BASE}/addresses`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/addresses");
    if (authErr) return authErr;

    const url = new URL(request.url);
    const q = (url.searchParams.get("query") ?? "").trim();
    if (!q) return problemResponse("MALFORMED_REQUEST", "/addresses");

    // 명세 응답 필드만 내려보낸다. keyword/region 은 목 내부 검색용이라 제외한다.
    const data: AddressResult[] = db.addresses
      .filter(
        (a) =>
          a.keyword.indexOf(q) === 0 ||
          a.region.indexOf(q) >= 0 ||
          a.roadAddress.indexOf(q) >= 0,
      )
      .map((a) => ({
        roadAddress: a.roadAddress,
        jibunAddress: a.jibunAddress,
        latitude: a.latitude,
        longitude: a.longitude,
      }));
    return HttpResponse.json({ data });
  },
);

/* ── 개인 보관함 ───────────────────────────────────────────────── */

interface SaveItemBody {
  itemType?: unknown;
  itemId?: unknown;
  /** itemType이 COURSE 일 때만 쓴다 — 추천 후보를 그대로 저장한다(명세 미정, 백엔드 확인 필요) */
  course?: Candidate;
}

const saveItemHandler = http.post(
  `${API_BASE}/user/collections/me/items`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/collections/me/items");
    if (authErr) return authErr;

    const body = (await readJson(request)) as SaveItemBody | null;
    if (!body || typeof body.itemType !== "string") {
      return problemResponse("MALFORMED_REQUEST", "/user/collections/me/items");
    }

    let kind = body.itemType;
    const srv = getServerState();

    if (kind === "COURSE") {
      if (!body.course || !Array.isArray(body.course.components)) {
        return problemResponse(
          "MALFORMED_REQUEST",
          "/user/collections/me/items",
        );
      }
      const course: StoredCourse = {
        id: nextId(),
        name: body.course.name,
        area: body.course.area,
        rank: body.course.rank,
        componentCount: body.course.components.length,
        estimatedDurationMinutes: body.course.estimatedDurationMinutes,
        totalTravelMinutes: body.course.totalTravelMinutes,
        components: body.course.components,
        startAt: body.course.startAt,
        endAt: body.course.endAt,
        createdAt: nowIso(),
      };
      srv.courses.unshift(course);
      persist();
      const data: CollectionItem = {
        id: course.id,
        itemType: "COURSE",
        itemId: course.id,
        createdAt: course.createdAt,
      };
      return HttpResponse.json({ data }, { status: 201 });
    }

    if (typeof body.itemId !== "string") {
      return problemResponse("MALFORMED_REQUEST", "/user/collections/me/items");
    }
    const itemId = body.itemId;

    // 명세 예시는 itemType: "GUIDE" 이고 조회 응답은 PLACE/EVENT/COURSE 다.
    // 어느 쪽이 맞는지 확인 전까지 GUIDE 도 받아 이벤트/장소로 해석한다.
    if (kind === "GUIDE") kind = db.byId(db.events, itemId) ? "EVENT" : "PLACE";

    if (kind !== "PLACE" && kind !== "EVENT") {
      return problemResponse("MALFORMED_REQUEST", "/user/collections/me/items");
    }
    const itemType = kind; // 위에서 'PLACE' | 'EVENT' 로 좁혔다

    const dup = srv.items.find(
      (i) => i.itemId === itemId && i.itemType === itemType,
    );
    if (dup)
      return problemResponse(
        "SYNC_ALREADY_IN_PROGRESS",
        "/user/collections/me/items",
      ); // 중복 보관

    const source =
      itemType === "EVENT"
        ? db.byId(db.events, itemId)
        : db.byId(db.places, itemId);
    if (!source) {
      return problemResponse(
        itemType === "EVENT" ? "EVENT_NOT_FOUND" : "PLACE_NOT_FOUND",
        "/user/collections/me/items",
      );
    }

    const rec: CollectionItemRecord = {
      id: nextId(),
      itemType,
      itemId,
      createdAt: nowIso(),
    };
    srv.items.unshift(rec);
    persist();

    const data: CollectionItem = {
      id: rec.id,
      itemType: rec.itemType,
      itemId: rec.itemId,
      createdAt: rec.createdAt,
    };
    return HttpResponse.json({ data }, { status: 201 });
  },
);

const listItemsHandler = http.get(
  `${API_BASE}/user/collections/me/items`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/collections/me/items");
    if (authErr) return authErr;

    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? "ALL";
    if (!["ALL", "PLACE", "EVENT", "COURSE"].includes(type)) {
      return problemResponse("MALFORMED_REQUEST", "/user/collections/me/items");
    }

    const srv = getServerState();
    let data: CollectionItem[] = [];

    if (type !== "COURSE") {
      data = srv.items
        .filter((i) => type === "ALL" || i.itemType === type)
        .map((i) => {
          const src =
            i.itemType === "EVENT"
              ? db.byId(db.events, i.itemId)
              : db.byId(db.places, i.itemId);
          return {
            id: i.id,
            itemType: i.itemType,
            itemId: i.itemId,
            createdAt: i.createdAt,
            item: src ?? null,
          };
        });
    }
    if (type === "ALL" || type === "COURSE") {
      data = data.concat(
        srv.courses.map((c) => ({
          id: c.id,
          itemType: "COURSE" as const,
          itemId: c.id,
          createdAt: c.createdAt,
          item: c,
        })),
      );
    }

    data.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return HttpResponse.json({
      data,
      page: { nextCursor: null, hasNext: false },
    });
  },
);

const deleteItemHandler = http.delete(
  `${API_BASE}/user/collections/me/items/:itemId`,
  async ({ request, params }) => {
    await delay(LATENCY_MS);
    const id = String(params.itemId);
    const authErr = requireAuth(request, `/user/collections/me/items/${id}`);
    if (authErr) return authErr;

    const srv = getServerState();
    const before = srv.items.length + srv.courses.length;
    srv.items = srv.items.filter((i) => i.id !== id);
    srv.courses = srv.courses.filter((c) => c.id !== id);
    if (srv.items.length + srv.courses.length === before) {
      return problemResponse(
        "OUTING_ITEM_NOT_FOUND",
        `/user/collections/me/items/${id}`,
      );
    }
    persist();
    return new HttpResponse(null, { status: 204 });
  },
);

const getCourseHandler = http.get(
  `${API_BASE}/user/collections/me/:courseId`,
  async ({ request, params }) => {
    await delay(LATENCY_MS);
    const id = String(params.courseId);
    const authErr = requireAuth(request, `/user/collections/me/${id}`);
    if (authErr) return authErr;

    const srv = getServerState();
    const course = srv.courses.find((c) => c.id === id);
    if (!course)
      return problemResponse("COURSE_NOT_FOUND", `/user/collections/me/${id}`);
    return HttpResponse.json({ data: { ...course, saved: true } });
  },
);

/* ── 코스 추천(작업 생성 → 폴링 → 결과) ──────────────────────────── */

interface CreateRecommendationBody {
  startAt?: unknown;
  endAt?: unknown;
  currentLocation?: { latitude?: unknown; longitude?: unknown };
  preferences?: unknown;
}

const createRecommendationHandler = http.post(
  `${API_BASE}/user/recommendations`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/recommendations");
    if (authErr) return authErr;

    const body = (await readJson(request)) as CreateRecommendationBody | null;
    if (
      !body ||
      typeof body.startAt !== "string" ||
      typeof body.endAt !== "string"
    ) {
      return problemResponse("MALFORMED_REQUEST", "/user/recommendations");
    }
    const loc = body.currentLocation;
    if (
      !loc ||
      typeof loc.latitude !== "number" ||
      typeof loc.longitude !== "number"
    ) {
      return problemResponse("MALFORMED_REQUEST", "/user/recommendations");
    }

    const srv = getServerState();
    const hasOpenRun = Object.values(srv.runs).some(
      (r) => r.state === "QUEUED" || r.state === "RUNNING",
    );
    if (hasOpenRun)
      return problemResponse(
        "SYNC_ALREADY_IN_PROGRESS",
        "/user/recommendations",
      );

    const runId = nextId();
    const startedAt = Date.now();
    const expiresAt = toIso(new Date(startedAt + 60 * 60 * 1000));
    // 카테고리 값 자체의 유효성은 백엔드가 확정할 영역이라, 목에서는 배열 형태만 확인한다.
    const preferences = Array.isArray(body.preferences)
      ? (body.preferences as Category[])
      : undefined;

    srv.runs[runId] = {
      runId,
      state: "QUEUED",
      startedAt,
      request: {
        startAt: body.startAt,
        endAt: body.endAt,
        currentLocation: { latitude: loc.latitude, longitude: loc.longitude },
        preferences,
      },
      expiresAt,
    };
    persist();

    return HttpResponse.json(
      {
        data: {
          runId,
          state: "QUEUED",
          requestedAt: nowIso(),
          expiresAt,
          retryAfterSeconds: 1,
        },
      },
      { status: 202 },
    );
  },
);

const cancelRecommendationHandler = http.post(
  `${API_BASE}/user/recommendations/cancellation`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/recommendations/cancellation");
    if (authErr) return authErr;

    const srv = getServerState();
    const openIds = Object.keys(srv.runs).filter((k) => {
      const state = srv.runs[k].state;
      return state === "QUEUED" || state === "RUNNING";
    });
    if (!openIds.length)
      return problemResponse(
        "RECOMMENDATION_RUN_NOT_FOUND",
        "/user/recommendations/cancellation",
      );

    // 명세의 중단 요청에는 runId 가 없다 — 진행 중인 마지막 작업을 취소한다(endpoints.js 와 동일한 처리).
    const id = openIds[openIds.length - 1];
    delete srv.runs[id];
    persist();

    return HttpResponse.json(
      { data: { runId: id, state: "CANCELLED", requestedAt: nowIso() } },
      { status: 202 },
    );
  },
);

const getRecommendationHandler = http.get(
  `${API_BASE}/user/recommendations/:recommendationId`,
  async ({ request, params }) => {
    await delay(LATENCY_MS);
    const id = String(params.recommendationId);
    const authErr = requireAuth(request, `/user/recommendations/${id}`);
    if (authErr) return authErr;

    const srv = getServerState();
    const run = srv.runs[id];
    if (!run)
      return problemResponse(
        "RECOMMENDATION_RUN_NOT_FOUND",
        `/user/recommendations/${id}`,
      );

    const elapsed = Date.now() - run.startedAt;
    if (elapsed < GENERATION_MS) {
      run.state = elapsed > GENERATION_MS * 0.3 ? "RUNNING" : "QUEUED";
      persist();
      return problemResponse(
        "RECOMMENDATION_NOT_COMPLETED",
        `/user/recommendations/${id}/result`,
        {
          currentState: run.state,
          retryAfterSeconds: 1,
        },
      );
    }

    run.state = "COMPLETED";
    persist();

    const emptyReason = emptyReasonFor(srv.dataState);
    if (emptyReason) {
      return HttpResponse.json({
        data: {
          runId: run.runId,
          state: "COMPLETED",
          generatedAt: nowIso(),
          expiresAt: run.expiresAt,
          candidates: [],
          emptyReason,
        },
      });
    }

    return HttpResponse.json({ data: buildRecommendationResult(run) });
  },
);

/* ── 채팅 ──────────────────────────────────────────────────────── */

const listChatHandler = http.get(
  `${API_BASE}/user/chat-messages`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/chat-messages");
    if (authErr) return authErr;
    const srv = getServerState();
    return HttpResponse.json({
      data: [...srv.chat],
      page: { nextCursor: null, hasNext: false },
    });
  },
);

interface PostChatBody {
  content?: unknown;
  slots?: RecommendationSlots;
}

const postChatHandler = http.post(
  `${API_BASE}/user/chat-messages`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/chat-messages");
    if (authErr) return authErr;

    const body = (await readJson(request)) as PostChatBody | null;
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";
    if (!content)
      return problemResponse("MALFORMED_REQUEST", "/user/chat-messages");
    if (content.length > 300) {
      return problemResponse("USER_VALIDATION_FAILED", "/user/chat-messages", {
        errors: [
          { field: "content", message: "메시지는 300자 이하여야 합니다." },
        ],
      });
    }

    const srv = getServerState();
    const userMessage: ChatMessage = {
      id: nextId(),
      role: "USER",
      content,
      createdAt: nowIso(),
    };
    const analysis = analyze(content, body?.slots ?? {});
    const assistantMessage: ChatMessage = {
      id: nextId(),
      role: "ASSISTANT",
      content: analysis.reply,
      createdAt: nowIso(),
    };

    srv.chat.push(userMessage, assistantMessage);
    persist();

    // ChatReply.message 는 봇의 응답 한 건이다 — 사용자가 보낸 메시지는 클라이언트가 이미 들고 있다.
    const data: ChatReply = {
      message: assistantMessage,
      extractedSlots: analysis.slots,
      options: analysis.options,
    };
    return HttpResponse.json({ data }, { status: 201 });
  },
);

const clearChatHandler = http.delete(
  `${API_BASE}/user/chat-messages`,
  async ({ request }) => {
    await delay(LATENCY_MS);
    const authErr = requireAuth(request, "/user/chat-messages");
    if (authErr) return authErr;
    const srv = getServerState();
    srv.chat = [];
    persist();
    return new HttpResponse(null, { status: 204 });
  },
);

/* ── 핸들러 목록 ───────────────────────────────────────────────────
   /user/collections/me/items 와 /user/collections/me/:courseId 는 세그먼트 수가 같아
   겹칠 수 있다 — msw 는 배열 순서대로 첫 매치를 쓰므로 items 쪽을 courseId 보다 먼저 둔다. */
export const handlers = [
  loginHandler,
  refreshHandler,
  logoutHandler,

  getUserHandler,
  patchUserHandler,
  analyticsHandler,
  accountsHandler,
  startSyncHandler,
  patchSettingsHandler,
  disconnectGoogleHandler,

  notificationListHandler,
  notificationDetailHandler,
  notificationReadHandler,

  listPlacesHandler,
  getPlaceHandler,
  getEventHandler,
  listAdsHandler,
  getAdHandler,
  searchAddressHandler,

  saveItemHandler,
  listItemsHandler,
  deleteItemHandler,
  getCourseHandler,

  createRecommendationHandler,
  cancelRecommendationHandler,
  getRecommendationHandler,

  listChatHandler,
  postChatHandler,
  clearChatHandler,
];
