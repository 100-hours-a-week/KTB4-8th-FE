"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { Empty, Skeleton, Spinner, Thumb } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api/client";
import { CATEGORY_LABEL } from "@/lib/constants";
import { fmtDday, fmtPeriod } from "@/lib/format";
import { useEvent } from "./queries";
import type { CollectionItem } from "@/types/api";

/* 이벤트 상세 팝업 — 프로토타입 js/pages/home.js 의 openEventSheet() 를 그대로 옮겼다.
   장소 상세와 같은 16:9 사진 시트 규격(sheet--tall)이고, 마감 D-N 칩만 추가로 붙는다. */

export interface EventDetailSheetProps {
  eventId: string;
  onClose: () => void;
}

export function EventDetailSheet({ eventId, onClose }: EventDetailSheetProps) {
  const { data: event, isLoading, isError, error } = useEvent(eventId);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

  async function handleSave() {
    if (!event || saved || saving) return;
    setSaving(true);
    try {
      await api.post<CollectionItem>("/user/collections/me/items", {
        itemType: "EVENT",
        itemId: event.id,
      });
      setSaved(true);
      toast.ok("보관함에 담았어요.");
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSaving(false);
    }
  }

  const dday = event ? fmtDday(event.endAt) : "";

  return (
    <Sheet
      title="이벤트 정보"
      compact
      tall
      expandable
      onClose={onClose}
      foot={
        event && (
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
              className="btn"
              type="button"
              disabled={saved || saving}
              onClick={() => void handleSave()}
            >
              {saving ? (
                <>
                  <Spinner />
                  <span>담는 중</span>
                </>
              ) : saved ? (
                <>
                  <Icon name="check" size={18} />
                  <span>보관됨</span>
                </>
              ) : (
                <>
                  <Icon name="bookmark" size={18} />
                  <span>보관함에 담기</span>
                </>
              )}
            </button>
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
          <div className="pdetail__hero">
            <Thumb category={event.category} />
          </div>
          <div className="pdetail__tags">
            <span className="chip chip--tag chip--brand">
              {CATEGORY_LABEL[event.category]}
            </span>
            {dday && (
              <span className="chip chip--tag chip--accent">{dday}</span>
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
          <div className="pdetail__rows">
            <div className="pdetail__row">
              <span className="pdetail__row-key">기간</span>
              <span className="pdetail__row-val">
                {fmtPeriod(event.startAt, event.endAt)}
              </span>
            </div>
            <div className="pdetail__row">
              <span className="pdetail__row-key">카테고리</span>
              <span className="pdetail__row-val">
                {CATEGORY_LABEL[event.category]}
              </span>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}
