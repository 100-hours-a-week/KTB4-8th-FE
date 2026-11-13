"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/Primitives";
import { wishlistKeys } from "@/features/wishlist/queries";
import { isHomePath } from "@/lib/routes";
import { syncProgressNote, useDisplayProgress } from "./progress";
import { ResultBar } from "./ResultBar";
import { useSyncStore } from "./syncStore";

/* 좋아요 영상 불러오기의 앱 전체 연결부 — (app) 레이아웃에 한 번만 붙인다.
   - 새로고침 직전에 진행 중이었다면 "분석 중"으로 되살린다
   - 끝나면 보관함 목록을 다시 받는다(다른 화면에 있어도 새로 담긴 장소 · 이벤트가 보이게)
   - 홈이 아닌 화면에서는 탭바 위에 얇은 진행 막대를 띄워 "백그라운드에서 돌아가는 중"임을 알린다
     (홈에서는 위쪽 카드가 같은 일을 한다).
   - 끝나면 같은 자리에 결과 막대를 남긴다(닫거나 홈으로 가기 전까지). 토스트는 5초 만에 사라져 결과를 놓치기 쉬웠다. */

export function SyncHost() {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const status = useSyncStore((s) => s.status);
  const startedAt = useSyncStore((s) => s.startedAt);
  const finishAt = useSyncStore((s) => s.finishAt);
  const live = useSyncStore((s) => s.live);
  const liveDone = useSyncStore((s) => s.liveDone);
  const restorePending = useSyncStore((s) => s.restorePending);
  const bar = useSyncStore((s) => s.bar);
  const closeBar = useSyncStore((s) => s.closeBar);
  const prevStatus = useRef(status);

  useEffect(() => {
    restorePending();
  }, [restorePending]);

  useEffect(() => {
    const before = prevStatus.current;
    prevStatus.current = status;
    if (before === "pending" && (status === "done" || status === "empty")) {
      void qc.invalidateQueries({ queryKey: ["wishlist"] });
      void qc.invalidateQueries({ queryKey: wishlistKeys.places });
    }
  }, [status, qc]);

  const progress = useDisplayProgress(
    status === "pending" ? startedAt : null,
    finishAt,
    status === "pending" ? live : null,
    liveDone,
  );
  const show = status === "pending" && !isHomePath(pathname);

  // 결과 막대 — 홈에서는 카드가 같은 결과를 보여 주고, 보관함에서는 "보관함 보기"가 필요 없어 지운다
  const resultHidden =
    !!bar &&
    (isHomePath(pathname) ||
      ((bar.state === "done" || bar.state === "slow") &&
        pathname.startsWith("/collection")));
  const showResult = !!bar && !resultHidden;
  useEffect(() => {
    if (resultHidden) useSyncStore.setState({ bar: null });
  }, [resultHidden]);

  // 토스트가 이 막대를 가리지 않게 CSS 가 body 속성을 보고 토스트를 막대 위로 올린다
  // 막대 높이는 결과 막대(설명 줄 수에 따라)와 진행 막대가 달라서 재서 알린다
  const barVisible = show || showResult;
  useEffect(() => {
    if (!barVisible) return;
    document.body.dataset.syncBar = "1";
    const el = document.querySelector<HTMLElement>(".rsbar");
    const setHeight = () => {
      if (el)
        document.body.style.setProperty(
          "--syncbar-h",
          `${el.getBoundingClientRect().height}px`,
        );
    };
    setHeight();
    const ro = el ? new ResizeObserver(setHeight) : null;
    if (el) ro?.observe(el);
    return () => {
      ro?.disconnect();
      delete document.body.dataset.syncBar;
      document.body.style.removeProperty("--syncbar-h");
    };
  }, [barVisible, showResult]);

  if (showResult && bar)
    return (
      <ResultBar
        bar={bar}
        onClose={closeBar}
        onAction={(kind) => {
          if (kind === "retry") {
            void useSyncStore.getState().start();
            return;
          }
          useSyncStore.setState({ bar: null });
          router.push("/collection");
        }}
      />
    );
  if (!show) return null;
  return (
    <div className="rsbar" role="status" aria-live="polite">
      <div className="rsbar__row">
        <Spinner />
        <p className="rsbar__title">
          {progress && !progress.fetching
            ? "좋아요 영상 분석 중"
            : "좋아요 영상 불러오는 중"}
        </p>
        <span className="rsbar__eta">다른 화면을 봐도 계속돼요</span>
      </div>
      <p className="rsbar__sub">
        <span>
          {progress && !progress.fetching
            ? progress.real
              ? syncProgressNote(progress)
              : progress.capped
                ? "영상이 많아 시간이 더 걸리고 있어요."
                : "영상 속 장소와 이벤트를 찾고 있어요."
            : "영상 수에 따라 시간이 걸릴 수 있어요."}
        </span>
        {/* BE v3 가 알려 준 실제 진행률일 때만 숫자를 보여 준다(홈 카드와 같은 조건) */}
        {progress?.real && !progress.fetching && (
          <span className="rsbar__pct">{progress.percent}%</span>
        )}
      </p>
      {progress && (
        <div className="rsbar__bar">
          <i style={{ width: `${progress.percent}%` }} />
        </div>
      )}
    </div>
  );
}
