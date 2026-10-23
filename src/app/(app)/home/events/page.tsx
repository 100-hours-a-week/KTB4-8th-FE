"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Empty } from "@/components/ui/Primitives";
import { HomeEventCard } from "@/features/home/HomeEventCard";
import { splitHomeEvents } from "@/features/home/homeEvents";
import { WishlistDetailSheet } from "@/features/wishlist/WishlistDetailSheet";

/* 홈 이벤트 전체보기 — 홈의 "지금 열린 이벤트 / 곧 열려요" 오른쪽 "전체보기"가 연다.
   보관함처럼 앱바(뒤로가기 · 제목)가 있는 별도 페이지이고, 카드는 2열로 위아래 스크롤한다.
   ?type=ongoing(기본) | upcoming */

const TYPES = {
  ongoing: {
    title: "지금 열린 이벤트",
    empty: "지금 열려 있는 이벤트가 없어요.",
  },
  upcoming: { title: "곧 열려요", empty: "곧 열릴 이벤트가 없어요." },
} as const;

export default function HomeEventsPage() {
  return (
    <Suspense fallback={null}>
      <HomeEventsContent />
    </Suspense>
  );
}

function HomeEventsContent() {
  const type =
    useSearchParams().get("type") === "upcoming" ? "upcoming" : "ongoing";
  const events = useMemo(() => splitHomeEvents()[type], [type]);
  const [openId, setOpenId] = useState<string | null>(null);
  const meta = TYPES[type];

  return (
    <>
      <AppBar back title={meta.title} />
      <div className="scroll scroll--pad">
        {events.length === 0 ? (
          <Empty
            icon="calendar"
            title={meta.empty}
            message="나중에 다시 확인해 주세요."
          />
        ) : (
          <div className="evgrid">
            {events.map((e) => (
              <HomeEventCard key={e.id} event={e} onOpen={setOpenId} />
            ))}
          </div>
        )}
      </div>
      {openId && (
        <WishlistDetailSheet
          kind="event"
          id={openId}
          preset={events.find((e) => e.id === openId)}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}
