import type { Config } from "tailwindcss";

/* 디자인 시스템은 프로토타입에서 검증한 CSS 토큰(src/styles/tokens.css)을 그대로 쓴다.
   Tailwind 는 레이아웃 보조 유틸리티용으로만 둔다. */
const config: Config = {
  /* dark: 변형은 OS 설정이 아니라 앱의 화면 모드(<html data-theme="dark">)를 따른다.
     기본값(media)이면 앱을 다크로 두어도 OS 가 라이트일 때 dark: 색이 안 붙어 글자가 배경에 묻힌다. */
  darkMode: ["selector", ':root[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)",
        ink: "var(--ink)",
        surface: "var(--surface)",
      },
      fontFamily: { sans: ["var(--font)"] },
    },
  },
  plugins: [],
};

export default config;
