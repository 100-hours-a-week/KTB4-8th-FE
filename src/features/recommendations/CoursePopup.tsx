"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { toast } from "@/components/ui/Toast";
import { confirm } from "@/components/ui/Confirm";
import { isApiError } from "@/lib/api/client";
import { CATEGORY_BY_LABEL } from "@/lib/api/backend";
import {
  currentPosition,
  permissionState,
  reverseGeocode,
  searchAddress,
} from "@/lib/address/address";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  TIME_OF_DAY_LABEL,
} from "@/lib/constants";
import { nearestRegion, searchRegions } from "@/lib/address/regionDb";
import { fmtDate, uid } from "@/lib/format";
import {
  defaultOrigin,
  emptySlots,
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
  useRequestRecommendation,
  useSendChatMessage,
  useUpdateSlot,
  type UpdateSlotBody,
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
import type {
  Candidate,
  Category,
  ChatSlot,
  RecommendationRun,
  TimeOfDay,
} from "@/types/api";

/* 05 · 코스 추천(챗봇) — 탭 이동이 아니라 화면 위에 뜨는 팝업(풀스크린 시트)이다.
   흐름: 대화로 조건 추출 → 조건 카드 확인 · 수정 → 추천 작업 생성(202)
         → 결과 폴링(retryAfterSeconds 준수) → 코스 후보 → 상세 → 보관함 추가
   프로토타입 js/pages/course.js 를 컴포넌트로 옮겼다. */

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

/** 후보가 0개일 때 "이렇게 바꿔볼까요?" 제안 — 지금 입력한 조건을 기준으로 만든다.
    · 외출 시간: 지금보다 긴 단계가 있을 때만
    · 카테고리: 이미 고른 게 있고 아직 안 고른 게 남았을 때만(고른 게 없으면 이미 전체다)
    · 지역: 지금 지역이 속한 시·군·구를 알 수 있을 때만("서울 성동구 전체로")
    조건을 알 수 없는 제안은 만들지 않는다. */
function buildRelaxSuggestions(slots: Slots): RelaxSuggestion[] {
  const out: RelaxSuggestion[] = [];

  const current = slots.availableMinutes ?? 180;
  const nextMinutes = ([180, 360, 540] as const).find((m) => m > current);
  if (nextMinutes) {
    out.push({
      label: `외출 가능 시간을 ${current / 60}시간 → ${nextMinutes / 60}시간으로`,
      patch: { availableMinutes: nextMinutes },
    });
  }

  if (slots.categories.length > 0) {
    const missing = CATEGORY_ORDER.find((c) => !slots.categories.includes(c));
    if (missing) {
      out.push({
        label: `카테고리에 ${CATEGORY_LABEL[missing]} 추가`,
        patch: { addCategory: missing },
      });
    }
  }

  const gu = guOfRegion(slots);
  if (gu) {
    out.push({
      label: `지역을 ${gu} 전체로`,
      patch: { region: gu },
    });
  }
  return out;
}

/** "서울 마포구 양화로 188" · "경기도 성남시 분당구 삼평동" 같은 주소 앞부분에서
    "서울 마포구" · "경기 성남시 분당구" 를 뽑는다. 시·군·구가 없으면 null. */
function guFromAddress(address: string | null | undefined): string | null {
  const m = address
    ?.trim()
    .match(/^(\S+)\s+(\S+[시군구](?:\s+\S+구)?)(?:\s|$)/);
  if (!m) return null;
  const sido = m[1].replace(/(특별자치시|특별자치도|특별시|광역시|도)$/, "");
  return `${sido} ${m[2]}`;
}

/** 조건의 지역(이름 또는 지도 좌표)이 속한 "서울 성동구" 같은 시·군·구. 알 수 없거나
    이미 구 단위로 골랐다면 null. */
function guOfRegion(slots: Slots): string | null {
  const q = slots.region?.trim();
  if (!q) return null;
  // 검색 결과에서 골랐다면 그 주소에 시·군·구가 들어 있다 — 가장 정확하다
  const fromAddress = guFromAddress(slots.regionAddress);
  if (fromAddress) return fromAddress;
  let region = searchRegions(q, 1)[0] ?? null;
  const point = slots.regionPoint;
  if (!region && point?.latitude != null && point.longitude != null) {
    const near = nearestRegion(point.latitude, point.longitude);
    if (near && near.distanceKm <= 3) region = near.region;
  }
  if (!region?.sigungu) return null;
  if (q.replace(/\s+/g, "").endsWith(region.sigungu.replace(/\s+/g, "")))
    return null;
  const sido = region.sido.replace(
    /(특별자치시|특별자치도|특별시|광역시|도)$/,
    "",
  );
  return `${sido} ${region.sigungu}`;
}

type ViewState =
  | { name: "region"; kind: "region" | "origin" }
  | { name: "datetime" }
  | { name: "available" }
  | { name: "category" }
  | { name: "candidates"; result: RecommendationRun }
  | { name: "detail"; result: RecommendationRun; candidate: Candidate }
  | null;

/** "yyyy-MM-ddTHH:mm:ss" — BE가 java.time.LocalDateTime으로 받아서, toIso()가 붙이는
    "+09:00" 오프셋이 있으면 못 읽는다(타임존 없는 로컬 시각이어야 한다). */
function toLocalDateTime(date: Date): string {
  const p2 = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}` +
    `T${p2(date.getHours())}:${p2(date.getMinutes())}:00`
  );
}

/** "의도 카드" PATCH 본문 — BE가 추천 요청 때 쓰는 조건은 이걸로 먼저 반영해 둬야 한다
    (POST /user/recommendation 은 본문을 안 읽는다). BE가 전체 필드를 다 요구해서
    (@NotNull/@NotBlank) 아직 안 고른 값도 기본값으로 채워 보낸다. */
function buildSlotUpdateBody(slots: Slots, origin: Origin): UpdateSlotBody {
  const start = new Date(`${slots.date}T00:00:00+09:00`);
  start.setHours(TIME_START[slots.timeOfDay ?? "AFTERNOON"] ?? 13, 0, 0, 0);
  return {
    location: {
      lat: origin.latitude ?? 0,
      lng: origin.longitude ?? 0,
    },
    requested_location_name: slots.region ?? origin.label,
    requested_date_time: toLocalDateTime(start),
    available_time: slots.availableMinutes ?? 180,
    categories: slots.categories.map((c) => CATEGORY_LABEL[c]),
  };
}

/** 날짜는 채팅에서 자동 추출되고 시간대는 사용자가 직접 고르므로, 둘 중 하나만 있어도
    채워진 부분은 보여준다(둘 다 없을 때만 빈 문자열 → "미입력"). */
function dateTimeLabel(slots: Slots): string {
  const d = slots.date ? fmtDate(new Date(`${slots.date}T00:00:00+09:00`)) : "";
  const t = slots.timeOfDay ? TIME_OF_DAY_LABEL[slots.timeOfDay] : "";
  // 날짜와 시간대 사이는 보통 공백보다 살짝 넓게(en space) 띄운다
  if (d && t) return `${d}\u2002${t}`;
  if (d) return `${d} · 시간대 선택`;
  return t;
}

export function CoursePopup() {
  const open = useCourseStore((s) => s.open);
  const setOpen = useCourseStore((s) => s.setOpen);
  const lines = useCourseStore((s) => s.lines);
  const phase = useCourseStore((s) => s.phase);
  const options = useCourseStore((s) => s.options);
  const origin = useCourseStore((s) => s.origin);
  const slots = useCourseStore((s) => s.slots);
  const done = useCourseStore((s) => s.done);
  const patchSlots = useCourseStore((s) => s.patchSlots);
  const reset = useCourseStore((s) => s.reset);

  const router = useRouter();
  const pathname = usePathname();

  const [draft, setDraft] = useState("");
  const [view, setView] = useState<ViewState>(null);
  const [stepIndex, setStepIndex] = useState(0);
  // 조건 카드를 접어 둔 대화의 식별값. 새 대화(reset 이 새 식별값을 발급)가 시작되면
  // 값이 달라져서 카드는 자동으로 다시 펼쳐진다.
  const conversationId = useCourseStore((s) => s.conversationId);
  const [collapsedKey, setCollapsedKey] = useState<string | null>(null);
  const convKey = conversationId ?? "none";
  const condCollapsed = collapsedKey === convKey;

  const logRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wasOpenRef = useRef(false);

  const sendChat = useSendChatMessage();
  const clearChat = useClearChat();
  const updateSlot = useUpdateSlot();
  const recommend = useRequestRecommendation();
  const cancelRecommendation = useCancelRecommendation();
  const generating = phase === "creating";
  // 메시지를 한 번이라도 보냈는지 — CondCard 를 강제로 띄우는 fallback 에 쓴다
  const firstMessageSent = lines.some((l) => l.role === "USER");

  /* 대화 식별값이 있으면 화면을 떠났다가 돌아와도 기존 상태를 복원한다.
     식별값이 없을 때만 새 대화를 발급하고 서버의 이전 문맥을 비운다. */
  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    if (justOpened) {
      const state = useCourseStore.getState();
      if (!state.conversationId) {
        reset();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 새 식별값을 발급할 때 이전 화면의 미전송 입력도 함께 비운다
        setDraft("");
        setView(null);
        void clearChat.mutateAsync().catch(() => {
          /* 서버 초기화 실패가 인트로 진입 자체를 막지는 않는다. */
        });
      }
    }
    wasOpenRef.current = open;
  }, [clearChat, open, reset]);

  /* 출발지 — 비어 있으면 기본값을 먼저 깔고, 브라우저 위치로 현재 위치를 찾으면 바꾼다.
     권한 거부 · 시간 초과 · 한국 밖이면 기본값을 그대로 둔다. 그 사이 사용자가 출발지를
     직접 고쳤다면(스토어의 출발지가 방금 깐 기본값 객체가 아니면) 덮어쓰지 않는다. */
  useEffect(() => {
    if (!open || origin) return;
    const fallback = defaultOrigin();
    useCourseStore.setState({ origin: fallback });
    void (async () => {
      try {
        if ((await permissionState()) === "denied") return;
        const pos = await currentPosition();
        const hit = await reverseGeocode(pos.latitude, pos.longitude);
        useCourseStore.setState((s) =>
          s.origin === fallback
            ? {
                origin: {
                  label: hit.label,
                  latitude: pos.latitude,
                  longitude: pos.longitude,
                  current: true,
                },
              }
            : s,
        );
      } catch {
        /* 기본 출발지를 그대로 쓴다 */
      }
    })();
  }, [open, origin]);

  /* 하단 내비게이션과 브라우저 뒤로가기는 팝업만 닫고 대화 상태는 유지한다. */
  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    setView(null);
    if (useCourseStore.getState().phase !== "idle") {
      useCourseStore.setState({ phase: "idle" });
    }
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
    // iOS Safari에서 자동 포커스를 주면 키보드가 접혀 있어도 이전/다음·완료가 있는
    // 폼 보조 막대가 화면 하단에 남는다. 터치 기기는 사용자가 입력창을 직접 눌렀을
    // 때만 포커스하고, 키보드가 없는 데스크톱에서만 자동 포커스한다.
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;
    const t = window.setTimeout(() => textareaRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open, phase]);

  /* 추천 요청 — BE 가 동기 처리라 POST 응답이 바로 최종 결과다(202+폴링 아님).
     BE 는 POST 본문을 안 읽고 서버에 저장된 "의도 카드" 값을 쓰므로, 먼저 PATCH 로
     현재 조건을 반영해 둔 다음 추천을 요청한다. */
  async function requestRecommendation() {
    const state = useCourseStore.getState();
    if (state.phase !== "idle" || !state.origin) return;
    useCourseStore.setState({ phase: "creating" });
    try {
      await updateSlot.mutateAsync(
        buildSlotUpdateBody(state.slots, state.origin),
      );
      const run = await recommend.mutateAsync();
      useCourseStore.setState({ phase: "idle" });
      setView({ name: "candidates", result: run });
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

  /* 지역 검색(법정동 DB + 지하철역)으로 이름에 맞는 주소를 찾아 조건에 저장한다.
     찾는 동안 지역이 바뀌었으면 버린다. 못 찾으면 아무 일도 하지 않는다. */
  async function resolveRegionAddress(region: string) {
    try {
      const hits = await searchAddress(region);
      const hit = hits.find((h) => guFromAddress(h.sub));
      if (!hit) return;
      if (useCourseStore.getState().slots.region !== region) return;
      patchSlots({ regionAddress: hit.sub });
    } catch {
      /* 주소를 못 찾으면 지역 제안만 빠진다 */
    }
  }

  /* 채팅 응답의 조건 추출 결과를 조건 카드에 반영한다. null 인 필드는 아직 못 뽑아낸
     것뿐이라 기존 값을 그대로 둔다(덮어쓰지 않음). "시간대"는 AI/BE 에 개념 자체가
     없어서 여기서 안 건드린다 — 사용자가 "날짜 · 시간" 수정에서 항상 직접 고른다. */
  function applyChatSlot(slot: ChatSlot | undefined) {
    if (!slot) return;
    const patch: Partial<Slots> = {};
    if (slot.region != null) {
      patch.region = slot.region;
      // 대화로 지역이 바뀌면 검색 결과에서 골랐던 좌표 · 주소는 더 이상 이 지역의 것이 아니다
      if (slot.region !== useCourseStore.getState().slots.region) {
        patch.regionPoint = null;
        patch.regionAddress = null;
      }
    }
    if (slot.date != null) patch.date = slot.date;
    if (slot.availableMinutes != null)
      patch.availableMinutes = slot.availableMinutes;
    if (slot.category != null) {
      const mapped = slot.category
        .map((label) => CATEGORY_BY_LABEL[label])
        .filter((c): c is Category => !!c);
      if (mapped.length) patch.categories = mapped;
    }
    if (Object.keys(patch).length) patchSlots(patch);
    // 대화로 새 지역이 들어왔으면, 검색과 같은 방법으로 주소를 찾아 둔다(구 단위 제안에 쓴다)
    if (patch.region != null && patch.regionAddress === null)
      void resolveRegionAddress(patch.region);

    if (slot.origin) {
      const { latitude, longitude } = slot.origin;
      useCourseStore.setState((s) => ({
        origin: s.origin
          ? { ...s.origin, latitude, longitude }
          : { label: "대화에서 알려준 위치", latitude, longitude },
      }));
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      // iOS Safari/Simulator의 폼 보조 막대(이전·다음·완료)가 전송 뒤 남지 않게 한다.
      textareaRef.current.blur();
    }

    try {
      const reply = await sendChat.mutateAsync({
        content: text,
      });
      const botLine: ChatLine = {
        id: uid("msg"),
        role: "ASSISTANT",
        content: reply.content,
      };
      useCourseStore.setState((s) => ({
        lines: [...s.lines, botLine],
      }));
      applyChatSlot(reply.slot);
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
    setView(null);
    reset();
  }

  function handleClose() {
    const state = useCourseStore.getState();
    // 추천 완료 뒤 X는 대화를 종료한다. 진행 중 X는 상태를 유지한 채 닫는다.
    if (state.done) {
      setView(null);
      setOpen(false);
      reset();
      void clearChat.mutateAsync().catch(() => {
        /* 화면은 이미 새 대화로 전환되므로 서버 초기화 실패는 닫기를 막지 않는다. */
      });
      return;
    }
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
      next.regionAddress = null;
    }
    patchSlots(next);
    setView(null);
    void requestRecommendation();
  }

  function handleGoHome(opts?: { startSync?: boolean }) {
    setView(null);
    setOpen(false);
    router.push(opts?.startSync ? "/home?startSync=1" : "/home");
  }

  function handleAdded(course: Candidate, itemId: string) {
    useCourseStore.setState({ done: { course, itemId } });
    // 후보 목록은 그대로 남겨 둔다 — 완료 화면에서 뒤로가기를 누르면
    // 같은 후보 목록으로 돌아가 다른 코스도 이어서 담을 수 있다.
    setView((v) =>
      v?.name === "detail" ? { name: "candidates", result: v.result } : v,
    );
  }

  async function handleAgain() {
    // 이전 대화 기록 없이 처음부터 다시 시작한다(기능정의서 8)
    try {
      await clearChat.mutateAsync();
    } catch {
      /* 무시 — 화면 상태는 어차피 초기화한다 */
    }
    setView(null);
    reset();
  }

  async function handleResetSlots() {
    const ok = await confirm({
      title: "조건을 초기화할까요?",
      message: (
        <>
          지역 · 날짜 · 시간대 · 외출 가능 시간 · 카테고리가 모두 비워집니다.
          <br />
          출발지와 대화 내용은 그대로 유지돼요.
        </>
      ),
      ok: "초기화",
      danger: true,
    });
    if (!ok) return;
    patchSlots(emptySlots());
    toast.info("조건을 초기화했어요.");
  }

  function handleGoCollection() {
    setView(null);
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
        center
        back
        showClose={false}
        onBack={() =>
          // 완료 화면에서는 "뒤로"가 홈이 아니라 방금 담은 후보 목록으로 돌아간다
          // (view 는 handleAdded 에서 candidates 로 유지해 둔 상태).
          done ? useCourseStore.setState({ done: null }) : handleGoHome()
        }
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
              generating={generating}
              // 메시지를 한 번 보낸 뒤에는(AI가 하나도 못 뽑아냈거나 응답 자체가 실패해도)
              // 조건 카드를 띄워서 "수정" 버튼으로 직접 채울 수 있는 길을 열어둔다.
              forceShow={firstMessageSent}
              collapsed={condCollapsed}
              onToggle={() => setCollapsedKey(condCollapsed ? null : convKey)}
              onResetSlots={() => void handleResetSlots()}
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
                    // 최대 높이에 닿았을 때만 스크롤을 보인다(그 전에는 숨겨 둔다)
                    e.target.style.overflowY =
                      e.target.scrollHeight > 96 ? "auto" : "hidden";
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
      {/* 완료 화면에서는 후보 시트를 숨긴다 — 뒤로가기로 done 이 풀리면 다시 나타난다 */}
      {!done && (view?.name === "candidates" || view?.name === "detail") && (
        <CandidatesSheet
          result={view.result}
          slots={slots}
          relaxSuggestions={buildRelaxSuggestions(slots)}
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
          onClose={() => setView({ name: "candidates", result: view.result })}
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
  generating,
  forceShow,
  collapsed,
  onToggle,
  onResetSlots,
  onEditOrigin,
  onEditSlot,
  onRecommend,
}: {
  slots: Slots;
  origin: Origin | null;
  ready: boolean;
  generating: boolean;
  /** 첫 메시지를 보낸 뒤에는 추출된 값이 하나도 없어도 카드를 띄운다(수동 입력 경로) */
  forceShow: boolean;
  /** 접힌 상태에서는 한 줄 요약 막대만 보이고, 누르면 다시 펼쳐진다 */
  collapsed: boolean;
  onToggle: () => void;
  /** 지역 · 날짜 · 시간대 · 외출 시간 · 카테고리를 비운다(출발지와 대화는 그대로) */
  onResetSlots: () => void;
  onEditOrigin: () => void;
  onEditSlot: (kind: "region" | "datetime" | "available" | "category") => void;
  onRecommend: () => void;
}) {
  const availableLabel = slots.availableMinutes
    ? `${slots.availableMinutes / 60}시간`
    : "";
  const categoriesLabel = slots.categories
    .map((c) => CATEGORY_LABEL[c])
    .join(", ");
  const summary = [
    slots.region,
    dateTimeLabel(slots).replace("\u2002", " "),
    availableLabel,
    categoriesLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  // 접힌 막대의 요약: 한 줄로 보다가 눌러서 전체를 펼쳐 볼 수 있다. 잘리는 경우에만 토글을 보인다.
  const [barFull, setBarFull] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const sumRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = sumRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const check = () => setTruncated(el.scrollWidth > el.clientWidth + 1);
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapsed, summary]);

  const hasAny =
    ready ||
    !!slots.region ||
    !!slots.date ||
    !!slots.availableMinutes ||
    slots.categories.length > 0;
  // 생성이 시작되면 더 이상 손댈 수 없는 조건 카드는 접어, 진행 상태에 화면을 내준다.
  if ((!hasAny && !forceShow) || !origin || generating) return null;

  if (collapsed) {
    return (
      <div className="cond cond--bar" data-full={barFull ? "true" : undefined}>
        <button
          className="cond__bar-main"
          type="button"
          aria-expanded={barFull}
          aria-label={barFull ? "조건을 한 줄로 보기" : "조건 전체 보기"}
          disabled={!truncated && !barFull}
          onClick={() => setBarFull((v) => !v)}
        >
          <span className="cond__bar-title">추출된 조건</span>
          <span className="cond__bar-sum" ref={sumRef}>
            {summary || "아직 비어 있어요"}
          </span>
        </button>
        {ready && <span className="cond__badge">추천 가능</span>}
        <button
          className="cond__bar-chev"
          type="button"
          aria-expanded={false}
          aria-label="조건 카드 펼치기"
          onClick={onToggle}
        >
          <Icon name="chevronDown" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="cond">
      <div className="cond__origin">
        <span className="cond__origin-ico">
          <Icon name="pin" size={16} />
        </span>
        <span className="cond__origin-label">출발지</span>
        <span className="cond__origin-value">{origin.label}</span>
        {origin.current && (
          <button
            className="cond__badge cond__badge--btn"
            type="button"
            onClick={onEditOrigin}
          >
            현재 위치
          </button>
        )}
        <button className="cond__edit" type="button" onClick={onEditOrigin}>
          수정 ›
        </button>
      </div>
      <div className="cond__legendrow">
        <p className="cond__legend">추출된 조건</p>
        <div className="cond__legendactions">
          {(slots.region ||
            slots.date ||
            slots.timeOfDay ||
            slots.availableMinutes ||
            slots.categories.length > 0) && (
            <button className="cond__edit" type="button" onClick={onResetSlots}>
              조건 초기화
            </button>
          )}
          <button
            className="cond__edit"
            type="button"
            aria-expanded
            onClick={onToggle}
          >
            숨기기
          </button>
        </div>
      </div>
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
      <span className="cond__slot-key">{label}</span>
      <span
        className={`cond__slot-req${required ? " cond__slot-req--must" : ""}`}
      >
        {required ? "필수" : "선택"}
      </span>
      <span className="cond__slot-val">{value || "미입력"}</span>
      <span className="cond__slot-go">수정 ›</span>
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
