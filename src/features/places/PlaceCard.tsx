"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const saveItem = useSaveCollectionItem();
  const deleteItem = useDeleteCollectionItem();

  // place.saved 는 BE 트렌딩 응답엔 없는 필드라 항상 undefined 다 — 그래서 상세 시트와
  // 같은 쿼리 키(placeKeys.detail)를 구독해서 보관함 더미 저장소 값을 가져온다. 상세
  // 시트에서 저장/삭제하면 그쪽이 이 키를 invalidate 하는데, 카드도 같은 키를 들고
  // 있으면(마운트돼 있는 한) 다시 마운트하지 않아도 바로 최신 값으로 갱신된다.
  const { data: detail } = useQuery({
    queryKey: placeKeys.detail(place.id),
    queryFn: async () => (await api.get<Place>(`/places/${place.id}`)).data,
    initialData: () => ({ ...place, saved: isPlaceSavedLocally(place.id) }),
  });
  const saved = !!detail.saved;

  async function toggleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !saved;
    // 낙관적 업데이트 — invalidate 가 끝날 때까지(더미 지연 포함) 기다리지 않고 바로 반영한다
    qc.setQueryData<Place>(placeKeys.detail(place.id), (old) =>
      old ? { ...old, saved: next } : old,
    );
    try {
      if (next) {
        await saveItem.mutateAsync({ itemType: "PLACE", itemId: place.id });
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
        toast.info("보관함에서 삭제했어요.");
      }
    } catch (err) {
      qc.setQueryData<Place>(placeKeys.detail(place.id), (old) =>
        old ? { ...old, saved: !next } : old,
      );
      toast.fromError(err);
    } finally {
      setBusy(false);
      // 보관함 목록 캐시는 위 mutation 훅들이 알아서 무효화한다 — 이 장소의 상세 화면(더보기 ·
      // 상세 시트)이 들고 있을 수 있는 캐시도 같이 지워서, 서버 기준 값으로 한 번 더 맞춘다.
      void qc.invalidateQueries({ queryKey: placeKeys.detail(place.id) });
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
