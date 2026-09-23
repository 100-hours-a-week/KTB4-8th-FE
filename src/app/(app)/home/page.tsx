"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon, YouTubeMark } from "@/components/ui/Icon";
import { Empty, Skeleton } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { describe, isApiError } from "@/lib/api/client";
import { useCourseStore } from "@/features/recommendations/courseStore";
import { useAnalyticsStats, useStartSync } from "@/features/sync/queries";
import {
  useAdvertisements,
  useTrendingPlaces,
} from "@/features/places/queries";
import { PlaceCard } from "@/features/places/PlaceCard";
import { AdCard } from "@/features/places/AdCard";
import { PlaceDetailSheet } from "@/features/places/PlaceDetailSheet";
import { EventDetailSheet } from "@/features/places/EventDetailSheet";
import { PlaceListSheet } from "@/features/places/PlaceListSheet";
import type { AnalyticsStatistics } from "@/types/api";

/* 04 · 메인 — 로그인 후 첫 진입 화면. 프로토타입 js/pages/home.js 를 그대로 옮겼다.
   bootstrap() 이 하나로 묶었던 GET /user + /user/accounts 는 이 화면에서 쓰이지 않아(화면에
   렌더되는 값이 없다) 뺐고, /user/analytics-statistics 는 동기화 카드 전용 훅으로 옮겼다. */

interface SyncCardModel {
  badge?: string;
  title: string;
  msg: string;
  bar?: number;
  /** false 면 닫기(×) 버튼을 숨긴다 — 분석 진행 중에는 닫을 수 없다 */
  closable?: boolean;
  action?: "sync" | "course" | null;
  actionLabel?: string;
}

/** 동기화 상태 → 카드 문구. 프로토타입의 KG.api.config.dataState 로 강제하던 분기(devtools 전용)는
    여기서는 재현할 devtools 화면이 없어 뺐다 — total===0 / extractedGuideCount===0 조건만으로 같은 결과가 나온다. */
function buildSyncCard(
  stats: AnalyticsStatistics,
  syncing: boolean,
): SyncCardModel {
  const total = stats.syncedVideoCount;
  const done = stats.completedVideoCount;

  if (total === 0 && !syncing) {
    return {
      badge: "시작하기",
      title: "아직 저장된 장소가 없어요.",
      msg: "유튜브에서 좋아요한 영상을 불러와 시작해 보세요.",
      action: "sync",
      actionLabel: "좋아요 영상 불러오기",
    };
  }
  if (total > 0 && stats.extractedGuideCount === 0 && !syncing) {
    return {
      badge: "확인 필요",
      title: "장소가 담긴 영상을 찾지 못했어요.",
      msg: "맛집 · 카페 · 팝업 · 전시가 나오는 쇼츠에 좋아요를 누른 뒤 다시 불러와 주세요.",
      action: "sync",
      actionLabel: "다시 동기화",
    };
  }
  if (syncing || stats.pendingVideoCount + stats.inProgressVideoCount > 0) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    return {
      badge: `AI 분석 중 ${pct}%`,
      title: "좋아요 영상을 정리하고 있어요.",
      msg: `${total}개 중 ${done}개 분석 완료 · 장소 ${stats.extractedGuideCount}곳 발견`,
      bar: pct,
      closable: false,
    };
  }
  return {
    badge: "정리 완료",
    title: `장소 ${stats.extractedGuideCount}곳을 정리했어요.`,
    msg: `좋아요 영상 ${total}개에서 찾은 장소와 이벤트로 코스를 만들어 드릴게요.`,
    action: "course",
    actionLabel: "코스 추천받기",
  };
}

