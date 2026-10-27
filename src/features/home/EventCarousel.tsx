"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeDummyEvent } from "./dummyEvents";
import { HomeEventCard } from "./HomeEventCard";
import {
  AUTO_MS,
  RESUME_AFTER_MS,
  createLoopSettler,
  trackTouching,
} from "./loopScroll";

/* 홈 이벤트 가로 넘김 — 한 번에 카드 2개를 한 줄로 보여 주고, 일정 시간마다 다음 2개로 저절로 넘어간다.
   손가락(마우스)으로 밀어서 넘길 수도 있고(스크롤 스냅), 만지는 동안과 만진 뒤 잠시는 멈춘다.
   카드가 2개 이하면 넘길 곳이 없어서 점도 자동 넘김도 없다. "움직임 줄이기" 설정이 켜져 있으면 자동 넘김을 끈다. */

const PER_PAGE = 2;

/** 한 장을 넘기는 거리 — 장 폭에 장 사이 간격(CSS gap)을 더한 값. 간격이 있어서 폭만으로는 위치가 어긋난다 */
function pageStride(track: HTMLElement): number {
  const gap = parseFloat(getComputedStyle(track).columnGap);
  return track.clientWidth + (Number.isFinite(gap) ? gap : 0);
}

export function EventCarousel({
  events,
  onOpen,
}: {
  events: HomeDummyEvent[];
  onOpen: (id: string) => void;
}) {
  const pages: HomeDummyEvent[][] = [];
  for (let i = 0; i < events.length; i += PER_PAGE) {
    pages.push(events.slice(i, i + PER_PAGE));
  }
  const pageCount = pages.length;

  const trackRef = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: next * pageStride(el), behavior: "smooth" });
  }, []);

  // 스크롤 위치로 지금 몇 번째 장인지 알아낸다(손으로 밀 때도, 자동으로 넘어갈 때도 같다)
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    // 복제(맨 뒤에 붙인 첫 장)에 있을 때는 첫 장으로 센다
    setIndex(Math.round(el.scrollLeft / pageStride(el)) % pageCount);
  }, [pageCount]);

  // 사용자가 만지면 한동안 자동 넘김을 쉰다
  const hold = useCallback(() => {
    pausedUntil.current = Date.now() + RESUME_AFTER_MS;
  }, []);

  // 맨 뒤 복제 구간에 도착해 멈추면 진짜 첫 장으로 순간 이동 — 눈에는 계속 이어지는 것처럼 보인다
  const settlerRef = useRef<ReturnType<typeof createLoopSettler> | null>(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el || pageCount < 2) return;
    const touch = trackTouching(el, () => settlerRef.current?.settle());
    const settler = createLoopSettler(
      () => trackRef.current,
      (t) => pageCount * pageStride(t),
      touch.isTouching,
    );
    settlerRef.current = settler;
    return () => {
      settlerRef.current = null;
      settler.dispose();
      touch.dispose();
    };
  }, [pageCount]);

  useEffect(() => {
    if (pageCount < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden || Date.now() < pausedUntil.current) return;
      const el = trackRef.current;
      if (!el) return;
      // 화면 밖(아직 스크롤해서 내려가지 않은 아래쪽)에 있어도 계속 넘긴다 — 예전에는 보일 때만 넘겨서, 첫 화면에 안 걸린 이벤트는 스크롤해야 움직였다. 탭이 가려진(hidden) 동안만 쉰다.
      const current = Math.round(el.scrollLeft / pageStride(el));
      // 마지막 장에서는 맨 뒤에 붙인 첫 장(복제)으로 넘어가고, 멈추면 진짜 첫 장으로 조용히 옮긴다
      goTo(current + 1);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [pageCount, goTo]);

  return (
    <div className="evpager">
      <div
        ref={trackRef}
        className="evpager__track"
        onScroll={() => {
          onScroll();
          settlerRef.current?.onScroll();
        }}
        onPointerDown={hold}
        onTouchStart={hold}
        onWheel={hold}
      >
        {pages.map((page, i) => (
          <div className="evpager__page evgrid" key={i}>
            {page.map((e) => (
              <HomeEventCard key={e.id} event={e} onOpen={onOpen} />
            ))}
          </div>
        ))}
        {/* 끝에서 처음으로 자연스럽게 이어지게 첫 장을 한 번 더 붙인다(보이기만 하고 접근성 트리에서는 뺀다) */}
        {pageCount > 1 && (
          <div className="evpager__page evgrid" aria-hidden key="loop">
            {pages[0].map((e) => (
              <HomeEventCard key={e.id} event={e} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
      {pageCount > 1 && (
        <div
          className="evpager__dots"
          role="tablist"
          aria-label="이벤트 페이지"
        >
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1}번째 이벤트`}
              className="evpager__dot"
              onClick={() => {
                hold();
                goTo(i);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
