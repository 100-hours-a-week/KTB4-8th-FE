"use client";

import { useMemo, useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Empty } from "@/components/ui/Primitives";
import { HomePlaceCard } from "@/features/home/HomePlaceCard";
import { HOME_DUMMY_PLACES } from "@/features/home/dummyPlaces";
import { EventFilterSheet } from "@/features/wishlist/EventFilterSheet";
import { FilterButton } from "@/features/wishlist/FilterButton";
import {
  matchesEvent,
  NO_FILTER,
  placeCategoryOptions,
  placeFacts,
  regionOptions,
  type EventFilter,
} from "@/features/wishlist/eventFilter";
import { resolveMichelin } from "@/features/wishlist/michelin";
import { WishlistDetailSheet } from "@/features/wishlist/WishlistDetailSheet";

/* 요즘 뜨는 곳 전체보기 — 홈 "요즘 뜨는 곳" 오른쪽 "전체보기"가 연다.
   이벤트 전체보기(/home/events)와 같은 모양: 앱바(뒤로가기 · 제목)가 있는 별도 페이지이고, 카드는 2열로 위아래 스크롤한다.
   카드마다 사진과 정보(이름 · 지역 · 분류)가 같이 보인다. 홈 가로 넘김과 같은 순서이고 번호가 붙는다.
   위쪽 "카테고리 · 지역" 버튼은 보관함 장소 탭과 같은 필터 — 거르더라도 번호는 홈의 순서 그대로 둔다.
   그 왼쪽의 "2026 미쉐린" · "흑백요리사" 칩은 켜고 끄는 필터이고, 카테고리 · 지역 필터와 함께(둘 다 맞는 곳만) 적용된다. */

export default function HomePlacesPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventFilter>(NO_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [onlyMichelin, setOnlyMichelin] = useState(false);
  const [onlyBwChef, setOnlyBwChef] = useState(false);

  const facts = useMemo(
    () => HOME_DUMMY_PLACES.map((p) => placeFacts(p.category, p.address_sg)),
    [],
  );
  const categories = useMemo(() => placeCategoryOptions(facts), [facts]);
  const regions = useMemo(() => regionOptions(facts), [facts]);
  const shown = HOME_DUMMY_PLACES.map((place, i) => ({
    place,
    rank: i + 1,
    pass:
      matchesEvent(facts[i], filter) &&
      (!onlyMichelin || !!resolveMichelin(place.name, place.extra.michelin)) &&
      (!onlyBwChef || !!place.bw_chef),
  })).filter((x) => x.pass);

  return (
    <>
      <AppBar back title="요즘 뜨는 곳" />
      <div style={{ padding: "0 var(--s-5)" }}>
        <div className="evf__row">
          <div className="evf__chips" role="group" aria-label="추천 목록">
            <button
              className="evf__chip evf__chip--michelin"
              type="button"
              aria-pressed={onlyMichelin}
              onClick={() => setOnlyMichelin((v) => !v)}
            >
              2026 미쉐린
            </button>
            <button
              className="evf__chip evf__chip--bwchef"
              type="button"
              aria-pressed={onlyBwChef}
              aria-label="흑백요리사"
              onClick={() => setOnlyBwChef((v) => !v)}
            >
              {/* 산돌 격동명조2 Bold 익스텐디드로 쓴 "흑백요리사" 글자 이미지(public/icons/bw-chef-title.png) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/bw-chef-title.png"
                alt=""
                aria-hidden
                width={454}
                height={79}
              />
            </button>
          </div>
          <FilterButton filter={filter} onOpen={() => setFilterOpen(true)} />
        </div>
      </div>
      <div className="scroll scroll--pad">
        {shown.length === 0 ? (
          <Empty
            icon="search"
            title="조건에 맞는 장소가 없어요."
            message="카테고리나 지역을 바꿔 보세요."
          />
        ) : (
          <div className="evgrid">
            {shown.map(({ place, rank }) => (
              <HomePlaceCard
                key={place.id}
                place={place}
                rank={rank}
                onOpen={setOpenId}
                grid
              />
            ))}
          </div>
        )}
      </div>
      {filterOpen && (
        <EventFilterSheet
          value={filter}
          categories={categories}
          regions={regions}
          onApply={(next) => setFilter((f) => ({ ...f, ...next }))}
          onClose={() => setFilterOpen(false)}
        />
      )}
      {openId && (
        <WishlistDetailSheet
          kind="place"
          id={openId}
          preset={HOME_DUMMY_PLACES.find((p) => p.id === openId)}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
