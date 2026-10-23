"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import {
  CATEGORY_LABEL,
  TIME_OF_DAY_LABEL,
  WISHLIST_V2,
} from "@/lib/constants";
import { fmtDate, fmtDuration, fmtHm } from "@/lib/format";
import { useAddWishlistCourse } from "@/features/wishlist/queries";
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
  const addWishlistCourse = useAddWishlistCourse();

  const dateLabel = slots.date
    ? fmtDate(new Date(`${slots.date}T00:00:00+09:00`))
    : "";
  const timeLabel = slots.timeOfDay ? TIME_OF_DAY_LABEL[slots.timeOfDay] : "";

  async function handleAdd() {
    setAdding(true);
    try {
      if (WISHLIST_V2) {
        // 보관함이 BE 코스만 보여 주므로, 코스 ID 가 없는 응답(구버전 BE)을 브라우저에 담으면 담았는데 안 보이게 된다 — 담지 않고 알린다
        if (candidate.outingCourseId == null) {
          toast.warn(
            "이 코스는 지금 보관함에 담을 수 없어요.",
            "담지 못했어요",
          );
          return;
        }
        // BE v2 가 추천 결과를 저장해 둔 코스를 내 보관함에 담는다
        await addWishlistCourse.mutateAsync(candidate.outingCourseId);
        onAdded(candidate, String(candidate.outingCourseId));
      } else {
        const saved = await addItem.mutateAsync(candidate);
        onAdded(candidate, saved.id);
      }
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
          {/* BE 가 총 소요시간(이동 + 머무름)을 주면 그것을, 아직 안 주면 이동시간만 보여 준다
              (이동시간을 "소요시간"이라 부르면 뜻이 달라져서 라벨도 함께 바꾼다) */}
          <p className="stat__key">
            {candidate.estimatedDurationMinutes != null
              ? "총 소요시간"
              : "총 이동시간"}
          </p>
          <p className="stat__val">
            {fmtDuration(
              candidate.estimatedDurationMinutes ??
                candidate.totalTravelMinutes,
            )}
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
                {CATEGORY_LABEL[comp.category]}
                {/* 이동시간을 모르면(BE v2 는 장소별 이동시간을 안 준다) 0분으로 채우지 않고 문구를 뺀다 */}
                {comp.travelMinutes != null &&
                  ` · ${i === 0 ? "출발지에서" : "이전 장소에서"} ${comp.travelMinutes}분 이동`}
                {comp.estimatedArrivalAt &&
                  ` · ${fmtHm(comp.estimatedArrivalAt)} 도착`}
                {comp.estimatedStayMinutes != null &&
                  ` · ${comp.estimatedStayMinutes}분 머무름`}
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
