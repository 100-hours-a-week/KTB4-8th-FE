"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon, YouTubeMark } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Primitives";

/* 홈 "좋아요 영상 불러오기" 카드 — 실제 앱 홈의 카드(home/page.tsx 의 .home__sync)와
   같은 클래스 · 같은 문구를 써서, 로그인 뒤 실제로 보이는 모양 그대로 보여 준다.
   (실제 불러오기를 시작하지는 않는다 — 화면 안에서만 움직이는 예시)
   스트리밍(BE v3)이 적용된 카드 그대로다: 시작 → 불러오는 중(영상을 가져오는 동안, 진행률 없음)
   → AI 분석 중("N / M 영상 분석됨" · 진행률 %) → 완료(담긴 장소 · 이벤트 수).
   랜딩에서는 화면 모드를 따른다: 다크는 앱과 같은 어두운 카드, 라이트는 흰 카드(home__sync--themed, globals.css). */

/** start: 시작하기 · loading: 불러오는 중(영상을 가져오는 중) · analyzing: AI 분석 중(진행바 · 분석한 영상 수 · %) · done: 완료 */
export type SyncCardPhase = "start" | "loading" | "analyzing" | "done";

export function SyncCardView({
  phase,
  percent = 0,
  total = 120,
  onStart,
  style,
}: {
  phase: SyncCardPhase;
  /** loading · analyzing 일 때 진행바(0~100). 불러오는 중에는 0 */
  percent?: number;
  /** analyzing 일 때 "N / total 영상 분석됨"의 total (N 은 percent 에서 계산) */
  total?: number;
  /** "좋아요 영상 불러오기" 버튼을 눌렀을 때 */
  onStart?: () => void;
  /** 카드 높이를 고정할 때 */
  style?: React.CSSProperties;
}) {
  const badged = phase !== "done";
  const closable = phase === "start" || phase === "done";
  const analyzed = Math.round((percent / 100) * total);

  return (
    <div
      className={`card card--dark home__sync home__sync--themed${badged ? " home__sync--badged" : ""}`}
      style={{ margin: 0, ...style }}
    >
      {closable && (
        <span className="home__sync-close" aria-hidden="true">
          <Icon name="close" size={15} />
        </span>
      )}

      {phase === "start" && (
        <p className="home__sync-badge">
          <Icon name="sparkle" size={13} />
          <span>시작하기</span>
        </p>
      )}
      {phase === "loading" && (
        <p className="home__sync-badge">
          <Spinner />
          <span>불러오는 중</span>
        </p>
      )}
      {phase === "analyzing" && (
        <p className="home__sync-badge">
          <Spinner />
          <span>AI 분석 중</span>
        </p>
      )}

      <p className="home__sync-title">
        {phase === "start" && "아직 저장된 장소가 없어요."}
        {phase === "loading" && "좋아요 영상을 불러오고 있어요."}
        {phase === "analyzing" && "좋아요 영상을 정리하고 있어요."}
        {phase === "done" && "좋아요 영상을 정리했어요."}
      </p>
      <p className="home__sync-msg">
        {phase === "start" &&
          "유튜브에서 좋아요한 영상을 불러와 시작해 보세요."}
        {phase === "loading" && "영상 수에 따라 시간이 걸릴 수 있어요."}
        {phase === "analyzing" && "영상 속 장소와 이벤트를 찾고 있어요."}
        {phase === "done" && "장소 42곳 · 이벤트 6개를 보관함에 담았어요."}
      </p>

      {(phase === "loading" || phase === "analyzing") && (
        <>
          <div
            className="home__sync-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <i style={{ width: `${percent}%` }} />
          </div>
          <p className="home__sync-eta">
            <Icon name="clock" size={13} />
            <span>
              {phase === "loading"
                ? "유튜브에서 영상을 가져오고 있어요"
                : `${analyzed} / ${total} 영상 분석됨`}
            </span>
            {/* 분석이 시작된 뒤(BE 가 실시간으로 알려 준 진행률)에만 숫자를 보여 준다 */}
            {phase === "analyzing" && (
              <span className="home__sync-pct">{percent}%</span>
            )}
          </p>
        </>
      )}

      {phase === "start" && (
        <button
          className="btn btn--yt btn--block"
          type="button"
          onClick={onStart}
        >
          <YouTubeMark size={24} />
          <span>좋아요 영상 불러오기</span>
        </button>
      )}
      {phase === "done" && (
        <button className="btn btn--block" type="button" tabIndex={-1}>
          <Icon name="sparkle" size={18} />
          <span>코스 추천받기</span>
        </button>
      )}
    </div>
  );
}

const START_HOLD_MS = 2200;
const LOADING_MS = 1200;
const ANALYZING_MS = 4200;
const DONE_HOLD_MS = 3000;

/* "How it works" 1단계용 — 시작 → 불러오는 중 → AI 분석 중(진행바가 차오름) → 완료를 자동 반복하고,
   버튼을 누르면 바로 불러오는 중으로 넘어간다. */
export function SyncCardPreview({ className = "" }: { className?: string }) {
  const [phase, setPhase] = useState<SyncCardPhase>("start");
  const [percent, setPercent] = useState(0);
  const timer = useRef<number | null>(null);

  // 단계별 자동 전환
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (phase === "start") {
      timer.current = window.setTimeout(() => {
        setPercent(0);
        setPhase("loading");
      }, START_HOLD_MS);
    } else if (phase === "loading") {
      timer.current = window.setTimeout(
        () => setPhase("analyzing"),
        LOADING_MS,
      );
    } else if (phase === "done") {
      timer.current = window.setTimeout(() => setPhase("start"), DONE_HOLD_MS);
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [phase]);

  // 분석 중: 진행바가 차오르다 끝나면 완료
  useEffect(() => {
    if (phase !== "analyzing") return;
    const startedAt = performance.now();
    const id = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startedAt) / ANALYZING_MS);
      setPercent(Math.round((1 - Math.pow(1 - t, 2)) * 100));
      if (t >= 1) {
        window.clearInterval(id);
        setPhase("done");
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [phase]);

  return (
    <div className={className}>
      {/* 화면 모드에 맞춘 은은한 번짐 테두리 */}
      <div className="gborder">
        <SyncCardView
          phase={phase}
          percent={percent}
          onStart={() => {
            setPercent(0);
            setPhase("loading");
          }}
        />
      </div>
      <p className="mt-3 text-center text-[11px] text-gray-400 dark:text-gray-500">
        예시 화면이에요 · 로그인하면 실제 서비스에서 이렇게 보여요
      </p>
    </div>
  );
}
