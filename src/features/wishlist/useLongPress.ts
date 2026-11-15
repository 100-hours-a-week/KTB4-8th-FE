"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent, MouseEvent } from "react";

/* 손가락(터치 · 펜)으로 한 곳을 꾹 누르면 onLongPress 를 부른다.
   - 누른 채로 조금이라도 움직이거나(스크롤 시작) 손을 떼면 취소한다.
   - 꾹 누른 뒤 손을 뗄 때 따라오는 클릭은 삼킨다(눌렀다고 상세가 열리지 않게).
   - 마우스는 대상이 아니다(데스크톱에서는 ⋯ 메뉴를 쓴다). */

const HOLD_MS = 500;
const MOVE_LIMIT = 10; // px

export function useLongPress(onLongPress?: () => void) {
  const timer = useRef<number | undefined>(undefined);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  // 꾹 눌러 선택 모드가 시작되면 행이 바뀌어 콜백이 사라진다 — 그래도 뒤따르는 클릭은 삼켜야 하므로 핸들러는 늘 돌려준다
  const callback = useRef(onLongPress);
  useEffect(() => {
    callback.current = onLongPress;
  });

  const clear = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
    start.current = null;
  }, []);

  return {
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !callback.current) return;
      fired.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        fired.current = true;
        timer.current = undefined;
        try {
          navigator.vibrate?.(12); // 지원하는 기기에서만 짧게 진동
        } catch {
          /* 진동을 못 써도 동작은 같다 */
        }
        callback.current?.();
      }, HOLD_MS);
    },
    onPointerMove: (e: PointerEvent) => {
      const s = start.current;
      if (!s) return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > MOVE_LIMIT) clear();
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    // 안드로이드의 꾹 누르기 메뉴(복사 · 공유)가 뜨지 않게 한다
    onContextMenu: (e: MouseEvent) => {
      if (callback.current || fired.current) e.preventDefault();
    },
    onClickCapture: (e: MouseEvent) => {
      if (fired.current) {
        fired.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
  };
}
