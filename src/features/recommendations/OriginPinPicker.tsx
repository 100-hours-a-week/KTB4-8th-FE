"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Sheet } from "@/components/ui/Sheet";
import { SubwayLineBadge } from "@/components/ui/SubwayLineBadge";
import {
  currentPosition,
  OutsideServiceAreaError,
  permissionState,
  reverseGeocode,
} from "@/lib/address/address";
import {
  describePoint,
  fetchPointInfo,
  type PlaceView,
} from "@/lib/address/pointInfo";
import { loadNaverMaps } from "@/lib/naverMaps";
import { useCourseStore } from "./courseStore";

/* 지도 핀으로 출발지 설정 — 설계: Wiki/Frontend/Origin-Pin-Picker-Design.md (1단계).
   핀은 화면 정중앙에 고정하고 사용자가 지도를 밀어 위치를 맞춘다(카카오택시 방식).
   지도가 멈췄을 때(idle) 한 번만 중심 좌표를 설명하는 정보를 조회하고,
   [출발지로 설정] 을 눌러야 출발지가 바뀐다.
   네이버 지도는 브라우저 전역을 쓰므로 이 파일은 RegionSheet 에서 next/dynamic({ ssr: false }) 으로만 불러온다. */

type AddressView =
  | { kind: "moving" }
  | { kind: "loading" }
  | { kind: "ok"; place: PlaceView; lat: number; lng: number }
  | { kind: "outside" }
  | { kind: "error"; lat: number; lng: number };

interface OriginPinPickerProps {
  /** 뒤로(검색 화면으로 돌아가기) */
  onClose: () => void;
  /** 저장이 끝났을 때 — 출발지 설정 화면까지 같이 닫는다 */
  onSaved: () => void;
}

/** 출발지가 없고 현재 위치도 못 얻을 때 지도를 여는 위치(서울시청) */
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
/** 지도가 멈춘 뒤 이 시간 동안 더 움직이지 않으면 조회한다 */
const LOOKUP_DEBOUNCE_MS = 300;
const START_ZOOM = 17;

