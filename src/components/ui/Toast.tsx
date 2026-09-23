"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { Icon, type IconName } from "./Icon";
import { useOverlayStore } from "./overlay-store";
import { describe, isApiError } from "@/lib/api/client";
import type { Tone } from "@/lib/api/problems";

/* 토스트 — 오류 코드 기반 안내의 기본 표시 수단.
   시트·모달 위에서도 항상 보이도록 가장 높은 층에 그리고,
   시트가 열려 있을 때는 시트에 가리지 않도록 화면 위쪽으로 붙인다. */

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
  const sheets = useOverlayStore((s) => s.sheets);
  if (!items.length) return null;
  return (
    <div
      className={`toasts${sheets > 0 ? " toasts--top" : ""}`}
      role="status"
      aria-live="polite"
    >
      {items.map((it) => (
        <ToastRow key={it.id} item={it} />
      ))}
    </div>
  );
}
