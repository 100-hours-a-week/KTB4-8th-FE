"use client";

import { useEffect, useRef, useState } from "react";
import { isNaverGl, loadNaverMaps, zoomShift } from "@/lib/naverMaps";
import type { CandidateComponent } from "@/types/api";
import { tightenPlan, type Pad } from "./fitTighten";

/* 코스 상세 지도 — 네이버 지도 API v3.
   이 파일은 CandidateDetailSheet 에서 next/dynamic({ ssr: false }) 으로만 불러온다.
   네이버 지도 스크립트는 로드되는 즉시 브라우저 전역(window)을 건드리므로 서버에서 실행되면 안 된다.

   스크립트 로더는 출발지 핀 선택 화면과 같이 쓰려고 lib/naverMaps.ts 로 분리했다.
   키가 없거나 스크립트 로드·인증에 실패하면, 혹은 애초에 좌표가 없으면 기존 도식(SVG) 플레이스홀더로 되돌린다. */

interface MapPoint {
  lat: number;
  lng: number;
  sequence: number;
  name: string;
}

/** 지도에 "출발" 핀으로 찍는 출발지 — 있으면 출발지 → 첫 장소 → … 순서로 경로를 잇는다 */
export interface MapOrigin {
  lat: number;
  lng: number;
  name: string;
}

/* 거리 눈금 — SDK 기본 눈금은 늘 보이고 위치도 못 바꿔서 직접 그린다.
   확대 · 축소할 때만 나타났다가 잠깐 뒤 사라진다. 지도 가운데에서 SCALE_MAX_PX 만큼의 실제 거리(m)를 재서,
   그보다 짧은 "깔끔한 값"(1 · 2 · 5 · 10 · 20 · 50 … m)을 고르고 그 길이만큼 선을 그린다. */
const SCALE_MAX_PX = 80;
const SCALE_HIDE_MS = 1600;
/** 래스터 지도에서 fitBounds 뒤에 한 단계 더 확대해 봐도 되는지 볼 때 쓰는 줄인 여백(px) — 점(지름 25px)이 잘리지 않을 만큼만 둔다 */
const TIGHT_PAD: Pad = { top: 22, right: 42, bottom: 42, left: 30 };
/** 타일이 안 와도 지도를 보여 주는 최대 대기(느린 망 · 이벤트가 안 오는 환경 대비) */
const REVEAL_MAX_MS = 1200;
/** 같은 화면의 타일이 캐시에 있어 소식이 먼저 온 경우 보여 주기까지 기다리는 시간 */
const REVEAL_CACHED_MS = 200;
/* 눈금 후보 — 1 · 2 · 3 · 5 · 7 이 한 묶음. GL 지도는 + · − 가 반 단계(약 1.41배)씩 움직여서
   1km · 700m · 500m · 300m · 200m · 100m · 70m · 50m … 처럼 촘촘하게 이어진다(래스터 지도는 한 단계가 2배라 일부를 건너뛴다) */
const SCALE_STEPS = [
  1, 2, 3, 5, 7, 10, 20, 30, 50, 70, 100, 200, 300, 500, 700, 1000, 2000, 3000,
  5000, 7000, 10000, 20000, 30000, 50000,
];

/** meters: SCALE_MAX_PX 가 실제로 몇 m 인지. 눈금 길이(px)와 글자를 돌려준다 */
export function scaleFor(meters: number): { px: number; label: string } | null {
  if (!Number.isFinite(meters) || meters <= 0) return null;
  const nice = [...SCALE_STEPS].reverse().find((s) => s <= meters);
  if (!nice) return null;
  return {
    px: Math.round((SCALE_MAX_PX * nice) / meters),
    label: nice >= 1000 ? `${nice / 1000}km` : `${nice}m`,
  };
}

/* 폰에서 지도를 빠르게 두 번 탭하면 탭한 곳을 중심으로 한 단계 확대한다.
   · 한 손가락 탭만 센다 — 지도를 끌었거나(10px 넘게 움직임) 두 손가락이면 탭으로 보지 않는다.
   · 두 탭 사이는 0.3초 · 30px 안일 때만 "두 번 탭"이다.
   · 탭한 위치를 좌표로 바꾸지 못하면 지도 가운데를 기준으로 확대한다.
   돌려주는 함수로 이벤트를 걷어 낸다. */
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_DISTANCE = 30;
const TAP_MOVE_LIMIT = 10;

