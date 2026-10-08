/* 보관함 임시 저장소 — BE 에 개인 보관함 API 가 없어, 이 브라우저의 localStorage 로 대신한다.
   `/user/collections/me/...` 요청과 보관한 장소·이벤트의 상세 조회만 여기서 처리하고,
   나머지 API 는 그대로 BE 로 보낸다. BE 보관함 API 가 나오면 이 파일과 client.ts 의 호출 한 줄을 지운다. */
import { toIso } from "@/lib/format";
import { LOCAL_DUMMY } from "@/lib/constants";
import type { CandidateComponent, Category } from "@/types/api";

const STORAGE_KEY = "keepgo.collection.local.v1";
const LATENCY_MS = 150;

export type LocalResult = { data: unknown } | { error: string } | null;

interface CatalogPlace {
  id: string;
  name: string;
  category: Category;
  region: string;
  description: string;
  googlePlaceId: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
}

interface CatalogEvent {
  id: string;
  name: string;
  category: Category;
  placeId: string;
  region: string;
  description: string;
  startAt: string;
  endAt: string;
  imageUrl: string | null;
}

interface StoredItem {
  id: string;
  itemType: "PLACE" | "EVENT";
  itemId: string;
  createdAt: string;
}

interface StoredCourse {
  id: string;
  name: string;
  area: string;
  rank?: number;
  componentCount: number;
  estimatedDurationMinutes: number;
  totalTravelMinutes?: number;
  components: CandidateComponent[];
  startAt: string;
  endAt: string;
  createdAt: string;
}

interface Store {
  items: StoredItem[];
  courses: StoredCourse[];
}

/* ── 더미 카탈로그 ─────────────────────────────────────── */

const PLACES: CatalogPlace[] = [
  {
    // 홈의 "요즘 뜨는 곳" 1번 카드(backend.ts 의 be-place-0)와 같은 장소라 id 를 맞췄다.
    // 예전엔 "701"과 "be-place-0"이 이름·내용이 같은 채로 따로 있어서, 홈에서 저장하면
    // 보관함에 같은 장소가 두 번 쌓였다 — 하나로 합쳤다.
    id: "be-place-0",
    name: "어라운드 성수",
    category: "CAFE",
    region: "서울 성동구",
    description: "성수동 골목 안쪽, 층고 높은 로스터리 카페",
    googlePlaceId: "ChIJ_around_seongsu",
    imageUrl: null,
    latitude: 37.5445,
    longitude: 127.056,
  },
  {
    id: "702",
    name: "을지로 골라디짐",
    category: "RESTAURANT",
    region: "서울 중구",
    description: "노포 감성 그대로인 을지로 노가리 골목 맛집",
    googlePlaceId: "ChIJ_euljiro",
    imageUrl: null,
    latitude: 37.5663,
    longitude: 126.991,
  },
  {
    // 홈의 "요즘 뜨는 곳" 3번 카드(backend.ts 의 be-place-2)와 같은 장소라 id · 이름을 맞췄다.
    // BE 더미 응답 이름이 "보안여관 전시"라(TrendingPlacesResponse.stub()), 홈 카드와 상세 화면의
    // 이름이 다르게 보이지 않도록 카탈로그 이름도 그대로 맞춘다.
    // 예전엔 "703"과 "be-place-2"가 따로 있어서 홈에서 저장하면 보관함에 같은 장소가 두 번 쌓였다 — 하나로 합쳤다.
    id: "be-place-2",
    name: "보안여관 전시",
    category: "EXHIBITION",
    region: "서울 종로구",
    description: "1940년대 여관을 고쳐 만든 복합 문화 공간",
    googlePlaceId: "ChIJ_boan",
    imageUrl: null,
    latitude: 37.5765,
    longitude: 126.972,
  },
  {
    id: "704",
    name: "성수연방",
    category: "POPUP",
    region: "서울 성동구",
    description: "팝업·편집샵이 모인 복합 문화 공장",
    googlePlaceId: "ChIJ_yeonbang",
    imageUrl: null,
    latitude: 37.5424,
    longitude: 127.0565,
  },
  {
    id: "705",
    name: "대림창고",
    category: "CAFE",
    region: "서울 성동구",
    description: "정미소를 고친 대형 카페 겸 전시장",
    googlePlaceId: "ChIJ_daerim",
    imageUrl: null,
    latitude: 37.5432,
    longitude: 127.0543,
  },
  {
    id: "706",
    name: "카페 온화",
    category: "CAFE",
    region: "서울 성동구",
    description: "조용한 창가 자리가 있는 디저트 카페",
    googlePlaceId: "ChIJ_onhwa",
    imageUrl: null,
    latitude: 37.5451,
    longitude: 127.0521,
  },
  // 홈의 "요즘 뜨는 곳"은 BE 더미 응답이고 id 가 be-place-N 이다(backend.ts). 저장 · 상세가 이어지도록 같은 id 를 둔다.
  // be-place-0(어라운드 성수) · be-place-2(보안여관 전시)는 위 카탈로그에 이미 같은 id 로 있어서 여기서는 뺐다.
  {
    id: "be-place-1",
    name: "을지로 산수갑산",
    category: "RESTAURANT",
    region: "서울 중구",
    description: "을지로 골목의 노포 감성 맛집",
    googlePlaceId: null,
    imageUrl: null,
    latitude: 37.5663,
    longitude: 126.991,
  },
];

