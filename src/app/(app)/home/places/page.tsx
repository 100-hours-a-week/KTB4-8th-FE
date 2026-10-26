"use client";

import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { HomePlaceCard } from "@/features/home/HomePlaceCard";
import { HOME_DUMMY_PLACES } from "@/features/home/dummyPlaces";
import { WishlistDetailSheet } from "@/features/wishlist/WishlistDetailSheet";

/* 요즘 뜨는 곳 전체보기 — 홈 "요즘 뜨는 곳" 오른쪽 "전체보기"가 연다.
   이벤트 전체보기(/home/events)와 같은 모양: 앱바(뒤로가기 · 제목)가 있는 별도 페이지이고, 카드는 2열로 위아래 스크롤한다.
   카드마다 사진과 정보(이름 · 지역 · 분류)가 같이 보인다. 홈 가로 넘김과 같은 순서이고 번호가 붙는다. */

export default function HomePlacesPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <AppBar back title="요즘 뜨는 곳" />
      <div className="scroll scroll--pad">
        <div className="evgrid">
          {HOME_DUMMY_PLACES.map((p, i) => (
            <HomePlaceCard
              key={p.id}
              place={p}
              rank={i + 1}
              onOpen={setOpenId}
              grid
            />
          ))}
        </div>
      </div>
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
