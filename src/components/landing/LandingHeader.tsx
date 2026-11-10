"use client";

import React, { useEffect, useState } from "react";
import { KeepGoLogo } from "../brand/KeepGoLogo";
import { Icon } from "@/components/ui/Icon";
import { useThemeStore } from "@/features/theme/theme";

interface LandingHeaderProps {
  onStartLogin: () => void;
  isLoggedIn?: boolean;
}

export function LandingHeader({
  onStartLogin,
  isLoggedIn = false,
}: LandingHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const setThemePref = useThemeStore((s) => s.setPref);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setIsScrolled(scrollTop > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* 화면 모드 전환 — 지금 모드는 <html data-theme> 에서 읽는다(스토어 값은 첫 그리기 뒤에 올라오기 때문).
     마이페이지 토글과 같은 저장소 · 같은 규칙이라 앱과 랜딩이 같은 모드를 쓴다. */
  function toggleTheme() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    setThemePref(dark ? "light" : "dark");
  }

  function scrollToSection(id: string) {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-[#141a16]/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 py-3"
          : "bg-transparent py-5"
      }`}
    >
      {/* ── 스크롤 진행률 인디케이터 (상단 얇은 바) ── */}
      <div
        className="absolute top-0 left-0 h-[2.5px] bg-gradient-to-r from-[#16a46b] via-[#32d892] to-[#f2a33c] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* 로고 */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="cursor-pointer"
        >
          <KeepGoLogo size={34} variant="full" />
        </div>

        {/* 데스크톱 네비게이션 메뉴 */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-300">
          <button
            type="button"
            onClick={() => scrollToSection("problem")}
            className="hover:text-[#16a46b] transition-colors"
          >
            서비스 소개
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("process")}
            className="hover:text-[#16a46b] transition-colors"
          >
            작동 원리
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="hover:text-[#16a46b] transition-colors"
          >
            주요 기능
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("compliance")}
            className="hover:text-[#16a46b] transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a46b]" />
            데이터 & 보안 정책
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("faq")}
            className="hover:text-[#16a46b] transition-colors"
          >
            FAQ
          </button>
        </nav>

        {/* 우측 CTA */}
        <div className="flex items-center gap-3">
          {/* 라이트 ↔ 다크 — 아이콘은 CSS 로만 바꿔서(dark: 변형) 첫 그리기에서 어긋나지 않는다 */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/80 bg-white/70 text-gray-600 transition-colors hover:text-[#16a46b] dark:border-gray-700/80 dark:bg-white/5 dark:text-gray-300 dark:hover:text-[#32d892]"
            aria-label="화면 모드 바꾸기 (라이트 · 다크)"
            title="화면 모드 바꾸기"
          >
            <span className="dark:hidden">
              <Icon name="moon" size={17} />
            </span>
            <span className="hidden dark:inline-flex">
              <Icon name="sun" size={17} />
            </span>
          </button>
          {isLoggedIn ? (
            <a
              href="/home"
              className="px-4 py-2 rounded-full bg-[#16a46b] text-white text-xs sm:text-sm font-semibold hover:bg-[#0e8a58] transition-all shadow-sm shadow-[#16a46b]/20"
            >
              내 코스 보러가기 →
            </a>
          ) : (
            <button
              type="button"
              onClick={onStartLogin}
              className="group flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#16a46b] text-white text-xs sm:text-sm font-semibold hover:bg-[#0e8a58] transition-all shadow-md shadow-[#16a46b]/25 hover:shadow-lg hover:shadow-[#16a46b]/35 active:scale-95"
            >
              <svg
                className="w-4 h-4 fill-current shrink-0"
                viewBox="0 0 24 24"
              >
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              <span>시작하기</span>
            </button>
          )}

          {/* 모바일 햄버거 토글 */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/98 dark:bg-[#151a17]/98 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-col gap-3.5 text-sm font-medium animate-fade-in">
          <button
            type="button"
            onClick={() => scrollToSection("problem")}
            className="text-left py-1 text-gray-700 dark:text-gray-200"
          >
            서비스 소개
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("process")}
            className="text-left py-1 text-gray-700 dark:text-gray-200"
          >
            작동 원리
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="text-left py-1 text-gray-700 dark:text-gray-200"
          >
            주요 기능
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("compliance")}
            className="text-left py-1 text-[#16a46b] font-semibold"
          >
            데이터 & 보안 정책 (Google OAuth)
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("faq")}
            className="text-left py-1 text-gray-700 dark:text-gray-200"
          >
            FAQ
          </button>
        </div>
      )}
    </header>
  );
}
