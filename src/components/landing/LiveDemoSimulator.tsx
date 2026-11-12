"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CATEGORY_EMOJI } from "@/lib/constants";
import { courseTime } from "@/lib/format";
import type { Candidate } from "@/types/api";
import { SyncCardView, type SyncCardPhase } from "./SyncCardPreview";

/* 히어로의 데모 — 하나의 "창" 안에서 "쇼츠 수집 → AI 분석 → 코스 완성"이 이어진다.
   · 1단계: 실제 앱 홈의 "좋아요 영상 불러오기" 카드(어두운 카드) 그대로.
   · 2단계: AI가 영상에서 장소를 추출하고 이름 · 주소 · 위치를 검증하는 과정(일치율은 예시 수치).
   · 3단계: 코스 추천이 끝났을 때 실제 서비스에 나오는 "코스 후보" 화면과 같은 클래스 · 같은 형식.
   · 위의 세 탭은 창 너비를 3등분하고, 활성 탭 아래 막대가 부드럽게 옮겨 간다.
   · 각 단계의 애니메이션이 끝나면 다음 단계로 크로스페이드로 넘어가고, 마지막 뒤에는 처음으로 돌아간다.
   · 창 높이가 고정이라 단계가 바뀌어도 옆의 글이 움직이지 않는다. 탭을 누르면 그 단계부터 다시 보여 준다. */

export type DemoStage = "sync" | "analyze" | "route";

const ORDER: DemoStage[] = ["sync", "analyze", "route"];
const TAB_LABEL: Record<DemoStage, string> = {
  sync: "01 쇼츠 수집",
  analyze: "02 AI 분석",
  route: "03 코스 완성",
};
/** 각 단계가 무엇을 하는지 한 줄 설명(화면 아래) */
const STAGE_NOTE: Record<DemoStage, string> = {
  sync: "1단계 · 유튜브에서 좋아요한 영상을 불러와요",
  analyze: "2단계 · AI가 영상 속 장소를 추출하고 이름 · 주소 · 위치를 검증해요",
  route: "3단계 · 조건에 맞는 코스를 추천해 드려요",
};

/** 화면 영역 높이 — 세 단계 중 가장 큰 화면(3단계 코스 후보 + 안내 문구, 창이 넓을 때 약 428px)이 위아래로 24px쯤 여유를 두고 들어가는 크기로 고정한다.
    창이 좁은 폰(폭 430px 미만)은 글이 더 줄바꿈돼 화면이 커지므로 예전 높이(530px)를 그대로 쓴다 */
const BODY_HEIGHT_CLASS = "h-[530px] min-[430px]:h-[480px]";
/** 1단계(앱 홈 카드)의 실제 너비 */
const CARD_WIDTH = 350;
/** 2 · 3단계 화면의 최대 너비 */
const WIDE_WIDTH = 392;

const SYNC_START_MS = 2000;
const SYNC_LOADING_MS = 2600;
const ANALYZE_MS = 5200;
const ANALYZE_HOLD_MS = 700;
const COURSE_HOLD_MS = 4200;

/** 단계 컴포넌트가 끝났다고 알릴 함수를 최신 값으로 들고 있는다(타이머를 다시 걸지 않으려고) */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

/* 1단계 — 쇼츠 수집: 시작하기 → 불러오는 중 */
function SyncStage({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<SyncCardPhase>("start");
  // 불러오는 중에도 진행바가 차오른다(실제 앱의 불러오기 카드와 같다)
  const [percent, setPercent] = useState(0);
  const done = useLatest(onDone);

  useEffect(() => {
    if (phase !== "loading") return;
    const startedAt = performance.now();
    const id = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startedAt) / SYNC_LOADING_MS);
      setPercent(Math.round((1 - Math.pow(1 - t, 2)) * 100));
      if (t >= 1) window.clearInterval(id);
    }, 80);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const toLoading = window.setTimeout(
      () => setPhase("loading"),
      SYNC_START_MS,
    );
    const finish = window.setTimeout(
      () => done.current(),
      SYNC_START_MS + SYNC_LOADING_MS,
    );
    return () => {
      window.clearTimeout(toLoading);
      window.clearTimeout(finish);
    };
  }, [done]);

  // 다른 랜딩 카드와 같은 번짐 테두리
  return (
    <div className="gborder">
      <SyncCardView
        phase={phase}
        percent={percent}
        onStart={() => {
          setPercent(0);
          setPhase("loading");
        }}
      />
    </div>
  );
}

/** 영상에서 추출한 장소 후보 — extractAt: 이 진행률(%)에 추출돼 "검증 중"이 되고, verifyAt 에 검증을 마친다 */
const CANDIDATES = [
  {
    name: "성수율 카페",
    meta: "카페",
    rate: "99.4%",
    extractAt: 12,
    verifyAt: 38,
  },
  {
    name: "어니언 성수",
    meta: "카페",
    rate: "98.7%",
    extractAt: 40,
    verifyAt: 66,
  },
  {
    name: "성수연방",
    meta: "팝업 · 전시",
    rate: "97.9%",
    extractAt: 68,
    verifyAt: 92,
  },
];
const TOTAL_VIDEOS = 120;