const EVENTS: CatalogEvent[] = [
  {
    id: "801",
    name: "성수 팝업 위크",
    category: "POPUP",
    placeId: "704",
    region: "서울 성동구",
    description: "12개 브랜드가 참여하는 주말 팝업 페스티벌",
    startAt: "2026-09-18T11:00:00+09:00",
    endAt: "2026-10-28T20:00:00+09:00",
    imageUrl: null,
  },
  {
    id: "802",
    name: "보안여관 기획전 〈밤의 기록〉",
    category: "EXHIBITION",
    placeId: "be-place-2",
    region: "서울 종로구",
    description: "사진·설치 작업 20여 점을 모은 기획 전시",
    startAt: "2026-09-05T11:00:00+09:00",
    endAt: "2026-10-12T19:00:00+09:00",
    imageUrl: null,
  },
  {
    id: "803",
    name: "서울 디저트 페어",
    category: "POPUP",
    placeId: "702",
    region: "서울 강남구",
    description: "인기 디저트 브랜드를 한자리에서 만나는 기간 한정 페어",
    startAt: "2026-09-24T11:00:00+09:00",
    endAt: "2026-10-05T20:00:00+09:00",
    imageUrl: null,
  },
  {
    id: "804",
    name: "가을 미디어 아트전",
    category: "EXHIBITION",
    placeId: "be-place-2",
    region: "서울 종로구",
    description: "빛과 사운드로 가을의 풍경을 재해석한 미디어 전시",
    startAt: "2026-09-20T10:00:00+09:00",
    endAt: "2026-10-15T19:00:00+09:00",
    imageUrl: null,
  },
];

/* ── 저장소 ────────────────────────────────────────────── */

let memory: Store | null = null;

function makeComponent(
  sequence: number,
  placeId: string,
  arrival: Date,
  stay: number,
  travel: number,
  reason: string,
): CandidateComponent {
  const p = PLACES.find((x) => x.id === placeId)!;
  return {
    sequence,
    guideId: p.id,
    type: "PLACE",
    name: p.name,
    category: p.category,
    estimatedArrivalAt: toIso(arrival),
    estimatedStayMinutes: stay,
    travelMinutes: travel,
    reason,
    latitude: p.latitude,
    longitude: p.longitude,
  };
}

