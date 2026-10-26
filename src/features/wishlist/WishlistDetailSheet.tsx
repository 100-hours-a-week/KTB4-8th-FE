"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon, YouTubeMark } from "@/components/ui/Icon";
import { Empty, Skeleton } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { confirm } from "@/components/ui/Confirm";
import {
  useDeleteWishlistEvent,
  useDeleteWishlistPlace,
  useWishlistEvent,
  useWishlistPlace,
} from "./queries";
import {
  daysUntilStart,
  describePeriod,
  eventStatus,
  fmtSaveDate,
  naverMapUrl,
  splitCategories,
  toYoutubeLinks,
} from "./format";
import type { HomeDummyEvent } from "@/features/home/dummyEvents";
import type { HomeDummyPlace } from "@/features/home/dummyPlaces";
import type {
  WishlistEventDetail,
  WishlistExtra,
  WishlistPlaceDetail,
} from "./types";
import { useYoutubeMeta } from "./youtubeMeta";
import { BusinessHours } from "./BusinessHours";
import { useSavedHomeItems } from "@/features/home/savedHomeItems";
import { MICHELIN_EDITION, resolveMichelin } from "./michelin";
import { MichelinMark } from "@/components/ui/MichelinMark";
import { ThemeSection } from "./ThemeSection";
import { groupSchedule, isCurrentWeek, pickDefaultGroup } from "./schedule";

/* 보관한 장소·이벤트 상세(BE v2) — GET /outing-wishlist/places/{placeId} · events/{eventId}.
   BE 가 내려주는 값만 보여준다: 분류 · 이름 · 시군구 · 도로명 주소 · 설명 · 영상 링크 · 저장일(이벤트는 기간도).
   영업시간 · 영상 제목은 BE 에 아직 없어 넣지 않았다. 사진은 쓰지 않는다.
   저장일은 시트를 크게 늘려도 항상 아래에 보이도록 하단 버튼 위(foot)에 둔다.
   주소를 펼치면 시트가 위로 커져 닫기 버튼이 움직이는 문제가 있어서, 접혀 있는 동안 펼친 만큼의 빈 자리를
   YouTube 아래에 미리 잡아 둔다(보이지 않는 같은 모양의 주소 상자). 펼치면 그 자리를 주소 상자가 쓴다.
   영상 목록을 펼친 동안은 이미 내용이 길어 자리를 잡지 않는다. */

export interface WishlistDetailSheetProps {
  kind: "place" | "event";
  /** 보관함 항목 id (place_id / event_id) */
  id: string;
  /** 서버에서 불러오지 않고 FE 에 들어 있는 이벤트 내용으로 보여 줄 때(홈의 이벤트 더미). 아래 버튼은 "보관함에 담기 / 삭제"가 된다. */
  preset?: HomeDummyEvent | HomeDummyPlace;
  /** preset 을 보관함에서 지우면 시트도 닫는다(보관함 화면에서 열었을 때) */
  removeClosesSheet?: boolean;
  onClose: () => void;
}

/** FE 에 들어 있는 장소를 보관함 장소 상세 응답과 같은 모양으로 맞춘다 */
function presetToPlaceDetail(
  p: HomeDummyPlace,
  savedAt: string | null,
): WishlistPlaceDetail {
  return {
    place_id: 0,
    name: p.name,
    category: p.category,
    description: p.description,
    address_sg: p.address_sg,
    address_road: p.address_road || null,
    coordinate: null,
    videos_featured_link: p.video_ids.map(
      (v) => `https://youtube.com/shorts/${v}`,
    ),
    save_date: savedAt ? savedAt.slice(0, 10) : null,
    naver_place_id: p.naver_place_id || null,
    extra: p.extra,
  };
}

/** FE 에 들어 있는 이벤트를 보관함 이벤트 상세 응답과 같은 모양으로 맞춘다 */
function presetToDetail(
  p: HomeDummyEvent,
  savedAt: string | null,
): WishlistEventDetail {
  return {
    event_id: 0,
    name: p.name,
    category: p.category,
    description: p.description,
    videos_featured_link: p.video_ids.map(
      (v) => `https://youtube.com/shorts/${v}`,
    ),
    save_date: savedAt ? savedAt.slice(0, 10) : null,
    start_date: p.start_date,
    end_date: p.end_date,
    place: {
      name: p.place_name || null,
      address_sg: p.address_sg,
      address_road: p.address_road || null,
      coordinate: null,
    },
    naver_place_id: p.naver_place_id || null,
    extra: p.extra,
  };
}

