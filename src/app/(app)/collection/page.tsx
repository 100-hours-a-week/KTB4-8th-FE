"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { Empty, Skeleton, Spinner, Thumb } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { CATEGORY_LABEL, WISHLIST_V2 } from "@/lib/constants";
import {
  courseTime,
  fmtDot,
  fmtDuration,
  fmtPeriod,
  getDdayBadge,
  type DdayLevel,
} from "@/lib/format";
import { useCourseStore } from "@/features/recommendations/courseStore";
import { PlaceDetailSheet } from "@/features/places/PlaceDetailSheet";
import { EventDetailSheet } from "@/features/places/EventDetailSheet";
import { CourseDetailSheet } from "@/features/collections/CourseDetailSheet";
import { WishlistDetailSheet } from "@/features/wishlist/WishlistDetailSheet";
import { WishlistCourseSheet } from "@/features/wishlist/WishlistCourseSheet";
import { HOME_DUMMY_EVENTS } from "@/features/home/dummyEvents";
import { HOME_DUMMY_PLACES } from "@/features/home/dummyPlaces";
import { useSavedHomeItems } from "@/features/home/savedHomeItems";
import {
  useWishlistCourses,
  useWishlistEvents,
  useWishlistPlaces,
} from "@/features/wishlist/queries";
import {
  daysUntilStart,
  ddayOf,
  describePeriod,
  eventStatus,
  fmtSaveDate,
  splitCategories,
  primaryCategory,
} from "@/features/wishlist/format";
import { EventFilterSheet } from "@/features/wishlist/EventFilterSheet";
import { resolveItemEmoji } from "@/features/wishlist/itemEmoji";
import {
  eventFacts,
  filterLabel,
  matchesEvent,
  NO_FILTER,
  courseFacts,
  placeCategoryOptions,
  placeFacts,
  regionOptions,
  type EventFilter,
  type StatusFilter,
} from "@/features/wishlist/eventFilter";
import type {
  WishlistCourseSummary,
  WishlistEventSummary,
  WishlistExtra,
  WishlistPlaceSummary,
} from "@/features/wishlist/types";
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

type Overlay = {
  name:
    | "place"
    | "event"
    | "course"
    | "wishlistPlace"
    | "wishlistEvent"
    | "wishlistCourse"
    | "eventFilter"
    | "placeFilter"
    | "courseFilter"
    | "homeEvent"
    | "homePlace";
  id: string;
} | null;

/** URL 의 ?tab= 값이 유효한 탭이면 그 탭을, 아니면 "전체"를 돌려준다 */
function parseTab(value: string | null): ItemFilter {
  const upper = value?.toUpperCase();
  return TABS.find((t) => t.key === upper)?.key ?? "ALL";
}

/* useSearchParams 는 Suspense 경계 안에서만 써야 정적 빌드가 깨지지 않는다 */
export default function CollectionPage() {
  return (
    <Suspense fallback={null}>
      <CollectionContent />
    </Suspense>
  );
}

