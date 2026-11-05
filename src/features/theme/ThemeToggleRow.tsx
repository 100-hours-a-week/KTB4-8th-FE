"use client";

import { Icon } from "@/components/ui/Icon";
import { useThemeStore } from "./theme";

/* 마이페이지 "화면" — 라이트 ↔ 다크를 바꾸는 해 · 달 토글 한 줄.
   트랙 양쪽에 해(왼쪽) · 달(오른쪽)이 있고, 동그라미가 지금 모드 쪽으로 가서 그 아이콘을 덮는다. */
export function ThemeToggleRow() {
  const pref = useThemeStore((s) => s.pref);
  const setPref = useThemeStore((s) => s.setPref);
  const dark = pref === "dark";

  return (
    <button
      className="me__row me__row--theme"
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="다크 모드"
      onClick={() => setPref(dark ? "light" : "dark")}
    >
      <span className="me__row-key">화면 모드</span>
      <span className="me__row-sub">{dark ? "다크" : "라이트"}</span>
      <span className="themetoggle" aria-hidden>
        <span className="themetoggle__icon">
          <Icon name="sun" size={16} />
        </span>
        <span className="themetoggle__icon">
          <Icon name="moon" size={16} />
        </span>
        <span className="themetoggle__knob">
          <Icon name={dark ? "moon" : "sun"} size={16} />
        </span>
      </span>
    </button>
  );
}