function at(daysFromNow: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function seedStore(): Store {
  const now = Date.now();
  const ago = (hours: number) => toIso(new Date(now - hours * 3_600_000));

  const cafe = [
    makeComponent(
      1,
      "be-place-0",
      at(3, 13),
      60,
      0,
      "좋아요한 영상에 자주 나온 로스터리예요.",
    ),
    makeComponent(
      2,
      "705",
      at(3, 14),
      60,
      12,
      "정미소를 고친 넓은 공간이라 쉬어 가기 좋아요.",
    ),
    makeComponent(
      3,
      "704",
      at(3, 15),
      90,
      8,
      "팝업·편집샵을 함께 둘러볼 수 있어요.",
    ),
  ];
  const culture = [
    makeComponent(
      1,
      "be-place-2",
      at(4, 14),
      90,
      0,
      "전시를 보고 하루를 시작하기 좋아요.",
    ),
    makeComponent(
      2,
      "702",
      at(4, 16),
      80,
      25,
      "전시 뒤 저녁을 먹기 좋은 을지로 노포예요.",
    ),
  ];

  return {
    items: [
      {
        id: "L-seed-1",
        itemType: "PLACE",
        itemId: "be-place-0",
        createdAt: ago(2),
      },
      {
        id: "L-seed-2",
        itemType: "PLACE",
        itemId: "be-place-2",
        createdAt: ago(30),
      },
      { id: "L-seed-3", itemType: "PLACE", itemId: "705", createdAt: ago(80) },
      { id: "L-seed-4", itemType: "EVENT", itemId: "802", createdAt: ago(5) },
      { id: "L-seed-5", itemType: "EVENT", itemId: "801", createdAt: ago(50) },
    ],
    courses: [
      {
        id: "L-course-1",
        name: "성수 감성 카페 투어",
        area: "성동구 성수동",
        rank: 1,
        componentCount: cafe.length,
        estimatedDurationMinutes: 230,
        totalTravelMinutes: 20,
        components: cafe,
        startAt: cafe[0].estimatedArrivalAt!,
        endAt: toIso(at(3, 18)),
        createdAt: ago(10),
      },
      {
        id: "L-course-2",
        name: "종로 · 을지로 문화 산책",
        area: "종로구",
        rank: 2,
        componentCount: culture.length,
        estimatedDurationMinutes: 195,
        totalTravelMinutes: 25,
        components: culture,
        startAt: culture[0].estimatedArrivalAt!,
        endAt: toIso(at(4, 19)),
        createdAt: ago(40),
      },
    ],
  };
}

/** 옛 카탈로그 id 를 지금의 be-place-N id 로 옮긴다(카탈로그 id 통합).
    "701"(어라운드 성수) → "be-place-0", "703"(보안여관) → "be-place-2".
    이 수정 전에 홈에서 저장해서 옛 id · be-place-N 이 둘 다 들어있는 브라우저는, 같은 장소가
    보관함에 두 번 보이던 걸 여기서 한 번만 남기고 정리한다. */
const LEGACY_PLACE_IDS: Record<string, string> = {
  "701": "be-place-0",
  "703": "be-place-2",
};

function migrateLegacyIds(store: Store): Store {
  const seen = new Set<string>();
  const items: StoredItem[] = [];
  for (const item of store.items) {
    const itemId =
      item.itemType === "PLACE" && item.itemId in LEGACY_PLACE_IDS
        ? LEGACY_PLACE_IDS[item.itemId]
        : item.itemId;
    const key = `${item.itemType}:${itemId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(itemId === item.itemId ? item : { ...item, itemId });
  }
  return items.length === store.items.length &&
    items.every((it, i) => it === store.items[i])
    ? store
    : { ...store, items };
}

function load(): Store {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memory = migrateLegacyIds(JSON.parse(raw) as Store);
      save();
      return memory;
    }
  } catch {
    /* 저장소가 막혀 있으면 메모리로만 동작한다 */
  }
  memory = seedStore();
  save();
  return memory;
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    /* 무시 */
  }
}

const newId = () =>
  `L${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ── 응답 조립 ─────────────────────────────────────────── */

function placeOf(id: string, saved: boolean) {
  const p = PLACES.find((x) => x.id === id);
  return p ? { ...p, saved } : null;
}

function eventOf(id: string, saved: boolean) {
  const e = EVENTS.find((x) => x.id === id);
  return e ? { ...e, saved } : null;
}

function courseSummary(c: StoredCourse) {
  return {
    id: c.id,
    name: c.name,
    area: c.area,
    rank: c.rank,
    componentCount: c.componentCount,
    estimatedDurationMinutes: c.estimatedDurationMinutes,
    totalTravelMinutes: c.totalTravelMinutes,
    components: c.components.map((x) => ({ name: x.name })),
  };
}

function isSaved(store: Store, itemType: "PLACE" | "EVENT", itemId: string) {
  return store.items.some(
    (i) => i.itemType === itemType && i.itemId === itemId,
  );
}

/** 홈의 "요즘 뜨는 곳" 카드가 쓴다 — BE 트렌딩 응답엔 보관함 여부가 안 들어있어서(saved 항상 undefined),
    카드가 화면에 뜰 때마다 보관함 더미 저장소를 직접 확인해 북마크 아이콘 초기 상태를 정한다.
    페이지를 떠났다 돌아와도(컴포넌트가 다시 마운트돼도) 이 값으로 다시 채워지므로 초기화되지 않는다. */
export function isPlaceSavedLocally(itemId: string): boolean {
  if (!LOCAL_DUMMY || typeof window === "undefined") return false;
  return isSaved(load(), "PLACE", itemId);
}

/* ── 라우팅 ────────────────────────────────────────────── */

const wait = () => new Promise((r) => setTimeout(r, LATENCY_MS));

export async function handleLocalCollection(
  method: string,
  path: string,
  query: Record<string, unknown> | undefined,
  body: unknown,
): Promise<LocalResult> {
  if (typeof window === "undefined") return null;

  const isItems = path === "/user/collections/me/items";
  const itemMatch = path.match(/^\/user\/collections\/me\/items\/([^/]+)$/);
  const courseMatch = path.match(/^\/user\/collections\/me\/([^/]+)$/);
  const placeMatch = path.match(/^\/places\/([^/]+)$/);
  const eventMatch = path.match(/^\/events\/([^/]+)$/);

  if (method === "GET" && placeMatch) {
    const p = placeOf(placeMatch[1], isSaved(load(), "PLACE", placeMatch[1]));
    if (!p) return null; // 카탈로그에 없는 id 는 BE 로 보낸다
    await wait();
    return { data: p };
  }
  if (method === "GET" && eventMatch) {
    const e = eventOf(eventMatch[1], isSaved(load(), "EVENT", eventMatch[1]));
    if (!e) return null;
    await wait();
    return { data: e };
  }

  if (!path.startsWith("/user/collections/me")) return null;
  await wait();
  const store = load();

  if (method === "GET" && isItems) {
    const type = String(query?.type ?? "ALL");
    const rows: {
      id: string;
      itemType: string;
      itemId: string;
      savedAt: string;
      item: unknown;
    }[] = [];
    if (type === "ALL" || type === "PLACE" || type === "EVENT") {
      for (const i of store.items) {
        if (type !== "ALL" && i.itemType !== type) continue;
        rows.push({
          id: i.id,
          itemType: i.itemType,
          itemId: i.itemId,
          savedAt: i.createdAt,
          item:
            i.itemType === "EVENT"
              ? eventOf(i.itemId, true)
              : placeOf(i.itemId, true),
        });
      }
    }
    if (type === "ALL" || type === "COURSE") {
      for (const c of store.courses) {
        rows.push({
          id: c.id,
          itemType: "COURSE",
          itemId: c.id,
          savedAt: c.createdAt,
          item: courseSummary(c),
        });
      }
    }
    rows.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
    return { data: rows };
  }

  if (method === "POST" && isItems) {
    const b = (body ?? {}) as {
      itemType?: string;
      itemId?: string;
      course?: {
        name: string;
        area: string;
        rank?: number;
        estimatedDurationMinutes: number;
        totalTravelMinutes?: number;
        components: CandidateComponent[];
        startAt: string;
        endAt: string;
      };
    };

    if (b.itemType === "COURSE") {
      if (!b.course || !Array.isArray(b.course.components))
        return { error: "MALFORMED_REQUEST" };
      const course: StoredCourse = {
        id: newId(),
        name: b.course.name,
        area: b.course.area,
        rank: b.course.rank,
        componentCount: b.course.components.length,
        estimatedDurationMinutes: b.course.estimatedDurationMinutes,
        totalTravelMinutes: b.course.totalTravelMinutes,
        components: b.course.components,
        startAt: b.course.startAt,
        endAt: b.course.endAt,
        createdAt: toIso(new Date()),
      };
      store.courses.unshift(course);
      save();
      return {
        data: {
          id: course.id,
          itemType: "COURSE",
          itemId: course.id,
          savedAt: course.createdAt,
        },
      };
    }

    if (
      (b.itemType !== "PLACE" && b.itemType !== "EVENT") ||
      typeof b.itemId !== "string"
    )
      return { error: "MALFORMED_REQUEST" };

    const exists =
      b.itemType === "EVENT"
        ? EVENTS.some((e) => e.id === b.itemId)
        : PLACES.some((p) => p.id === b.itemId);
    if (!exists)
      return {
        error: b.itemType === "EVENT" ? "EVENT_NOT_FOUND" : "PLACE_NOT_FOUND",
      };

    let row = store.items.find(
      (i) => i.itemType === b.itemType && i.itemId === b.itemId,
    );
    if (!row) {
      row = {
        id: newId(),
        itemType: b.itemType,
        itemId: b.itemId,
        createdAt: toIso(new Date()),
      };
      store.items.unshift(row);
      save();
    }
    return {
      data: {
        id: row.id,
        itemType: row.itemType,
        itemId: row.itemId,
        savedAt: row.createdAt,
      },
    };
  }

  if (method === "DELETE" && itemMatch) {
    const id = itemMatch[1];
    const before = store.items.length + store.courses.length;
    store.items = store.items.filter((i) => i.id !== id);
    store.courses = store.courses.filter((c) => c.id !== id);
    if (store.items.length + store.courses.length === before)
      return { error: "OUTING_ITEM_NOT_FOUND" };
    save();
    return { data: undefined };
  }

  if (method === "GET" && courseMatch && courseMatch[1] !== "items") {
    const c = store.courses.find((x) => x.id === courseMatch[1]);
    if (!c) return { error: "COURSE_NOT_FOUND" };
    return { data: { ...c, saved: true } };
  }

  return null;
}
