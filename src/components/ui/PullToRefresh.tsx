"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Spinner } from "./Primitives";

/* 당겨서 새로고침 — 화면 맨 위에서 아래로 끌면 새로고침 아이콘이 로고 헤더 밑에서 나와 손가락을 따라 내려온다.
   내용은 움직이지 않는다. 임계값만큼 끌었다 놓으면 아이콘이 제자리에서 돌며 onRefresh 가 끝날 때까지 기다리고,
   끝나면 다시 헤더 밑으로 들어간다.
   문서 스크롤을 쓰는 화면용이다(스크롤이 맨 위일 때만 시작한다). 터치와 마우스(데스크톱 확인용)를 모두 받는다. */

/** 이만큼(끈 뒤 저항을 적용한 거리) 넘게 끌었다 놓아야 새로고침한다 */
const THRESHOLD = 64;
const MAX_PULL = 110;
/** 손가락이 움직인 거리 대비 아이콘이 내려오는 비율 */
const RESISTANCE = 0.5;
/** 새로고침 중에 아이콘이 머무는 위치 */
const REFRESH_POS = 70;
/** 너무 빨리 끝나도 깜빡이지 않게 최소로 보여 주는 시간 */
const MIN_SHOW_MS = 700;

interface PullState {
  pull: number;
  dragging: boolean;
  refreshing: boolean;
}

export function usePullToRefresh(
  onRefresh: () => Promise<unknown>,
  enabled = true,
): PullState {
  const [state, setState] = useState<PullState>({
    pull: 0,
    dragging: false,
    refreshing: false,
  });
  const refreshRef = useRef(onRefresh);
  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    let pulling = false;
    let busy = false;
    let current = 0;

    const root = document.documentElement;
    // 브라우저 자체의 당겨서 새로고침 · 바운스가 같이 일어나지 않게 한다
    const prevOverscroll = root.style.overscrollBehaviorY;
    root.style.overscrollBehaviorY = "contain";

    function begin(x: number, y: number, target: EventTarget | null) {
      const inOverlay =
        target instanceof Element &&
        !!target.closest(".phone__overlays, [role='dialog']");
      // 닫기 같은 작은 버튼은 누르다 살짝 미끄러져도 당기기로 바뀌지 않게 한다(터치에서는 클릭이 취소된다)
      const ignored =
        target instanceof Element && !!target.closest("[data-ptr-ignore]");
      if (busy || inOverlay || ignored || window.scrollY > 0) return;
      tracking = true;
      pulling = false;
      startX = x;
      startY = y;
    }

    function move(x: number, y: number, event: { preventDefault(): void }) {
      if (!tracking) return;
      const dy = y - startY;
      const dx = x - startX;
      if (!pulling) {
        // 위로 밀거나 옆으로 먼저 움직이면 일반 스크롤 · 가로 스크롤에 맡긴다
        if (dy < 0 || Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 10 || dy < -6) tracking = false;
          return;
        }
        if (dy < 8) return;
        pulling = true;
        document.body.style.userSelect = "none";
      }
      event.preventDefault();
      current = Math.min(MAX_PULL, dy * RESISTANCE);
      setState({ pull: current, dragging: true, refreshing: false });
    }

    function end() {
      if (!tracking) return;
      tracking = false;
      if (!pulling) return;
      pulling = false;
      document.body.style.userSelect = "";
      if (current < THRESHOLD) {
        current = 0;
        setState({ pull: 0, dragging: false, refreshing: false });
        return;
      }
      current = 0;
      busy = true;
      setState({ pull: REFRESH_POS, dragging: false, refreshing: true });
      const started = Date.now();
      void Promise.resolve(refreshRef.current())
        .catch(() => {})
        .finally(() => {
          window.setTimeout(
            () => {
              busy = false;
              setState({ pull: 0, dragging: false, refreshing: false });
            },
            Math.max(0, MIN_SHOW_MS - (Date.now() - started)),
          );
        });
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1)
        begin(e.touches[0].clientX, e.touches[0].clientY, e.target);
      else tracking = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1)
        move(e.touches[0].clientX, e.touches[0].clientY, e);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button === 0)
        begin(e.clientX, e.clientY, e.target);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.buttons === 1)
        move(e.clientX, e.clientY, e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse") end();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    // preventDefault 로 기본 스크롤 · 바운스를 막아야 해서 passive 가 아니어야 한다
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", end);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      root.style.overscrollBehaviorY = prevOverscroll;
      document.body.style.userSelect = "";
    };
  }, [enabled]);

  return state;
}

