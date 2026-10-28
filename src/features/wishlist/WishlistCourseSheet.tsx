"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { categoryLabel, Empty, Skeleton } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { confirm } from "@/components/ui/Confirm";
import { CATEGORY_BY_LABEL } from "@/lib/api/backend";
import { fmtDuration } from "@/lib/format";
import { courseStopItems, fmtSaveDate } from "./format";
import { useDeleteWishlistCourse, useWishlistCourse } from "./queries";
import type { CandidateComponent } from "@/types/api";

/* 보관한 코스 상세 — BE v2(GET /outing-wishlist/outing-courses/{courseId}).
   코스 추천 결과 화면과 같은 지도 · 통계 · 순서 구성이고, 삭제 버튼이 붙는다.
   BE 는 추천 순위 · 머무름 시간을 내려주지 않아서 그 부분은 보여 주지 않는다.
   장소별 이동시간은 duration_minutes 로 온다(없으면 문구를 뺀다). */
const CourseMap = dynamic(
  () => import("@/features/recommendations/CourseMap").then((m) => m.CourseMap),
  { ssr: false },
);

export interface WishlistCourseSheetProps {
  /** 목록의 course_id */
  courseId: string;
  /** 목록에서 알고 있는 추천 지역 · 저장일 — 상세 응답에는 없다 */
  area?: string | null;
  saveDate?: string | null;
  onClose: () => void;
}

export function WishlistCourseSheet({
  courseId,
  area,
  saveDate,
  onClose,
}: WishlistCourseSheetProps) {
  const {
    data: course,
    isLoading,
    isError,
    error,
  } = useWishlistCourse(courseId);
  const deleteCourse = useDeleteWishlistCourse();

  useEffect(() => {
    if (isError) toast.fromError(error);
  }, [isError, error]);

  // 구성 요소(장소 · 이벤트)를 순서대로 한 줄로 펴고, 지도·목록이 같이 쓰는 모양으로 바꾼다
  const items = courseStopItems(course?.stops).sort(
    (a, b) => a.sequence - b.sequence,
  );
  const components: CandidateComponent[] = items.map((it, i) => ({
    sequence: i + 1,
    guideId: `wl-course-${courseId}-${it.stop_id}`,
    type: it.type === "event" ? "EVENT" : "PLACE",
    name: it.name,
    category: CATEGORY_BY_LABEL[it.category] ?? "ETC",
    latitude: it.coordinate?.lat ?? null,
    longitude: it.coordinate?.lng ?? null,
  }));

  async function handleDelete() {
    const ok = await confirm({
      title: "이 코스를 삭제할까요?",
      message: "삭제한 코스는 복구할 수 없어요.",
      ok: "삭제",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteCourse.mutateAsync(courseId);
      toast.ok("보관함에서 삭제했어요.");
      onClose();
    } catch (err) {
      toast.fromError(err);
    }
  }

  const saved = fmtSaveDate(saveDate);

  return (
    <Sheet
      topAlign
      autoHideScroll
      title={course?.name ?? "코스 정보"}
      sub={
        area ? (
          <span className="cdetail__area">
            <Icon name="pin" size={14} />
            <span>{area}</span>
          </span>
        ) : undefined
      }
      onClose={onClose}
      foot={
        course && (
          <div className="wl__foot">
            {saved && <p className="pdetail__saved">최초 저장일 {saved}</p>}
            <button
              className="btn btn--soft btn--block"
              type="button"
              disabled={deleteCourse.isPending}
              onClick={() => void handleDelete()}
            >
              <Icon name="trash" size={18} />
              <span>보관함에서 삭제</span>
            </button>
          </div>
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
          <CourseMap components={components} />
          <div className="stats">
            <div className="stat">
              <p className="stat__key">구성</p>
              <p className="stat__val">{components.length}곳</p>
            </div>
            <div className="stat">
              <p className="stat__key">총 소요시간</p>
              <p className="stat__val">{fmtDuration(course.duration_hours)}</p>
            </div>
          </div>
          <div className="steps">
            {items.map((it, i) => (
              <div className="step" key={it.stop_id}>
                <span className="step__no">{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="step__name">{it.name}</span>
                  <span className="step__meta">
                    {categoryLabel(components[i].category)}
                    {it.type === "event" && " · 이벤트"}
                    {it.duration_minutes != null &&
                      it.duration_minutes > 0 &&
                      ` · ${i === 0 ? "출발지에서" : "이전 장소에서"} ${it.duration_minutes}분 이동`}
                    {it.is_available === false && " · 지금은 이용할 수 없어요"}
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