function attachDoubleTapZoom(el: HTMLElement, map: naver.maps.Map) {
  let start: { x: number; y: number } | null = null;
  let last: { t: number; x: number; y: number } | null = null;

  const onStart = (e: TouchEvent) => {
    // 손가락이 둘 이상이면(확대·축소 동작) 탭이 아니다
    start =
      e.touches.length === 1
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : null;
    if (!start) last = null;
  };
  const onEnd = (e: TouchEvent) => {
    const t = e.changedTouches[0];
    if (!start || !t || e.touches.length > 0) return;
    const moved = Math.hypot(t.clientX - start.x, t.clientY - start.y);
    start = null;
    if (moved > TAP_MOVE_LIMIT) {
      last = null; // 끌기였다
      return;
    }
    const now = Date.now();
    const isDouble =
      last !== null &&
      now - last.t <= DOUBLE_TAP_MS &&
      Math.hypot(t.clientX - last.x, t.clientY - last.y) <= DOUBLE_TAP_DISTANCE;
    if (!isDouble) {
      last = { t: now, x: t.clientX, y: t.clientY };
      return;
    }
    last = null;
    try {
      const rect = el.getBoundingClientRect();
      const origin = map
        .getProjection()
        .fromOffsetToCoord(
          new naver.maps.Point(t.clientX - rect.left, t.clientY - rect.top),
        );
      map.zoomBy(1, origin, true);
    } catch {
      map.setZoom(map.getZoom() + 1, true);
    }
  };

  el.addEventListener("touchstart", onStart, { passive: true });
  el.addEventListener("touchend", onEnd, { passive: true });
  return () => {
    el.removeEventListener("touchstart", onStart);
    el.removeEventListener("touchend", onEnd);
  };
}

/** 장소 이름을 지도 글자로 쓰기 전에 이스케이프한다(마커 내용은 HTML 문자열이라서) */
function esc(text: string) {
  return text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] as string,
  );
}

/* 지도 점 — 작은 동그라미(숫자) 하나. 네이버 지도의 저장 장소 표시처럼, 멀리서는 동그라미만 보이고
   충분히 확대(LABEL_ZOOM 이상)하면 동그라미 밑에 장소 이름이 나타나 어디인지 알 수 있다. */
const DOT_BOX_W = 96;
const DOT_BOX_H = 60;
const DOT = 25;
/** 지도의 경로선(도보 경로 · 출발지 점선) 색과 투명도 */
const ROUTE_COLOR = "#16A46B";
const ROUTE_OPACITY = 0.9;
/** 이 확대 단계 이상일 때 장소 이름을 보여 준다(래스터 지도 기준 — GL 지도에서는 zoomShift() 만큼 옮겨 쓴다) */
const LABEL_ZOOM = 16;
/** 지도에 맞출 때 확대 한도 · 장소가 하나일 때 확대 단계(래스터 지도 기준) */
const FIT_MAX_ZOOM = 17;
const SINGLE_ZOOM = 15;
/** + · − 버튼이 한 번에 움직이는 단계 — 래스터 지도는 정수 단계뿐이라 1, GL 지도는 반 단계씩 촘촘하게 */
const GL_ZOOM_STEP = 0.5;
let dotSeq = 0;
function dotHtml(label: string, name: string, origin = false) {
  /* 원과 글자를 한 SVG 로 그린다(지하철 노선 배지와 같은 방식). HTML 글자는 줄 높이 · 소수 위치 때문에 원 안에서
     0.5~1px 치우치는데, SVG 안에서는 원과 글자가 같은 좌표계라 정중앙에 맞출 수 있다.
     글자 위치(y · 숫자 1 의 x)는 확대해서 글자 윤곽의 중심이 원 중심(12.5)에 오도록 잰 값이다. */
  const id = `rdot${++dotSeq}`;
  const fill = origin ? "#17161b" : `url(#${id})`;
  const defs = origin
    ? ""
    : `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2fbe85"/><stop offset="1" stop-color="#0e8a58"/></linearGradient></defs>`;
  const x = label === "1" ? 12.8 : 12.5;
  const y = origin ? 15.85 : 16.8;
  const size = origin ? 9.5 : 12;
  return `<span class="route__pin route__pin--live route__pin--dot${origin ? " route__pin--origin" : ""}"><b><svg width="${DOT}" height="${DOT}" viewBox="0 0 ${DOT} ${DOT}" aria-hidden="true">${defs}<circle cx="${DOT / 2}" cy="${DOT / 2}" r="${DOT / 2 - 0.3}" fill="${fill}" stroke="${origin ? "#6a6876" : "#2f8f68"}" stroke-opacity="0.6" stroke-width="0.6"/><text x="${x}" y="${y}" text-anchor="middle" fill="#fff" font-size="${size}" font-weight="700">${esc(label)}</text></svg></b><i class="route__pinlabel">${esc(name)}</i></span>`;
}
const DOT_ICON = {
  size: { width: DOT_BOX_W, height: DOT_BOX_H },
  // 동그라미 가운데가 좌표
  anchor: { x: DOT_BOX_W / 2, y: DOT / 2 },
};

