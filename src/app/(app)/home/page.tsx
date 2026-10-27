"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon, YouTubeMark } from "@/components/ui/Icon";
import { sleep } from "@/lib/format";
import { PullIndicator, usePullToRefresh } from "@/components/ui/PullToRefresh";
import { Spinner } from "@/components/ui/Primitives";
import { useCourseStore } from "@/features/recommendations/courseStore";
import { hasNoSavedGuides } from "@/features/sync/queries";
import {
  useSyncProgress,
  type SyncDemoMode,
  type SyncProgress,
} from "@/features/sync/progress";
import { dismissLastSync, loadLastSync } from "@/features/sync/lastResult";
import { describeAddedObject } from "@/features/sync/newItems";
import {
  defaultSyncDemo,
  useSyncStore,
  type SyncStatus,
} from "@/features/sync/syncStore";
import type { SyncResult } from "@/types/api";
import { HOME_DUMMY_PLACES } from "@/features/home/dummyPlaces";
import { EventCarousel } from "@/features/home/EventCarousel";
import { PlaceCarousel } from "@/features/home/PlaceCarousel";
import { splitHomeEvents } from "@/features/home/homeEvents";
import { WishlistDetailSheet } from "@/features/wishlist/WishlistDetailSheet";

/* 04 · 메인 — 로그인 후 첫 진입 화면. 프로토타입 js/pages/home.js 를 그대로 옮겼다.
   bootstrap() 이 하나로 묶었던 GET /user + /user/accounts 는 이 화면에서 쓰이지 않아(화면에
   렌더되는 값이 없다) 뺐다.

   동기화 카드: BE 의 POST /user/youtube-analyze 는 끝날 때까지 기다리는 동기 처리이고,
   진행률 · 결과 건수를 알려주는 조회 API 가 없다. 그래서 SYNC_PROGRESS_DUMMY 가 켜져 있으면
   시작한 시각에서 계산한 **가짜** 진행률로 진행바만 채우고(숫자 · 남은 시간 문구는 BE API 가 생길 때까지 보여 주지 않는다),
   실제 요청이 끝나면 완료로 바꾼다. 끄면(off) 예전처럼 "불러오는 중 / 불러옴" 두 상태만 구분한다. */

type SyncState = SyncStatus;

interface SyncCardModel {
  badge?: string;
  title: string;
  msg: string;
  /** false 면 닫기(×) 버튼을 숨긴다 — 불러오는 중에는 닫을 수 없다 */
  closable?: boolean;
  action?: "sync" | "course" | null;
  actionLabel?: string;
}

function buildSyncCard(
  state: SyncState,
  result: SyncResult | null,
  progress: SyncProgress | null,
): SyncCardModel {
  if (state === "pending" && progress) {
    return {
      badge: "AI 분석 중",
      title: "좋아요 영상을 정리하고 있어요.",
      msg: progress.capped
        ? "영상이 많아 시간이 더 걸리고 있어요. 조금만 기다려 주세요."
        : "영상 속 장소와 이벤트를 찾고 있어요.",
      closable: false,
    };
  }
  if (state === "pending") {
    return {
      badge: "불러오는 중",
      title: "좋아요 영상을 불러오고 있어요.",
      msg: "영상 수에 따라 시간이 걸릴 수 있어요.",
      closable: false,
    };
  }
  if (state === "done") {
    // 새로 담긴 개수는 불러오기 전후 보관함을 견줘 센 값이다(못 셌으면 숫자 없는 문구)
    const counted = result?.addedPlaces != null && result?.addedEvents != null;
    const added = counted
      ? describeAddedObject(result.addedPlaces ?? 0, result.addedEvents ?? 0)
      : "";
    // 개수(영상 · 장소 수)는 BE 에 진행률 · 결과 조회 API 가 생기면 보여 준다 — 그 전에는 숫자 없는 문구만 쓴다
    return {
      title: "좋아요 영상을 정리했어요.",
      msg: added
        ? `${added} 보관함에 담았어요.`
        : counted
          ? "새로 담긴 장소와 이벤트는 없었어요."
          : "찾은 장소와 이벤트로 코스를 만들어 드릴게요.",
      action: "course",
      actionLabel: "코스 추천받기",
    };
  }
  if (state === "empty") {
    return {
      badge: "찾은 장소 없음",
      title: "좋아요 영상에서 장소를 찾지 못했어요.",
      msg: "장소가 나오는 쇼츠에 좋아요를 누른 뒤 다시 불러와 보세요.",
      action: "sync",
      actionLabel: "다시 불러오기",
    };
  }
  if (state === "slow") {
    return {
      badge: "분석 중",
      title: "영상이 많아 시간이 더 걸려요.",
      msg: "분석은 계속되고 있어요. 잠시 뒤 보관함 탭에서 확인해 주세요.",
    };
  }
  if (state === "failed") {
    return {
      badge: "불러오기 실패",
      title: "좋아요 영상을 불러오지 못했어요.",
      msg: "일시적인 문제로 실패했어요. 다시 시도해 주세요.",
      action: "sync",
      actionLabel: "다시 시도",
    };
  }
  return {
    badge: "시작하기",
    title: "아직 저장된 장소가 없어요.",
    msg: "유튜브에서 좋아요한 영상을 불러와 시작해 보세요.",
    action: "sync",
    actionLabel: "좋아요 영상 불러오기",
  };
}

