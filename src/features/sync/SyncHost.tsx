"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/Primitives";
import { wishlistKeys } from "@/features/wishlist/queries";
import { useSyncProgress } from "./progress";
import { setSyncNavigator, useSyncStore } from "./syncStore";

/* 좋아요 영상 불러오기의 앱 전체 연결부 — (app) 레이아웃에 한 번만 붙인다.
   - 새로고침 직전에 진행 중이었다면 "분석 중"으로 되살린다
   - 끝나면 보관함 목록을 다시 받는다(다른 화면에 있어도 새로 담긴 장소 · 이벤트가 보이게)
   - 홈이 아닌 화면에서는 탭바 위에 얇은 진행 막대를 띄워 "백그라운드에서 돌아가는 중"임을 알린다
     (홈에서는 위쪽 카드가 같은 일을 한다). */

export function SyncHost() {
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const status = useSyncStore((s) => s.status);
  const startedAt = useSyncStore((s) => s.startedAt);
  const finishAt = useSyncStore((s) => s.finishAt);
  const restorePending = useSyncStore((s) => s.restorePending);
  const prevStatus = useRef(status);

  useEffect(() => {
    setSyncNavigator((href) => router.push(href));
    return () => setSyncNavigator(null);
  }, [router]);

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

  const progress = useSyncProgress(
    status === "pending" ? startedAt : null,
    finishAt,
  );
  const show = status === "pending" && pathname !== "/home";

  // 토스트가 이 막대를 가리지 않게 CSS 가 body 속성을 보고 토스트를 막대 위로 올린다
  useEffect(() => {
    if (!show) return;
    document.body.dataset.syncBar = "1";
    return () => {
      delete document.body.dataset.syncBar;
    };
  }, [show]);

  if (!show) return null;
  return (
    <div className="rsbar" role="status" aria-live="polite">
      <div className="rsbar__row">
        <Spinner />
        <p className="rsbar__title">
          {progress ? "좋아요 영상 분석 중" : "좋아요 영상 불러오는 중"}
        </p>
        <span className="rsbar__eta">다른 화면을 봐도 계속돼요</span>
      </div>
      <p className="rsbar__sub">
        {progress
          ? progress.capped
            ? "영상이 많아 시간이 더 걸리고 있어요."
            : "영상 속 장소와 이벤트를 찾고 있어요."
          : "영상 수에 따라 시간이 걸릴 수 있어요."}
      </p>
      {progress && (
        <div className="rsbar__bar">
          <i style={{ width: `${progress.percent}%` }} />
        </div>
      )}
    </div>
  );
}