export function CourseMap({
  components,
  origin,
  includeOrigin = false,
  walkPath = null,
  walkPending = false,
}: {
  components: CandidateComponent[];
  origin?: MapOrigin | null;
  /** 지도 범위에 출발지까지 넣을지 — 기본은 코스 장소만 크게 보여 준다(출발지 핀 · 점선은 범위 밖이어도 지도에 있다) */
  includeOrigin?: boolean;
  /** 장소 사이의 도보 경로(첫 장소 → 마지막 장소). 있으면 실선으로 그리고, 없으면 장소 사이를 직선 점선으로 잇는다 */
  walkPath?: { lat: number; lng: number }[] | null;
  /** 도보 경로를 아직 받는 중 — 받는 동안은 직선 점선을 그리지 않는다(직선이 먼저 보였다가 도보 경로로 바뀌는 깜빡임을 막는다). 못 받으면 그때 직선으로 대신한다 */
  walkPending?: boolean;
}) {
  const points: MapPoint[] = components
    .filter(
      (c): c is CandidateComponent & { latitude: number; longitude: number } =>
        typeof c.latitude === "number" && typeof c.longitude === "number",
    )
    .map((c) => ({
      lat: c.latitude,
      lng: c.longitude,
      sequence: c.sequence,
      name: c.name,
    }));

  const containerRef = useRef<HTMLDivElement | null>(null);
  // 확대 · 축소 버튼이 쓰는 지도 객체(지도가 만들어진 뒤에만 있다)
  const mapRef = useRef<naver.maps.Map | null>(null);
  // 지도 범위를 다시 맞추는 함수(지도가 만들어진 뒤에만 있다)와 지금 "출발지 포함" 값 — 스위치를 바꿀 때 지도를 새로 만들지 않으려고 둔다
  const fitRef = useRef<((withOrigin: boolean) => void) | null>(null);
  const includeRef = useRef(includeOrigin);
  // 도보 경로가 늦게 도착해도 지도를 새로 만들지 않고 선만 바꾼다
  const walkRef = useRef(walkPath);
  const walkPendingRef = useRef(walkPending);
  // 장소 사이 직선 점선을 보일지 다시 정하는 함수(지도가 만들어진 뒤에만 있다)
  const syncStopsRef = useRef<(() => void) | null>(null);
  const applyWalkRef = useRef<
    ((path: { lat: number; lng: number }[] | null) => void) | null
  >(null);
  const [broken, setBroken] = useState(points.length === 0);
  // 지도가 처음 그려질 때까지(타일이 올 때까지) 지도 자리에 흐린 움직임을 보여 준다
  const [mapReady, setMapReady] = useState(false);
  // 거리 눈금 — 확대 · 축소할 때만 on
  const [scale, setScale] = useState({ px: 0, label: "", on: false });
  const scaleTimer = useRef<number | null>(null);
  const pointsKey =
    (origin ? `o:${origin.lat},${origin.lng}|` : "") +
    points.map((p) => `${p.sequence}:${p.lat},${p.lng}`).join("|");

  useEffect(() => {
    if (!points.length || !containerRef.current) return;
    let cancelled = false;
    let map: naver.maps.Map | null = null;
    // 두 번 탭 확대용 터치 감지를 걷어 내는 함수
    let detachDoubleTap: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let revealTimer = 0;
    const listeners: naver.maps.MapEventListener[] = [];

    loadNaverMaps()
      .then((ns) => {
        if (cancelled || !containerRef.current) return;
        const latlngs = points.map((p) => new ns.maps.LatLng(p.lat, p.lng));
        const originLatLng = origin
          ? new ns.maps.LatLng(origin.lat, origin.lng)
          : null;
        // 경로와 화면 범위에는 출발지를 맨 앞에 넣는다
        const routeLatLngs = originLatLng
          ? [originLatLng, ...latlngs]
          : latlngs;

        map = new ns.maps.Map(containerRef.current, {
          center: latlngs[0],
          zoom: SINGLE_ZOOM + zoomShift(),
          // 벡터(GL) 지도를 켠 경우(주소 뒤 ?mapgl=on) 소수점 확대가 된다. 기기가 WebGL 을 못 쓰면 SDK 가 알아서 기본 지도로 돌아간다
          ...(isNaverGl() ? { gl: true } : {}),
          zoomControl: false,
          // NAVER 로고를 왼쪽 아래로 — 오른쪽 아래 구석은 확대 · 축소 버튼이 쓴다
          logoControl: true,
          logoControlOptions: { position: ns.maps.Position.BOTTOM_LEFT },
          scrollWheel: false,
          scaleControl: false,
          mapDataControl: false,
          // 두 번 탭 확대는 아래에서 직접 처리한다(SDK 와 같이 켜 두면 두 단계씩 커진다)
          disableDoubleTapZoom: true,
        });
        mapRef.current = map;
        detachDoubleTap = attachDoubleTapZoom(containerRef.current, map);

        // 확대 · 축소가 일어나면 거리 눈금을 보여 주고 잠깐 뒤 숨긴다. 처음 그려질 때(fitBounds)의 확대는 건너뛴다
        const mapEl = containerRef.current;
        let ready = false;
        let fitted = false;
        let tilesBeforeFit = false;
        const reveal = () => {
          ready = true;
          setMapReady(true);
        };
        const showScale = () => {
          if (!ready || !map || !mapEl) return;
          try {
            const rect = mapEl.getBoundingClientRect();
            const y = rect.height / 2;
            const x0 = (rect.width - SCALE_MAX_PX) / 2;
            const proj = map.getProjection();
            const meters = proj.getDistance(
              proj.fromOffsetToCoord(new ns.maps.Point(x0, y)),
              proj.fromOffsetToCoord(new ns.maps.Point(x0 + SCALE_MAX_PX, y)),
            );
            const sc = scaleFor(meters);
            if (!sc) return;
            setScale({ ...sc, on: true });
            if (scaleTimer.current) window.clearTimeout(scaleTimer.current);
            scaleTimer.current = window.setTimeout(
              () => setScale((s) => ({ ...s, on: false })),
              SCALE_HIDE_MS,
            );
          } catch {
            /* 눈금은 부가 표시라 계산에 실패하면 그냥 안 보여 준다 */
          }
        };
        // 충분히 확대했을 때만 장소 이름(.route--labels)을 보여 준다
        const updateLabels = () => {
          if (!map || !mapEl) return;
          mapEl.classList.toggle(
            "route--labels",
            map.getZoom() >= LABEL_ZOOM + zoomShift(),
          );
        };
        listeners.push(
          ns.maps.Event.addListener(map, "zoom_changed", showScale),
          ns.maps.Event.addListener(map, "zooming", showScale),
          ns.maps.Event.addListener(map, "zoom_changed", updateLabels),
          ns.maps.Event.addListener(map, "zooming", updateLabels),
          // 코스에 맞춘 화면의 타일이 다 올 때까지 지도를 감춰 둔다(흐린 움직임이 대신 보인다).
          // 예전에는 처음 idle 에서 바로 보여 줘서, 타일이 오기 전의 회색 네모가 그대로 보였다
          ns.maps.Event.addListener(map, "tilesloaded", () => {
            if (fitted) reveal();
            else tilesBeforeFit = true;
          }),
        );
        // 타일 소식이 안 오거나 느린 망이어도 지도는 보여 준다
        revealTimer = window.setTimeout(reveal, REVEAL_MAX_MS);

        // 도보 경로(실선)와 출발지 구간(점선)은 같은 색 · 투명도로 그린다(번호 원과 같은 초록)
        const dashed = {
          strokeColor: ROUTE_COLOR,
          strokeWeight: 3,
          strokeOpacity: ROUTE_OPACITY,
          strokeStyle: "shortdash" as const,
          strokeLineCap: "round" as const,
          zIndex: 1, // 핀(zIndex 10 이상) 아래에 그린다 — 번호가 선에 가리지 않게
        };
        // 출발지 → 첫 장소는 늘 직선 점선(도보 경로를 받지 않는다 — 출발지가 멀 수 있고 사용자 위치를 밖으로 보내지 않는다)
        if (originLatLng && latlngs.length > 0) {
          new ns.maps.Polyline({
            map,
            path: [originLatLng, latlngs[0]],
            ...dashed,
          });
        }
        // 장소 사이: 도보 경로를 받기 전(또는 못 받았을 때)에는 직선 점선
        const stopsLine =
          latlngs.length > 1
            ? new ns.maps.Polyline({ map, path: latlngs, ...dashed })
            : null;
        let walkLine: naver.maps.Polyline | null = null;
        let walkLatLngs: naver.maps.LatLng[] = [];
        // 직선 점선은 도보 경로가 없고 받는 중도 아닐 때만 보인다
        const syncStopsLine = () => {
          stopsLine?.setMap(walkLine || walkPendingRef.current ? null : map!);
        };
        syncStopsRef.current = syncStopsLine;

        points.forEach((p, i) => {
          new ns.maps.Marker({
            map: map!,
            position: latlngs[i],
            title: p.name,
            zIndex: 10 + i,
            icon: {
              content: dotHtml(String(p.sequence), p.name),
              ...DOT_ICON,
            },
          });
        });

        if (originLatLng) {
          new ns.maps.Marker({
            map: map!,
            position: originLatLng,
            title: `출발지 · ${origin!.name}`,
            zIndex: 30,
            icon: {
              content: dotHtml("출발", origin!.name, true),
              ...DOT_ICON,
            },
          });
        }

        /* 래스터 지도는 확대 단계가 정수뿐이라, fitBounds 가 빠듯하면 한 단계 낮은 쪽을 골라 지도가 절반 넘게 비는 때가 있다.
           (GL 지도는 소수점 단계로 맞춰서 필요 없다) 줄인 여백으로도 들어가면 한 단계 더 확대해, 출발지와 경로가 지도를 꽉 채우게 한다 */
        const tighten = (pts: naver.maps.LatLng[]) => {
          if (!map || isNaverGl()) return;
          try {
            const size = map.getSize();
            const proj = map.getProjection();
            const room = FIT_MAX_ZOOM + zoomShift() - map.getZoom();
            const plan = tightenPlan(
              pts.map((p) => {
                const o = proj.fromCoordToOffset(p);
                return { x: o.x, y: o.y };
              }),
              size.width,
              size.height,
              TIGHT_PAD,
              room,
            );
            if (!plan) return;
            map.setCenter(
              proj.fromOffsetToCoord(
                new ns.maps.Point(plan.center.x, plan.center.y),
              ),
            );
            map.setZoom(map.getZoom() + plan.steps);
          } catch {
            /* 계산에 실패하면 fitBounds 결과를 그대로 쓴다 */
          }
        };

        // 지도 범위 — 기본은 코스 장소만, 출발지 포함이 켜져 있으면 출발지까지. 도보 경로가 장소 밖으로 돌아가도 잘리지 않게 경로도 넣는다
        const fit = (withOrigin: boolean) => {
          if (!map) return;
          const base = withOrigin ? routeLatLngs : latlngs;
          const pts = [...base, ...walkLatLngs];
          if (pts.length > 1) {
            // 여백은 동그라미(지름 20px) · 장소 이름(확대했을 때 점 아래 약 40px) · 오른쪽 확대 버튼이 가려지지 않을 만큼만 둔다 — 크게 두면 그만큼 덜 확대된다
            map.fitBounds(pts, {
              top: 26,
              right: 58,
              bottom: 46,
              left: 36,
              maxZoom: FIT_MAX_ZOOM + zoomShift(),
            });
            tighten(pts);
          } else {
            map.setCenter(pts[0]);
            map.setZoom(SINGLE_ZOOM + zoomShift());
          }
        };
        fitRef.current = fit;
        updateLabels();

        // 도보 경로를 그린다(없으면 지운다) — 경로가 있으면 장소 사이 직선은 숨긴다
        const applyWalk = (
          path: { lat: number; lng: number }[] | null,
          initial = false,
        ) => {
          walkLine?.setMap(null);
          walkLine = null;
          walkLatLngs = [];
          if (path && path.length > 1) {
            walkLatLngs = path.map((p) => new ns.maps.LatLng(p.lat, p.lng));
            walkLine = new ns.maps.Polyline({
              map: map!,
              path: walkLatLngs,
              strokeColor: ROUTE_COLOR,
              strokeWeight: 4,
              // 반투명 — 장소 번호 동그라미(불투명)와 구분되고, 경로가 겹치는 곳은 더 진하게 보인다
              strokeOpacity: ROUTE_OPACITY,
              strokeStyle: "solid",
              strokeLineCap: "round",
              strokeLineJoin: "round",
              zIndex: 2,
            });
          }
          syncStopsLine();
          // 도보 경로가 나중에 도착했을 때, 이미 보이는 범위 안이면 지도를 다시 맞추지 않는다 — 지도가 한 번 더 움직이며 확대되는 것처럼 보이지 않게
          const inView = () => {
            try {
              const b = map!.getBounds() as naver.maps.LatLngBounds;
              return walkLatLngs.every((p) => b.hasLatLng(p));
            } catch {
              return false;
            }
          };
          if (initial || !walkLatLngs.length || !inView())
            fit(includeRef.current);
        };
        applyWalkRef.current = applyWalk;
        applyWalk(walkRef.current, true);
        // 맞춘 화면이 정해졌다 — 이 뒤에 오는 tilesloaded 부터 "코스 화면의 타일"이다.
        // 같은 화면의 타일이 이미 캐시에 있어 소식이 먼저 와 버렸다면 잠깐만 더 기다렸다가 보여 준다
        fitted = true;
        if (tilesBeforeFit) {
          if (revealTimer) window.clearTimeout(revealTimer);
          revealTimer = window.setTimeout(reveal, REVEAL_CACHED_MS);
        }

        // 지도 칸의 크기가 시트가 열리는 동안이나 스크롤바가 생길 때 바뀌면 타일이 모자라 회색으로 남는다 — 크기가 바뀌면 지도에 다시 알린다
        if (typeof ResizeObserver !== "undefined") {
          let lastW = mapEl.clientWidth;
          let lastH = mapEl.clientHeight;
          let frame = 0;
          resizeObserver = new ResizeObserver(() => {
            if (mapEl.clientWidth === lastW && mapEl.clientHeight === lastH)
              return;
            lastW = mapEl.clientWidth;
            lastH = mapEl.clientHeight;
            window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
              try {
                map?.autoResize();
              } catch {
                /* 크기를 다시 읽지 못해도 지도는 그대로 쓴다 */
              }
            });
          });
          resizeObserver.observe(mapEl);
        }
      })
      .catch(() => {
        if (!cancelled) setBroken(true);
      });

    return () => {
      cancelled = true;
      mapRef.current = null;
      fitRef.current = null;
      applyWalkRef.current = null;
      syncStopsRef.current = null;
      detachDoubleTap?.();
      resizeObserver?.disconnect();
      if (revealTimer) window.clearTimeout(revealTimer);
      if (scaleTimer.current) window.clearTimeout(scaleTimer.current);
      try {
        naver.maps.Event.removeListener(listeners);
      } catch {
        /* 지도가 이미 정리됐으면 무시 */
      }
      try {
        // 시트가 열리자마자 빠르게 닫히면, 네이버 지도가 내부 초기화(타일·프로젝션 설정)를
        // 끝내기 전에 destroy() 가 불려서 SDK 내부에서 그대로 터지는 경우가 있다(null.isArray).
        // 우리 쪽 버그가 아니라 SDK 타이밍 문제라, 정리 단계에서는 실패해도 무시한다 —
        // 이 시점엔 컨테이너 DOM 자체가 곧 사라지므로 실패해도 화면에 영향이 없다.
        map?.destroy();
      } catch {
        /* SDK 내부 정리 실패는 무시 */
      }
    };
    // pointsKey(좌표 조합)가 바뀔 때만 지도를 새로 만든다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey]);

  // 도보 경로가 도착하거나 바뀌면 선만 바꾼다
  useEffect(() => {
    walkRef.current = walkPath;
    applyWalkRef.current?.(walkPath);
  }, [walkPath]);

  // 도보 경로를 받는 중인지가 바뀌면 직선 점선만 다시 정한다(지도 범위는 건드리지 않는다)
  useEffect(() => {
    walkPendingRef.current = walkPending;
    syncStopsRef.current?.();
  }, [walkPending]);

  // "출발지 포함" 스위치가 바뀌면 지도 범위만 다시 맞춘다
  useEffect(() => {
    includeRef.current = includeOrigin;
    fitRef.current?.(includeOrigin);
  }, [includeOrigin]);

  /** 한 단계씩 확대(+1) · 축소(-1) — 한계(가장 멀리 · 가까이)는 지도가 알아서 막는다 */
  function zoomBy(step: number) {
    const map = mapRef.current;
    if (!map) return;
    const unit = isNaverGl() ? GL_ZOOM_STEP : 1;
    map.setZoom(map.getZoom() + step * unit, true);
  }

  if (broken) return <SchematicRoute components={components} />;
  return (
    <div className="coursemap">
      <div
        ref={containerRef}
        className={`route route--live${mapReady ? "" : " route--skeleton"}`}
        role="img"
        aria-label="코스 경로 지도"
      />
      {/* 거리 눈금 — 왼쪽 아래 로고 · 출처 줄 위. 확대 · 축소할 때만 보인다 */}
      <div
        className={`coursemap__scale${scale.on ? " is-on" : ""}`}
        aria-hidden="true"
      >
        <span>{scale.label}</span>
        <i style={{ width: scale.px }} />
      </div>
      {/* 마우스 휠은 시트 스크롤과 겹쳐서 막아 두었으니, 확대 · 축소는 버튼으로 한다(폰은 두 손가락으로도 된다) */}
      <div className="coursemap__zoom">
        <button type="button" aria-label="지도 확대" onClick={() => zoomBy(1)}>
          +
        </button>
        <button type="button" aria-label="지도 축소" onClick={() => zoomBy(-1)}>
          −
        </button>
      </div>
      {/* 도보 경로(OpenStreetMap 데이터)를 그렸을 때만 — OSM 라이선스(ODbL)가 요구하는 출처 표기.
            지도 왼쪽 아래, NAVER 로고(왼쪽 아래) 바로 오른쪽에 작게 둔다 */}
      {walkPath && (
        <a
          className="coursemap__credit"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
        >
          © OpenStreetMap
        </a>
      )}
    </div>
  );
}

/** 좌표가 없거나 네이버 지도 로드·인증에 실패했을 때의 도식 대체 화면(프로토타입의 기존 플레이스홀더와 동일) */
function SchematicRoute({ components }: { components: CandidateComponent[] }) {
  const n = Math.max(1, components.length - 1);
  const pts = components.map((_, i) => ({
    x: 14 + i * (68 / n),
    y: 20 + (i % 2 === 0 ? 0 : 32) + i * (22 / n),
  }));
  const path = `M${pts.map((p) => `${p.x + 4} ${p.y + 9}`).join(" L")}`;
  return (
    <div className="route">
      <svg
        className="route__line"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path vectorEffect="non-scaling-stroke" d={path} />
      </svg>
      {components.map((c, i) => (
        <span
          key={c.sequence}
          className="route__pin"
          style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
        >
          {c.sequence}
        </span>
      ))}
      <span className="route__label">지도 · 코스 경로 및 Place 마커</span>
    </div>
  );
}