type Overlay =
  { name: "homePlace"; id: string } | { name: "homeEvent"; id: string } | null;

/** 가로 스크롤을 마우스로도 끌 수 있게 한다 — 프로토타입의 dragScroll() 을 그대로 옮겼다.
    드래그가 6px 넘게 움직였으면 그 클릭은 카드 탭으로 이어지지 않게 캡처 단계에서 막는다. */
function useDragScroll() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!el) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // 터치는 브라우저 기본 스크롤에 맡긴다
      down = true;
      moved = 0;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) el.classList.add("is-dragging");
      el.scrollLeft = startLeft - dx;
    };
    const end = () => {
      down = false;
      el.classList.remove("is-dragging");
    };
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointerleave", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointerleave", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, [el]);

  return setEl;
}

export default function HomePage() {
  const router = useRouter();
  const openCourse = useCourseStore((s) => s.setOpen);

  const [dismissed, setDismissed] = useState(false);
  // 불러오기 상태는 앱 전체가 공유한다(syncStore) — 다른 탭에 다녀와도 진행 중이면 그대로 보인다
  const syncState = useSyncStore((st) => st.status);
  const syncResult = useSyncStore((st) => st.result);
  const syncStartedAt = useSyncStore((st) => st.startedAt);
  const syncFinishAt = useSyncStore((st) => st.finishAt);
  const demoRef = useRef<SyncDemoMode | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const initDoneRef = useRef(false);

  const hscrollRef = useDragScroll();

  // 홈 이벤트 더미(FE) — 지금 열린 이벤트 / 곧 열려요 두 섹션으로 나눈다. 끝난 이벤트는 넣지 않는다.
  const [now, setNow] = useState(() => new Date());
  const homeEvents = useMemo(() => splitHomeEvents(now), [now]);

  // 당겨서 새로고침 — 인기 장소를 다시 불러온다. 시트나 코스 추천 팝업이 열려 있을 때는 끈다.
  const courseOpen = useCourseStore((s) => s.open);
  const pullState = usePullToRefresh(
    async () => {
      // 홈 더미는 서버에서 받는 게 없어서, 오늘 날짜 기준으로 이벤트 구분만 다시 계산한다
      setNow(new Date());
      await sleep(500);
    },
    overlay === null && !courseOpen,
  );

  const handleStartSync = useCallback(async () => {
    setDismissed(false);
    // 이미 진행 중이면 요청을 보내지 않고 안내만 띄운다(스토어가 처리)
    await useSyncStore.getState().start({ demo: demoRef.current });
  }, []);

  // 최초 진입 1회 — startSync=1 쿼리(온보딩 · 코스 추천 팝업에서 옴)를 소비해 동기화를 시작한다
  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;
    const params = new URLSearchParams(window.location.search);
    // 개발용 토큰으로 로그인한 로컬 계정은 유튜브 연동이 없어 실제 동기화가 늘 실패한다.
    // 그래서 진행률 더미가 켜져 있으면 BE 를 부르지 않고 가짜로 끝까지 진행시킨다(?syncDemo=fail 로 실패도 볼 수 있다).
    demoRef.current = defaultSyncDemo();
    if (params.get("startSync") === "1") {
      router.replace("/home");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL 파라미터로 진입 시 동기화를 트리거하는 1회성 초기화
      void handleStartSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 홈에 돌아왔을 때 이전 불러오기 결과를 되살린다(없으면 서버 보관함에 장소 · 이벤트가 이미 있는지로 판단).
  // 온보딩 · 코스 추천 팝업에서 startSync=1 로 들어오면 위 효과가 새로 시작하니 건너뛴다.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (new URLSearchParams(window.location.search).get("startSync") === "1")
      return;
    const store = useSyncStore.getState();
    // 새로고침 직전에 분석 중이었다면 그 상태를 되살린다 — 이때는 저장된 결과보다 진행 중이 먼저다
    store.restorePending();
    // 이미 진행 중이거나 이번 방문 중에 끝난 결과가 있으면 스토어의 상태를 그대로 보여 준다
    if (useSyncStore.getState().status !== "idle") return;
    const last = loadLastSync();
    if (last) {
      store.hydrate(last.state, last.result);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 때 저장된 결과를 화면 상태로 옮기는 1회성 복원
      setDismissed(last.dismissed);
      return;
    }
    void hasNoSavedGuides().then((none) => {
      // 보관함에 이미 있으면 "아직 저장된 장소가 없어요"를 보여 주지 않는다(그 사이 새로 시작했다면 건드리지 않는다)
      if (none === false) useSyncStore.getState().hydrate("done", null);
    });
  }, []);

  const progress = useSyncProgress(
    syncState === "pending" ? syncStartedAt : null,
    syncFinishAt,
  );
  const sync = buildSyncCard(syncState, syncResult, progress);

  function closeOverlay() {
    setOverlay(null);
  }

  return (
    <>
      <AppBar brand />
      <PullIndicator {...pullState} />
      <div className="scroll">
        {!dismissed && sync && (
          <div
            className={`card card--dark home__sync${sync.badge ? " home__sync--badged" : ""}`}
          >
            {sync.closable !== false && (
              <button
                className="home__sync-close"
                type="button"
                aria-label="닫기"
                data-ptr-ignore
                onClick={() => {
                  setDismissed(true);
                  if (syncState === "done" || syncState === "empty") {
                    dismissLastSync(syncState, syncResult);
                  }
                  useSyncStore.getState().dismiss();
                }}
              >
                <Icon name="close" size={15} />
              </button>
            )}
            {sync.badge && (
              <p
                className={`home__sync-badge${syncState === "failed" ? " home__sync-badge--error" : ""}`}
              >
                {syncState === "pending" ? (
                  <Spinner />
                ) : syncState === "failed" ? (
                  <Icon name="alert" size={13} />
                ) : syncState === "empty" ? (
                  <Icon name="search" size={13} />
                ) : (
                  <Icon name="sparkle" size={13} />
                )}
                <span>{sync.badge}</span>
              </p>
            )}
            <p className="home__sync-title">{sync.title}</p>
            <p className="home__sync-msg">{sync.msg}</p>
            {progress && (
              <>
                <div
                  className="home__sync-bar"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress.percent}
                >
                  <i style={{ width: `${progress.percent}%` }} />
                </div>
                <p className="home__sync-eta">
                  <Icon name="clock" size={13} />
                  <span>
                    {progress.capped
                      ? "조금만 더 기다려 주세요"
                      : "영상 수에 따라 시간이 걸려요"}
                  </span>
                </p>
              </>
            )}
            {sync.action === "sync" && (
              <button
                className="btn btn--yt btn--block"
                type="button"
                onClick={() => void handleStartSync()}
              >
                {syncState !== "failed" && <YouTubeMark size={24} />}
                <span>{sync.actionLabel}</span>
              </button>
            )}
            {sync.action === "course" && (
              <button
                className="btn btn--block"
                type="button"
                onClick={() => openCourse(true)}
              >
                <Icon name="sparkle" size={18} />
                <span>{sync.actionLabel}</span>
              </button>
            )}
          </div>
        )}

        <section className="section">
          <div className="section__head">
            <div>
              <h2 className="section__title">요즘 뜨는 곳</h2>
              <p className="section__sub">이번 주 저장이 많았던 장소</p>
            </div>
            <button
              className="section__more"
              type="button"
              onClick={() => router.push("/home/places")}
            >
              전체보기
            </button>
          </div>
          <PlaceCarousel
            places={HOME_DUMMY_PLACES}
            setScrollEl={hscrollRef}
            onOpen={(id) => setOverlay({ name: "homePlace", id })}
          />
        </section>

        {homeEvents.ongoing.length > 0 && (
          <section className="section adsection">
            <div
              className="section__head"
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <h2 className="section__title">지금 열린 이벤트</h2>
              <button
                className="section__more"
                type="button"
                onClick={() => router.push("/home/events?type=ongoing")}
              >
                전체보기
              </button>
            </div>
            <EventCarousel
              events={homeEvents.ongoing}
              onOpen={(id) => setOverlay({ name: "homeEvent", id })}
            />
          </section>
        )}

        {homeEvents.upcoming.length > 0 && (
          <section className="section adsection">
            <div
              className="section__head"
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <h2 className="section__title">곧 열려요</h2>
              <button
                className="section__more"
                type="button"
                onClick={() => router.push("/home/events?type=upcoming")}
              >
                전체보기
              </button>
            </div>
            <EventCarousel
              events={homeEvents.upcoming}
              onOpen={(id) => setOverlay({ name: "homeEvent", id })}
            />
          </section>
        )}

        <div style={{ height: 28 }} />
      </div>
      {overlay?.name === "homePlace" && (
        <WishlistDetailSheet
          kind="place"
          id={overlay.id}
          preset={HOME_DUMMY_PLACES.find((p) => p.id === overlay.id)}
          onClose={closeOverlay}
        />
      )}
      {overlay?.name === "homeEvent" && (
        <WishlistDetailSheet
          kind="event"
          id={overlay.id}
          preset={[...homeEvents.ongoing, ...homeEvents.upcoming].find(
            (e) => e.id === overlay.id,
          )}
          onClose={closeOverlay}
        />
      )}
    </>
  );
}
