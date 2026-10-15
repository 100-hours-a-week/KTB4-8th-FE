"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon, YouTubeMark } from "@/components/ui/Icon";
import { hasSession, useMe } from "@/features/auth/session";
import { usePrefsStore } from "@/features/onboarding/prefsStore";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
} from "@/lib/constants";
import type { Category } from "@/types/api";

/* 03 · 온보딩 — 최초 가입(isNewUser = true)일 때만 진입한다.
   인트로 3슬라이드(스와이프 가능) → 관심사 선택(3개 이상) → 가입 완료.
   프로토타입 js/pages/onboarding.js 를 그대로 옮겼다. */

const MIN_PICK = 3;

interface Slide {
  title: ReactNode;
  desc: ReactNode;
  art: ReactNode;
}

const ROUTE_STOPS: [string, string][] = [
  ["카페 온화", "☕️ 카페 · 출발지에서 12분"],
  ["대림창고", "🖼️ 전시 · 도보 7분"],
  ["성수연방", "🛍️ 팝업 · 도보 5분"],
];

const SLIDES: Slide[] = [
  {
    title: (
      <>
        좋아요만 누르고
        <br />
        <em>잊어버린 쇼츠</em>
      </>
    ),
    desc: (
      <>
        맛집 · 카페 · 팝업 · 전시 영상,
        <br />
        다시 찾으려면 한참 스크롤해야 했죠.
      </>
    ),
    art: (
      <div style={{ position: "relative" }}>
        <div className="art-phone">
          <Icon name="play" size={36} />
        </div>
        <span className="art-heart">
          <Icon name="heart" size={22} />
        </span>
        <span
          className="art-chip"
          style={{
            left: -56,
            top: 24,
            animation: "kg-float 4.2s var(--e-io) .2s infinite",
          }}
        >
          ☕️ 성수 카페
        </span>
        <span
          className="art-chip"
          style={{
            right: -48,
            top: 18,
            animation: "kg-float 4.8s var(--e-io) .9s infinite",
          }}
        >
          🛍️ 팝업
        </span>
        <span
          className="art-chip"
          style={{
            left: -40,
            bottom: 16,
            animation: "kg-float 5.4s var(--e-io) .5s infinite",
          }}
        >
          🖼️ 전시
        </span>
      </div>
    ),
  },
  {
    title: (
      <>
        AI가 장소와 이벤트로
        <br />
        <em>자동 정리</em>해요
      </>
    ),
    desc: (
      <>
        영상 제목과 설명에서 장소명 · 지역 · 기간을 찾아
        <br />
        실제 존재하는 곳인지 확인한 뒤 담아 둡니다.
      </>
    ),
    art: (
      <div className="art-pipe">
        <span className="art-node">
          <Icon name="youtube" size={24} />
        </span>
        <span style={{ color: "var(--ink-4)" }}>
          <Icon name="arrowRight" size={18} />
        </span>
        <span className="art-node art-node--ai">
          <Icon name="sparkle" size={24} />
        </span>
        <span style={{ color: "var(--ink-4)" }}>
          <Icon name="arrowRight" size={18} />
        </span>
        <span className="art-node art-node--pin">
          <Icon name="pin" size={24} />
        </span>
      </div>
    ),
  },
  {
    // 슬라이드 3 · 코스 경로 아트 — 번호를 점선(::before)으로 잇는다. 프로토타입에도 SVG 는 쓰이지 않는다.
    title: (
      <>
        조건만 말하면
        <br />
        <em>외출 코스</em>가 완성돼요
      </>
    ),
    desc: (
      <>
        &ldquo;토요일 오후에 성수에서 카페랑 팝업&rdquo;
        <br />
        지역 · 날짜 · 시간만 알려주면 방문 순서까지 짜 드려요.
      </>
    ),
    art: (
      <div className="art-route">
        {ROUTE_STOPS.map(([name, meta], i) => (
          <div
            className={`art-stop${i === ROUTE_STOPS.length - 1 ? " art-stop--last" : ""}`}
            key={name}
          >
            <span className="art-stop__no">{i + 1}</span>
            <span className="art-stop__card">
              <span className="art-stop__name">{name}</span>
              <span className="art-stop__meta">{meta}</span>
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

/** 관심 카테고리 — 실제 Category enum 이 프로토타입의 라벨과 1:1 로 맞아 재매핑이 필요 없다 */
const PICKS = CATEGORY_ORDER.map((category) => ({
  category,
  label: CATEGORY_LABEL[category],
  emoji: CATEGORY_EMOJI[category],
}));

function Dots({ active, total }: { active: number; total: number }) {
  return (
    <div className="onb__dots">
      {Array.from({ length: total }).map((_, i) => (
        <span className="onb__dot" data-on={i === active} key={i} />
      ))}
    </div>
  );
}

function Confetti() {
  // 조각별 위치·타이밍은 매 마운트마다 한 번만 무작위로 정해지는 순수 장식용 값이다.
  /* eslint-disable react-hooks/purity -- 컨페티 조각을 최초 1회만 무작위로 배치하기 위한 의도된 randomness */
  const pieces = useMemo(() => {
    const colors = ["#FF5A36", "#FFB020", "#7B5CFF", "#42C9A3", "#FF7BAC"];
    return Array.from({ length: 16 }, (_, i) => ({
      color: colors[i % colors.length],
      left: 6 + Math.random() * 88,
      top: 8 + Math.random() * 20,
      delay: Math.random() * 1.2,
      dur: 2.4 + Math.random() * 1.6,
      rot: Math.round(Math.random() * 360),
    }));
  }, []);
  /* eslint-enable react-hooks/purity */
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            background: p.color,
            left: `${p.left.toFixed(1)}%`,
            top: `${p.top.toFixed(1)}%`,
            transform: `rotate(${p.rot}deg)`,
            animation: `kg-float ${p.dur.toFixed(2)}s var(--e-io) ${p.delay.toFixed(2)}s infinite`,
          }}
        />
      ))}
    </>
  );
}

