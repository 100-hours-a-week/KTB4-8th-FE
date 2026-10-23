"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { create } from "zustand";
import { Icon, type IconName } from "./Icon";
import { useOverlayStore } from "./overlay-store";
import { useCourseStore } from "@/features/recommendations/courseStore";
import { describe, isApiError } from "@/lib/api/client";
import type { Tone } from "@/lib/api/problems";

/* 토스트 — 오류 코드 기반 안내의 기본 표시 수단.
   시트·모달 위에서도 항상 보이도록 가장 높은 층에 그리고,
   기본은 하단 탭바 바로 위, 코스 추천 창이 열려 있을 때는 화면 맨 위,
   그 밖의 하단 시트가 올라와 있으면 시트 바로 위에 띄운다(시트의 버튼 줄을 가리지 않게). */

/** 시트 위쪽 끝과 토스트 사이 간격(px) */
const SHEET_GAP = 10;
/** 시트 위에 토스트가 들어갈 만큼 남아 있어야 하는 높이(px) — 시트가 화면 거의 끝까지 올라오면 기본 위치를 쓴다 */
const SHEET_MIN_ROOM = 120;

export interface ToastItem {
  id: number;
  tone: Tone;
  title?: string;
  text: string;
  code?: string;
  traceId?: string;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastState {
  items: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => number;
  remove: (id: number) => void;
}

let seq = 1;

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (t) => {
    const id = seq++;
    set((s) => ({ items: [...s.items, { ...t, id }].slice(-3) }));
    return id;
  },
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));

const ICON: Record<Tone, IconName> = {
  info: "info",
  ok: "check",
  warn: "alert",
  error: "alert",
};

function show(t: Partial<ToastItem> & { text: string }) {
  return useToastStore.getState().push({
    tone: t.tone || "info",
    title: t.title,
    text: t.text,
    code: t.code,
    traceId: t.traceId,
    duration: t.duration ?? 2600,
    actionLabel: t.actionLabel,
    onAction: t.onAction,
  });
}

/** 세션이 만료됐을 때 앱이 어떻게 반응할지는 한 곳에서 정한다 */
let onRelogin: ((text: string) => void) | null = null;
export function setReloginHandler(fn: ((text: string) => void) | null) {
  onRelogin = fn;
}

export const toast = {
  show,
  info: (text: string, title?: string) => show({ tone: "info", text, title }),
  ok: (text: string, title?: string) => show({ tone: "ok", text, title }),
  warn: (text: string, title?: string) => show({ tone: "warn", text, title }),
  error: (text: string, title?: string) => show({ tone: "error", text, title }),

  /** ApiError 를 code 기준으로 해석해 표시한다 */
  fromError(
    err: unknown,
    opts: {
      force?: boolean;
      noRelogin?: boolean;
      duration?: number;
      onRetry?: () => void;
    } = {},
  ) {
    const d = describe(err);
    if (d.silent && !opts.force) return;

    if (d.effect === "RELOGIN" && !opts.noRelogin) {
      onRelogin?.(d.text);
      return;
    }

    show({
      tone: d.tone,
      title: d.title,
      text: d.text,
      code: isApiError(err) ? `${d.status} · ${d.code}` : undefined,
      traceId: d.traceId,
      duration: opts.duration || 3400,
      actionLabel: opts.onRetry ? "다시 시도" : undefined,
      onAction: opts.onRetry,
    });
  },
};

function ToastRow({ item }: { item: ToastItem }) {
  const remove = useToastStore((s) => s.remove);
  useEffect(() => {
    const t = window.setTimeout(() => remove(item.id), item.duration);
    return () => window.clearTimeout(t);
  }, [item.id, item.duration, remove]);

  return (
    <div className={`toast toast--${item.tone}`}>
      <span className="toast__icon">
        <Icon name={ICON[item.tone]} size={18} />
      </span>
      <div className="toast__body">
        {item.title && <p className="toast__title">{item.title}</p>}
        {item.text && <p className="toast__msg">{item.text}</p>}
        {item.code && (
          <p className="toast__code">
            {item.code}
            {item.traceId ? ` · ${item.traceId}` : ""}
          </p>
        )}
      </div>
      {item.actionLabel && (
        <button
          className="toast__action"
          type="button"
          onClick={() => {
            remove(item.id);
            item.onAction?.();
          }}
        >
          {item.actionLabel}
        </button>
      )}
    </div>
  );
}

export function ToastHost() {
  const items = useToastStore((s) => s.items);
  // 코스 추천 창(그 위에 쌓인 시트 포함)이 열려 있을 때만 토스트를 화면 위쪽에 띄운다 — 그 밖의 시트에서는 기본 위치다
  const courseOpen = useCourseStore((s) => s.open);
  const sheets = useOverlayStore((s) => s.sheets);
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  // 로그인 화면은 하단 탭바가 없어서, 토스트의 기본 하단 위치(탭바 높이 기준)가
  // 구글 로그인 버튼과 겹친다 — 그 화면에서는 버튼과 위쪽 흐름 아이콘 사이 빈 공간에 띄운다.
  const atTop = courseOpen;
  const hasItems = items.length > 0;

  // 하단 시트(코스 추천 창 제외)가 올라와 있으면, 가장 위에 쌓인 시트의 위쪽 끝에서 SHEET_GAP 만큼 띄운 자리에 둔다
  const onSheet = hasItems && !courseOpen && !isLogin && sheets > 0;
  const [sheetBottom, setSheetBottom] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!onSheet) return;
    const measure = () => {
      const all = document.querySelectorAll<HTMLElement>(".sheet");
      const top = all[all.length - 1]?.getBoundingClientRect().top;
      setSheetBottom(
        top != null && top >= SHEET_MIN_ROOM
          ? Math.round(window.innerHeight - top + SHEET_GAP)
          : null,
      );
    };
    measure();
    // 시트가 올라오는 애니메이션(0.24초)이 끝난 뒤의 자리로 한 번 더 맞춘다
    const timer = window.setTimeout(measure, 300);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [onSheet, items.length]);

  if (!hasItems) return null;
  return (
    <div
      className={`toasts${isLogin ? " toasts--login" : atTop ? " toasts--top" : ""}`}
      style={
        onSheet && sheetBottom != null ? { bottom: sheetBottom } : undefined
      }
      role="status"
      aria-live="polite"
    >
      {items.map((it) => (
        <ToastRow key={it.id} item={it} />
      ))}
    </div>
  );
}
