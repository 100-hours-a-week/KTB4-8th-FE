"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeDummyEvent } from "./dummyEvents";
import { HomeEventCard } from "./HomeEventCard";

/* 홈 이벤트 가로 넘김 — 한 번에 카드 2개를 한 줄로 보여 주고, 일정 시간마다 다음 2개로 저절로 넘어간다.
   손가락(마우스)으로 밀어서 넘길 수도 있고(스크롤 스냅), 만지는 동안과 만진 뒤 잠시는 멈춘다.
   카드가 2개 이하면 넘길 곳이 없어서 점도 자동 넘김도 없다. "움직임 줄이기" 설정이 켜져 있으면 자동 넘김을 끈다. */

const PER_PAGE = 2;
/** 자동으로 다음 장으로 넘기는 간격 */
const AUTO_MS = 6000;
/** 사용자가 만진 뒤 자동 넘김을 쉬는 시간 */
const RESUME_AFTER_MS = 9000;

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
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, []);

  // 스크롤 위치로 지금 몇 번째 장인지 알아낸다(손으로 밀 때도, 자동으로 넘어갈 때도 같다)
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  // 사용자가 만지면 한동안 자동 넘김을 쉰다
  const hold = useCallback(() => {
    pausedUntil.current = Date.now() + RESUME_AFTER_MS;
  }, []);

  useEffect(() => {
    if (pageCount < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (document.hidden || Date.now() < pausedUntil.current) return;
      const el = trackRef.current;
      if (!el) return;
      // 화면에 보이지 않는 동안에는 넘기지 않는다(스크롤해서 지나친 뒤 몰래 넘어가지 않게)
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      goTo((current + 1) % pageCount);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [pageCount, goTo]);

  return (
    <div className="evpager">
      <div
        ref={trackRef}
        className="evpager__track"
        onScroll={onScroll}
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
