"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Icon } from "@/components/ui/Icon";
import { Empty, Skeleton, Thumb } from "@/components/ui/Primitives";
import { toast } from "@/components/ui/Toast";
import { CATEGORY_LABEL } from "@/lib/constants";
import { useTrendingPlaces } from "./queries";
import { PlaceDetailSheet } from "./PlaceDetailSheet";

/* 더보기 — 요즘 뜨는 곳 전체 목록. 프로토타입 js/pages/home.js 의 openPlaceList() 를 옮겼다.
   title/sub 를 열어 둬서 마이페이지의 보관함 목록도 같은 시트를 재사용할 수 있다.
   행을 탭하면 이 시트 위에 장소 상세를 쌓고, 상세의 뒤로가기는 이 목록으로 돌아온다. */

export interface PlaceListSheetProps {
  title?: string;
  sub?: string;
  onClose: () => void;
}

export function PlaceListSheet({
  title = "요즘 뜨는 곳",
  sub = "이번 주 저장이 많았던 장소",
  onClose,
}: PlaceListSheetProps) {
  const { data, isLoading, isError, error } = useTrendingPlaces(20);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (isError) toast.fromError(error);
  }, [isError, error]);

  const rows = data ?? [];

  return (
    <>
      <Sheet title={title} sub={sub} compact tall expandable onClose={onClose}>
        {isLoading && (
          <>
            <Skeleton
              style={{ height: 70, marginBottom: 8, borderRadius: 18 }}
            />
            <Skeleton style={{ height: 70, borderRadius: 18 }} />
          </>
        )}
        {isError && (
          <Empty
            icon="alert"
            title="목록을 불러오지 못했어요."
            message="잠시 후 다시 시도해 주세요."
          />
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <Empty
            icon="pin"
            title="보여드릴 장소가 아직 없어요."
            message="좋아요 영상을 불러오면 이 자리에 채워집니다."
          />
        )}
        {rows.length > 0 && (
          <div className="stagger">
            {rows.map((p, i) => (
              <button
                key={p.id}
                className="plist__row press"
                type="button"
                onClick={() => setDetailId(p.id)}
              >
                <span className="plist__rank">{i + 1}</span>
                <Thumb className="thumb--sq" category={p.category} />
                <span className="plist__body">
                  <span className="plist__name">{p.name}</span>
                  <span className="plist__meta">
                    {CATEGORY_LABEL[p.category]} · {p.region ?? ""}
                  </span>
                </span>
                <span style={{ color: "var(--ink-4)" }}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
            ))}
          </div>
        )}
      </Sheet>

      {detailId && (
        <PlaceDetailSheet
          placeId={detailId}
          back
          onBack={() => setDetailId(null)}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}
