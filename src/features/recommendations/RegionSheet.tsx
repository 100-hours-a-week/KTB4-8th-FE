"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { SubwayLineBadge } from "@/components/ui/SubwayLineBadge";
import {
  addressConfig,
  currentPosition,
  permissionState,
  OutsideServiceAreaError,
  reverseGeocode,
  searchAddress,
  type AddressHit,
} from "@/lib/address/address";
import { describePoint, fetchPointInfo } from "@/lib/address/pointInfo";
import { MAX_REGION, REGION_DISALLOWED } from "@/lib/constants";
import { useCourseStore } from "./courseStore";

/* 지도 핀으로 출발지 설정 — 네이버 지도는 서버에서 실행되면 안 되고 첫 로딩 번들에도 넣지 않으려고
   next/dynamic({ ssr: false }) 으로 필요할 때만 불러온다. */
const OriginPinPicker = dynamic(
  () => import("./OriginPinPicker").then((m) => m.OriginPinPicker),
  { ssr: false },
);

/* 지역 검색 · 출발지 설정 — 기능정의서 10장. 조건 카드의 "지역" 항목과 "출발지 수정"이 같은 시트를 쓴다
   (kind 로 저장할 곳만 다르다). 프로토타입 js/pages/course.js 의 sheetRegion() 을 그대로 옮겼다. */

type ResultsView =
  | { kind: "idle" }
  | { kind: "need-more" }
  | { kind: "searching" }
  | { kind: "locating" }
  | { kind: "empty" }
  | { kind: "error"; message: string; retry?: boolean }
  | { kind: "list"; items: AddressHit[] };

interface RegionSheetProps {
  kind: "region" | "origin";
  onClose: () => void;
}

const DEBOUNCE_MS = 220;

