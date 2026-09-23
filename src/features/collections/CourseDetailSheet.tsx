"use client";

import { useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { categoryLabel, Empty, Skeleton } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { confirm } from "@/components/ui/Confirm";
import { fmtDot, fmtDuration } from "@/lib/format";
import { useCourseDetail, useDeleteCollectionItem } from "./queries";

/* 보관한 코스 상세 팝업 — 프로토타입 js/pages/collection.js 의 openCourse() 를 그대로 옮겼다.
   코스 추천 흐름의 CandidateDetailSheet(지도 포함)와 달리, 이미 저장된 코스라 지도 없이
   통계 · 이동 순서 · 삭제만 보여준다. */

export interface CourseDetailSheetProps {
  courseId: string;
  onClose: () => void;
}

export function CourseDetailSheet({
  courseId,
  onClose,
}: CourseDetailSheetProps) {
  const { data: course, isLoading, isError, error } = useCourseDetail(courseId);
  const deleteItem = useDeleteCollectionItem();

  useEffect(() => {
    if (isError) toast.fromError(error);
  }, [isError, error]);

  async function handleDelete() {
    const ok = await confirm({
      title: "이 코스를 삭제할까요?",
      message: "삭제한 코스는 복구할 수 없어요.",
      ok: "삭제",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteItem.mutateAsync(courseId);
      toast.ok("보관함에서 삭제했어요.");
      onClose();
    } catch (err) {
      toast.fromError(err);
    }
  }

  return (
    <Sheet
      center
      title={course?.name ?? "코스 정보"}
      sub={
        course
          ? `${course.area} · ${fmtDot(new Date(course.createdAt))} 저장`
          : undefined
      }
      onClose={onClose}
      foot={
        course && (
          <button
            className="btn btn--ghost btn--block"
            type="button"
            onClick={() => void handleDelete()}
          >
            <Icon name="trash" size={18} />
            <span>보관함에서 삭제</span>
          </button>
        )
      }
    >
      {isLoading && (
        <>
          <Skeleton style={{ height: 60, borderRadius: 14 }} />
          <Skeleton style={{ height: 60, marginTop: 8, borderRadius: 14 }} />
        </>
      )}
      {isError && (
        <Empty
          icon="alert"
          title="코스 정보를 불러오지 못했어요."
          message="잠시 후 다시 시도해 주세요."
        />
      )}
      {course && (
        <>
          <div className="stats">
            <div className="stat">
              <p className="stat__key">추천 순위</p>
              <p className="stat__val">{course.rank}순위</p>
            </div>
            <div className="stat">
              <p className="stat__key">총 소요시간</p>
              <p className="stat__val">
                {fmtDuration(course.estimatedDurationMinutes)}
              </p>
            </div>
          </div>
          <div className="steps">
            {course.components.map((comp, i) => (
              <div className="step" key={comp.sequence}>
                <span className="step__no">{comp.sequence}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="step__name">{comp.name}</span>
                  <span className="step__meta">
                    {categoryLabel(comp.category)} ·{" "}
                    {i === 0 ? "출발지에서 " : "이전 장소에서 "}
                    {comp.travelMinutes ?? 0}분 이동
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
