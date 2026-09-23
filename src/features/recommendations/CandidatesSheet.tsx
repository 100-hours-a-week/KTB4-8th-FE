"use client";

import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { Empty } from "@/components/ui/Primitives";
import { CATEGORY_EMOJI, TIME_OF_DAY_LABEL } from "@/lib/constants";
import { fmtDate } from "@/lib/format";
import type { Slots } from "./courseStore";
import type {
  AvailableMinutes,
  Candidate,
  Category,
  EmptyReason,
  RecommendationRun,
} from "@/types/api";

/* 코스 후보 목록 — 후보가 있으면 순위 카드 목록을, 0개면 사유별 안내 화면을 보여준다.
   프로토타입의 openCandidates() / showEmptyResult() 를 한 시트로 합쳤다(둘 다 "추천 결과" 화면이라서). */

export interface RelaxPatch {
  availableMinutes?: AvailableMinutes;
  addCategory?: Category;
  region?: string;
}

export interface RelaxSuggestion {
  label: string;
  patch: RelaxPatch;
}

interface EmptyCopy {
  title: string;
  message: string;
  relax?: boolean;
  action?: { label: string; kind: "sync" | "home"; ghost?: boolean };
}

const EMPTY_COPY: Record<EmptyReason, EmptyCopy> = {
  NO_LIKED_VIDEO: {
    title: "좋아요한 영상이 없어요.",
    message:
      "유튜브에서 마음에 드는 쇼츠에 좋아요를 누른 뒤 다시 불러와 주세요.",
    action: { label: "다시 동기화", kind: "sync" },
  },
  NO_PLACE_VIDEO: {
    title: "장소가 담긴 영상을 찾지 못했어요.",
    message:
      "맛집 · 카페 · 팝업 · 전시가 나오는 영상이면 장소를 찾을 수 있어요.",
    action: { label: "다시 동기화", kind: "sync" },
  },
  ANALYSIS_IN_PROGRESS: {
    title: "아직 분석하고 있어요.",
    message: "분석이 끝나면 알려드릴게요. 잠시 후 다시 시도해 주세요.",
    action: { label: "홈에서 진행 상황 보기", kind: "home", ghost: true },
  },
  NO_MATCH: {
    title: "조건에 맞는 장소가 없어요.",
    message: "조건을 한 단계만 넓히면 코스를 만들 수 있어요.",
    relax: true,
  },
  TOO_NARROW: {
    title: "조건이 좁아 코스를 만들지 못했어요.",
    message: "외출 시간을 늘리거나 카테고리를 넓혀보세요.",
    relax: true,
  },
  VERIFICATION_PENDING: {
    title: "확인이 필요한 장소가 있어요.",
    message: "AI가 찾은 장소 중 일부는 실제 위치를 확인하지 못했어요.",
    action: { label: "확인하러 가기", kind: "home", ghost: true },
  },
};

interface CandidatesSheetProps {
  result: RecommendationRun;
  slots: Slots;
  relaxSuggestions: RelaxSuggestion[];
  onClose: () => void;
  onSelect: (candidate: Candidate) => void;
  onRelax: (patch: RelaxPatch) => void;
  onGoHome: (opts?: { startSync?: boolean }) => void;
}

export function CandidatesSheet({
  result,
  slots,
  relaxSuggestions,
  onClose,
  onSelect,
  onRelax,
  onGoHome,
}: CandidatesSheetProps) {
  const candidates = result.candidates ?? [];
  const dateLabel = slots.date
    ? fmtDate(new Date(`${slots.date}T00:00:00+09:00`))
    : "";
  const timeLabel = slots.timeOfDay ? TIME_OF_DAY_LABEL[slots.timeOfDay] : "";

  if (!candidates.length) {
    const reason = result.emptyReason ?? "NO_MATCH";
    const copy = EMPTY_COPY[reason];
    return (
      <Sheet title="추천 결과" sub={reason} back center onClose={onClose}>
        <Empty
          icon="alert"
          title={copy.title}
          message={copy.message}
          actions={
            copy.action && (
              <button
                className={`btn btn--block${copy.action.ghost ? " btn--ghost" : ""}`}
                type="button"
                onClick={() =>
                  onGoHome(
                    copy.action?.kind === "sync"
                      ? { startSync: true }
                      : undefined,
                  )
                }
              >
                {copy.action.label}
              </button>
            )
          }
        />
        {copy.relax && (
          <>
            <p
              className="cond__legend"
              style={{ textAlign: "left", marginTop: 20 }}
            >
              이렇게 바꿔볼까요?
            </p>
            {relaxSuggestions.map((r) => (
              <button
                key={r.label}
                className="optrow"
                type="button"
                onClick={() => onRelax(r.patch)}
              >
                {r.label}
                <span style={{ marginLeft: "auto", color: "var(--ink-4)" }}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
            ))}
          </>
        )}
      </Sheet>
    );
  }

  return (
    <Sheet
      title={`코스 후보 ${candidates.length}개`}
      sub={`${slots.region ?? ""} · ${dateLabel} ${timeLabel}`}
      back
      center
      onClose={onClose}
    >
      <div className="stagger">
        {candidates.map((c) => (
          <button
            key={c.candidateId}
            className="cand"
            type="button"
            onClick={() => onSelect(c)}
          >
            <span className="cand__rank">
              <b>{c.rank}</b>
              <i>순위</i>
            </span>
            <span className="cand__body">
              <span className="cand__name">{c.name}</span>
              <span className="cand__meta">
                장소 {c.components.length}곳 · 총 {c.totalTravelMinutes ?? 0}분
                이동
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
          </button>
        ))}
      </div>
    </Sheet>
  );
}