type Overlay =
  | { name: "placeList" }
  | { name: "place"; id: string }
  | { name: "event"; id: string }
  | null;

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

  const [syncing, setSyncing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const initDoneRef = useRef(false);

  const statsQuery = useAnalyticsStats({ polling: syncing });
  const placesQuery = useTrendingPlaces(10);
  const adsQuery = useAdvertisements();
  const startSync = useStartSync();

  const hscrollRef = useDragScroll();

  const handleStartSyncRef = useRef<() => void>(() => {});
  const handleStartSync = useCallback(async () => {
    try {
      await startSync.mutateAsync();
      setSyncing(true);
      setDismissed(false);
    } catch (err) {
      const retryable =
        isApiError(err) &&
        (err.code === "YOUTUBE_SERVICE_FAILURE" ||
          err.code === "YOUTUBE_SERVICE_TIMEOUT");
      toast.fromError(err, {
        onRetry: retryable ? () => handleStartSyncRef.current() : undefined,
      });
    }
  }, [startSync]);
  useEffect(() => {
    handleStartSyncRef.current = () => void handleStartSync();
  }, [handleStartSync]);

  // 최초 진입 1회 — startSync=1 쿼리(온보딩 · 코스 추천 팝업에서 옴)를 소비하거나,
  // 이미 진행 중이던 동기화가 있으면 폴링을 이어서 시작한다.
  useEffect(() => {
    if (initDoneRef.current || statsQuery.data === undefined) return;
    initDoneRef.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("startSync") === "1") {
      router.replace("/home");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL 파라미터로 진입 시 동기화를 트리거하는 1회성 초기화(내부에서 setSyncing 수행)
      void handleStartSync();
      return;
    }
    const s = statsQuery.data;
    if (
      s.pendingVideoCount + s.inProgressVideoCount > 0 &&
      s.completedVideoCount < s.syncedVideoCount
    ) {
      setSyncing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsQuery.data]);

  // 폴링 중 완료로 바뀌는 순간을 감지해 폴링을 멈추고 완료 토스트를 띄운다
  useEffect(() => {
    if (!syncing || !statsQuery.data) return;
    const s = statsQuery.data;
    const running =
      s.pendingVideoCount + s.inProgressVideoCount > 0 &&
      s.completedVideoCount < s.syncedVideoCount;
    if (!running) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 폴링 결과(서버 동기화 완료)에 반응하는 상태 갱신
      setSyncing(false);
      toast.ok(`장소 ${s.extractedGuideCount}곳을 정리했어요.`, "분석 완료");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsQuery.data]);

  const sync = statsQuery.data ? buildSyncCard(statsQuery.data, syncing) : null;
  const places = placesQuery.data ?? [];
  const ads = adsQuery.data ?? [];

  function closeOverlay() {
    setOverlay(null);
  }

  return (
    <>
      <AppBar brand />
      <div className="scroll">
        {statsQuery.isError && (
          <div style={{ padding: "16px 20px 0" }}>
            <div className="banner banner--error">
              <span>
                <Icon name="alert" size={18} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b className="banner__title">
                  {describe(statsQuery.error).title}
                </b>
                <span className="banner__msg">
                  {describe(statsQuery.error).text}
                </span>
              </span>
              <button
                className="btn btn--ghost btn--sm banner__action"
                type="button"
                onClick={() => void statsQuery.refetch()}
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {!dismissed && sync && (
          <div className="card card--dark home__sync">
            {sync.closable !== false && (
              <button
                className="home__sync-close"
                type="button"
                aria-label="닫기"
                onClick={() => setDismissed(true)}
              >
                <Icon name="close" size={15} />
              </button>
            )}
            {sync.badge && (
              <p className="home__sync-badge">
                <Icon name="sparkle" size={13} />
                <span>{sync.badge}</span>
              </p>
            )}
            <p className="home__sync-title">{sync.title}</p>
            <p className="home__sync-msg">{sync.msg}</p>
            {sync.bar != null && (
              <div className="home__sync-bar">
                <i style={{ width: `${sync.bar}%` }} />
              </div>
            )}
            {sync.action === "sync" && (
              <button
                className="btn btn--yt btn--block"
                type="button"
                onClick={() => void handleStartSync()}
              >
                <YouTubeMark size={24} />
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
              onClick={() => setOverlay({ name: "placeList" })}
            >
              더보기
            </button>
          </div>
          {placesQuery.isLoading ? (
            <div className="hscroll">
              {[0, 1].map((i) => (
                <div className="placecard" key={i}>
                  <Skeleton style={{ aspectRatio: "4/3", borderRadius: 14 }} />
                  <Skeleton style={{ height: 16, marginTop: 12 }} />
                  <Skeleton
                    style={{ height: 12, width: "60%", marginTop: 8 }}
                  />
                </div>
              ))}
            </div>
          ) : places.length ? (
            <div className="hscroll" ref={hscrollRef}>
              {places.map((p, i) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  rank={i + 1}
                  onOpen={(id) => setOverlay({ name: "place", id })}
                />
              ))}
            </div>
          ) : (
            <Empty
              icon="pin"
              title="보여드릴 장소가 아직 없어요."
              message="좋아요 영상을 불러오면 이 자리에 채워집니다."
            />
          )}
        </section>

        {ads.length > 0 && (
          <section className="section adsection">
            <div
              className="section__head"
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <h2 className="section__title">지금 열린 이벤트</h2>
            </div>
            {ads.map((a) => (
              <AdCard
                key={a.id}
                ad={a}
                onOpenEvent={(id) => setOverlay({ name: "event", id })}
              />
            ))}
          </section>
        )}

        <div style={{ height: 28 }} />
      </div>

      {overlay?.name === "placeList" && (
        <PlaceListSheet onClose={closeOverlay} />
      )}
      {overlay?.name === "place" && (
        <PlaceDetailSheet placeId={overlay.id} onClose={closeOverlay} />
      )}
      {overlay?.name === "event" && (
        <EventDetailSheet eventId={overlay.id} onClose={closeOverlay} />
      )}
    </>
  );
}