export function WishlistDetailSheet({
  kind,
  id,
  preset,
  removeClosesSheet,
  onClose,
}: WishlistDetailSheetProps) {
  const homeSaved = useSavedHomeItems();
  const presetSavedAt = preset ? (homeSaved.saved[preset.id] ?? null) : null;
  const isEvent = kind === "event";
  const placeQuery = useWishlistPlace(isEvent || preset ? null : id);
  const eventQuery = useWishlistEvent(isEvent && !preset ? id : null);
  const query = isEvent ? eventQuery : placeQuery;
  const isLoading = !preset && query.isLoading;
  const isError = !preset && query.isError;
  const error = query.error;
  const [addressOpen, setAddressOpen] = useState(false);
  // 복사한 주소 줄 — 이 시트를 닫을 때까지 "복사됨 ✓"으로 남긴다(주소를 접었다 펴도 유지)
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [videosOpen, setVideosOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const linksRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);
  const deletePlace = useDeleteWishlistPlace();
  const deleteEvent = useDeleteWishlistEvent();
  const deleteItem = isEvent ? deleteEvent : deletePlace;

  /* 장소 · 이벤트 응답을 같은 모양으로 맞춘다. BE 가 extra 로 준 값(도로명 주소 대체 · 건물 · 이모지 등)이 있으면 덧붙인다 */
  const presetEventDetail = useMemo(
    () =>
      preset && isEvent
        ? presetToDetail(preset as HomeDummyEvent, presetSavedAt)
        : undefined,
    [preset, isEvent, presetSavedAt],
  );
  const presetPlaceDetail = useMemo(
    () =>
      preset && !isEvent
        ? presetToPlaceDetail(preset as HomeDummyPlace, presetSavedAt)
        : undefined,
    [preset, isEvent, presetSavedAt],
  );
  const eventData = presetEventDetail ?? eventQuery.data;
  const placeData = presetPlaceDetail ?? placeQuery.data;
  const raw = isEvent ? eventData : placeData;
  const extra: WishlistExtra | null = raw?.extra ?? null;
  const place = raw
    ? {
        name: raw.name,
        category: raw.category,
        description: raw.description,
        address_sg:
          (isEvent ? eventData?.place?.address_sg : placeData?.address_sg) ??
          "",
        address_road:
          extra?.address_road ??
          (isEvent
            ? (eventData?.place?.address_road ?? null)
            : (placeData?.address_road ?? null)),
        address_detail: extra?.address_detail ?? null,
        videos_featured_link: raw.videos_featured_link,
        save_date: raw.save_date,
        naver_place_id: raw.naver_place_id ?? null,
        // BE 가 장소 이름을 내려주면(실제 서버는 지금 null) 그 값을 보여 준다
        place_name: isEvent ? (eventData?.place?.name ?? null) : null,
      }
    : undefined;
  const startDate = eventData?.start_date;
  const endDate = eventData?.end_date;
  const period = isEvent ? describePeriod(startDate, endDate) : null;

  useEffect(() => {
    if (isError) toast.fromError(error);
  }, [isError, error]);

  /* 영상 · 링크 목록을 펼치면 시트 안쪽이 스크롤돼야 보이는 경우가 있어서, 펼친 목록의 끝이 보이게 자동으로 내린다.
     시트가 커지는 애니메이션이 끝난 뒤의 높이로 계산하려고 한 프레임 기다린다. */
  useEffect(() => {
    const target = videosOpen
      ? videosRef.current
      : linksOpen
        ? linksRef.current
        : null;
    if (!target) return;
    const id = window.setTimeout(
      () => target.scrollIntoView({ block: "end", behavior: "smooth" }),
      60,
    );
    return () => window.clearTimeout(id);
  }, [videosOpen, linksOpen]);

  const status = isEvent ? eventStatus(startDate, endDate) : null;
  // 아직 열리기 전이면 남은 날 수(OPEN D-N). 이때는 마감까지의 D-N 배지를 달지 않는다.
  const opensIn = isEvent ? daysUntilStart(startDate) : null;
  const categories = splitCategories(place?.category);
  const videos = toYoutubeLinks(place?.videos_featured_link);
  // 영상 제목 · 채널 — BE 는 영상 ID 만 저장해서 화면에서 읽는다(조회 전 · 실패면 영상 N + 주소로 대신 보인다)
  const videoMeta =
    useYoutubeMeta(videos.flatMap((v) => (v.id ? [v.id] : []))).data ?? {};
  const unavailableCount = videos.filter(
    (v) => v.id && videoMeta[v.id]?.state === "unavailable",
  ).length;
  // "지도에서 보기"와 장소 이름이 같은 네이버 지도 장소로 연결된다
  const mapHref = place
    ? naverMapUrl(
        extra?.map_query ?? place.name,
        extra?.map_query ? null : place.address_road,
        place.naver_place_id,
      )
    : "";
  // https 주소만 연결한다
  const links = (extra?.links ?? []).filter((l) =>
    l.url.startsWith("https://"),
  );
  const savedAt = fmtSaveDate(place?.save_date);
  // 미쉐린 가이드 서울 선정 — 이름으로 자동 매칭(데이터에 직접 적은 값이 우선). 장소에만 적용한다
  const michelin = isEvent
    ? undefined
    : resolveMichelin(place?.name, extra?.michelin);

  /** 홈 이벤트 더미(preset)를 보관함에 담거나 뺀다. 보관함 화면에서 열었을 때는 지우기 전에 한 번 묻고, 지우면 시트를 닫는다. */
  async function handleTogglePreset(p: HomeDummyEvent | HomeDummyPlace) {
    if (!presetSavedAt) {
      homeSaved.toggle(p.id);
      toast.ok("보관함에 담았어요.", "저장 완료");
      return;
    }
    if (removeClosesSheet) {
      const ok = await confirm({
        title: "보관함에서 삭제할까요?",
        message: `삭제하면 이 ${isEvent ? "이벤트가" : "장소가"} 보관함에서 사라집니다.`,
        ok: "삭제",
        danger: true,
      });
      if (!ok) return;
    }
    homeSaved.remove(p.id);
    toast.info("보관함에서 삭제했어요.");
    if (removeClosesSheet) onClose();
  }

  async function handleDelete() {
    if (!place) return;
    const ok = await confirm({
      title: "보관함에서 삭제할까요?",
      message: (
        <>
          삭제하면 이 {isEvent ? "이벤트가" : "장소가"} 보관함에서 사라집니다.
          <span className="modal__sub">
            삭제한 내용은 다시 복구할 수 없어요.
          </span>
        </>
      ),
      ok: "삭제",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteItem.mutateAsync(id);
      toast.info("보관함에서 삭제했어요.");
      onClose();
    } catch (err) {
      toast.fromError(err);
    }
  }

  /** 클립보드에 복사한다. 성공 여부만 돌려주고, 안내는 버튼 글자("복사됨 ✓")가 맡는다.
      안드로이드 13 이상은 시스템이 "클립보드에 복사되었어요"를 직접 띄워서, 앱 토스트까지 띄우면 두 개가 겹친다. */
  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      toast.error("복사하지 못했어요.");
      return false;
    }
  }

  return (
    <Sheet
      title={isEvent ? "이벤트 정보" : "장소 정보"}
      autoHideScroll
      compact
      tall
      expandable
      onClose={onClose}
      foot={
        place && (
          <div className="wl__foot">
            {savedAt && <p className="pdetail__saved">최초 저장일 {savedAt}</p>}
            <div className="pdetail__actions">
              <a
                className="btn btn--ghost"
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="map" size={18} />
                <span>지도에서 보기</span>
              </a>
              {preset && (
                <button
                  className="btn btn--soft"
                  type="button"
                  onClick={() => void handleTogglePreset(preset)}
                >
                  <Icon name={presetSavedAt ? "trash" : "bookmark"} size={18} />
                  <span>
                    {presetSavedAt ? "보관함에서 삭제" : "보관함에 담기"}
                  </span>
                </button>
              )}
              {!preset && (
                <button
                  className="btn btn--soft"
                  type="button"
                  disabled={deleteItem.isPending}
                  onClick={() => void handleDelete()}
                >
                  <Icon name="trash" size={18} />
                  <span>보관함에서 삭제</span>
                </button>
              )}
            </div>
          </div>
        )
      }
    >
      {isLoading && (
        <>
          <Skeleton style={{ height: 24, width: "40%" }} />
          <Skeleton style={{ height: 26, width: "70%", marginTop: 12 }} />
          <Skeleton style={{ height: 14, width: "35%", marginTop: 10 }} />
        </>
      )}
      {isError && (
        <Empty
          icon="alert"
          title={`${isEvent ? "이벤트" : "장소"} 정보를 불러오지 못했어요.`}
          message="잠시 후 다시 시도해 주세요."
        />
      )}
      {place && (
        <>
          {categories.length > 0 && (
            <div className="pdetail__tags wl__tags">
              {categories.map((c) => (
                <span key={c} className="chip chip--tag chip--brand">
                  {c}
                </span>
              ))}
              {opensIn !== null && (
                <span className="wl__status wl__status--upcoming">
                  OPEN D-{opensIn}
                </span>
              )}
              {status && (
                <span className={`wl__status wl__status--${status}`}>
                  {status === "ongoing" ? "진행중" : "종료"}
                </span>
              )}
            </div>
          )}
          <p className="pdetail__name">{place.name}</p>

          <div className="pdetail__region">
            <Icon name="pin" size={14} />
            <span>{place.address_sg}</span>
            {place.place_name && (
              <a
                className="wl__venue"
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {place.place_name}
              </a>
            )}
            {/* 주소 펼침 화살표 — 장소 이름이 있으면 그 오른쪽, 없으면 지역 오른쪽 */}
            {place.address_road && (
              <button
                className="wl__chev"
                type="button"
                aria-expanded={addressOpen}
                aria-label={addressOpen ? "주소 접기" : "주소 펼치기"}
                onClick={() => setAddressOpen((v) => !v)}
              >
                <Icon name="chevronDown" size={16} />
              </button>
            )}
          </div>
          {addressOpen && place.address_road && (
            <AddressBox
              rows={addressRows(place)}
              onCopy={copy}
              copiedTag={copiedTag}
              onCopied={setCopiedTag}
            />
          )}

          {place.description && (
            <p className="pdetail__desc">{place.description}</p>
          )}

          {michelin &&
            (michelin.url ? (
              // 미쉐린 가이드 서울의 이 레스토랑 페이지로 연결한다
              <a
                className="wl__michelin"
                href={michelin.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MichelinMark michelin={michelin.michelin} size={14} />
                <span>{MICHELIN_EDITION}</span>
              </a>
            ) : (
              <p className="wl__michelin">
                <MichelinMark michelin={michelin.michelin} size={14} />
                <span>{MICHELIN_EDITION}</span>
              </p>
            ))}

          {period && (
            <div className="wl__period">
              <Icon name="calendar" size={16} />
              <span>{period.text}</span>
              {period.dday && opensIn === null && (
                <span className={`dday dday--${period.dday.level}`}>
                  {period.dday.label}
                </span>
              )}
            </div>
          )}

          {extra?.hours && <BusinessHours hours={extra.hours} />}

          {extra?.schedule && <ScheduleSection schedule={extra.schedule} />}

          {extra?.themes && (
            <ThemeSection
              title={extra.themes.title}
              items={extra.themes.items}
            />
          )}

          {(extra?.images ?? [])
            .filter(
              (img) =>
                img.src.startsWith("/") || img.src.startsWith("https://"),
            )
            .map((img) => (
              <div key={img.src} className="wl__img">
                <p className="wl__sched-title">{img.title}</p>
                <a href={img.src} target="_blank" rel="noopener noreferrer">
                  {/* 안내도 같은 큰 그림이라 next/image 최적화 대상이 아니다 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.title} loading="lazy" />
                </a>
                <p className="wl__img-hint">누르면 크게 볼 수 있어요</p>
              </div>
            ))}

          {extra?.booking_url?.startsWith("https://") && (
            <a
              className="wl__booking"
              href={extra.booking_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="calendar" size={18} />
              <span className="wl__booking-name">예약하기</span>
              <Icon name="chevron" size={18} />
            </a>
          )}

          {links.length > 0 && (
            <div className="wl__yt wl__links" ref={linksRef}>
              <button
                className="wl__yt-head"
                type="button"
                aria-expanded={linksOpen}
                onClick={() => setLinksOpen((v) => !v)}
              >
                <span className="wl__links-ico">
                  <WebIcon size={20} />
                </span>
                <span className="wl__yt-name">공식 링크</span>
                <span className="wl__yt-count">{links.length}개</span>
                <span className={`wl__yt-chev${linksOpen ? " is-open" : ""}`}>
                  <Icon name="chevronDown" size={20} />
                </span>
              </button>
              {linksOpen && (
                <div className="wl__chips">
                  {links.map((l) => (
                    <a
                      key={l.url}
                      className="wl__chip"
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {l.type === "instagram" ? (
                        <InstagramIcon size={18} />
                      ) : (
                        <WebIcon size={18} />
                      )}
                      <span>
                        {l.type === "instagram"
                          ? "인스타그램"
                          : l.type === "blog"
                            ? "블로그"
                            : "공식 홈페이지"}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {videos.length > 0 && (
            <div className="wl__yt" ref={videosRef}>
              <button
                className="wl__yt-head"
                type="button"
                aria-expanded={videosOpen}
                onClick={() => setVideosOpen((v) => !v)}
              >
                <YouTubeMark size={24} />
                <span className="wl__yt-name">YouTube</span>
                <span className="wl__yt-count">
                  원본 콘텐츠 {videos.length}개
                  {unavailableCount > 0 && ` · ${unavailableCount}개 확인 불가`}
                </span>
                <span className={`wl__yt-chev${videosOpen ? " is-open" : ""}`}>
                  <Icon name="chevronDown" size={20} />
                </span>
              </button>
              {videosOpen && (
                <ul className="wl__yt-list">
                  {videos.map((v, i) => {
                    const meta = v.id ? videoMeta[v.id] : undefined;
                    if (meta?.state === "unavailable") {
                      return (
                        <li key={v.url}>
                          <div className="wl__yt-row wl__yt-row--off">
                            <span className="wl__yt-ico">
                              <Icon name="ban" size={20} />
                            </span>
                            <span className="wl__yt-body">
                              <span className="wl__yt-title">
                                확인할 수 없는 영상
                              </span>
                              <span className="wl__yt-url">
                                삭제되었거나 비공개인 영상입니다
                              </span>
                            </span>
                          </div>
                        </li>
                      );
                    }
                    const info = meta?.state === "ok" ? meta : null;
                    return (
                      <li key={v.url}>
                        <a
                          className="wl__yt-row"
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="wl__yt-ico">
                            <Icon name="play" size={20} />
                          </span>
                          <span className="wl__yt-body">
                            <span className="wl__yt-title">
                              {info?.title || `영상 ${i + 1}`}
                            </span>
                            <span className="wl__yt-url">
                              {info ? info.channel : v.label}
                            </span>
                          </span>
                          <Icon name="chevron" size={16} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {!addressOpen && !videosOpen && !linksOpen && place.address_road && (
            <AddressBox rows={addressRows(place)} ghost />
          )}
        </>
      )}
    </Sheet>
  );
}

function WebIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9S14.6 18.3 12 21c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z" />
    </svg>
  );
}

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface AddressRow {
  tag: string;
  /** 화면에 보이는 주소 */
  text: string;
}

/** 네이버 지도 주소창과 같은 구성 — 도로명(건물 · 층 · 상호까지), 지번, 우편번호. 값이 있는 줄만 보여 준다 */
function addressRows(place: {
  address_road: string | null;
  address_detail?: string | null;
}): AddressRow[] {
  const rows: AddressRow[] = [];
  if (place.address_road) {
    rows.push({
      tag: "도로명",
      text: [place.address_road, place.address_detail]
        .filter(Boolean)
        .join(" "),
    });
  }
  return rows;
}

/** 주소 상자. ghost 면 보이지 않는 자리 차지용(접힌 동안 펼친 높이를 미리 잡아 둔다) */
function AddressBox({
  rows,
  onCopy,
  copiedTag = null,
  onCopied,
  ghost,
}: {
  rows: AddressRow[];
  onCopy?: (text: string) => Promise<boolean>;
  /** 복사한 줄 — 그 줄 버튼만 "복사됨 ✓" 으로 바뀌고, 시트를 닫을 때까지 그대로 남는다 */
  copiedTag?: string | null;
  onCopied?: (tag: string) => void;
  ghost?: boolean;
}) {
  async function handleCopy(row: AddressRow) {
    if (!(await onCopy?.(row.text))) return;
    onCopied?.(row.tag);
  }

  return (
    <div
      className={`wl__addr${ghost ? " wl__addr--ghost" : ""}`}
      aria-hidden={ghost || undefined}
    >
      {rows.map((row) => (
        <div className="wl__addr-row" key={row.tag}>
          <span className="wl__addr-tag">{row.tag}</span>
          <span className="wl__addr-val">{row.text}</span>
          <button
            className={`wl__copy${copiedTag === row.tag ? " is-copied" : ""}`}
            type="button"
            tabIndex={ghost ? -1 : undefined}
            aria-live="polite"
            onClick={() => void handleCopy(row)}
          >
            {copiedTag === row.tag ? (
              <>
                복사됨
                <span className="wl__copy-check">
                  <Icon name="check" size={14} strokeWidth={2.8} />
                </span>
              </>
            ) : (
              "복사"
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

/** 대회 · 축제 일정표. 묶음이 둘 이상이면(상반기 · 하반기) 탭으로 나누고, 오늘이 속한 묶음을 먼저 보여 준다.
    날짜가 있는 행은 오늘이 속한 주를 초록으로 강조한다. */
function ScheduleSection({
  schedule,
}: {
  schedule: NonNullable<WishlistExtra["schedule"]>;
}) {
  const groups = useMemo(() => groupSchedule(schedule.rows), [schedule]);
  const [active, setActive] = useState(() => pickDefaultGroup(groups));
  const today = new Date();
  const shown = groups[Math.min(active, groups.length - 1)];
  const tabbed = groups.length > 1;
  const tabsRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ left: 0, width: 0, ready: false });

  // 활성 탭의 위치 · 너비를 재서 알약을 옮긴다. 처음 그릴 때는 애니메이션 없이 자리를 잡고, 글꼴이 바뀌어 너비가 달라져도 다시 맞춘다.
  useLayoutEffect(() => {
    const box = tabsRef.current;
    if (!box || !tabbed) return;
    const place = (animate: boolean) => {
      const tab = box.querySelectorAll<HTMLElement>(".wl__sched-tab")[active];
      if (!tab) return;
      setThumb((t) =>
        t.left === tab.offsetLeft &&
        t.width === tab.offsetWidth &&
        (t.ready || !animate)
          ? t
          : {
              left: tab.offsetLeft,
              width: tab.offsetWidth,
              // 한 번 켜진 움직임은 탭을 바꿀 때마다 끄지 않는다
              ready: t.ready || animate,
            },
      );
    };
    place(false);
    // 첫 배치가 끝난 다음 프레임부터 움직임(transition)을 켠다
    const raf = window.requestAnimationFrame(() => place(true));
    const ro = new ResizeObserver(() => place(true));
    ro.observe(box);
    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active, tabbed, groups]);

  return (
    <div className="wl__sched">
      <p className="wl__sched-title">{schedule.title}</p>
      {tabbed && (
        <div className="wl__sched-head">
          <div className="wl__sched-tabs" role="tablist" ref={tabsRef}>
            {/* 활성 탭을 받치는 흰 알약 — 탭을 바꾸면 이 알약이 옆으로 미끄러져 간다 */}
            <span
              className={`wl__sched-thumb${thumb.ready ? " is-ready" : ""}`}
              style={{
                width: thumb.width,
                transform: `translateX(${thumb.left}px)`,
              }}
              aria-hidden
            />
            {groups.map((g, i) => (
              <button
                key={g.label}
                className="wl__sched-tab"
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
              >
                {g.label}
              </button>
            ))}
          </div>
          {shown.range && <p className="wl__sched-range">{shown.range}</p>}
        </div>
      )}
      <ul className="wl__sched-list">
        {shown.rows.map((r, i) => (
          <li
            key={`${r.tag}-${i}`}
            className={`wl__sched-row${r.current || isCurrentWeek(r.date, today) ? " is-current" : ""}`}
          >
            <span className="wl__sched-tag">{r.tag}</span>
            <span className="wl__sched-body">
              <span className="wl__sched-name">{r.title}</span>
              <span className="wl__sched-meta">{r.meta}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