/** 좌우 스와이프 · 마우스 드래그로 슬라이드를 넘긴다 — 프로토타입의 swipe() 를 그대로 옮겼다 */
function useSwipeRef(onNext: () => void, onPrev: () => void) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!el) return;
    let x0: number | null = null;
    let m0: number | null = null;

    const onTouchStart = (e: TouchEvent) => {
      x0 = e.touches[0].clientX;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (dx < -48) onNext();
      else if (dx > 48) onPrev();
    };
    const onMouseDown = (e: MouseEvent) => {
      m0 = e.clientX;
    };
    const onMouseUp = (e: MouseEvent) => {
      if (m0 == null) return;
      const dx = e.clientX - m0;
      m0 = null;
      if (dx < -60) onNext();
      else if (dx > 60) onPrev();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
    };
  }, [el, onNext, onPrev]);

  return setEl;
}

export default function OnboardingPage() {
  const router = useRouter();
  const setCategories = usePrefsStore((s) => s.setCategories);
  const me = useMe();

  // 0~2 = 인트로 슬라이드, 3 = 관심사 선택, 4 = 가입 완료
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Category[]>([]);

  useEffect(() => {
    if (!hasSession()) router.replace("/login");
  }, [router]);

  function go(delta: number) {
    setStep((s) => {
      const n = s + delta;
      return n < 0 || n > SLIDES.length ? s : n;
    });
  }

  const swipeRef = useSwipeRef(
    () => go(1),
    () => go(-1),
  );

  function togglePick(category: Category) {
    setSelected((s) =>
      s.includes(category) ? s.filter((c) => c !== category) : [...s, category],
    );
  }

  function finish(opts?: { startSync?: boolean }) {
    setCategories(selected);
    router.replace(opts?.startSync ? "/home?startSync=1" : "/home");
  }

  if (step < SLIDES.length) {
    const s = SLIDES[step];
    return (
      <section className="onb">
        <div className="onb__top">
          <Dots active={step} total={SLIDES.length + 1} />
          <button className="onb__skip" type="button" onClick={() => finish()}>
            건너뛰기
          </button>
        </div>
        <div className="onb__body" ref={swipeRef}>
          <div className="onb__art">{s.art}</div>
          <h1 className="onb__title">{s.title}</h1>
          <p className="onb__desc">{s.desc}</p>
        </div>
        <div className="onb__foot">
          <button
            className="btn btn--block"
            type="button"
            onClick={() => go(1)}
          >
            {step === SLIDES.length - 1 ? "관심사 고르기" : "다음"}
          </button>
        </div>
      </section>
    );
  }

  if (step === SLIDES.length) {
    const ready = selected.length >= MIN_PICK;
    return (
      <section className="onb">
        <div className="onb__top">
          <Dots active={SLIDES.length} total={SLIDES.length + 1} />
          <button className="onb__skip" type="button" onClick={() => finish()}>
            건너뛰기
          </button>
        </div>
        <div className="onb__body" style={{ textAlign: "left" }}>
          <h1 className="onb__title">
            어떤 곳을
            <br />
            찾고 계세요?
          </h1>
          <p className="onb__desc" style={{ marginTop: 10 }}>
            {MIN_PICK}개 이상 골라주시면
            <br />첫 코스 추천이 더 정확해져요.
          </p>
          <div className="pickgrid">
            {PICKS.map((p) => (
              <button
                key={p.category}
                className="pick"
                type="button"
                aria-pressed={selected.includes(p.category)}
                onClick={() => togglePick(p.category)}
              >
                <span className="pick__mark">
                  <Icon name="check" size={12} strokeWidth={2.6} />
                </span>
                <span className="pick__emoji">{p.emoji}</span>
                <span className="pick__label">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="onb__foot">
          <p className="onb__count">
            <b>{selected.length}</b> / {MIN_PICK}개 이상
          </p>
          <button
            className="btn btn--block"
            type="button"
            disabled={!ready}
            onClick={() => setStep((s) => s + 1)}
          >
            {ready ? "다음" : `${MIN_PICK - selected.length}개 더 골라주세요`}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="done">
      <Confetti />
      <div className="done__mark">
        <Icon name="check" size={46} strokeWidth={2.6} />
      </div>
      <h1 className="onb__title">
        가입 완료 🎉
        <br />
        KeepGo와 함께 떠나볼까요!
      </h1>
      <p className="onb__desc">
        {me.data?.nickname ?? ""}님의 YouTube 좋아요 목록을 불러오면
        <br />첫 코스를 추천해 드릴게요.
      </p>
      <div style={{ width: "100%", marginTop: 36, position: "relative" }}>
        <button
          className="btn btn--yt btn--block btn--lg"
          type="button"
          onClick={() => finish({ startSync: true })}
        >
          <YouTubeMark size={24} />
          <span>좋아요 영상 불러오기</span>
        </button>
        <button
          className="btn btn--ghost btn--block"
          type="button"
          style={{ marginTop: 10 }}
          onClick={() => finish()}
        >
          나중에 할래요
        </button>
      </div>
    </section>
  );
}
