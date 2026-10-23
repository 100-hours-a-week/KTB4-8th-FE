/* 좋아요 영상 동기화 임시 저장소 — BE 에 통계 · 동기화 API 가 없어(유튜브 동기화는 BE 보류), 이 브라우저에서
   진행 상황을 흉내 낸다. 처리하는 API 는 아래 두 개뿐이고, 로그인(/user/auth-session)이나
   BE 의 유튜브 API 같은 나머지는 건드리지 않는다. BE 가 붙으면 이 파일과 client.ts 의 호출 한 줄을 지운다.
     GET  /user/analytics-statistics
     POST /user/liked-video-syncs */
import { toIso } from "@/lib/format";
import type { LocalResult } from "./local-collection";

const STORAGE_KEY = "keepgo.sync.local.v1";
const TOTAL_VIDEOS = 24;
const EXTRACTED_GUIDES = 17;
const DURATION_MS = 6000;
const CONCURRENT = 3;

interface SyncState {
  startedAt: number | null;
}

let memory: SyncState | null = null;

function load(): SyncState {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memory = JSON.parse(raw) as SyncState;
      return memory;
    }
  } catch {
    /* 저장소가 막혀 있으면 메모리로만 동작한다 */
  }
  memory = { startedAt: null };
  return memory;
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    /* 무시 */
  }
}

/** 시작 시각으로부터 진행 상황을 계산한다 — 끝나면 완료 상태로 남는다 */
function stats(state: SyncState) {
  if (state.startedAt === null) {
    return {
      syncedVideoCount: 0,
      pendingVideoCount: 0,
      inProgressVideoCount: 0,
      completedVideoCount: 0,
      failedVideoCount: 0,
      extractedGuideCount: 0,
    };
  }
  const f = Math.min(1, (Date.now() - state.startedAt) / DURATION_MS);
  const completed = Math.floor(TOTAL_VIDEOS * f);
  const inProgress = Math.min(CONCURRENT, TOTAL_VIDEOS - completed);
  return {
    syncedVideoCount: TOTAL_VIDEOS,
    pendingVideoCount: TOTAL_VIDEOS - completed - inProgress,
    inProgressVideoCount: inProgress,
    completedVideoCount: completed,
    failedVideoCount: 0,
    extractedGuideCount: Math.floor(EXTRACTED_GUIDES * f),
  };
}

function running(state: SyncState) {
  return state.startedAt !== null && Date.now() - state.startedAt < DURATION_MS;
}

export async function handleLocalSync(
  method: string,
  path: string,
): Promise<LocalResult> {
  if (typeof window === "undefined") return null;

  if (method === "GET" && path === "/user/analytics-statistics") {
    return { data: stats(load()) };
  }

  if (method === "POST" && path === "/user/liked-video-syncs") {
    const state = load();
    if (running(state)) return { error: "SYNC_ALREADY_IN_PROGRESS" };
    state.startedAt = Date.now();
    save();
    return {
      data: {
        syncId: `L${state.startedAt.toString(36)}`,
        state: "PENDING",
        requestedAt: toIso(new Date()),
      },
    };
  }

  return null;
}