/* 새로고침 화살표(크롬 · 당근과 같은 모양) — 위에서 시계 방향으로 호가 그려지고, 호 끝에 꽉 찬 삼각형 화살촉이 붙는다.
   끌수록 호가 길어지고(최대 255°), 화살촉과 호의 시작 사이에는 항상 틈이 남는다. */
const ARC_MAX = 255;
const ARC_RADIUS = 7.5;
/** 아이콘이 나타나기 시작하는 끌기 거리 — 이보다 적게 끌면 빈 원만 보인다 */
const ARC_START_PULL = 10;

function polar(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: 12 + ARC_RADIUS * Math.sin(rad),
    y: 12 - ARC_RADIUS * Math.cos(rad),
  };
}

function RefreshArrow({ sweep }: { sweep: number }) {
  if (sweep < 4) return null;
  const rad = (sweep * Math.PI) / 180;
  const start = polar(0);
  const end = polar(sweep);
  // 호 끝에서의 진행 방향(시계 방향)과 바깥쪽 수직 방향
  const dir = { x: Math.cos(rad), y: Math.sin(rad) };
  const out = { x: Math.sin(rad), y: -Math.cos(rad) };
  const LENGTH = 4.8;
  const HALF_WIDTH = 4.2;
  const points = [
    [end.x + dir.x * LENGTH, end.y + dir.y * LENGTH],
    [end.x + out.x * HALF_WIDTH, end.y + out.y * HALF_WIDTH],
    [end.x - out.x * HALF_WIDTH, end.y - out.y * HALF_WIDTH],
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path
        d={`M${start.x.toFixed(2)} ${start.y.toFixed(2)} A${ARC_RADIUS} ${ARC_RADIUS} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`}
      />
      <polygon
        points={points}
        fill="currentColor"
        stroke="none"
        opacity={Math.min(1, Math.max(0, (sweep - 50) / 60))}
      />
    </svg>
  );
}

/** 당기는 동안 떠 있는 새로고침 아이콘 — 헤더(z-index 5) 밑에서 나온다.
    빈 원이 먼저 내려오고, 더 끌수록 회색 호가 그려지며 진해지고, 손가락을 따라 화살표가 돈다. */
export function PullIndicator({ pull, dragging, refreshing }: PullState) {
  const progress = Math.min(
    1,
    Math.max(0, (pull - ARC_START_PULL) / (THRESHOLD - ARC_START_PULL)),
  );
  const sweep = refreshing ? ARC_MAX : ARC_MAX * (1 - (1 - progress) ** 2);
  const style = {
    "--ptr-pull": `${pull}px`,
    "--ptr-rot": `${pull * 3.4}deg`,
    "--ptr-scale": 0.6 + 0.4 * Math.min(1, pull / 36),
    opacity: pull > 0 ? Math.min(1, pull / 20) : 0,
  } as CSSProperties;
  return (
    <>
      <div
        className={`ptr${dragging ? " is-dragging" : ""}${refreshing ? " is-refreshing" : ""}`}
        style={style}
        aria-hidden
      >
        <span
          className="ptr__icon"
          style={{ opacity: refreshing ? 1 : 0.35 + 0.65 * progress }}
        >
          {/* 끌 때는 화살표, 놓아서 불러오는 중에는 홈 카드의 "AI 분석 중"과 같은 도넛 스피너 */}
          {refreshing ? <Spinner /> : <RefreshArrow sweep={sweep} />}
        </span>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {refreshing ? "새로고침하는 중" : ""}
      </span>
    </>
  );
}
