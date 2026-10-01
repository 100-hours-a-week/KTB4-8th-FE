"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon, YouTubeMark } from "@/components/ui/Icon";
import { Empty, Skeleton, Spinner } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { isApiError } from "@/lib/api/client";
import { useCourseStore } from "@/features/recommendations/courseStore";
import { useSyncYoutubeNow } from "@/features/sync/queries";
import {
  useAdvertisements,
  useTrendingPlaces,
} from "@/features/places/queries";
import { PlaceCard } from "@/features/places/PlaceCard";
import { AdCard } from "@/features/places/AdCard";
import { PlaceDetailSheet } from "@/features/places/PlaceDetailSheet";
import { EventDetailSheet } from "@/features/places/EventDetailSheet";
import { PlaceListSheet } from "@/features/places/PlaceListSheet";

/* 04 · 메인 — 로그인 후 첫 진입 화면. 프로토타입 js/pages/home.js 를 그대로 옮겼다.
   bootstrap() 이 하나로 묶었던 GET /user + /user/accounts 는 이 화면에서 쓰이지 않아(화면에
   렌더되는 값이 없다) 뺐다.

   동기화 카드: BE 의 POST /user/youtube-analyze 는 끝날 때까지 기다리는 동기 처리이고,
   진행률 · 결과 건수를 알려주는 조회 API 가 없다. 그래서 몇 개를 불러왔는지는 보여줄 수 없고,
   "불러오는 중 / 불러옴" 두 상태만 구분한다 — 실제로 없는 숫자를 지어내지 않는다. */

type SyncState = "idle" | "pending" | "done";

interface SyncCardModel {
  badge?: string;
  title: string;
  msg: string;
  /** false 면 닫기(×) 버튼을 숨긴다 — 불러오는 중에는 닫을 수 없다 */
  closable?: boolean;
  action?: "sync" | "course" | null;
  actionLabel?: string;
}

function buildSyncCard(state: SyncState): SyncCardModel {
  if (state === "pending") {
    return {
      badge: "불러오는 중",
      title: "좋아요 영상을 불러오고 있어요.",
      msg: "영상 수에 따라 시간이 걸릴 수 있어요.",
      closable: false,
    };
  }
  if (state === "done") {
    return {
      badge: "정리 완료",
      title: "좋아요 영상을 불러왔어요.",
      msg: "찾은 장소와 이벤트로 코스를 만들어 드릴게요.",
      action: "course",
      actionLabel: "코스 추천받기",
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

  const [dismissed, setDismissed] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const initDoneRef = useRef(false);

  const placesQuery = useTrendingPlaces(10);
  const adsQuery = useAdvertisements();
  const syncNow = useSyncYoutubeNow();

  const hscrollRef = useDragScroll();

  const handleStartSyncRef = useRef<() => void>(() => {});
  const handleStartSync = useCallback(async () => {
    setSyncState("pending");
    setDismissed(false);
    try {
      await syncNow.mutateAsync();
      setSyncState("done");
      toast.ok("좋아요 영상을 불러왔어요.", "완료");
    } catch (err) {
      setSyncState("idle");
      const retryable =
        isApiError(err) &&
        (err.code === "YOUTUBE_SERVICE_FAILURE" ||
          err.code === "YOUTUBE_SERVICE_TIMEOUT");
      toast.fromError(err, {
        onRetry: retryable ? () => handleStartSyncRef.current() : undefined,
      });
    }
  }, [syncNow]);
  useEffect(() => {
    handleStartSyncRef.current = () => void handleStartSync();
  }, [handleStartSync]);

  // 최초 진입 1회 — startSync=1 쿼리(온보딩 · 코스 추천 팝업에서 옴)를 소비해 동기화를 시작한다
  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("startSync") === "1") {
      router.replace("/home");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL 파라미터로 진입 시 동기화를 트리거하는 1회성 초기화
      void handleStartSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = buildSyncCard(syncState);
  const places = placesQuery.data ?? [];
  const ads = adsQuery.data ?? [];

  function closeOverlay() {
    setOverlay(null);
  }

  return (
    <>
      <AppBar brand />
      <div className="scroll">
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
                {syncState === "pending" ? (
                  <Spinner />
                ) : (
                  <Icon name="sparkle" size={13} />
                )}
                <span>{sync.badge}</span>
              </p>
            )}
            <p className="home__sync-title">{sync.title}</p>
            <p className="home__sync-msg">{sync.msg}</p>
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
