"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";
import { useOverlayStore } from "./overlay-store";

/* 바텀시트 — 조건 편집, 코스 후보/상세, 코스 추천 팝업, 장소·이벤트 상세가 쓴다.
   공통 동작 (프로토타입과 동일)
     - 하단 글로벌 내비게이션은 가리지 않는다(탭바 높이만큼 띄운다).
     - 네 모서리가 둥글고 그림자가 있는 '떠 있는' 형태다.
     - 상단(손잡이 · 헤더)을 아래로 끌면 따라 내려가고, 충분히 내리면 닫힌다.
     - 닫기(×)를 눌러도 아래로 미끄러지며 사라진다. */

export interface SheetProps {
  title: string;
  sub?: string;
  /** 제목 가운데 정렬 */
  center?: boolean;
  /** 화면을 거의 덮는 팝업 (코스 추천) */
  full?: boolean;
  /** 화면 절반 높이 */
  compact?: boolean;
  /** 사진이 들어가는 상세 · 목록 시트 높이 */
  tall?: boolean;
  /** 닫기 버튼 왼쪽에 확장/축소 토글 */
  expandable?: boolean;
  /** 왼쪽 위 뒤로가기 */
  back?: boolean;
  onBack?: () => void;
  /** 헤더 오른쪽에 붙는 추가 버튼 */
  actions?: ReactNode;
  foot?: ReactNode;
  /** 배경을 눌러 닫을 수 있는지 */
  dismissible?: boolean;
  onClose: () => void;
  children: ReactNode;
}

interface SheetHandle {
  close: () => void;
}

const SheetContext = createContext<SheetHandle | null>(null);

/** 시트 안에서 자기 자신을 닫을 때 쓴다 */
export function useSheet(): SheetHandle {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("useSheet 은 Sheet 안에서만 쓸 수 있습니다.");
  return ctx;
}

const CLOSE_MS = 230;

function tabGap() {
  if (typeof document === "undefined") return 0;
  const tab = document.querySelector(".tabbar");
  return tab ? Math.round(tab.getBoundingClientRect().height) : 0;
}

export function Sheet({
  title,
  sub,
  center,
  full,
  compact,
  tall,
  expandable,
  back,
  onBack,
  actions,
  foot,
  dismissible = true,
  onClose,
  children,
}: SheetProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [gap, setGap] = useState(0);
  const panelRef = useRef<HTMLElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const closingRef = useRef(false);
  const pushSheet = useOverlayStore((s) => s.pushSheet);
  const popSheet = useOverlayStore((s) => s.popSheet);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 포털 대상/탭바 간격은 서버 렌더에 없는 DOM 값이라 마운트 후에만 계산 가능
    setHost(document.getElementById("overlays"));

    setGap(tabGap());
    pushSheet();
    document.body.classList.add("kg-lock");
    return () => {
      popSheet();
      if (useOverlayStore.getState().sheets === 0)
        document.body.classList.remove("kg-lock");
    };
  }, [pushSheet, popSheet]);

  /** 아래로 미끄러지듯 사라진 뒤 onClose 를 부른다 */
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    if (panel) {
      panel.style.animation = "none";
      panel.style.transition = "transform .24s var(--e-io)";
      requestAnimationFrame(() => {
        panel.style.transform = "translateY(110%)";
      });
    }
    if (scrim) {
      scrim.style.animation = "none";
      scrim.style.transition = "opacity .24s linear";
      scrim.style.opacity = "0";
    }
    window.setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  /* 상단을 끌어 내리면 따라 내려가고, 충분히 내리면 닫힌다 */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    let startY = 0;
    let dy = 0;
    let t0 = 0;
    let dragging = false;

    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("button")) return; // 헤더 버튼은 제외
      dragging = true;
      startY = e.clientY;
      dy = 0;
      t0 = Date.now();
      panel.style.animation = "none";
      panel.style.transition = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      panel.style.transform = `translateY(${dy}px)`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      const speed = dy / Math.max(1, Date.now() - t0);
      if (dy > 90 || speed > 0.55) {
        close();
        return;
      }
      panel.style.transition = "transform .22s var(--e-out)";
      panel.style.transform = "";
    };

    const grips = [
      panel.querySelector(".sheet__grip"),
      panel.querySelector(".sheet__head"),
    ];
    grips.forEach((el) =>
      el?.addEventListener("pointerdown", onDown as EventListener),
    );
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      grips.forEach((el) =>
        el?.removeEventListener("pointerdown", onDown as EventListener),
      );
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [close]);

  if (!host) return null;

  const panelClass = [
    "sheet",
    full ? "sheet--full" : "",
    compact ? "sheet--compact" : "",
    tall ? "sheet--tall" : "",
    expanded ? "sheet--expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <SheetContext.Provider value={{ close }}>
      <div
        className={`sheet-scrim${full ? " sheet-scrim--full" : ""}`}
        style={{ bottom: gap }}
        ref={scrimRef}
        onClick={(e) => {
          if (dismissible && e.target === e.currentTarget) close();
        }}
      >
        <section
          className={panelClass}
          role="dialog"
          aria-modal="true"
          ref={panelRef}
        >
          <div className="sheet__grip" />
          <div className={`sheet__head${center ? " sheet__head--center" : ""}`}>
            <div className="sheet__lead">
              {back && (
                <button
                  className="iconbtn"
                  type="button"
                  aria-label="뒤로"
                  onClick={() => (onBack ? onBack() : close())}
                >
                  <Icon name="back" size={20} />
                </button>
              )}
            </div>
            <div className="sheet__titles">
              <p className="sheet__title">{title}</p>
              {sub && <p className="sheet__sub">{sub}</p>}
            </div>
            <div className="sheet__actions">
              {actions}
              {expandable && (
                <button
                  className="iconbtn"
                  type="button"
                  aria-label={expanded ? "작게 보기" : "크게 보기"}
                  aria-pressed={expanded}
                  onClick={() => setExpanded((v) => !v)}
                >
                  <Icon name={expanded ? "collapse" : "expand"} size={18} />
                </button>
              )}
              <button
                className="iconbtn"
                type="button"
                aria-label="닫기"
                onClick={close}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          </div>
          <div className="sheet__body">{children}</div>
          {foot && <div className="sheet__foot">{foot}</div>}
        </section>
      </div>
    </SheetContext.Provider>,
    host,
  );
}
