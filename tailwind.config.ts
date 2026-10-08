import type { Config } from "tailwindcss";

/* 디자인 시스템은 프로토타입에서 검증한 CSS 토큰(src/styles/tokens.css)을 그대로 쓴다.
   Tailwind 는 레이아웃 보조 유틸리티용으로만 둔다. */
const config: Config = {
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
