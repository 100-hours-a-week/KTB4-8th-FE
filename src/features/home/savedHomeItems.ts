"use client";

import { useCallback, useSyncExternalStore } from "react";

/* 홈 이벤트 · 장소 더미(FE)를 "보관함에 담기" 한 기록 — 이 브라우저(localStorage)에만 저장한다.
   BE 에 이벤트를 보관함에 담는 API 가 생기면 이 파일을 그 API 호출로 바꾼다.
   id → 담은 시각(ISO). 같은 탭의 다른 화면(홈 · 보관함)에도 바로 반영되도록 구독자에게 알린다. */

const KEY = "keepgo.home-events.saved.v1";

const listeners = new Set<() => void>();
let memory: string | null = null;

function read(): string {
  if (memory !== null) return memory;
  try {
    memory = window.localStorage.getItem(KEY) ?? "{}";
  } catch {
    memory = "{}";
  }
  return memory;
}

function write(saved: Record<string, string>) {
  memory = JSON.stringify(saved);
  try {
    window.localStorage.setItem(KEY, memory);
  } catch {
    /* 저장소를 못 써도 이번 방문 동안은 메모리 값으로 동작한다 */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 다른 탭에서 바뀐 것도 따라간다
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    memory = e.newValue ?? "{}";
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function parse(raw: string): Record<string, string> {
  try {
    const value: unknown = JSON.parse(raw);
    return value && typeof value === "object"
      ? (value as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

/** 담은 홈 이벤트 — { id: 담은 시각(ISO) }. 담기 · 빼기 함수도 함께 준다 */
export function useSavedHomeItems() {
  const raw = useSyncExternalStore(subscribe, read, () => "{}");
  const saved = parse(raw);
  const toggle = useCallback((id: string): boolean => {
    const current = parse(read());
    if (id in current) {
      delete current[id];
      write(current);
      return false;
    }
    write({ ...current, [id]: new Date().toISOString() });
    return true;
  }, []);
  const remove = useCallback((id: string) => {
    const current = parse(read());
    if (!(id in current)) return;
    delete current[id];
    write(current);
  }, []);
  return { saved, toggle, remove };
}
