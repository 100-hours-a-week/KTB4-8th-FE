"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import {
  DummyDataNotice,
  Empty,
  Skeleton,
  Spinner,
} from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api/client";
import { CATEGORY_LABEL } from "@/lib/constants";
import { describePeriod, eventStatus } from "@/features/wishlist/format";
import {
  useDeleteCollectionItem,
  useSaveCollectionItem,
} from "@/features/collections/queries";
import { placeKeys, useEvent } from "./queries";
import type { CollectionItem } from "@/types/api";

/* 이벤트 상세 팝업 — 프로토타입 js/pages/home.js 의 openEventSheet() 를 그대로 옮겼다.
   보관한 이벤트 상세(WishlistDetailSheet)와 같은 배치다 — 분류 칩 옆 진행 상태 배지, 기간 줄의 D-N. */

export interface EventDetailSheetProps {
  eventId: string;
  onClose: () => void;
}

export function EventDetailSheet({ eventId, onClose }: EventDetailSheetProps) {
  const { data: event, isLoading, isError, error } = useEvent(eventId);
  const [saved, setSaved] = useState(!!event?.saved);
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const saveItem = useSaveCollectionItem();
  const deleteItem = useDeleteCollectionItem();

  // 조회된 event 가 바뀔 때마다(최초 로딩·재조회) 저장 여부를 서버 값으로 다시 맞춘다.
  // (렌더 중 상태 조정 패턴: https://react.dev/learn/you-might-not-need-an-effect)
  const [prevEvent, setPrevEvent] = useState(event);
  if (event !== prevEvent) {
    setPrevEvent(event);
    if (event) setSaved(!!event.saved);
  }

  useEffect(() => {
    if (isError) toast.fromError(error);
  }, [isError, error]);

  async function handleToggle() {
    if (!event || saving) return;
    setSaving(true);
    try {
      if (!saved) {
        await saveItem.mutateAsync({ itemType: "EVENT", itemId: event.id });
        setSaved(true);
        toast.ok("보관함에 담았어요.");
      } else {
        // 개별 삭제 API 는 itemId 가 아니라 보관함 행 id 를 받아서, 목록에서 행을 먼저 찾는다.
        const r = await api.get<CollectionItem[]>(
          "/user/collections/me/items",
          { type: "EVENT", size: 50 },
        );
        const row = (r.data || []).find(
          (x) => x.item && String(x.item.id) === String(event.id),
        );
        if (row) await deleteItem.mutateAsync(row.id);
        setSaved(false);
        toast.info("보관함에서 삭제했어요.");
      }
      // 홈 · 더보기 목록이 들고 있는 이 이벤트의 캐시도 같이 지워서 바로 반영되게 한다.
      void qc.invalidateQueries({ queryKey: placeKeys.event(event.id) });
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSaving(false);
    }
  }

  const status = event ? eventStatus(event.startAt, event.endAt) : null;
  const period = event ? describePeriod(event.startAt, event.endAt) : null;

  return (
    <Sheet
      title="이벤트 정보"
      autoHideScroll
      compact
      tall
      expandable
      onClose={onClose}
      foot={
        event && (
          <div className="wl__foot">
            <div className="pdetail__actions">
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => toast.info("준비 중인 기능입니다.")}
              >
                <Icon name="map" size={18} />
                <span>지도에서 보기</span>
              </button>
              <button
                className={`btn${saved ? " btn--soft" : ""}`}
                type="button"
                disabled={saving}
                onClick={() => void handleToggle()}
              >
                {saving ? (
                  <>
                    <Spinner />
                    <span>{saved ? "삭제하는 중" : "담는 중"}</span>
                  </>
                ) : saved ? (
                  <>
                    <Icon name="trash" size={18} />
                    <span>보관함에서 삭제</span>
                  </>
                ) : (
                  <>
                    <Icon name="bookmark" size={18} />
                    <span>보관함에 담기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )
      }
    >
      {isLoading && (
        <>
          <Skeleton style={{ aspectRatio: "16/9", borderRadius: 18 }} />
          <Skeleton style={{ height: 22, width: "60%", marginTop: 16 }} />
        </>
      )}
      {isError && (
        <Empty
          icon="alert"
          title="이벤트 정보를 불러오지 못했어요."
          message="잠시 후 다시 시도해 주세요."
        />
      )}
      {event && (
        <>
          <DummyDataNotice />
          <div className="pdetail__tags wl__tags">
            <span className="chip chip--tag chip--brand">
              {CATEGORY_LABEL[event.category]}
            </span>
            {status && (
              <span className={`wl__status wl__status--${status}`}>
                {status === "ongoing" ? "진행중" : "종료"}
              </span>
            )}
          </div>
          <p className="pdetail__name">{event.name}</p>
          <p className="pdetail__region">
            <Icon name="pin" size={14} />
            <span>{event.region ?? ""}</span>
          </p>
          {event.description && (
            <p className="pdetail__desc">{event.description}</p>
          )}
          {period && (
            <div className="wl__period">
              <Icon name="calendar" size={16} />
              <span>{period.text}</span>
              {period.dday && (
                <span className={`dday dday--${period.dday.level}`}>
                  {period.dday.label}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}
