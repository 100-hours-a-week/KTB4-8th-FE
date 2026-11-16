"use client";

import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";

/* 시트 본문 안의 이 부분이 시트 높이에 안 들어가면, 글자 · 번호 원 · 간격을 같은 비율로 줄여서(zoom) 들어가게 한다.
   - 줄이는 건 이 안쪽(순위 · 소요시간 카드, 이동 순서)뿐이다. 지도와 하단 버튼은 그대로다.
   - 화면이 충분히 높으면 줄이지 않는다(zoom 1).
   - MIN_ZOOM 보다 더 줄여야 하면 거기서 멈추고 나머지는 스크롤한다(너무 작으면 읽기 어렵다).
   zoom 을 1 로 되돌려 본래 높이를 재고 → 넘친 만큼을 뺀 비율을 다시 정하므로, 화면 크기 · 장소 수가 바뀌어도 매번 처음부터 계산한다. */
const MIN_ZOOM = 0.8;

export function FitZoom({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const apply = useCallback(() => {
    const el = ref.current;
    const body = el?.closest<HTMLElement>(".sheet__body");
    if (!el || !body) return;
    el.style.zoom = "1";
    const overflow = body.scrollHeight - body.clientHeight;
    if (overflow <= 0) return;
    const full = el.offsetHeight;
    if (full <= 0) return;
    // 반올림 오차로 1px 넘치지 않게 1px 더 줄인다
    const zoom = Math.max(MIN_ZOOM, (full - overflow - 1) / full);
    el.style.zoom = String(Math.round(zoom * 1000) / 1000);
  }, []);

  // 내용(장소 수 · 출발지 줄)이 바뀔 때마다 다시 계산한다
  useLayoutEffect(() => {
    apply();
  });

  // 화면 크기가 바뀌거나(회전 · 주소창 · 키보드) 글꼴이 늦게 들어와도 다시 계산한다
  useLayoutEffect(() => {
    const body = ref.current?.closest<HTMLElement>(".sheet__body");
    const observer =
      body && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(apply)
        : null;
    if (body) observer?.observe(body);
    void document.fonts?.ready.then(apply);
    return () => observer?.disconnect();
  }, [apply]);

  return (
    <div className="cfit" ref={ref}>
      {children}
    </div>
  );
}
