"use client";

import { useEffect } from "react";

/* iOS 는 입력창에 포커스하면 키보드 위 보조 막대(이전·다음·완료)만큼 화면 영역을 줄이면서
   position:fixed 요소(탭바 · 시트)를 함께 밀어 올린다. 탭바는 그대로 있고 보조 막대가 그 위를
   덮는 모양이어야 하므로, 포커스 직전 위치를 기억해 밀린 만큼 --kg-pin 으로 되돌린다.
   소프트웨어 키보드처럼 크게 줄어드는 경우(80px 이상)는 브라우저 동작에 맡긴다. */
const MAX_ACCESSORY_SHRINK = 80;
const SETTLE_MS = 1500;
const RELEASE_MS = 700;

const isField = (el: Element | null) =>
  !!el && el.matches("input, textarea, select, [contenteditable='true']");

export function useFixedPin() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const root = document.documentElement;
    const sensor = document.createElement("div");
    sensor.setAttribute("aria-hidden", "true");
    sensor.style.cssText =
      "position:fixed;left:0;bottom:0;width:0;height:0;visibility:hidden;pointer-events:none";
    document.body.appendChild(sensor);

    let base: number | null = null;
    let raf = 0;
    let releaseTimer = 0;

    const apply = () => {
      if (base === null) return;
      const shrink = window.innerHeight - vv.height;
      const delta =
        shrink < MAX_ACCESSORY_SHRINK
          ? base - sensor.getBoundingClientRect().bottom
          : 0;
      root.style.setProperty("--kg-pin", `${Math.round(delta * 10) / 10}px`);
    };

    const burst = () => {
      cancelAnimationFrame(raf);
      const end = performance.now() + SETTLE_MS;
      const tick = () => {
        apply();
        if (performance.now() < end) raf = requestAnimationFrame(tick);
      };
      tick();
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!isField(e.target as Element)) return;
      window.clearTimeout(releaseTimer);
      if (base === null) base = sensor.getBoundingClientRect().bottom;
      burst();
    };

    const onFocusOut = () => {
      burst();
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        if (isField(document.activeElement)) return;
        base = null;
        root.style.removeProperty("--kg-pin");
      }, RELEASE_MS);
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    vv.addEventListener("resize", burst);
    vv.addEventListener("scroll", burst);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      vv.removeEventListener("resize", burst);
      vv.removeEventListener("scroll", burst);
      cancelAnimationFrame(raf);
      window.clearTimeout(releaseTimer);
      root.style.removeProperty("--kg-pin");
      sensor.remove();
    };
  }, []);
}
