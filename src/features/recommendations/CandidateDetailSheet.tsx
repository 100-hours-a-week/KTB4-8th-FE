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
import {
  distanceMeters,
  fmtDate,
  fmtDistance,
  fmtDuration,
  fmtHm,
} from "@/lib/format";
import { useAddWishlistCourse } from "@/features/wishlist/queries";
import { naverMapCourseStopUrl } from "@/features/wishlist/format";
import {
  openNaverCourseRoute,
  toRoutePoint,
} from "@/features/wishlist/naverRoute";
import { useAddCourseItem } from "./queries";
import { FitZoom } from "./FitZoom";
import { OriginSwitch } from "./OriginSwitch";
import { useWalkingRoute } from "./walkingRoute";
import { hasOriginCoordinates, type Origin, type Slots } from "./courseStore";
import type { Candidate } from "@/types/api";

/* 코스 상세 — 지도 + 통계 + 이동 순서 타임라인 + "이 코스 추가하기".
   지도(네이버 지도)는 서버에서 절대 실행되면 안 되므로 next/dynamic({ ssr: false }) 으로만 불러온다. */
const CourseMap = dynamic(
  () => import("./CourseMap").then((m) => m.CourseMap),
  {
    ssr: false,
    // 지도 코드를 받는 동안 빈 칸 대신 지도 자리를 미리 잡아 두어 화면이 밀리지 않게 한다
    loading: () => (
      <div className="route route--live route--skeleton" aria-hidden="true" />
    ),
  },
);

interface CandidateDetailSheetProps {
  candidate: Candidate;
  slots: Slots;
  /** 사용자가 정한 출발지 — 있으면 지도와 이동 순서 맨 앞에 "출발"로 보여 준다 */
  origin?: Origin | null;
  onClose: () => void;
  onBack: () => void;
  onAdded: (course: Candidate, itemId: string) => void;
}

export function CandidateDetailSheet({
  candidate,
  slots,
  origin,
  onClose,
  onBack,
  onAdded,
}: CandidateDetailSheetProps) {
  const [adding, setAdding] = useState(false);
  // 지도 범위에 출발지까지 넣을지 — 기본은 코스 장소만
  const [includeOrigin, setIncludeOrigin] = useState(false);
  const addItem = useAddCourseItem();
  const addWishlistCourse = useAddWishlistCourse();

  // 길찾기 버튼용 — 장소마다 좌표를 아는 경우에만 만든다
  const routePoints = candidate.components
    .map((c) => toRoutePoint(c.name, c.latitude, c.longitude))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // 출발지 — 좌표를 아는 경우에만(지도 핀 · 첫 장소의 길찾기 출발지)
  const originPoint = hasOriginCoordinates(origin)
    ? toRoutePoint(origin.label, origin.latitude, origin.longitude)
    : null;

  // 장소 사이의 도보 경로(못 받으면 null — 지도는 직선 점선으로 대신한다)
  const walkPath = useWalkingRoute(
    candidate.components.map((c) =>
      typeof c.latitude === "number" && typeof c.longitude === "number"
        ? { lat: c.latitude, lng: c.longitude }
        : null,
    ),
  );

  // 출발지에서 첫 장소까지의 직선거리(도로 거리가 아니다)
  const firstPoint = routePoints[0];
  const originDistance =
    originPoint && firstPoint
      ? fmtDistance(distanceMeters(originPoint, firstPoint))
      : "";

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
      autoHideScroll
      onBack={onBack}
      onClose={onClose}
      foot={
        /* 보관함 코스 상세처럼 길찾기가 왼쪽, 주 버튼이 오른쪽 */
        <div className="wl__foot-row">
          {routePoints.length >= 2 && (
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => openNaverCourseRoute(routePoints)}
            >
              <Icon name="route" size={18} />
              <span>길찾기</span>
            </button>
          )}
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
        </div>
      }
    >
      <CourseMap
        components={candidate.components}
        origin={originPoint}
        includeOrigin={includeOrigin}
        walkPath={walkPath}
      />
      {/* 순위 · 소요시간 카드와 이동 순서는 시트 높이에 안 들어가면 글자 · 번호 원 · 간격을 같은 비율로 줄여 스크롤 없이 보이게 한다(FitZoom) */}
      <FitZoom>
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
          {originPoint && (
            <div className="step">
              <span className="step__no step__no--origin">
                <Icon name="pin" size={14} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="step__name">{originPoint.name}</span>
                <span className="step__meta">
                  출발지
                  {originDistance && ` · 직선 ${originDistance}`}
                </span>
              </span>
              <OriginSwitch
                checked={includeOrigin}
                onChange={setIncludeOrigin}
              />
            </div>
          )}
          {candidate.components.map((comp, i) => (
            <div className="step" key={comp.sequence}>
              <span className="step__no">{comp.sequence}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="step__name">
                  {comp.name}
                  {/* 이름 오른쪽 지도 아이콘을 누르면 네이버 지도에서 이 장소를 연다(보관함 코스 상세와 같다) */}
                  <a
                    className="step__maplink"
                    href={naverMapCourseStopUrl(
                      comp.name,
                      candidate.area,
                      comp.type === "EVENT",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${comp.name} 네이버 지도에서 보기`}
                    title="네이버 지도에서 보기"
                  >
                    <Icon name="map" size={15} />
                  </a>
                </span>
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
      </FitZoom>
    </Sheet>
  );
}