/* 2단계 — AI 분석: 영상에서 장소를 추출하고, 이름 · 주소 · 위치를 검증한다(일치율은 예시) */
function AnalyzeStage({ onDone }: { onDone: () => void }) {
  const [percent, setPercent] = useState(0);
  const done = useLatest(onDone);

  useEffect(() => {
    const startedAt = performance.now();
    let finish: number | undefined;
    const id = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - startedAt) / ANALYZE_MS);
      setPercent(Math.round(t * 100));
      if (t >= 1) {
        window.clearInterval(id);
        finish = window.setTimeout(() => done.current(), ANALYZE_HOLD_MS);
      }
    }, 80);
    return () => {
      window.clearInterval(id);
      if (finish) window.clearTimeout(finish);
    };
  }, [done]);

  const analyzed = Math.round((percent / 100) * TOTAL_VIDEOS);

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-gray-700/70 dark:bg-[#18221b]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#16a46b]" />
          AI 장소 분석
        </span>
        <span className="font-mono text-xs font-bold text-[#16a46b]">
          {percent}% 분석 중
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-base font-extrabold leading-snug text-gray-900 dark:text-white">
          영상 속 장소를 추출하고
          <br />
          검증하는 중...
        </p>
        <span className="flex-none font-mono text-xs text-gray-500">
          {analyzed} / {TOTAL_VIDEOS} 영상
        </span>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 p-0.5 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#16a46b] to-[#38e29a]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {CANDIDATES.map((c) => {
          const extracted = percent >= c.extractAt;
          const verified = percent >= c.verifyAt;
          return (
            <div
              key={c.name}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5 transition-all duration-500 ease-out dark:border-gray-700/60 dark:bg-gray-800/50"
              style={{
                opacity: extracted ? 1 : 0.18,
                transform: extracted ? "translateY(0)" : "translateY(6px)",
              }}
            >
              <span
                className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg transition-colors duration-500 ${
                  verified
                    ? "bg-emerald-100 text-[#16a46b] dark:bg-emerald-950"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-950/60"
                }`}
              >
                <Icon name={verified ? "check" : "pin"} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-tight text-gray-900 dark:text-white">
                  {c.name}
                </span>
                <span className="block truncate text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                  {verified ? (
                    <>
                      {/* 폭이 좁은 폰에서는 줄여서 한 줄에 들어가게 한다: 480px 미만은 업종을, 420px 미만은 "이름 · 주소 · 위치"까지 뺀다 */}
                      <span className="max-[419px]:hidden">
                        이름 · 주소 · 위치{" "}
                      </span>
                      확인 완료
                      <span className="max-[479px]:hidden"> · {c.meta}</span>
                    </>
                  ) : (
                    "영상에서 추출 · 후보 검증 중…"
                  )}
                </span>
              </span>
              <span
                className={`flex-none rounded-md px-2 py-1 text-[11px] font-bold transition-colors duration-500 ${
                  verified
                    ? "bg-emerald-50 text-[#16a46b] dark:bg-emerald-950/60"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-950/50"
                }`}
              >
                {verified ? `일치율 ${c.rate}` : "검증 중"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 실제 앱의 코스 후보 목록과 같은 모양으로 그리려고, 후보를 앱의 Candidate 형식으로 만든다 */
function demoCandidate(
  id: string,
  name: string,
  durationMinutes: number,
  stops: {
    name: string;
    category: Candidate["components"][number]["category"];
  }[],
): Candidate {
  return {
    candidateId: id,
    rank: 1,
    name,
    area: "성수",
    startAt: "",
    endAt: "",
    estimatedDurationMinutes: durationMinutes,
    components: stops.map((s, i) => ({
      sequence: i + 1,
      guideId: `${id}-${i}`,
      type: "PLACE" as const,
      name: s.name,
      category: s.category,
    })),
  };
}

const DEMO_CANDIDATES: Candidate[] = [
  demoCandidate("c1", "성수 감성 카페 · 팝업 코스", 240, [
    { name: "성수율 카페", category: "CAFE" },
    { name: "어니언 성수", category: "DESSERT" },
    { name: "성수연방", category: "POPUP" },
  ]),
  demoCandidate("c2", "맛집 탐방 후 서울숲 산책", 300, [
    { name: "소문난 성수 감자탕", category: "RESTAURANT" },
    { name: "도토리오븐", category: "DESSERT" },
    { name: "서울숲", category: "WALK" },
  ]),
];

/* 3단계 — 코스 완성: 코스 추천이 끝났을 때 앱에 나오는 "코스 후보" 화면(CandidatesSheet)과 같은 모양 */
function CourseStage({ onDone }: { onDone: () => void }) {
  const done = useLatest(onDone);

  useEffect(() => {
    const finish = window.setTimeout(() => done.current(), COURSE_HOLD_MS);
    return () => window.clearTimeout(finish);
  }, [done]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/70 dark:bg-[#18221b]">
      <div className="border-b border-gray-100 px-4 py-3 text-center dark:border-gray-700/60">
        <p className="sheet__title">코스 후보 {DEMO_CANDIDATES.length}개</p>
        <p className="sheet__sub">성수 · 11월 8일(토) 오후</p>
      </div>
      <div className="stagger px-3 py-3" style={{ pointerEvents: "none" }}>
        {DEMO_CANDIDATES.map((c, index) => {
          const time = courseTime(c);
          return (
            <div
              key={c.candidateId}
              className="cand"
              style={{ cursor: "default" }}
            >
              <span className="cand__rank">
                <b>{index + 1}</b>
                <i>순위</i>
              </span>
              <span className="cand__body">
                <span className="cand__name">{c.name}</span>
                <span className="cand__meta">
                  장소 {c.components.length}곳 · 총 {time.text} {time.kind}
                </span>
                <span className="cand__tags">
                  {c.components.map((comp) => (
                    <span key={comp.sequence} className="chip chip--tag">
                      {CATEGORY_EMOJI[comp.category]} {comp.name}
                    </span>
                  ))}
                </span>
              </span>
              <Icon name="chevron" size={16} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LiveDemoSimulator() {
  const [active, setActive] = useState<DemoStage>("sync");
  // 단계가 다시 시작될 때마다 올려서, 그 단계의 애니메이션을 처음부터 다시 돌린다
  const [runs, setRuns] = useState<Record<DemoStage, number>>({
    sync: 0,
    analyze: 0,
    route: 0,
  });
  // 지금 보이는 단계 — 이미 지나간 단계의 늦은 타이머가 단계를 건너뛰게 만들지 못하도록 막는 데 쓴다
  const activeRef = useRef<DemoStage>("sync");

  const goTo = useCallback((stage: DemoStage) => {
    activeRef.current = stage;
    setRuns((r) => ({ ...r, [stage]: r[stage] + 1 }));
    setActive(stage);
  }, []);

  /** from 단계가 끝났다고 알려 오면, 그 단계가 아직 보이는 중일 때만 다음 단계로 넘어간다 */
  const next = useCallback(
    (from: DemoStage) => {
      if (activeRef.current !== from) return;
      goTo(ORDER[(ORDER.indexOf(from) + 1) % ORDER.length]);
    },
    [goTo],
  );

  // 한 번도 보이지 않은 단계는 그리지 않는다(숨은 채로 애니메이션을 돌리지 않으려고)
  const started = (stage: DemoStage) => stage === "sync" || runs[stage] > 0;
  const activeIndex = ORDER.indexOf(active);

  return (
    <div className="relative w-full">
      {/* 창 — 위 탭이 창 너비를 3등분한다 */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/90 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#151c17]">
        <div
          className="relative grid grid-cols-3 border-b border-gray-200/70 bg-gray-50/90 dark:border-gray-800/80 dark:bg-[#18221b]"
          role="tablist"
          aria-label="KeepGo 사용 단계"
        >
          {ORDER.map((stage) => (
            <button
              key={stage}
              type="button"
              role="tab"
              aria-selected={active === stage}
              onClick={() => goTo(stage)}
              className={`py-3.5 text-center text-sm font-bold transition-colors duration-300 ${
                active === stage
                  ? "text-[#16a46b]"
                  : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {TAB_LABEL[stage]}
            </button>
          ))}
          {/* 활성 탭 표시 막대 — 탭 사이를 부드럽게 옮겨 간다 */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[3px] w-1/3 bg-[#16a46b] transition-transform duration-500 ease-out"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
        </div>

        {/* 화면 영역 — 높이가 고정이라 단계가 바뀌어도 창 크기와 주변이 움직이지 않는다 */}
        <div className={`relative ${BODY_HEIGHT_CLASS}`}>
          {ORDER.map((stage) => (
            <div
              key={stage}
              aria-hidden={active !== stage}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-4 px-5 transition-all duration-500 ease-out ${
                active === stage
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: stage === "sync" ? CARD_WIDTH : WIDE_WIDTH,
                }}
              >
                {stage === "sync" && started("sync") && (
                  <SyncStage
                    key={`sync-${runs.sync}`}
                    onDone={() => next("sync")}
                  />
                )}
                {stage === "analyze" && started("analyze") && (
                  <AnalyzeStage
                    key={`analyze-${runs.analyze}`}
                    onDone={() => next("analyze")}
                  />
                )}
                {stage === "route" && started("route") && (
                  <CourseStage
                    key={`route-${runs.route}`}
                    onDone={() => next("route")}
                  />
                )}
              </div>
              <p className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                {STAGE_NOTE[stage]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 창 밑에 걸쳐 두는 안내 문구 — 레이아웃 높이에 넣지 않아서 옆 글이 "창"만 기준으로 가운데에 놓인다 */}
      <p className="absolute left-0 right-0 top-full mt-3 text-center text-[11px] text-gray-400 dark:text-gray-500">
        예시 화면이에요 · 수치는 이해를 돕기 위한 예시예요
      </p>
    </div>
  );
}
