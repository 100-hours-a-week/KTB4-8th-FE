"use client";

import { useEffect } from "react";
import { create } from "zustand";

/* 화면 모드(라이트 · 다크) — 마이페이지의 해 · 달 토글로 고른다.
   고른 값(pref)은 이 브라우저의 localStorage 에만 저장한다(계정에 저장하지 않는다).
   저장한 값이 없으면 라이트다(기기 설정을 따라가지 않는다).
   화면에는 <html data-theme="light|dark"> 로 반영하고, 색은 tokens.css 의 [data-theme="dark"] 가 바꾼다.
   처음 그리기 전에 깜빡이지 않도록 layout.tsx 의 인라인 스크립트(THEME_INIT_SCRIPT)가 같은 규칙으로 먼저 적용한다. */

export type ThemePref = "light" | "dark";

export const THEME_KEY = "keepgo.theme.v1";

/** layout.tsx 의 <head> 에 그대로 넣는 스크립트 — 아래 readPref 와 같은 규칙이어야 한다 */
export const THEME_INIT_SCRIPT = `(function(){try{document.documentElement.setAttribute("data-theme",localStorage.getItem("${THEME_KEY}")==="dark"?"dark":"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}})()`;

function readPref(): ThemePref {
  try {
    // 예전에 저장된 "system" 같은 값은 라이트로 본다
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light"; // 저장소를 못 쓰는 환경(사생활 보호 모드 등)
  }
}

function apply(pref: ThemePref) {
  document.documentElement.setAttribute("data-theme", pref);
}

interface ThemeState {
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  pref: "light",
  setPref: (pref) => {
    try {
      window.localStorage.setItem(THEME_KEY, pref);
    } catch {
      /* 저장하지 못해도 이번 접속에서는 바뀐다 */
    }
    apply(pref);
    set({ pref });
  },
}));

/** 앱을 열 때 한 번 — 저장된 값을 스토어에 올리고 화면에 맞춘다 */
export function useThemeSync() {
  useEffect(() => {
    const pref = readPref();
    useThemeStore.setState({ pref });
    apply(pref);
  }, []);
}
