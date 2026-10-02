"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { Thumb } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api/client";
import { isPlaceSavedLocally } from "@/lib/api/local-collection";
import { CATEGORY_LABEL } from "@/lib/constants";
import {
  useDeleteCollectionItem,
  useSaveCollectionItem,
} from "@/features/collections/queries";
import { placeKeys } from "./queries";
import type { CollectionItem, Place } from "@/types/api";

/* 요즘 뜨는 곳 카드(가로 스크롤) — 프로토타입 js/components/cards.js 의 place() 를 그대로 옮겼다.
   보관함 담기/빼기는 카드 자체에서 처리하고, 카드 탭은 상세 시트를 여는 콜백만 위로 올린다. */

export interface PlaceCardProps {
  place: Place;
  /** 가로 스크롤에서의 순번(1부터). 없으면 배지를 그리지 않는다. */
  rank?: number;
  onOpen: (placeId: string) => void;
}

export function PlaceCard({ place, rank, onOpen }: PlaceCardProps) {
  // place.saved 는 BE 트렌딩 응답엔 없는 필드라 항상 undefined 다 — 그걸로 초기화하면
  // 화면을 떠났다 돌아올 때(컴포넌트가 다시 마운트될 때)마다 저장 표시가 풀려 보였다.
  // 대신 보관함 더미 저장소를 직접 확인해서 초기 상태를 정한다.
  const [saved, setSaved] = useState(() => isPlaceSavedLocally(place.id));
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const saveItem = useSaveCollectionItem();
  const deleteItem = useDeleteCollectionItem();

  async function toggleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (!saved) {
        await saveItem.mutateAsync({ itemType: "PLACE", itemId: place.id });
        setSaved(true);
        toast.ok("보관함에 담았어요.", "저장 완료");
      } else {
        // 보관함 목록에서 이 장소의 행을 찾아 삭제한다(개별 삭제 API가 itemId 가 아니라 보관함 행 id 를 받는다)
        const r = await api.get<CollectionItem[]>(
          "/user/collections/me/items",
          { type: "PLACE", size: 50 },
        );
        const row = (r.data || []).find(
          (x) => x.item && String(x.item.id) === String(place.id),
        );
        if (row) await deleteItem.mutateAsync(row.id);
        setSaved(false);
        toast.info("보관함에서 삭제했어요.");
      }
      // 보관함 목록 캐시는 위 mutation 훅들이 알아서 무효화한다 — 이 장소의 상세 화면(더보기 ·
      // 상세 시트)이 들고 있을 수 있는 캐시도 같이 지워서, 바로 열어도 최신 저장 상태로 보이게 한다.
      void qc.invalidateQueries({ queryKey: placeKeys.detail(place.id) });
    } catch (err) {
      toast.fromError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="placecard card--tap press"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(place.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(place.id);
        }
      }}
    >
      <Thumb className="thumb--wide" category={place.category}>
        {rank != null && <span className="placecard__rank">{rank}</span>}
        <button
          className="placecard__save"
          type="button"
          aria-pressed={saved}
          aria-label="보관함에 담기"
          disabled={busy}
          onClick={toggleSave}
        >
          <Icon name={saved ? "bookmarkFill" : "bookmark"} size={15} />
        </button>
      </Thumb>
      <p className="placecard__name">{place.name}</p>
      <p className="placecard__meta">{place.region ?? ""}</p>
      <p className="placecard__tags">
        <span className="chip chip--tag chip--brand">
          {CATEGORY_LABEL[place.category]}
        </span>
      </p>
    </div>
  );
}