function CollectionContent() {
  const tabParam = useSearchParams().get("tab");
  const [tab, setTab] = useState<ItemFilter>(() => parseTab(tabParam));
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [filter, setFilter] = useState<EventFilter>(NO_FILTER);
  const [placeFilter, setPlaceFilter] = useState<EventFilter>(NO_FILTER);
  const [courseFilter, setCourseFilter] = useState<EventFilter>(NO_FILTER);
  const openCourse = useCourseStore((s) => s.setOpen);

  // 이미 보관함에 있는 상태에서 ?tab= 만 바뀌어 들어와도(예: 코스 추천 완료 → 보관함에서 확인하기) 탭을 맞춘다.
  // (렌더 중 상태 조정 패턴: https://react.dev/learn/you-might-not-need-an-effect)
  const [prevTabParam, setPrevTabParam] = useState(tabParam);
  if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam);
    setTab(parseTab(tabParam));
  }

  /* WISHLIST_V2 가 켜져 있으면 장소 · 이벤트 · 코스를 BE v2 보관함에서 가져온다.
     (홈에서 담은 예시 장소 · 이벤트와, 이벤트의 기존 로컬 항목은 함께 보여 준다) */
  const showsPlaces = WISHLIST_V2 && (tab === "ALL" || tab === "PLACE");
  const placesOnly = WISHLIST_V2 && tab === "PLACE";
  const showsCourses = WISHLIST_V2 && (tab === "ALL" || tab === "COURSE");
  const coursesOnly = WISHLIST_V2 && tab === "COURSE";
  const items = useCollectionItems(tab, !placesOnly && !coursesOnly);
  const wishlist = useWishlistPlaces(showsPlaces);
  const wishlistCoursesQuery = useWishlistCourses(showsCourses);
  // 이벤트는 BE 보관함 이벤트를 위에, 기존 예시 이벤트를 그 아래에 함께 보여준다
  const showsEvents = WISHLIST_V2 && (tab === "ALL" || tab === "EVENT");
  const wishlistEventsQuery = useWishlistEvents(showsEvents);

  const localOnly = !placesOnly && !coursesOnly;
  const isLoading =
    (localOnly && items.isLoading) ||
    (showsPlaces && wishlist.isLoading) ||
    (showsEvents && wishlistEventsQuery.isLoading) ||
    (showsCourses && wishlistCoursesQuery.isLoading);
  const isError =
    (localOnly && items.isError) ||
    (showsPlaces && wishlist.isError) ||
    (showsEvents && wishlistEventsQuery.isError) ||
    (showsCourses && wishlistCoursesQuery.isError);
  // 목록이 아예 안 떴을 때만 오류 화면으로 바꾼다 — 다음 페이지를 불러오다 실패한 건 이미 받은 목록을 지우지 않고 아래의 "다시 불러오기"로 다룬다
  const loadFailed =
    (localOnly && items.isError) ||
    (showsPlaces && wishlist.isError && !wishlist.data) ||
    (showsEvents && wishlistEventsQuery.isError && !wishlistEventsQuery.data) ||
    (showsCourses &&
      wishlistCoursesQuery.isError &&
      !wishlistCoursesQuery.data);
  const error =
    items.error ??
    wishlist.error ??
    wishlistEventsQuery.error ??
    wishlistCoursesQuery.error;

  useEffect(() => {
    if (isError)
      toast.fromError(error, {
        onRetry: () => {
          if (localOnly) void items.refetch();
          if (showsPlaces) void wishlist.refetch();
          if (showsEvents) void wishlistEventsQuery.refetch();
          if (showsCourses) void wishlistCoursesQuery.refetch();
        },
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, error]);

  const wishlistPlaces: WishlistPlaceSummary[] = showsPlaces
    ? (wishlist.data?.pages.flatMap((p) => p.places) ?? [])
    : [];
  const wishlistEvents: WishlistEventSummary[] = showsEvents
    ? (wishlistEventsQuery.data?.pages.flatMap((p) => p.events) ?? [])
    : [];
  const wishlistCourses: WishlistCourseSummary[] = showsCourses
    ? (wishlistCoursesQuery.data?.pages.flatMap((p) => p.courses) ?? [])
    : [];
  // 홈에서 담은 이벤트(FE 더미) — 최근에 담은 것이 위. BE 보관함에 같은 이름이 있으면 BE 쪽만 보여 준다
  const homeSaved = useSavedHomeItems().saved;
  const beEventNames = new Set(wishlistEvents.map((e) => e.name));
  const savedHomeEventList =
    tab === "ALL" || tab === "EVENT"
      ? HOME_DUMMY_EVENTS.filter(
          (e) => e.id in homeSaved && !beEventNames.has(e.name),
        ).sort((a, b) => homeSaved[b.id].localeCompare(homeSaved[a.id]))
      : [];
  const bePlaceNames = new Set(wishlistPlaces.map((p) => p.name));
  const savedHomePlaces =
    tab === "ALL" || tab === "PLACE"
      ? HOME_DUMMY_PLACES.filter(
          (p) => p.id in homeSaved && !bePlaceNames.has(p.name),
        ).sort((a, b) => homeSaved[b.id].localeCompare(homeSaved[a.id]))
      : [];
  const wishlistCount =
    wishlistPlaces.length +
    wishlistEvents.length +
    wishlistCourses.length +
    savedHomeEventList.length +
    savedHomePlaces.length;
  // WISHLIST_V2 가 켜져 있으면 장소 · 코스는 BE 에서 오므로 브라우저 더미 항목은 숨긴다
  const otherRows = (items.data ?? []).filter(
    (r) =>
      !(WISHLIST_V2 && (r.itemType === "PLACE" || r.itemType === "COURSE")),
  );
  const rows = placesOnly || coursesOnly ? [] : otherRows;

  /* 이벤트 탭의 필터(진행 상태 · 카테고리 · 지역) — BE 항목 · 예시 이벤트를 같은 기준으로 거른다 */
  const filtering = tab === "EVENT";
  const homeFacts = (e: (typeof HOME_DUMMY_EVENTS)[number]) =>
    eventFacts(e.category, e.address_sg, e.start_date, e.end_date);
  const beFacts = (e: WishlistEventSummary) =>
    eventFacts(e.category, e.place?.address_sg, e.start_date, e.end_date);
  const rowFacts = (r: CollectionItem) => {
    const ev = r.item as EventItem | undefined;
    return eventFacts(
      ev ? CATEGORY_LABEL[ev.category] : "",
      ev?.region,
      ev?.startAt,
      ev?.endAt,
    );
  };
  const isEventRow = (r: CollectionItem) => r.itemType === "EVENT" && !!r.item;

  /* 장소 탭의 필터(카테고리 · 지역) — BE 장소 · 예시 장소를 같은 기준으로 거른다 */
  const placeFiltering = tab === "PLACE";
  const homePlaceFacts = (p: (typeof HOME_DUMMY_PLACES)[number]) =>
    placeFacts(p.category, p.address_sg);
  const bePlaceFacts = (p: WishlistPlaceSummary) =>
    placeFacts(p.category, p.address_sg);
  const rowPlaceFacts = (r: CollectionItem) => {
    const pl = r.item as Place | undefined;
    return placeFacts(pl ? CATEGORY_LABEL[pl.category] : "", pl?.region);
  };
  const isPlaceRow = (r: CollectionItem) => r.itemType === "PLACE" && !!r.item;
  const allPlaceFacts = [
    ...savedHomePlaces.map(homePlaceFacts),
    ...wishlistPlaces.map(bePlaceFacts),
    ...rows.filter(isPlaceRow).map(rowPlaceFacts),
  ];
  const placeRegions = regionOptions(allPlaceFacts);
  const placeCategories = placeCategoryOptions(allPlaceFacts);
  const passPlace = (facts: ReturnType<typeof placeFacts>) =>
    !placeFiltering || matchesEvent(facts, placeFilter);
  /* 코스 탭의 필터(지역) — 코스에는 분류가 없어 지역만 거른다 */
  const courseFiltering = tab === "COURSE";
  const rowCourseFacts = (r: CollectionItem) =>
    courseFacts((r.item as CollectionCourseItem | undefined)?.area);
  const isCourseRow = (r: CollectionItem) =>
    r.itemType === "COURSE" && !!r.item;
  const beCourseFacts = (c: WishlistCourseSummary) => courseFacts(c.address_sg);
  const courseRegions = regionOptions([
    ...rows.filter(isCourseRow).map(rowCourseFacts),
    ...wishlistCourses.map(beCourseFacts),
  ]);
  const passCourse = (facts: ReturnType<typeof courseFacts>) =>
    !courseFiltering || matchesEvent(facts, courseFilter);
  const shownHomePlaces = savedHomePlaces.filter((p) =>
    passPlace(homePlaceFacts(p)),
  );
  const shownWishlistPlaces = wishlistPlaces.filter((p) =>
    passPlace(bePlaceFacts(p)),
  );
  const shownWishlistCourses = wishlistCourses.filter((c) =>
    passCourse(beCourseFacts(c)),
  );
  const regions = regionOptions([
    ...savedHomeEventList.map(homeFacts),
    ...wishlistEvents.map(beFacts),
    ...rows.filter(isEventRow).map(rowFacts),
  ]);
  const pass = (facts: ReturnType<typeof eventFacts>) =>
    !filtering || matchesEvent(facts, filter);
  const shownHomeEvents = savedHomeEventList.filter((e) => pass(homeFacts(e)));
  const shownWishlistEvents = wishlistEvents.filter((e) => pass(beFacts(e)));
  const shownRows = rows.filter(
    (r) =>
      (!isEventRow(r) || pass(rowFacts(r))) &&
      (!isPlaceRow(r) || passPlace(rowPlaceFacts(r))) &&
      (!isCourseRow(r) || passCourse(rowCourseFacts(r))),
  );
  const visibleCount =
    shownHomePlaces.length +
    shownWishlistPlaces.length +
    shownHomeEvents.length +
    shownWishlistEvents.length +
    shownWishlistCourses.length +
    shownRows.length;
  const hasAny = rows.length + wishlistCount > 0;

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
        {filtering && hasAny && !isLoading && (
          <EventFilterBar
            filter={filter}
            onStatus={(status) => setFilter((f) => ({ ...f, status }))}
            onOpen={() => setOverlay({ name: "eventFilter", id: "" })}
          />
        )}
        {courseFiltering && hasAny && !isLoading && (
          <div className="evf__row evf__row--end">
            <FilterButton
              filter={courseFilter}
              placeholder="지역"
              onOpen={() => setOverlay({ name: "courseFilter", id: "" })}
            />
          </div>
        )}
        {placeFiltering && hasAny && !isLoading && (
          <div className="evf__row evf__row--end">
            <FilterButton
              filter={placeFilter}
              onOpen={() => setOverlay({ name: "placeFilter", id: "" })}
            />
          </div>
        )}
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
        {!isLoading && loadFailed && (
          <Empty
            icon="alert"
            title="목록을 불러오지 못했어요."
            message="잠시 후 다시 시도해 주세요."
          />
        )}
        {!isLoading && !loadFailed && !hasAny && (
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
        {!isLoading && !loadFailed && hasAny && visibleCount === 0 && (
          <Empty
            icon="search"
            title={`조건에 맞는 ${courseFiltering ? "코스가" : placeFiltering ? "장소가" : "이벤트가"} 없어요.`}
            message="필터를 바꾸거나 초기화해 보세요."
            actions={
              <button
                className="btn btn--ghost btn--block"
                type="button"
                onClick={() =>
                  courseFiltering
                    ? setCourseFilter(NO_FILTER)
                    : placeFiltering
                      ? setPlaceFilter(NO_FILTER)
                      : setFilter(NO_FILTER)
                }
              >
                필터 초기화
              </button>
            }
          />
        )}
        {!isLoading && !loadFailed && visibleCount > 0 && (
          <div>
            {shownHomePlaces.map((p) => (
              <WishlistRow
                key={`home-${p.id}`}
                name={p.name}
                category={p.category}
                addressSg={p.address_sg}
                sub={p.description}
                emoji={wishlistEmoji({
                  name: p.name,
                  description: p.description,
                  extra: p.extra,
                })}
                onOpen={() => setOverlay({ name: "homePlace", id: p.id })}
              />
            ))}
            {shownWishlistPlaces.map((p) => (
              <WishlistRow
                key={`wl-${p.place_id}`}
                name={p.name}
                category={p.category}
                addressSg={p.address_sg}
                sub={p.description || ""}
                emoji={wishlistEmoji(p)}
                onOpen={() =>
                  setOverlay({ name: "wishlistPlace", id: String(p.place_id) })
                }
              />
            ))}
            {showsPlaces && (
              <AutoLoadMore
                hasNext={wishlist.hasNextPage}
                fetching={wishlist.isFetchingNextPage}
                failed={wishlist.isFetchNextPageError}
                onLoad={() => void wishlist.fetchNextPage()}
              />
            )}
            {shownHomeEvents.map((e) => {
              const period = describePeriod(e.start_date, e.end_date);
              const opensIn = daysUntilStart(e.start_date);
              return (
                <WishlistRow
                  key={`home-${e.id}`}
                  name={e.name}
                  category={e.category}
                  addressSg={e.address_sg}
                  sub={period?.text ?? ""}
                  dday={ddayOf(e.end_date)}
                  ended={eventStatus(e.start_date, e.end_date) === "ended"}
                  opensIn={opensIn}
                  emoji={wishlistEmoji({
                    name: e.name,
                    description: e.description,
                    extra: e.extra,
                  })}
                  onOpen={() => setOverlay({ name: "homeEvent", id: e.id })}
                />
              );
            })}
            {shownWishlistEvents.map((e) => {
              const period = describePeriod(e.start_date, e.end_date);
              return (
                <WishlistRow
                  key={`wle-${e.event_id}`}
                  name={e.name}
                  category={e.category}
                  addressSg={e.place?.address_sg ?? ""}
                  sub={period?.text ?? ""}
                  dday={ddayOf(e.end_date)}
                  opensIn={daysUntilStart(e.start_date)}
                  ended={eventStatus(e.start_date, e.end_date) === "ended"}
                  emoji={wishlistEmoji(e)}
                  onOpen={() =>
                    setOverlay({
                      name: "wishlistEvent",
                      id: String(e.event_id),
                    })
                  }
                />
              );
            })}
            {showsEvents && (
              <AutoLoadMore
                hasNext={wishlistEventsQuery.hasNextPage}
                fetching={wishlistEventsQuery.isFetchingNextPage}
                failed={wishlistEventsQuery.isFetchNextPageError}
                onLoad={() => void wishlistEventsQuery.fetchNextPage()}
              />
            )}
            {shownWishlistCourses.map((c) => (
              <WishlistCourseRow
                key={`wlc-${c.course_id}`}
                course={c}
                onOpen={() =>
                  setOverlay({
                    name: "wishlistCourse",
                    id: String(c.course_id),
                  })
                }
              />
            ))}
            {showsCourses && (
              <AutoLoadMore
                hasNext={wishlistCoursesQuery.hasNextPage}
                fetching={wishlistCoursesQuery.isFetchingNextPage}
                failed={wishlistCoursesQuery.isFetchNextPageError}
                onLoad={() => void wishlistCoursesQuery.fetchNextPage()}
              />
            )}
            {shownRows.map((row) => (
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
      {(overlay?.name === "wishlistPlace" ||
        overlay?.name === "wishlistEvent") && (
        <WishlistDetailSheet
          kind={overlay.name === "wishlistEvent" ? "event" : "place"}
          id={overlay.id}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "homePlace" && (
        <WishlistDetailSheet
          kind="place"
          id={overlay.id}
          preset={HOME_DUMMY_PLACES.find((p) => p.id === overlay.id)}
          removeClosesSheet
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "homeEvent" && (
        <WishlistDetailSheet
          kind="event"
          id={overlay.id}
          preset={HOME_DUMMY_EVENTS.find((e) => e.id === overlay.id)}
          removeClosesSheet
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "eventFilter" && (
        <EventFilterSheet
          value={filter}
          regions={regions}
          onApply={(next) => setFilter((f) => ({ ...f, ...next }))}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "courseFilter" && (
        <EventFilterSheet
          value={courseFilter}
          categories={[]}
          title="지역"
          regions={courseRegions}
          onApply={(next) => setCourseFilter((f) => ({ ...f, ...next }))}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "placeFilter" && (
        <EventFilterSheet
          value={placeFilter}
          categories={placeCategories}
          regions={placeRegions}
          onApply={(next) => setPlaceFilter((f) => ({ ...f, ...next }))}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "event" && (
        <EventDetailSheet
          eventId={overlay.id}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.name === "wishlistCourse" && (
        <WishlistCourseSheet
          courseId={overlay.id}
          area={
            wishlistCourses.find((c) => String(c.course_id) === overlay.id)
              ?.address_sg
          }
          saveDate={
            wishlistCourses.find((c) => String(c.course_id) === overlay.id)
              ?.save_date
          }
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

/** 목록 끝에 닿으면 다음 페이지를 자동으로 불러온다(스크롤하면 이어서 나온다).
    불러오다 실패하면 같은 요청이 계속 반복되지 않게 멈추고 "다시 불러오기" 버튼을 보여 준다. */
function AutoLoadMore({
  hasNext,
  fetching,
  failed,
  onLoad,
}: {
  hasNext: boolean;
  fetching: boolean;
  failed: boolean;
  onLoad: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const loadRef = useRef(onLoad);
  useEffect(() => {
    loadRef.current = onLoad;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNext || fetching || failed) return;
    // 바닥에서 조금 떨어져 있을 때 미리 불러와서, 스크롤이 끊기지 않게 한다
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadRef.current();
      },
      { rootMargin: "240px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNext, fetching, failed]);

  if (!hasNext) return null;
  if (failed) {
    return (
      <button
        className="btn btn--ghost btn--block"
        type="button"
        onClick={onLoad}
        style={{ marginBottom: 8 }}
      >
        다시 불러오기
      </button>
    );
  }
  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        height: 48,
        display: "grid",
        placeItems: "center",
        marginBottom: 8,
      }}
    >
      {fetching && <Spinner />}
    </div>
  );
}

/** BE v2 보관함의 코스 한 행 — 구성 요소 이름을 "A → B → C" 로 보여 준다 */
function WishlistCourseRow({
  course,
  onOpen,
}: {
  course: WishlistCourseSummary;
  onOpen: () => void;
}) {
  const names = course.stops
    .flatMap((s) => s.items)
    .sort((a, b) => a.sequence - b.sequence)
    .map((i) => i.name)
    .join(" → ");
  const saved = fmtSaveDate(course.save_date);
  const sub = [
    course.duration_hours != null
      ? `총 소요 ${fmtDuration(course.duration_hours)}`
      : "",
    saved ? `${saved} 저장` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <button className="listitem press" type="button" onClick={onOpen}>
      <span className="listitem__ico">
        <Icon name="route" size={22} />
      </span>
      <div className="listitem__body">
        <p className="listitem__name">{course.name}</p>
        <p className="listitem__meta">{names}</p>
        {sub && <p className="listitem__sub">{sub}</p>}
      </div>
      <span style={{ color: "var(--ink-4)" }}>
        <Icon name="chevron" size={16} />
      </span>
    </button>
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
            {course?.rank ?? "-"}순위 · 총 {courseTime(course ?? {}).kind}{" "}
            {courseTime(course ?? {}).text} · {fmtDot(new Date(row.savedAt))}{" "}
            저장
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
  let dday: ReturnType<typeof getDdayBadge> = null;
  let ended = false;
  let opensIn: number | null = null;
  if (row.itemType === "EVENT" && item) {
    const ev = item as EventItem;
    sub = fmtPeriod(ev.startAt, ev.endAt);
    dday = getDdayBadge(ev.endAt);
    ended = eventStatus(ev.startAt, ev.endAt) === "ended";
    opensIn = daysUntilStart(ev.startAt);
  } else if (item) {
    sub = (item as Place).description || "";
  }

  return (
    <button className="listitem press" type="button" onClick={onOpen}>
      <Thumb
        className="thumb--sq"
        category={item?.category}
        glyph={item ? resolveItemEmoji(item) : null}
      />
      <div className="listitem__body">
        <p className="listitem__name">{item?.name ?? ""}</p>
        <p className="listitem__meta">{meta}</p>
        <ListSub sub={sub} dday={dday} ended={ended} opensIn={opensIn} />
      </div>
    </button>
  );
}

/** 목록 항목 맨 아래 줄 — 왼쪽에 부가 설명, 오른쪽 끝에 D-N 배지 */
function ListSub({
  sub,
  dday,
  ended,
  opensIn,
}: {
  sub: string;
  dday: { label: string; level: DdayLevel } | null;
  /** 기간이 끝난 이벤트 — D-N 대신 회색 "종료" 배지 */
  ended?: boolean;
  /** 아직 열리지 않은 이벤트가 열리기까지 남은 날 — 오픈 전에는 종료일 D-N 대신 "OPEN D-N" 배지, 오픈 당일부터는 D-N */
  opensIn?: number | null;
}) {
  if (!dday && !ended && opensIn == null)
    return <p className="listitem__sub">{sub}</p>;
  return (
    <p className="listitem__sub listitem__sub--row">
      <span>{sub}</span>
      {opensIn != null ? (
        <span className="dday dday--upcoming">OPEN D-{opensIn}</span>
      ) : dday ? (
        <span className={`dday dday--${dday.level}`}>{dday.label}</span>
      ) : (
        <span className="dday dday--ended">종료</span>
      )}
    </p>
  );
}

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "ONGOING", label: "진행중" },
  { key: "ENDED", label: "종료" },
];

/** "카테고리 · 지역" 필터 버튼 — 고르면 "팝업 · 성동구"처럼 고른 값이 버튼에 표시된다(이벤트 · 장소 탭 공통) */
function FilterButton({
  filter,
  placeholder = "카테고리 · 지역",
  onOpen,
}: {
  filter: EventFilter;
  placeholder?: string;
  onOpen: () => void;
}) {
  const label = filterLabel(filter);
  return (
    <button
      className={`evf__btn${label ? " is-on" : ""}`}
      type="button"
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <Icon name="sliders" size={15} />
      <span>{label || placeholder}</span>
      <Icon name="chevronDown" size={14} />
    </button>
  );
}

/** 이벤트 탭 필터 줄 — 왼쪽은 진행 상태 칩, 오른쪽은 카테고리 · 지역을 고르는 버튼(고르면 "팝업 · 성동구"처럼 표시) */
function EventFilterBar({
  filter,
  onStatus,
  onOpen,
}: {
  filter: EventFilter;
  onStatus: (status: StatusFilter) => void;
  onOpen: () => void;
}) {
  return (
    <div className="evf__row">
      <div className="evf__chips" role="group" aria-label="진행 상태">
        {STATUS_CHIPS.map((c) => (
          <button
            key={c.key}
            className="evf__chip"
            type="button"
            aria-pressed={filter.status === c.key}
            onClick={() => onStatus(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <FilterButton filter={filter} onOpen={onOpen} />
    </div>
  );
}

/** BE v2 보관함의 장소·이벤트 한 행 — 사진 없이 대표 카테고리 아이콘(온보딩과 같은 아이콘)으로 표시한다 */
function WishlistRow({
  name,
  category,
  addressSg,
  sub,
  dday,
  ended,
  opensIn,
  emoji,
  onOpen,
}: {
  name: string;
  category: string;
  addressSg: string;
  sub: string;
  dday?: { label: string; level: DdayLevel } | null;
  ended?: boolean;
  /** 열리기까지 남은 날(아직 열리지 않은 이벤트만) */
  opensIn?: number | null;
  /** 이 항목의 특성에 맞춘 이모지(없으면 분류 이모지) */
  emoji?: string | null;
  onOpen: () => void;
}) {
  const cat = primaryCategory(category);
  const meta = [splitCategories(category).join(" · "), addressSg]
    .filter(Boolean)
    .join(" · ");
  return (
    <button className="listitem press" type="button" onClick={onOpen}>
      {cat || emoji ? (
        <Thumb className="thumb--sq" category={cat ?? "ETC"} glyph={emoji} />
      ) : (
        <span className="listitem__ico">
          <Icon name="pin" size={22} />
        </span>
      )}
      <div className="listitem__body">
        <p className="listitem__name">{name}</p>
        <p className="listitem__meta">{meta}</p>
        <ListSub
          sub={sub}
          dday={dday ?? null}
          ended={ended}
          opensIn={opensIn}
        />
      </div>
    </button>
  );
}

/** 보관함(BE) 항목의 이모지 — BE 가 extra 로 정해 준 값이 있으면 그 값, 없으면 제목 · 설명 키워드로 고른다 */
function wishlistEmoji(item: {
  name: string;
  description: string | null;
  extra?: WishlistExtra | null;
}) {
  return resolveItemEmoji({
    name: item.name,
    description: item.description,
    emoji: item.extra?.emoji,
  });
}
