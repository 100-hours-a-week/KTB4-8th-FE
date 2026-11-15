"use client";

import { useCallback, useEffect, useState } from "react";

/* 보관함 선택 모드(삭제)의 상태.
   선택은 "지금 목록에 보이는 항목"만 유효하다 — 필터로 가려진 항목은 선택되어 있어도 세지 않고 처리하지 않는다. */

/** delete: 메뉴의 [삭제]로 시작하거나 항목을 꾹 눌러 시작한다 */
export type SelectMode = "delete";
export type SelectKind =
  "homePlace" | "place" | "homeEvent" | "event" | "course";
export type AllState = "none" | "part" | "all";

export interface SelectableItem {
  /** 목록에서 행을 구분하는 키(예: wl-12, home-home-place-x) */
  key: string;
  kind: SelectKind;
  /** 홈 더미는 더미 ID, 보관함 항목은 BE 의 항목 ID */
  id: string;
}

export function useCollectionSelection({
  items,
  hasNext,
  fetching,
  failed,
  fetchNext,
}: {
  /** 지금 목록에 보이는 선택 가능한 항목(필터가 걸려 있으면 걸러진 결과) */
  items: SelectableItem[];
  /** 아직 불러오지 않은 다음 페이지가 있는지 */
  hasNext: boolean;
  fetching: boolean;
  failed: boolean;
  fetchNext: () => void;
}) {
  const [mode, setMode] = useState<SelectMode | null>(null);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [loadingAll, setLoadingAll] = useState(false);

  // 지금 보이는 항목 중 고른 것
  const selected = items.filter((i) => picked.has(i.key));
  const allState: AllState =
    selected.length === 0
      ? "none"
      : selected.length === items.length
        ? "all"
        : "part";

  const start = useCallback((next: SelectMode, firstKey?: string) => {
    setMode(next);
    setPicked(new Set(firstKey ? [firstKey] : []));
  }, []);
  const cancel = useCallback(() => {
    setMode(null);
    setPicked(new Set());
    setLoadingAll(false);
  }, []);
  const toggle = useCallback((key: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }, []);
  const clear = useCallback(() => setPicked(new Set()), []);
  const keepOnly = useCallback(
    (keys: string[]) => setPicked(new Set(keys)),
    [],
  );

  /** 체크박스 — 전부 골라져 있으면 모두 풀고, 아니면 목록 전체를 고른다.
      아직 불러오지 않은 뒤쪽 페이지가 있으면 끝까지 불러온 뒤에 고른다. */
  const toggleAll = useCallback(() => {
    if (allState === "all") {
      setPicked(new Set());
      return;
    }
    setLoadingAll(true);
  }, [allState]);

  useEffect(() => {
    if (!loadingAll) return;
    if (hasNext && !failed) {
      if (!fetching) fetchNext();
      return;
    }
    // 끝까지 불러왔다(또는 더 불러오지 못한다) — 지금 보이는 항목을 모두 고른다
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 페이지를 모두 불러온 뒤의 목록으로 한 번 고르는 일이라 렌더 중에 할 수 없다
    setPicked(new Set(items.map((i) => i.key)));
    setLoadingAll(false);
  }, [loadingAll, hasNext, failed, fetching, fetchNext, items]);

  return {
    mode,
    selected,
    isPicked: (key: string) => picked.has(key),
    allState,
    loadingAll,
    start,
    cancel,
    toggle,
    toggleAll,
    clear,
    keepOnly,
  };
}
