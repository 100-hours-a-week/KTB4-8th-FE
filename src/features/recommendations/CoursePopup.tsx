"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import { confirm } from "@/components/ui/Confirm";
import { isApiError } from "@/lib/api/client";
import { CATEGORY_LABEL, TIME_OF_DAY_LABEL } from "@/lib/constants";
import { fmtDate, toIso, uid } from "@/lib/format";
import {
  isReady,
  useCourseStore,
  type ChatLine,
  type DoneCourse,
  type Origin,
  type Slots,
} from "./courseStore";
import {
  useCancelRecommendation,
  useClearChat,
  useCreateRecommendation,
  useRecommendationPoll,
  useSendChatMessage,
  type CreateRecommendationBody,
} from "./queries";
import { RegionSheet } from "./RegionSheet";
import { DateTimeSheet } from "./DateTimeSheet";
import { AvailableSheet } from "./AvailableSheet";
import { CategorySheet } from "./CategorySheet";
import {
  CandidatesSheet,
  type RelaxPatch,
  type RelaxSuggestion,
} from "./CandidatesSheet";
import { CandidateDetailSheet } from "./CandidateDetailSheet";
import type { Candidate, RecommendationRun, TimeOfDay } from "@/types/api";

/* 05 · 코스 추천(챗봇) — 탭 이동이 아니라 화면 위에 뜨는 팝업(풀스크린 시트)이다.
   흐름: 대화로 조건 추출 → 조건 카드 확인 · 수정 → 추천 작업 생성(202)
         → 결과 폴링(retryAfterSeconds 준수) → 코스 후보 → 상세 → 보관함 추가
   프로토타입 js/pages/course.js 를 컴포넌트로 옮겼다. */

const QUICK = [
  "성수에서 토요일 오후에 카페 투어",
  "이번 주말 팝업 탐방",
  "친구와 반나절 코스",
];

/** AI 명세에 없는 시간대 → 시작 시각 매핑(명세 미정, 프로토타입 값을 그대로 쓴다) */
const TIME_START: Record<TimeOfDay, number> = {
  MORNING: 10,
  AFTERNOON: 13,
  EVENING: 18,
};

const PROGRESS_LINES = [
  "좋아요 영상에서 찾은 장소를 모으는 중",
  "조건에 맞는 장소를 추리는 중",
  "이동 순서를 계산하는 중",
];

const INTRO_GREETING =
  "가고 싶은 곳을 편하게 말씀해 주세요.\n예) 이번 주 토요일 오후에 카페 가고 싶어";
const INTRO_HINT = "지역과 시간도 함께 알려주시면 더 정확해요.";

const DEFAULT_ORIGIN: Origin = {
  label: "강남구 테헤란로",
  latitude: 37.5,
  longitude: 127.0364,
  current: true,
};

/** 후보가 0개일 때 "이렇게 바꿔볼까요?" 제안 — 프로토타입의 KG.db.relaxedSuggestions 를 대신한다.
    UI 전용 데이터라 명세에는 없고, 화면(이 파일)에 직접 둔다. */
const RELAX_SUGGESTIONS: RelaxSuggestion[] = [
  {
    label: "외출 가능 시간을 3시간 → 6시간으로",
    patch: { availableMinutes: 360 },
  },
  { label: "카테고리에 전시를 추가", patch: { addCategory: "EXHIBITION" } },
  { label: "지역을 성동구 전체로", patch: { region: "서울 성동구" } },
];

type ViewState =
  | { name: "region"; kind: "region" | "origin" }
  | { name: "datetime" }
  | { name: "available" }
  | { name: "category" }
  | { name: "candidates"; result: RecommendationRun }
  | { name: "detail"; result: RecommendationRun; candidate: Candidate }
  | null;

/** 추천 요청 본문 — 목 핸들러(createRecommendationHandler)가 실제로 받는 필드 그대로다.
    (@/types/api 의 RecommendationRequest 가 쓰는 region/datetime/availableTime 필드와는 다르다 —
    CONTRACT 이 "이미 끝난 목 레이어에 맞추라"고 명시해서, 실제 핸들러 기준으로 맞췄다) */