export function OriginPinPicker({ onClose, onSaved }: OriginPinPickerProps) {
  const setStore = useCourseStore((s) => s.set);

  /* 이미 정한 출발지가 있으면 그 위치에서 시작한다. 없으면 서울시청에서 열고,
     현재 위치를 얻을 수 있을 때 그쪽으로 옮긴다. */
  const [start] = useState(() => {
    const o = useCourseStore.getState().origin;
    const known =
      o && typeof o.latitude === "number" && typeof o.longitude === "number"
        ? { lat: o.latitude, lng: o.longitude }
        : null;
    return { point: known ?? DEFAULT_CENTER, known: known !== null };
  });

  const [view, setView] = useState<AddressView>({ kind: "loading" });
  const [lifted, setLifted] = useState(false);
  const [broken, setBroken] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /* Sheet 는 포털 대상이 준비된 뒤에야 자식을 그린다. 일반 ref 로는 그때를 알 수 없어서
     (효과가 먼저 돌아 컨테이너가 null 인 채 끝난다) 콜백 ref 로 DOM 이 생긴 시점을 state 로 받는다. */
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const mapRef = useRef<naver.maps.Map | null>(null);
  const timerRef = useRef<number | null>(null);
  const seqRef = useRef(0);
  const addrRef = useRef<HTMLDivElement | null>(null);
  /* 핀이 가리키는(지도가 멈춘) 위치. 카드 높이가 바뀌어 지도 크기가 달라질 때 이 위치로 다시 맞춘다 —
     그냥 두면 지도 안쪽 기준점이 위쪽에 고정되어 핀이 지도 위 다른 지점을 가리키게 된다. */
  const centerRef = useRef<naver.maps.LatLng | null>(null);
  /** 마지막으로 정보를 조회한 위치 — 같은 자리의 idle 로 다시 조회하지 않으려고 쓴다 */
  const lastLookupRef = useRef<{ lat: number; lng: number } | null>(null);
  /** 크기를 맞추는 동안 생기는 idle 은 사용자가 움직인 것이 아니라서 무시한다 */
  const resizingRef = useRef(false);
  /** 사용자가 지도를 끌고 있는 동안 — 이때의 idle 은 크기 조정 보호와 상관없이 늘 처리해야 한다 */
  const draggingRef = useRef(false);

  /** 마지막으로 멈춘 위치만 반영한다 — 이전 요청이 늦게 와도 결과를 무시한다 */
  const scheduleLookup = useCallback((lat: number, lng: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const seq = ++seqRef.current;
    lastLookupRef.current = { lat, lng };
    setView({ kind: "loading" });
    timerRef.current = window.setTimeout(async () => {
      const [hitResult, info] = await Promise.all([
        reverseGeocode(lat, lng).then(
          (hit) => ({ hit }),
          (err: unknown) => ({ err }),
        ),
        fetchPointInfo(lat, lng),
      ]);
      if (seq !== seqRef.current) return;
      // 결과가 오면 카드 높이를 내용에 맞게 다시 풀어 준다(움직이는 동안만 고정했던 것)
      if (addrRef.current) addrRef.current.style.minHeight = "";

      if (
        "err" in hitResult &&
        hitResult.err instanceof OutsideServiceAreaError
      ) {
        setView({ kind: "outside" });
        return;
      }
      const place = describePoint(
        "hit" in hitResult ? hitResult.hit : null,
        info,
        "pin",
      );
      setView(
        place ? { kind: "ok", place, lat, lng } : { kind: "error", lat, lng },
      );
    }, LOOKUP_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    let cancelled = false;
    permissionState().then((state) => {
      if (!cancelled && state === "denied") setGeoDenied(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!container) return;
    let cancelled = false;
    let map: naver.maps.Map | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimer: number | null = null;

    loadNaverMaps()
      .then((ns) => {
        if (cancelled) return;
        map = new ns.maps.Map(container, {
          center: new ns.maps.LatLng(start.point.lat, start.point.lng),
          zoom: START_ZOOM,
          zoomControl: false,
          scaleControl: false,
          mapDataControl: false,
        });
        mapRef.current = map;

        ns.maps.Event.addListener(map, "dragstart", () => {
          // 움직이는 동안은 이전 정보가 유효하지 않다 — 저장도 막는다
          if (timerRef.current) window.clearTimeout(timerRef.current);
          seqRef.current += 1;
          draggingRef.current = true;
          // 움직이는 동안 안내 문구가 한 줄로 바뀌어도 카드 높이는 그대로 둬서 지도가 출렁이지 않게 한다.
          // offsetHeight 는 소수 높이를 반올림해서 고정하는 순간 높이가 달라질 수 있어 실제 높이를 쓴다.
          const addr = addrRef.current;
          if (addr)
            addr.style.minHeight = `${addr.getBoundingClientRect().height}px`;
          setLifted(true);
          setView({ kind: "moving" });
        });
        // 드래그·확대·축소·setCenter 가 모두 끝나면 발생한다. 지도를 처음 만들 때는 발생하지 않으므로
        // 첫 위치는 아래에서 직접 조회한다.
        ns.maps.Event.addListener(map, "idle", () => {
          const dragged = draggingRef.current;
          draggingRef.current = false;
          if (resizingRef.current && !dragged) return;
          setLifted(false);
          // getCenter() 의 타입은 LatLng | Point 이지만 지도 좌표계가 기본(WGS84)이라 항상 LatLng 이다
          const c = map!.getCenter() as naver.maps.LatLng;
          centerRef.current = c;
          const last = lastLookupRef.current;
          // 같은 자리에서 다시 멈춘 것(예: 크기 조정 뒤)이면 다시 조회하지 않는다
          if (
            last &&
            Math.abs(last.lat - c.lat()) < 1e-7 &&
            Math.abs(last.lng - c.lng()) < 1e-7
          ) {
            return;
          }
          scheduleLookup(c.lat(), c.lng());
        });

        centerRef.current = map.getCenter() as naver.maps.LatLng;
        scheduleLookup(start.point.lat, start.point.lng);

        /* 카드 높이가 바뀌면 지도 영역 크기가 달라진다. 지도에 크기를 알려 주고 핀이 가리키던 위치로 되돌린다. */
        resizeObserver = new ResizeObserver(() => {
          const current = mapRef.current;
          const center = centerRef.current;
          // 끌고 있는 동안은 사용자가 정한 위치가 곧 중심이라 되돌리지 않는다
          if (!current || !center || draggingRef.current) return;
          resizingRef.current = true;
          current.autoResize();
          current.setCenter(center);
          if (resizeTimer) window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(() => {
            resizingRef.current = false;
          }, 400);
        });
        resizeObserver.observe(container);

        // 정해 둔 출발지가 없으면 현재 위치로 시작한다(실패하면 서울시청 그대로)
        if (!start.known) {
          currentPosition()
            .then((pos) => {
              if (cancelled) return;
              map?.setCenter(new ns.maps.LatLng(pos.latitude, pos.longitude));
            })
            .catch(() => {
              /* 권한 거부·실패는 조용히 넘어간다 — 지도를 직접 움직이면 된다 */
            });
        }
      })
      .catch(() => {
        if (!cancelled) setBroken(true);
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizingRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      seqRef.current += 1;
      mapRef.current = null;
      try {
        // CourseMap 과 같은 이유 — 시트가 바로 닫히면 SDK 내부 초기화 전에 destroy 가 불려 터질 수 있어 무시한다
        map?.destroy();
      } catch {
        /* SDK 내부 정리 실패는 무시 */
      }
    };
  }, [container, start, scheduleLookup]);

  async function moveToCurrentLocation() {
    const map = mapRef.current;
    if (!map || geoDenied || locating) return;
    setLocating(true);
    setNotice(null);
    try {
      const pos = await currentPosition();
      // 이동이 끝나면 idle 이 발생해 정보 조회가 이어진다
      map.setCenter(new naver.maps.LatLng(pos.latitude, pos.longitude));
    } catch (err) {
      const code = (err as { code?: number } | null)?.code;
      if (code === 1) {
        setGeoDenied(true);
        setNotice(
          "위치 권한이 허용되지 않아 현재 위치로 이동할 수 없어요. 지도를 직접 움직여 주세요.",
        );
      } else {
        setNotice("현재 위치를 확인하지 못했어요. 지도를 직접 움직여 주세요.");
      }
    } finally {
      setLocating(false);
    }
  }

  function handleSave() {
    if (view.kind !== "ok") return;
    setStore({
      origin: {
        label: view.place.title,
        latitude: view.lat,
        longitude: view.lng,
        current: false,
      },
    });
    onSaved();
  }

  function renderAddress() {
    switch (view.kind) {
      case "moving":
        return <p className="pinmap__hint">핀을 놓을 위치를 맞춰 주세요</p>;
      case "loading":
        return <p className="pinmap__hint">위치를 확인하고 있어요…</p>;
      case "ok":
        return (
          <>
            <p className="pinmap__label">
              <span className="pinmap__name">{view.place.title}</span>
              {view.place.lines.length > 0 && (
                <span className="addr__lines">
                  {view.place.lines.map((raw) => (
                    <SubwayLineBadge key={raw} raw={raw} />
                  ))}
                </span>
              )}
            </p>
            {view.place.sub && (
              <p className="pinmap__sub">
                {view.place.sub}
                {view.place.note && ` · ${view.place.note}`}
              </p>
            )}
            {view.place.facilities && view.place.facilities.length > 0 && (
              <p className="pinmap__facility">
                <Icon name="pin" size={15} />
                <span>{view.place.facilities.join(" · ")}</span>
              </p>
            )}
          </>
        );
      case "outside":
        return (
          <p className="pinmap__hint pinmap__hint--error">
            서비스 지역(대한민국) 밖이에요. 핀을 한국 안으로 옮겨 주세요.
          </p>
        );
      case "error":
        return (
          <>
            <p className="pinmap__hint pinmap__hint--error">
              위치 정보를 확인하지 못했어요.
            </p>
            <button
              className="btn btn--soft btn--sm btn--pill"
              type="button"
              style={{ marginTop: 8 }}
              onClick={() => scheduleLookup(view.lat, view.lng)}
            >
              다시 시도
            </button>
          </>
        );
    }
  }

  return (
    <Sheet
      title="지도에서 출발지 설정"
      back
      full
      onClose={onClose}
      foot={
        <button
          className="btn btn--block"
          type="button"
          disabled={view.kind !== "ok"}
          onClick={handleSave}
        >
          출발지로 설정
        </button>
      }
    >
      {broken ? (
        <div className="pinmap__fallback">
          <p className="pinmap__hint pinmap__hint--error">
            지도를 불러오지 못했어요. 이름으로 검색해서 출발지를 설정해 주세요.
          </p>
          <button
            className="btn btn--soft btn--sm btn--pill"
            type="button"
            style={{ marginTop: 8 }}
            onClick={onClose}
          >
            검색으로 돌아가기
          </button>
        </div>
      ) : (
        <>
          <div className="pinmap">
            <div
              ref={setContainer}
              className="pinmap__map"
              role="application"
              aria-label="출발지를 고르는 지도. 지도를 움직여 가운데 핀 위치를 맞춰 주세요."
            />
            <span
              className={`pinmap__pin${lifted ? " is-lifted" : ""}`}
              aria-hidden="true"
            >
              <span className="pinmap__body">
                <span className="pinmap__bubble">출발</span>
                <span className="pinmap__stem" />
              </span>
              <span className="pinmap__dot" />
            </span>
            <button
              className="pinmap__locate"
              type="button"
              aria-label="현재 위치로 이동"
              disabled={geoDenied || locating}
              onClick={() => void moveToCurrentLocation()}
            >
              <Icon name="locate" size={22} />
            </button>
          </div>
          <div className="pinmap__addr" aria-live="polite" ref={addrRef}>
            {renderAddress()}
            {notice && (
              <p className="pinmap__hint" style={{ marginTop: 8 }}>
                {notice}
              </p>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}
