"use client";

import { useCallback, useSyncExternalStore } from "react";
import { toast } from "@/components/ui/Toast";

/* 홈 이벤트 · 장소 더미(FE)를 "보관함에 담기" 한 기록 — 이 브라우저(localStorage)에만 저장한다.
   BE 에 이벤트를 보관함에 담는 API 가 생기면 이 파일을 그 API 호출로 바꾼다.
   id → 담은 시각(ISO). 같은 탭의 다른 화면(홈 · 보관함)에도 바로 반영되도록 구독자에게 알린다. */

const KEY = "keepgo.home-events.saved.v1";
/** "이 브라우저에만 저장돼요" 안내를 이미 보여 줬는지 — 처음 담을 때 한 번만 알린다 */
const NOTICE_KEY = "keepgo.home-events.local-notice.v1";

/* 홈에서 담은 항목은 아직 서버(BE 위시리스트)에 올라가지 않는다 — BE 에 장소 · 이벤트 담기 API 가 없다.
   그래서 다른 기기에서 안 보이고, 코스 추천(BE 위시리스트로만 후보를 고른다)에도 쓰이지 않는다.
   사용자가 서버에 저장된 줄 알고 있다가 놀라지 않게, 처음 담을 때 한 번 알린다. BE API 가 생기면 이 안내는 지운다. */
function noticeLocalOnlyOnce() {
  try {
    if (window.localStorage.getItem(NOTICE_KEY)) return;
    window.localStorage.setItem(NOTICE_KEY, "1");
  } catch {
    return; // 저장소를 못 쓰면 알릴 때마다 반복될 수 있어 아예 건너뛴다
  }
  toast.show({
    tone: "info",
    title: "이 브라우저에만 저장돼요",
    text: "홈에서 담은 장소는 아직 서버에 저장되지 않아요. 다른 기기에서는 보이지 않고, 코스 추천에도 쓰이지 않아요.",
    duration: 5200,
  });
}

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
    noticeLocalOnlyOnce();
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