function buildRecommendationBody(
  slots: Slots,
  origin: Origin,
): CreateRecommendationBody {
  const start = new Date(`${slots.date}T00:00:00+09:00`);
  start.setHours(TIME_START[slots.timeOfDay ?? "AFTERNOON"] ?? 13, 0, 0, 0);
  const end = new Date(
    start.getTime() + (slots.availableMinutes ?? 180) * 60000,
  );
  return {
    currentLocation: {
      latitude: origin.latitude ?? 0,
      longitude: origin.longitude ?? 0,
    },
    startAt: toIso(start),
    endAt: toIso(end),
    preferences: slots.categories.length ? slots.categories : undefined,
  };
}

function dateTimeLabel(slots: Slots): string {
  const d = slots.date ? fmtDate(new Date(`${slots.date}T00:00:00+09:00`)) : "";
  const t = slots.timeOfDay ? TIME_OF_DAY_LABEL[slots.timeOfDay] : "";
  return d && t ? `${d} ${t}` : "";
}

export function CoursePopup() {
  const open = useCourseStore((s) => s.open);
  const setOpen = useCourseStore((s) => s.setOpen);
  const lines = useCourseStore((s) => s.lines);
  const phase = useCourseStore((s) => s.phase);
  const options = useCourseStore((s) => s.options);
  const origin = useCourseStore((s) => s.origin);
  const slots = useCourseStore((s) => s.slots);
  const runId = useCourseStore((s) => s.runId);
  const done = useCourseStore((s) => s.done);
  const patchSlots = useCourseStore((s) => s.patchSlots);
  const reset = useCourseStore((s) => s.reset);

  const router = useRouter();
  const pathname = usePathname();

  const [draft, setDraft] = useState("");
  const [view, setView] = useState<ViewState>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const logRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wasOpenRef = useRef(false);
  const resumeDraftRef = useRef(false);

  const sendChat = useSendChatMessage();
  const clearChat = useClearChat();
  const createRecommendation = useCreateRecommendation();
  const cancelRecommendation = useCancelRecommendation();
  const generating = phase === "creating" || phase === "polling";
  const poll = useRecommendationPoll(runId, open && phase === "polling");

  /* 기본 진입은 항상 인트로 화면으로 시작한다.
     사용자가 진행 중 대화를 X로 직접 닫은 경우에만 메모리의 대화를 이어서 연다. */
  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    if (justOpened) {
      const shouldResume = resumeDraftRef.current;
      resumeDraftRef.current = false;
      if (!shouldResume) {
        reset();
        setDraft("");
        setView(null);
        // 새 대화의 화면과 서버 대화 문맥이 서로 달라지지 않도록 함께 초기화한다.
        void clearChat.mutateAsync().catch(() => {
          /* 서버 초기화 실패가 인트로 진입 자체를 막지는 않는다. */
        });
      }
    }
    wasOpenRef.current = open;
  }, [clearChat, open, reset]);

  /* 기본 출발지 — 프로토타입처럼 팝업을 처음 열 때 한 번 채워둔다 */
  useEffect(() => {
    if (open && !origin) useCourseStore.setState({ origin: DEFAULT_ORIGIN });
  }, [open, origin]);

  /* 탭을 옮기면 팝업을 닫는다 — 프로토타입에서 라우터가 시트를 모두 닫던 것과 같다.
     (팝업 안의 버튼으로 이동할 때는 이미 setOpen(false) 를 거친다) */
  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    resumeDraftRef.current = false;
    setView(null);
    setOpen(false);
  }, [pathname, setOpen]);

  /* 생성 중 문구 애니메이션 */
  useEffect(() => {
    if (!generating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 애니메이션 인터벌 구독 시작 전 상태 초기화
      setStepIndex(0);
      return;
    }

    setStepIndex(0);
    const id = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, PROGRESS_LINES.length));
    }, 700);
    return () => window.clearInterval(id);
  }, [generating]);

  /* 대화 로그 자동 스크롤 */
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines, options, phase]);

  /* 입력창 자동 포커스 */
  useEffect(() => {
    if (!open || phase !== "idle") return;
    const t = window.setTimeout(() => textareaRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open, phase]);

  /* 추천 결과 폴링 반영 — RECOMMENDATION_NOT_COMPLETED(409) 는 useRecommendationPoll 의
     refetchInterval 이 retryAfterSeconds 만큼 기다렸다 알아서 다시 부르므로 조용히 무시한다. */
  useEffect(() => {
    if (phase !== "polling") return;
    if (poll.data) {
      useCourseStore.setState({ phase: "idle" });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 비동기 폴링 결과 도착에 반응하는 화면 전환
      setView({ name: "candidates", result: poll.data });
      return;
    }
    if (poll.error) {
      const err = poll.error;
      if (isApiError(err) && err.code === "RECOMMENDATION_NOT_COMPLETED")
        return;
      useCourseStore.setState({ phase: "idle" });
      if (isApiError(err) && err.code === "RECOMMENDATION_RUN_NOT_FOUND") {
        useCourseStore.setState((s) => ({
          lines: [
            ...s.lines,
            {
              id: uid("msg"),
              role: "ASSISTANT",
              content:
                "추천 결과가 만료되었어요.\n같은 조건으로 다시 받아볼 수 있어요.",
            } as ChatLine,
          ],
        }));
      }
      toast.fromError(err, { onRetry: () => void requestRecommendation() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.data, poll.error, phase]);

  async function requestRecommendation() {
    const state = useCourseStore.getState();
    if (state.phase !== "idle" || !state.origin) return;
    useCourseStore.setState({ phase: "creating" });
    try {
      const body = buildRecommendationBody(state.slots, state.origin);
      const run = await createRecommendation.mutateAsync(body);
      useCourseStore.setState({ runId: run.runId, phase: "polling" });
    } catch (err) {
      useCourseStore.setState({ phase: "idle" });
      const retryable = !(
        isApiError(err) && err.code === "RECOMMENDATION_LIMIT_EXCEEDED"
      );
      toast.fromError(err, {
        onRetry: retryable ? () => void requestRecommendation() : undefined,
      });
    }
  }

  async function handleSend(preset?: string) {
    const current = useCourseStore.getState();
    const text = (preset ?? draft).trim();
    if (!text || current.phase !== "idle") return;

    const userLine: ChatLine = { id: uid("msg"), role: "USER", content: text };
    useCourseStore.setState((s) => ({
      lines: [...s.lines, userLine],
      phase: "sending",
      options: [],
    }));
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const reply = await sendChat.mutateAsync({
        content: text,
        slots: current.slots,
      });
      const patch: Partial<Slots> = { ...(reply.extractedSlots ?? {}) };
      if (
        reply.extractedSlots?.region &&
        reply.extractedSlots.region !== current.slots.region
      ) {
        // 지역이 바뀌면 이전에 지역 검색에서 골랐던 좌표는 더 이상 맞지 않는다(regionPoint 는 명세에 없는 화면 전용 필드)
        patch.regionPoint = null;
      }
      patchSlots(patch);
      const botLine: ChatLine = {
        id: reply.message.id,
        role: "ASSISTANT",
        content: reply.message.content,
      };
      useCourseStore.setState((s) => ({
        lines: [...s.lines, botLine],
        options: reply.options?.length ? reply.options : [],
      }));
    } catch (err) {
      useCourseStore.setState((s) => ({
        lines: [
          ...s.lines,
          {
            id: uid("msg"),
            role: "ASSISTANT",
            content:
              "일시적인 오류로 답변하지 못했어요.\n입력한 조건은 그대로 유지됩니다.",
          } as ChatLine,
        ],
      }));
      toast.fromError(err, { onRetry: () => void handleSend(text) });
    } finally {
      useCourseStore.setState({ phase: "idle" });
    }
  }

  function handleOptionClick(opt: string) {
    useCourseStore.setState({ options: [] });
    void handleSend(opt);
  }

  async function handleReset() {
    const ok = await confirm({
      title: "대화를 초기화할까요?",
      message: (
        <>
          대화 내용과 입력한 조건이 모두 삭제됩니다.
          <br />
          초기화한 내용은 다시 복구할 수 없어요.
        </>
      ),
      ok: "초기화",
      danger: true,
    });
    if (!ok) return;
    try {
      await clearChat.mutateAsync();
    } catch {
      /* 초기화 실패는 화면 상태만 되돌린다 */
    }
    reset();
  }

  function handleClose() {
    const state = useCourseStore.getState();
    const hasSlot =
      !!state.slots.region ||
      !!state.slots.date ||
      !!state.slots.timeOfDay ||
      !!state.slots.availableMinutes ||
      state.slots.categories.length > 0;
    resumeDraftRef.current =
      !state.done &&
      (state.lines.length > 0 || hasSlot || state.phase !== "idle");
    if (state.phase !== "idle") useCourseStore.setState({ phase: "idle" });
    setOpen(false);
  }

  /* 취소 응답 자체가 이미 CANCELLED 상태를 들고 온다 — 목 서버가 취소된 작업을 지워버려서,
     다음 폴링은(있다면) 오히려 RECOMMENDATION_RUN_NOT_FOUND(404) 가 난다.
     그래서 프로토타입처럼 다음 폴링 결과를 기다리지 않고 이 응답으로 바로 idle 로 되돌린다. */
  async function handleCancel() {
    try {
      await cancelRecommendation.mutateAsync();
      toast.info("중단을 요청했어요.");
      useCourseStore.setState((s) => ({
        phase: "idle",
        lines: [
          ...s.lines,
          {
            id: uid("msg"),
            role: "ASSISTANT",
            content:
              "추천 생성을 멈췄어요. 조건은 그대로 두었으니 언제든 다시 받아보세요.",
          } as ChatLine,
        ],
      }));
    } catch (err) {
      toast.fromError(err);
      useCourseStore.setState({ phase: "idle" });
    }
  }

  function handleRelax(patch: RelaxPatch) {
    const next: Partial<Slots> = {};
    if (patch.availableMinutes) next.availableMinutes = patch.availableMinutes;
    if (patch.addCategory) {
      const cats = useCourseStore.getState().slots.categories;
      next.categories = cats.includes(patch.addCategory)
        ? cats
        : [...cats, patch.addCategory];
    }
    if (patch.region) {
      next.region = patch.region;
      next.regionPoint = null;
    }
    patchSlots(next);
    setView(null);
    void requestRecommendation();
  }

  function handleGoHome(opts?: { startSync?: boolean }) {
    resumeDraftRef.current = false;
    setView(null);
    setOpen(false);
    router.push(opts?.startSync ? "/home?startSync=1" : "/home");
  }

  function handleAdded(course: Candidate, itemId: string) {
    useCourseStore.setState({ done: { course, itemId } });
    setView(null);
  }

  async function handleAgain() {
    // 이전 대화 기록 없이 처음부터 다시 시작한다(기능정의서 8)
    try {
      await clearChat.mutateAsync();
    } catch {
      /* 무시 — 화면 상태는 어차피 초기화한다 */
    }
    reset();
  }

  function handleGoCollection() {
    resumeDraftRef.current = false;
    setOpen(false);
    router.push("/collection?tab=COURSE");
  }

  function handleEditSlot(
    kind: "region" | "datetime" | "available" | "category",
  ) {
    if (kind === "region") setView({ name: "region", kind: "region" });
    else if (kind === "datetime") setView({ name: "datetime" });
    else if (kind === "available") setView({ name: "available" });
    else setView({ name: "category" });
  }

  if (!open) return null;

  return (
    <>
      <Sheet
        title="코스 추천"
        full
        dismissible={false}
        back={!!done}
        onBack={() => useCourseStore.setState({ done: null })}
        actions={
          <button
            className="iconbtn"
            type="button"
            aria-label="대화 초기화"
            onClick={() => void handleReset()}
          >
            <Icon name="refresh" size={18} />
          </button>
        }
        onClose={handleClose}
      >
        {done ? (
          <DoneView
            done={done}
            slots={slots}
            onGoCollection={handleGoCollection}
            onAgain={() => void handleAgain()}
          />
        ) : (
          <div className="chat">
            <div className="chat__log" ref={logRef}>
              {lines.length === 0 && (
                <div className="chat__intro">
                  <div className="chat__intro-ico">
                    <Icon name="sparkle" size={26} />
                  </div>
                  <p className="chat__intro-title">어디로 가볼까요?</p>
                  <p className="chat__intro-desc">
                    저장해 둔 장소 중에서 골라 순서까지 짜 드려요.
                  </p>
                </div>
              )}
              {lines.length === 0 && (
                <div className="bubble bubble--bot">
                  {INTRO_GREETING}
                  <span className="bubble__hint">{INTRO_HINT}</span>
                </div>
              )}
              {lines.map((line) => (
                <div
                  key={line.id}
                  className={`bubble ${line.role === "USER" ? "bubble--me" : "bubble--bot"}`}
                >
                  {line.content}
                </div>
              ))}
              {options.length > 0 && (
                <div className="quick">
                  <div className="quick__list">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        className="chip"
                        type="button"
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {lines.length === 0 && (
                <div className="quick">
                  <p className="quick__label">빠른 시작</p>
                  <div className="quick__list">
                    {QUICK.map((q) => (
                      <button
                        key={q}
                        className="chip"
                        type="button"
                        onClick={() => void handleSend(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {phase === "sending" && (
                <div className="bubble bubble--bot bubble--typing">
                  <i />
                  <i />
                  <i />
                </div>
              )}
              {generating && (
                <ProgressView
                  slots={slots}
                  stepIndex={stepIndex}
                  onCancel={() => void handleCancel()}
                />
              )}
            </div>

            <CondCard
              slots={slots}
              origin={origin}
              ready={isReady(slots) && phase === "idle"}
              onEditOrigin={() => setView({ name: "region", kind: "origin" })}
              onEditSlot={handleEditSlot}
              onRecommend={() => void requestRecommendation()}
            />

            <div className="composer">
              <div className="composer__row">
                <textarea
                  ref={textareaRef}
                  className="composer__input"
                  rows={1}
                  placeholder="어떤 곳에 가고 싶으세요?"
                  value={draft}
                  disabled={phase !== "idle"}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(96, e.target.scrollHeight)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <button
                  className="composer__send"
                  type="button"
                  aria-label="보내기"
                  disabled={phase !== "idle"}
                  onClick={() => void handleSend()}
                >
                  <Icon name="arrowUp" size={20} />
                </button>
              </div>
              {generating && (
                <p className="composer__note">
                  생성 중에는 입력과 전송이 잠시 멈춰요.
                </p>
              )}
            </div>
          </div>
        )}
      </Sheet>

      {view?.name === "region" && (
        <RegionSheet kind={view.kind} onClose={() => setView(null)} />
      )}
      {view?.name === "datetime" && (
        <DateTimeSheet onClose={() => setView(null)} />
      )}
      {view?.name === "available" && (
        <AvailableSheet onClose={() => setView(null)} />
      )}
      {view?.name === "category" && (
        <CategorySheet onClose={() => setView(null)} />
      )}
      {view?.name === "candidates" && (
        <CandidatesSheet
          result={view.result}
          slots={slots}
          relaxSuggestions={RELAX_SUGGESTIONS}
          onClose={() => setView(null)}
          onSelect={(candidate) =>
            setView({ name: "detail", result: view.result, candidate })
          }
          onRelax={handleRelax}
          onGoHome={handleGoHome}
        />
      )}
      {view?.name === "detail" && (
        <CandidateDetailSheet
          candidate={view.candidate}
          slots={slots}
          onClose={() => setView(null)}
          onBack={() => setView({ name: "candidates", result: view.result })}
          onAdded={handleAdded}
        />
      )}
    </>
  );
}

function CondCard({
  slots,
  origin,
  ready,
  onEditOrigin,
  onEditSlot,
  onRecommend,
}: {
  slots: Slots;
  origin: Origin | null;
  ready: boolean;
  onEditOrigin: () => void;
  onEditSlot: (kind: "region" | "datetime" | "available" | "category") => void;
  onRecommend: () => void;
}) {
  const hasAny =
    ready ||
    !!slots.region ||
    !!slots.date ||
    !!slots.availableMinutes ||
    slots.categories.length > 0;
  if (!hasAny || !origin) return null;

  const availableLabel = slots.availableMinutes
    ? `${slots.availableMinutes / 60}시간`
    : "";
  const categoriesLabel = slots.categories
    .map((c) => CATEGORY_LABEL[c])
    .join(", ");

  return (
    <div className="cond">
      <div className="cond__origin">
        <span className="cond__origin-ico">
          <Icon name="pin" size={16} />
        </span>
        <span className="cond__origin-label">출발지</span>
        <span className="cond__origin-value">{origin.label}</span>
        {origin.current && <span className="cond__badge">현재 위치</span>}
        <button className="cond__edit" type="button" onClick={onEditOrigin}>
          수정 ›
        </button>
      </div>
      <p className="cond__legend">추출된 조건</p>
      <div className="cond__grid">
        <SlotButton
          label="지역"
          required
          value={slots.region ?? ""}
          onClick={() => onEditSlot("region")}
        />
        <SlotButton
          label="날짜 · 시간"
          required
          value={dateTimeLabel(slots)}
          onClick={() => onEditSlot("datetime")}
        />
        <SlotButton
          label="외출 가능 시간"
          required={false}
          value={availableLabel}
          onClick={() => onEditSlot("available")}
        />
        <SlotButton
          label="카테고리"
          required={false}
          value={categoriesLabel}
          onClick={() => onEditSlot("category")}
        />
      </div>
      <button
        className="btn btn--block"
        type="button"
        disabled={!ready}
        onClick={onRecommend}
      >
        <Icon name="sparkle" size={18} />
        <span>이 조건으로 추천받기</span>
      </button>
    </div>
  );
}

function SlotButton({
  label,
  required,
  value,
  onClick,
}: {
  label: string;
  required: boolean;
  value: string;
  onClick: () => void;
}) {
  const empty = !value;
  return (
    <button
      className={`cond__slot ${empty ? "cond__slot--empty" : "cond__slot--filled"}`}
      type="button"
      onClick={onClick}
    >
      <span className="cond__slot-key">
        {label} · {required ? "필수" : "선택"}
      </span>
      <span className="cond__slot-row">
        <span className="cond__slot-val">{value || "미입력"}</span>
        <span className="cond__slot-go">수정 ›</span>
      </span>
    </button>
  );
}

function ProgressView({
  slots,
  stepIndex,
  onCancel,
}: {
  slots: Slots;
  stepIndex: number;
  onCancel: () => void;
}) {
  const timeLabel = slots.timeOfDay ? TIME_OF_DAY_LABEL[slots.timeOfDay] : "";
  return (
    <div className="progress">
      <p className="progress__state">
        <i />
        저장한 장소를 살펴보고 있어요
      </p>
      <p className="progress__title">
        {slots.region ?? ""}에서 보내는 {timeLabel}
      </p>
      <div className="progress__steps">
        {PROGRESS_LINES.slice(0, stepIndex).map((t, idx) => (
          <span key={t}>
            {idx === stepIndex - 1 ? (
              <span
                className="spinner"
                style={{ width: 12, height: 12, borderWidth: "1.6px" }}
              />
            ) : (
              <b>✓</b>
            )}
            {t}
          </span>
        ))}
      </div>
      <div className="progress__foot">
        <button
          className="btn btn--ghost btn--sm"
          type="button"
          onClick={onCancel}
        >
          <Icon name="stop" size={15} />
          <span>생성 중단</span>
        </button>
      </div>
    </div>
  );
}

function DoneView({
  done,
  slots,
  onGoCollection,
  onAgain,
}: {
  done: DoneCourse;
  slots: Slots;
  onGoCollection: () => void;
  onAgain: () => void;
}) {
  const c = done.course;
  return (
    <div className="scroll scroll--pad" style={{ textAlign: "center" }}>
      <div className="done__mark" style={{ margin: "32px auto 22px" }}>
        <Icon name="check" size={44} strokeWidth={2.6} />
      </div>
      <h2 className="onb__title">
        코스를 보관함에
        <br />
        추가했어요
      </h2>
      <p className="onb__desc">
        {dateTimeLabel(slots)} · 장소 {c.components.length}곳
      </p>
      <div className="card" style={{ textAlign: "left", marginTop: 24 }}>
        <p className="listitem__name">{c.name}</p>
        <p className="listitem__meta">
          {c.components.map((x) => x.name).join(" → ")}
        </p>
        <p className="listitem__sub">
          {c.rank}순위 · 총 이동 {c.totalTravelMinutes ?? 0}분
        </p>
      </div>
      <div
        style={{
          marginTop: 26,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          className="btn btn--block"
          type="button"
          onClick={onGoCollection}
        >
          보관함에서 확인하기
        </button>
        <button
          className="btn btn--ghost btn--block"
          type="button"
          onClick={onAgain}
        >
          새 코스 추천받기
        </button>
      </div>
    </div>
  );
}
