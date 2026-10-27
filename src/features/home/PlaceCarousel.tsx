"use client";

import { useCallback, useEffect, useRef } from "react";
import { HomePlaceCard } from "./HomePlaceCard";
import type { HomeDummyPlace } from "./dummyPlaces";
import {
  AUTO_MS,
  RESUME_AFTER_MS,
  createLoopSettler,
  trackTouching,
} from "./loopScroll";

/* 홈 "요즘 뜨는 곳" 가로 넘김 — 4초마다 한 화면(카드 2개쯤)씩 저절로 넘어가고, 끝에 닿으면 처음이 이어서 나온다.
   손가락(마우스)으로 밀면 한동안 멈춘다. 마지막 카드 뒤에 앞쪽 카드를 몇 장 복제해 붙여 두었다가,
   복제 구간에서 멈추면 진짜 처음 자리로 조용히 옮겨서 "왼쪽으로 빠르게 되감기"가 보이지 않게 한다. */

/** 맨 뒤에 한 번 더 붙이는 앞쪽 카드 수 — 한 화면에 보이는 카드 수(2~3장)보다 많아야 이음매가 안 보인다 */
const CLONES = 4;

function cardStride(el: HTMLElement): number {
  const cards = el.querySelectorAll<HTMLElement>(".placecard");
  return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
}

export function PlaceCarousel({
  places,
  setScrollEl,
  onOpen,
}: {
  places: HomeDummyPlace[];
  /** 마우스로 끌어 넘기는 기능(useDragScroll)이 스크롤 칸을 알 수 있게 넘겨 준다 */
  setScrollEl: (el: HTMLDivElement | null) => void;
  onOpen: (id: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pausedUntil = useRef(0);
  const settlerRef = useRef<ReturnType<typeof createLoopSettler> | null>(null);
  const count = places.length;
  const loops = count > CLONES;

  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      trackRef.current = el;
      setScrollEl(el);
    },
    [setScrollEl],
  );

  const hold = useCallback(() => {
    pausedUntil.current = Date.now() + RESUME_AFTER_MS;
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !loops) return;
    const touch = trackTouching(el, () => settlerRef.current?.settle());
    const settler = createLoopSettler(
      () => trackRef.current,
      (t) => count * cardStride(t),
      touch.isTouching,
    );
    settlerRef.current = settler;
    return () => {
      settlerRef.current = null;
      settler.dispose();
      touch.dispose();
    };
  }, [count, loops]);

  useEffect(() => {
    if (!loops) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden || Date.now() < pausedUntil.current) return;
      const el = trackRef.current;
      if (!el) return;
      // 화면 밖(아직 스크롤해서 내려가지 않은 아래쪽)에 있어도 계속 넘긴다 — 예전에는 보일 때만 넘겨서, 첫 화면에 안 걸린 이벤트는 스크롤해야 움직였다. 탭이 가려진(hidden) 동안만 쉰다.
      const stride = cardStride(el);
      if (!stride) return;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      // 한 번에 한 화면에 완전히 보이는 카드 수만큼 넘긴다
      const step = Math.max(1, Math.floor((el.clientWidth + gap) / stride));
      const now = Math.round(el.scrollLeft / stride);
      // 끝에서는 복제가 시작하는 자리(= 진짜 처음과 똑같이 보이는 자리)까지만 가고, 멈추면 진짜 처음으로 옮긴다
      const next = Math.min(now + step, count);
      el.scrollTo({ left: next * stride, behavior: "smooth" });
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [count, loops]);

  return (
    <div
      className="hscroll"
      ref={ref}
      onScroll={() => settlerRef.current?.onScroll()}
      onPointerDown={hold}
      onTouchStart={hold}
      onWheel={hold}
    >
      {places.map((p, i) => (
        <HomePlaceCard key={p.id} place={p} rank={i + 1} onOpen={onOpen} />
      ))}
      {loops &&
        places
          .slice(0, CLONES)
          .map((p, i) => (
            <HomePlaceCard
              key={`loop-${p.id}`}
              place={p}
              rank={i + 1}
              onOpen={onOpen}
              ariaHidden
            />
          ))}
    </div>
  );
}
