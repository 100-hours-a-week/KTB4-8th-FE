"use client";

import { useEffect, useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { Empty, Skeleton, Thumb } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { CATEGORY_LABEL } from "@/lib/constants";
import { fmtDday, fmtDot, fmtPeriod } from "@/lib/format";
import { useCourseStore } from "@/features/recommendations/courseStore";
import { PlaceDetailSheet } from "@/features/places/PlaceDetailSheet";
import { EventDetailSheet } from "@/features/places/EventDetailSheet";
import { CourseDetailSheet } from "@/features/collections/CourseDetailSheet";
import {
  useCollectionItems,
  type CollectionCourseItem,
  type ItemFilter,
} from "@/features/collections/queries";
import type { CollectionItem, EventItem, Place } from "@/types/api";

/* 07 · 보관함 — 프로토타입 js/pages/collection.js 를 그대로 옮겼다.
   v1은 추천받아 담은 코스 확인이 주 용도라, 장소 · 이벤트 행은 상세 시트를 그대로 재사용한다. */

const TABS: { key: ItemFilter; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "PLACE", label: "장소" },
  { key: "EVENT", label: "이벤트" },
  { key: "COURSE", label: "코스" },
];

type Overlay = { name: "place" | "event" | "course"; id: string } | null;

export default function CollectionPage() {
  const [tab, setTab] = useState<ItemFilter>("ALL");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const openCourse = useCourseStore((s) => s.setOpen);

  const { data, isLoading, isError, error, refetch } = useCollectionItems(tab);

  useEffect(() => {
    if (isError) toast.fromError(error, { onRetry: () => void refetch() });
  }, [isError, error, refetch]);

  const rows = data ?? [];

  function openRow(row: CollectionItem) {
    const name =
      row.itemType === "COURSE"
        ? "course"
        : row.itemType === "EVENT"
          ? "event"
          : "place";
    setOverlay({ name, id: row.itemId });
  }

  return (
    <>
      <AppBar back title="보관함" />

      <div style={{ padding: "0 var(--s-5)" }}>
        <div className="seg">
          {TABS.map((t) => (
            <button
              key={t.key}
              className="chip"
              type="button"
              aria-pressed={tab === t.key}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll scroll--pad">
        {isLoading && (
          <>
            <Skeleton
              style={{ height: 82, marginBottom: 8, borderRadius: 18 }}
            />
            <Skeleton
              style={{ height: 82, marginBottom: 8, borderRadius: 18 }}
            />
            <Skeleton style={{ height: 82, borderRadius: 18 }} />
          </>
        )}
        {!isLoading && isError && (
          <Empty
            icon="alert"
            title="목록을 불러오지 못했어요."
            message="잠시 후 다시 시도해 주세요."
          />
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <Empty
            icon="bookmark"
            title="보관한 항목이 없어요."
            message="코스 추천을 받고 마음에 드는 코스를 추가해 보세요."
            actions={
              <button
                className="btn btn--block"
                type="button"
                onClick={() => openCourse(true)}
              >
                코스 추천받기
              </button>
            }
          />
        )}
        {!isLoading && !isError && rows.length > 0 && (
          <div className="stagger">
            {rows.map((row) => (
              <CollectionRow
                key={row.id}
                row={row}
                onOpen={() => openRow(row)}
              />
            ))}
          </div>
        )}
      </div>

      {overlay?.name === "place" && (
        <PlaceDetailSheet
          placeId={overlay.id}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "event" && (
        <EventDetailSheet
          eventId={overlay.id}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "course" && (
        <CourseDetailSheet
          courseId={overlay.id}
          onClose={() => setOverlay(null)}
        />
      )}
    </>
  );
}

/** 보관함 한 행 — 프로토타입 js/components/cards.js 의 listItem() 을 그대로 옮겼다.
    아이콘/썸네일이 46px로 같은 크기를 쓰도록 코스 행도 thumb--sq 와 같은 .listitem__ico 를 쓴다. */
function CollectionRow({
  row,
  onOpen,
}: {
  row: CollectionItem;
  onOpen: () => void;
}) {
  if (row.itemType === "COURSE") {
    // 명세의 CourseSummary 에는 components 가 없지만 실제 응답엔 경로 표시용으로 들어있다(백엔드 확인 필요)
    const course = row.item as CollectionCourseItem | undefined;
    const names = (course?.components ?? []).map((c) => c.name).join(" → ");
    return (
      <button className="listitem press" type="button" onClick={onOpen}>
        <span className="listitem__ico">
          <Icon name="route" size={22} />
        </span>
        <div className="listitem__body">
          <p className="listitem__name">{course?.name ?? ""}</p>
          <p className="listitem__meta">{names}</p>
          <p className="listitem__sub">
            {course?.rank ?? "-"}순위 · 총 이동{" "}
            {course?.totalTravelMinutes ?? 0}분 ·{" "}
            {fmtDot(new Date(row.createdAt))} 저장
          </p>
        </div>
        <span style={{ color: "var(--ink-4)" }}>
          <Icon name="chevron" size={16} />
        </span>
      </button>
    );
  }

  const item = row.item as Place | EventItem | undefined;
  const meta = [item ? CATEGORY_LABEL[item.category] : "", item?.region]
    .filter(Boolean)
    .join(" · ");

  let sub = "";
  if (row.itemType === "EVENT" && item) {
    const ev = item as EventItem;
    const dday = fmtDday(ev.endAt);
    sub = fmtPeriod(ev.startAt, ev.endAt) + (dday ? ` · ${dday}` : "");
  } else if (item) {
    sub = (item as Place).description || "";
  }

  return (
    <button className="listitem press" type="button" onClick={onOpen}>
      <Thumb className="thumb--sq" category={item?.category} />
      <div className="listitem__body">
        <p className="listitem__name">{item?.name ?? ""}</p>
        <p className="listitem__meta">{meta}</p>
        <p className="listitem__sub">{sub}</p>
      </div>
    </button>
  );
}
