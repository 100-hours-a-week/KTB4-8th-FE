"use client";

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
import {
  addressConfig,
  currentPosition,
  permissionState,
  reverseGeocode,
  searchAddress,
  type AddressHit,
} from "@/lib/address/address";
import { MAX_REGION, REGION_DISALLOWED } from "@/lib/constants";
import { useCourseStore } from "./courseStore";

/* 지역 검색 · 출발지 설정 — 기능정의서 10장. 조건 카드의 "지역" 항목과 "출발지 수정"이 같은 시트를 쓴다
   (kind 로 저장할 곳만 다르다). 프로토타입 js/pages/course.js 의 sheetRegion() 을 그대로 옮겼다. */

type ResultsView =
  | { kind: "idle" }
  | { kind: "need-more" }
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

  const debounceRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);

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

  async function runSearch(q: string) {
    try {
      const list = await searchAddress(q);
      setResultsView(
        list.length ? { kind: "list", items: list } : { kind: "empty" },
      );
    } catch {
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
        if (cursor < 0 && resultsView.items.length) pick(0, resultsView.items);
        else if (chosen) handleSave();
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
      const hit = await reverseGeocode(pos.latitude, pos.longitude);
      const withCurrent: AddressHit = { ...hit, current: true };
      setQuery(hit.label);
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

  function handleSave() {
    if (!chosen) return;
    if (kind === "origin") {
      setStore({
        origin: {
          label: chosen.label,
          latitude: chosen.latitude,
          longitude: chosen.longitude,
          current: !!chosen.current,
        },
      });
    } else {
      patchSlots({
        region: chosen.label,
        regionPoint: { latitude: chosen.latitude, longitude: chosen.longitude },
      });
    }
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
                onClick={() => pick(i, resultsView.items)}
              >
                <span className="addr__name">
                  {highlightLabel(a.label, key)}
                </span>
                <span className="addr__sub">{a.sub}</span>
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
          className={`field__input${shaking ? " is-shake" : ""}`}
          placeholder={
            addressConfig.provider === "jusoKr" && addressConfig.jusoApiKey
              ? "도로명 주소 또는 지역명을 입력하세요"
              : "지역명을 입력하세요"
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
            2자 이상부터{" "}
            {addressConfig.provider === "jusoKr" && addressConfig.jusoApiKey
              ? "행정안전부 도로명주소 API로 자동완성"
              : "자체 지역 DB에서 자동 검색"}
          </span>
          <span
            className="field__count"
            data-full={query.length >= MAX_REGION ? "true" : "false"}
          >
            {query.length}/{MAX_REGION}
          </span>
        </div>
      </div>
      <button
        className="btn btn--soft btn--sm btn--pill"
        type="button"
        style={{ marginTop: 12 }}
        disabled={geoDenied || geoLoading}
        onClick={() => void fillFromCurrentLocation()}
      >
        <Icon name="pin" size={15} />
        <span>현재 위치로 설정</span>
      </button>
      <p className="cond__legend" style={{ marginTop: 18 }}>
        검색 결과
      </p>
      <div id="region-results" role="listbox">
        {renderResults()}
      </div>
    </Sheet>
  );
}
