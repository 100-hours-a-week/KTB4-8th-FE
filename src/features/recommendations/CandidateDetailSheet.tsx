"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { CATEGORY_LABEL, TIME_OF_DAY_LABEL } from "@/lib/constants";
import { fmtDate, fmtDuration, fmtHm } from "@/lib/format";
import { useAddCourseItem } from "./queries";
import type { Slots } from "./courseStore";
import type { Candidate } from "@/types/api";

/* 코스 상세 — 지도 + 통계 + 이동 순서 타임라인 + "이 코스 추가하기".
   지도(네이버 지도)는 서버에서 절대 실행되면 안 되므로 next/dynamic({ ssr: false }) 으로만 불러온다. */
const CourseMap = dynamic(
  () => import("./CourseMap").then((m) => m.CourseMap),
  { ssr: false },
);

interface CandidateDetailSheetProps {
  candidate: Candidate;
  slots: Slots;
  onClose: () => void;
  onBack: () => void;
  onAdded: (course: Candidate, itemId: string) => void;
}

export function CandidateDetailSheet({
  candidate,
  slots,
  onClose,
  onBack,
  onAdded,
}: CandidateDetailSheetProps) {
  const [adding, setAdding] = useState(false);
  const addItem = useAddCourseItem();

  const dateLabel = slots.date
    ? fmtDate(new Date(`${slots.date}T00:00:00+09:00`))
    : "";
  const timeLabel = slots.timeOfDay ? TIME_OF_DAY_LABEL[slots.timeOfDay] : "";

  async function handleAdd() {
    setAdding(true);
    try {
      const saved = await addItem.mutateAsync(candidate);
      onAdded(candidate, saved.id);
    } catch (err) {
      toast.fromError(err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Sheet
      title={candidate.name}
      sub={`${candidate.area} · ${dateLabel} ${timeLabel}`}
      center
      back
      onBack={onBack}
      onClose={onClose}
      foot={
        <button
          className="btn btn--block"
          type="button"
          disabled={adding}
          onClick={() => void handleAdd()}
        >
          {adding ? (
            <>
              <Spinner />
              <span>추가 중</span>
            </>
          ) : (
            <>
              <Icon name="bookmark" size={18} />
              <span>이 코스 추가하기</span>
            </>
          )}
        </button>
      }
    >
      <CourseMap components={candidate.components} />
      <div className="stats">
        <div className="stat stat--brand">
          <p className="stat__key">추천 순위</p>
          <p className="stat__val">{candidate.rank}순위</p>
        </div>
        <div className="stat">
          <p className="stat__key">총 소요시간</p>
          <p className="stat__val">
            {fmtDuration(candidate.estimatedDurationMinutes)}
          </p>
        </div>
      </div>
      <div className="steps">
        {candidate.components.map((comp, i) => (
          <div className="step" key={comp.sequence}>
            <span className="step__no">{comp.sequence}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="step__name">{comp.name}</span>
              <span className="step__meta">
                {CATEGORY_LABEL[comp.category]} ·{" "}
                {i === 0 ? "출발지에서 " : "이전 장소에서 "}
                {comp.travelMinutes ?? 0}분 이동 ·{" "}
                {fmtHm(comp.estimatedArrivalAt)} 도착 ·{" "}
                {comp.estimatedStayMinutes}분 머무름
              </span>
              {comp.reason && (
                <span className="step__reason">{comp.reason}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
