"use client";

import { create } from "zustand";

/* 좋아요 영상 불러오기로 "방금 담긴" 장소 · 이벤트 — 보관함에서 NEW 로 보여 주고, 탭에 개수 배지를 단다.
   키는 "place:{place_id}" · "event:{event_id}". 사용자가 보관함에서 "확인했어요"를 누르면 지운다.
   이 브라우저에만 저장한다(BE 에 "새로 담김" 정보가 없다). 확인하지 않은 채 오래 두면 저절로 사라진다. */

const KEY = "keepgo.sync.new.v1";
const EXPIRE_MS = 3 * 24 * 60 * 60 * 1000;

interface Stored {
  keys: string[];
  at: number;
}

function load(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw) as Partial<Stored>;
    if (!Array.isArray(v.keys) || typeof v.at !== "number") return [];
    if (Date.now() - v.at > EXPIRE_MS) {
      window.localStorage.removeItem(KEY);
      return [];
    }
    return v.keys.filter((k): k is string => typeof k === "string");
  } catch {
    return [];
  }
}

function save(keys: string[]) {
  try {
    if (keys.length === 0) window.localStorage.removeItem(KEY);
    else
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ keys, at: Date.now() } satisfies Stored),
      );
  } catch {
    /* 저장소를 못 써도 이번 방문 동안은 화면 상태로 동작한다 */
  }
}

interface NewItemsStore {
  keys: string[];
  /** 저장된 값을 읽어 온다(서버 렌더와 맞추려고 마운트 뒤에 한 번 부른다) */
  hydrate: () => void;
  add: (keys: string[]) => void;
  clear: () => void;
}

export const useNewItemsStore = create<NewItemsStore>((set, get) => ({
  keys: [],
  hydrate: () => set({ keys: load() }),
  add: (keys) => {
    const next = Array.from(new Set([...get().keys, ...keys]));
    save(next);
    set({ keys: next });
  },
  clear: () => {
    save([]);
    set({ keys: [] });
  },
}));

/** 키 목록 → 장소 · 이벤트 개수 */
export function countNewItems(keys: string[]) {
  const places = keys.filter((k) => k.startsWith("place:")).length;
  return { places, events: keys.length - places };
}

/** "장소 5곳 · 이벤트 2개" — 0 인 쪽은 뺀다. 둘 다 0 이면 빈 문자열 */
export function describeAdded(places: number, events: number): string {
  return [places > 0 && `장소 ${places}곳`, events > 0 && `이벤트 ${events}개`]
    .filter(Boolean)
    .join(" · ");
}

/** "장소 5곳을", "이벤트 2개를", "장소 5곳 · 이벤트 2개를" — 마지막 글자에 맞는 조사를 붙인다 */
export function describeAddedObject(places: number, events: number): string {
  const text = describeAdded(places, events);
  if (!text) return "";
  return text + (text.endsWith("곳") ? "을" : "를");
}