export function RegionSheet({ kind, onClose }: RegionSheetProps) {
  const patchSlots = useCourseStore((s) => s.patchSlots);
  const setStore = useCourseStore((s) => s.set);

  const [query, setQuery] = useState("");
  const [shaking, setShaking] = useState(false);
  const [chosen, setChosen] = useState<AddressHit | null>(null);
  const [cursor, setCursor] = useState(-1);
  const [resultsView, setResultsView] = useState<ResultsView>({ kind: "idle" });
  const [geoDenied, setGeoDenied] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [locatedNote, setLocatedNote] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const searchSeqRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* Simulator에서 하드웨어 키보드가 연결되면 소프트 키보드는 숨고 Safari의
     이전/다음/완료 막대만 남는다. 결과가 도착한 뒤 실제 키보드가 화면을 차지하지
     않은 경우에만 포커스를 해제해 막대가 계속 남지 않게 한다. */
  function dismissSimulatorAccessoryBar() {
    if (!("ontouchstart" in window) && navigator.maxTouchPoints <= 0) return;
    window.requestAnimationFrame(() => {
      const viewport = window.visualViewport;
      const keyboardIsVisible =
        viewport && viewport.height < window.innerHeight * 0.85;
      if (!keyboardIsVisible && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    });
  }

  /* 위치 권한을 이미 거부했다면 버튼을 비활성화한다(v1은 항상 http 로 서비스되므로 file:// 예외는 사실상 안 탄다) */
  useEffect(() => {
    let cancelled = false;
    permissionState().then((state) => {
      if (cancelled) return;
      if (
        state === "denied" &&
        typeof window !== "undefined" &&
        window.location.protocol !== "file:"
      ) {
        setGeoDenied(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    },
    [],
  );

  function triggerShake() {
    setShaking(false);
    window.requestAnimationFrame(() => setShaking(true));
    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = window.setTimeout(() => setShaking(false), 400);
  }

  function pick(i: number, items: AddressHit[]) {
    if (i < 0 || i >= items.length) return;
    setCursor(i);
    setChosen(items[i]);
    setLocatedNote(false);
  }

  /** 결과를 눌러 고른다. 출발지는 고르는 즉시 입력창에 채우고 출발지로 적용한다(시트는 [저장] 을 눌러야 닫힌다).
      그래야 [지도에서 핀으로 설정] 이 방금 고른 위치에서 열린다. 지역(목적지)은 기존처럼 [저장] 으로 확정한다. */
  function choose(i: number, items: AddressHit[]) {
    if (i < 0 || i >= items.length) return;
    pick(i, items);
    if (kind === "origin") {
      setQuery(items[i].label);
      commit(items[i]);
    }
  }

  async function runSearch(q: string) {
    const seq = ++searchSeqRef.current;
    setResultsView({ kind: "searching" });
    try {
      const list = await searchAddress(q);
      if (seq !== searchSeqRef.current) return;
      setResultsView(
        list.length ? { kind: "list", items: list } : { kind: "empty" },
      );
      dismissSimulatorAccessoryBar();
    } catch {
      if (seq !== searchSeqRef.current) return;
      setResultsView({
        kind: "error",
        message: "검색에 실패했어요. 잠시 후 다시 시도해 주세요.",
      });
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    let v = e.target.value;
    let shouldShake = false;
    const stripped = v.replace(REGION_DISALLOWED, "");
    if (stripped !== v) {
      v = stripped;
      shouldShake = true;
    }
    if (v.length > MAX_REGION) {
      v = v.slice(0, MAX_REGION);
      shouldShake = true;
    }
    setQuery(v);
    setChosen(null);
    setCursor(-1);
    setLocatedNote(false);
    if (shouldShake) triggerShake();

    const key = v.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (key.length < 2) {
      searchSeqRef.current += 1;
      setResultsView(
        key.length === 0 ? { kind: "idle" } : { kind: "need-more" },
      );
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      void runSearch(key);
    }, DEBOUNCE_MS);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      e.key === "ArrowDown" &&
      resultsView.kind === "list" &&
      resultsView.items.length
    ) {
      e.preventDefault();
      pick(
        Math.min(cursor + 1, resultsView.items.length - 1),
        resultsView.items,
      );
      return;
    }
    if (
      e.key === "ArrowUp" &&
      resultsView.kind === "list" &&
      resultsView.items.length
    ) {
      e.preventDefault();
      pick(Math.max(cursor - 1, 0), resultsView.items);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (resultsView.kind === "list") {
        if (cursor < 0 && resultsView.items.length) {
          choose(0, resultsView.items);
        } else if (chosen) {
          handleSave();
        }
      }
      return;
    }
    const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey;
    const full =
      query.length >= MAX_REGION &&
      e.currentTarget.selectionStart === e.currentTarget.selectionEnd;
    if (printable && full) {
      e.preventDefault();
      triggerShake();
    }
  }

  async function fillFromCurrentLocation() {
    if (geoDenied) return;
    setGeoLoading(true);
    setLocatedNote(false);
    setResultsView({ kind: "locating" });
    try {
      const pos = await currentPosition();
      const [hit, info] = await Promise.all([
        reverseGeocode(pos.latitude, pos.longitude),
        fetchPointInfo(pos.latitude, pos.longitude),
      ]);
      /* 법정동 밑에 상세 주소를 붙이고, 지하철 출구·역 가까이면 "홍대입구역 9번 출구"처럼 보여 준다 */
      const place = describePoint(hit, info, "region");
      const withCurrent: AddressHit = {
        ...hit,
        label: place?.title ?? hit.label,
        sub: place?.sub ?? hit.sub,
        lines: place?.lines.length ? place.lines : undefined,
        current: true,
      };
      setQuery(withCurrent.label);
      setChosen(withCurrent);
      setCursor(0);
      setResultsView({ kind: "list", items: [withCurrent] });
      setLocatedNote(true);
    } catch (err) {
      const code = (err as { code?: number } | null)?.code;
      if (code === 1) {
        setGeoDenied(true);
        setResultsView({
          kind: "error",
          message:
            "위치 권한이 허용되지 않아 현재 위치를 쓸 수 없어요. 브라우저 설정에서 허용한 뒤 다시 시도해 주세요.",
        });
      } else if (err instanceof OutsideServiceAreaError) {
        setResultsView({
          kind: "error",
          message:
            "현재 위치가 서비스 지역(대한민국) 밖이에요. 지역을 직접 검색해 주세요.",
        });
      } else {
        setResultsView({
          kind: "error",
          message: "일시적인 오류로 위치를 확인하지 못했어요.",
          retry: true,
        });
      }
    } finally {
      setGeoLoading(false);
    }
  }

  /** 고른 위치를 조건에 반영한다(시트는 닫지 않는다) */
  function commit(hit: AddressHit) {
    if (kind === "origin") {
      setStore({
        origin: {
          label: hit.label,
          latitude: hit.latitude,
          longitude: hit.longitude,
          current: !!hit.current,
        },
      });
    } else {
      patchSlots({
        region: hit.label,
        regionPoint: { latitude: hit.latitude, longitude: hit.longitude },
        regionAddress: hit.sub,
      });
    }
  }

  function handleSave() {
    if (!chosen) return;
    commit(chosen);
    onClose();
  }

  function highlightLabel(text: string, key: string): ReactNode {
    if (!key) return text;
    const compact = text.replace(/\s+/g, "");
    const i = compact.indexOf(key);
    if (i < 0) return text;
    // 공백을 제거한 인덱스를 원문 인덱스로 되돌린다
    let seen = 0;
    let from = -1;
    let to = -1;
    for (let p = 0; p < text.length; p++) {
      if (/\s/.test(text[p])) continue;
      if (seen === i) from = p;
      if (seen === i + key.length - 1) {
        to = p + 1;
        break;
      }
      seen++;
    }
    if (from < 0 || to < 0) return text;
    return (
      <>
        {text.slice(0, from)}
        <mark>{text.slice(from, to)}</mark>
        {text.slice(to)}
      </>
    );
  }

  function renderResults(): ReactNode {
    switch (resultsView.kind) {
      case "idle":
        return <p className="field__help">검색어를 입력해 주세요.</p>;
      case "need-more":
        return <p className="field__help">2자 이상 입력해 주세요.</p>;
      case "searching":
        return <p className="field__help">법정동과 지하철역을 찾고 있어요…</p>;
      case "locating":
        return <p className="field__help">현재 위치를 확인하고 있어요…</p>;
      case "empty":
        return (
          <p className="field__help">
            검색 결과가 없어요. 다른 이름으로 찾아보세요.
          </p>
        );
      case "error":
        return (
          <>
            <p className="field__help" style={{ color: "var(--danger)" }}>
              {resultsView.message}
            </p>
            {resultsView.retry && (
              <button
                className="btn btn--soft btn--sm btn--pill"
                type="button"
                style={{ marginTop: 8 }}
                onClick={() => void fillFromCurrentLocation()}
              >
                다시 시도
              </button>
            )}
          </>
        );
      case "list": {
        const key = query.trim().replace(/\s+/g, "");
        return (
          <>
            {resultsView.items.map((a, i) => (
              <button
                key={a.id}
                className="addr"
                type="button"
                role="option"
                aria-selected={i === cursor}
                onClick={() => choose(i, resultsView.items)}
              >
                <span className="addr__main">
                  <span className="addr__name">
                    {highlightLabel(a.label, key)}
                  </span>
                  <span className="addr__sub">{a.sub}</span>
                </span>
                {a.lines && a.lines.length > 0 && (
                  <span className="addr__lines">
                    {a.lines.map((raw) => (
                      <SubwayLineBadge key={raw} raw={raw} />
                    ))}
                  </span>
                )}
              </button>
            ))}
            {locatedNote && (
              <p className="field__help" style={{ marginTop: 8 }}>
                현재 위치와 가장 가까운 지역이에요. [저장] 을 눌러 확정해
                주세요.
              </p>
            )}
          </>
        );
      }
      default:
        return null;
    }
  }

  return (
    <>
      <Sheet
        title={kind === "origin" ? "출발지 설정" : "지역 검색"}
        back
        onClose={onClose}
        foot={
          <button
            className="btn btn--block"
            type="button"
            disabled={!chosen}
            onClick={handleSave}
          >
            저장
          </button>
        }
      >
        <div className="field" style={{ marginTop: 4 }}>
          <input
            ref={inputRef}
            className={`field__input${shaking ? " is-shake" : ""}`}
            placeholder={
              addressConfig.provider === "jusoKr" && addressConfig.jusoApiKey
                ? "도로명 주소·법정동·지하철역을 입력하세요"
                : "법정동 또는 지하철역을 입력하세요"
            }
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            role="combobox"
            aria-controls="region-results"
            aria-expanded={
              resultsView.kind === "list" && resultsView.items.length > 0
            }
            aria-autocomplete="list"
          />
          <div className="field__foot">
            <span className="field__help">
              지역명 1~{MAX_REGION}자, 한글 · 영문 · 숫자 · 공백만 허용
              <br />
              2자 이상부터 법정동 DB와 카카오 지하철역을 함께 검색
            </span>
            <span
              className="field__count"
              data-full={query.length >= MAX_REGION ? "true" : "false"}
            >
              {query.length}/{MAX_REGION}
            </span>
          </div>
        </div>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}
        >
          <button
            className="btn btn--soft btn--sm btn--pill"
            type="button"
            disabled={geoDenied || geoLoading}
            onClick={() => void fillFromCurrentLocation()}
          >
            <Icon name="pin" size={15} />
            <span>현재 위치로 설정</span>
          </button>
          {kind === "origin" && (
            <button
              className="btn btn--soft btn--sm btn--pill"
              type="button"
              onClick={() => setPinOpen(true)}
            >
              <Icon name="map" size={15} />
              <span>지도에서 핀으로 설정</span>
            </button>
          )}
        </div>
        <p className="cond__legend" style={{ marginTop: 18 }}>
          검색 결과
        </p>
        <div id="region-results" role="listbox">
          {renderResults()}
        </div>
      </Sheet>
      {pinOpen && (
        <OriginPinPicker onClose={() => setPinOpen(false)} onSaved={onClose} />
      )}
    </>
  );
}
