"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { Empty, Skeleton, Spinner, Thumb } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api/client";
import { CATEGORY_LABEL } from "@/lib/constants";
import { usePlace } from "./queries";
import type { CollectionItem } from "@/types/api";

/* 장소 상세 팝업 — 프로토타입 js/pages/home.js 의 openPlaceSheet() 를 그대로 옮겼다.
   16:9 사진 + 장소명 + 지역까지 먼저 보이고 그 아래는 스크롤로 본다(sheet--tall). */

export interface PlaceDetailSheetProps {
  placeId: string;
  onClose: () => void;
  /** 더보기 목록에서 열렸을 때만 true — 뒤로가기를 누르면 목록으로 돌아간다 */
  back?: boolean;
  onBack?: () => void;
}

export function PlaceDetailSheet({
  placeId,
  onClose,
  back,
  onBack,
}: PlaceDetailSheetProps) {
  const { data: place, isLoading, isError, error } = usePlace(placeId);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // 조회된 place 가 바뀔 때마다(최초 로딩·재조회) 저장 여부를 서버 값으로 다시 맞춘다.
  // (렌더 중 상태 조정 패턴: https://react.dev/learn/you-might-not-need-an-effect)
  const [prevPlace, setPrevPlace] = useState(place);
  if (place !== prevPlace) {
    setPrevPlace(place);
    if (place) setSaved(!!place.saved);
  }

  useEffect(() => {
    if (isError) toast.fromError(error);
  }, [isError, error]);

  async function handleSave() {
    if (!place || saved || saving) return;
    setSaving(true);
    try {
      await api.post<CollectionItem>("/user/collections/me/items", {
        itemType: "PLACE",
        itemId: place.id,
      });
      setSaved(true);
      toast.ok("보관함에 담았어요.");
    } catch (err) {
      toast.fromError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      title="장소 정보"
      compact
      tall
      expandable
      back={!!back}
      onBack={onBack}
      onClose={onClose}
      foot={
        place && (
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
          <Skeleton style={{ height: 14, width: "40%", marginTop: 10 }} />
        </>
      )}
      {isError && (
        <Empty
          icon="alert"
          title="장소 정보를 불러오지 못했어요."
          message="잠시 후 다시 시도해 주세요."
        />
      )}
      {place && (
        <>
          <div className="pdetail__hero">
            <Thumb category={place.category} />
          </div>
          <div className="pdetail__tags">
            <span className="chip chip--tag chip--brand">
              {CATEGORY_LABEL[place.category]}
            </span>
          </div>
          <p className="pdetail__name">{place.name}</p>
          <p className="pdetail__region">
            <Icon name="pin" size={14} />
            <span>{place.region ?? ""}</span>
          </p>
          {place.description && (
            <p className="pdetail__desc">{place.description}</p>
          )}
          <div className="pdetail__rows">
            <div className="pdetail__row">
              <span className="pdetail__row-key">카테고리</span>
              <span className="pdetail__row-val">
                {CATEGORY_LABEL[place.category]}
              </span>
            </div>
            <div className="pdetail__row">
              <span className="pdetail__row-key">지역</span>
              <span className="pdetail__row-val">{place.region || "-"}</span>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}
