"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { useCourseStore } from "@/features/recommendations/courseStore";
import { useNewItemsStore } from "@/features/sync/newItems";

/* 하단 글로벌 내비게이션 — 보관함 / 지도 / 홈 / 코스 / 마이페이지.
   가운데 홈을 강조하고, 코스는 화면 이동이 아니라 팝업을 연다. */

interface Item {
  href: string;
  key: string;
  label: string;
  icon: IconName;
  home?: boolean;
  popup?: boolean;
}

const ITEMS: Item[] = [
  { href: "/collection", key: "collection", label: "보관함", icon: "bookmark" },
  { href: "/map", key: "map", label: "지도", icon: "map" },
  { href: "/home", key: "home", label: "홈", icon: "home", home: true },
  {
    href: "#course",
    key: "course",
    label: "코스",
    icon: "sparkle",
    popup: true,
  },
  { href: "/mypage", key: "mypage", label: "마이페이지", icon: "user" },
];

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const courseOpen = useCourseStore((s) => s.open);
  const openCourse = useCourseStore((s) => s.setOpen);
  // 좋아요 불러오기로 새로 담긴 항목 수 — 보관함 탭에 배지로 보여 준다(보관함에서 "확인했어요"를 누르면 사라진다)
  const newCount = useNewItemsStore((s) => s.keys.length);
  const hydrateNew = useNewItemsStore((s) => s.hydrate);
  useEffect(() => {
    hydrateNew();
  }, [hydrateNew]);

  return (
    <nav className="tabbar" aria-label="주요 메뉴">
      {ITEMS.map((it) => {
        const active = it.popup ? courseOpen : pathname.startsWith(it.href);
        return (
          <button
            key={it.key}
            className={`tabbar__item${it.home ? " tabbar__item--home" : ""}`}
            type="button"
            data-tab={it.key}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (it.popup) {
                openCourse(true);
                return;
              }
              // 홈의 하위 페이지(전체보기 등)에서는 홈 탭이 홈으로 돌아간다. 이미 홈이면 맨 위로 올린다
              const here =
                pathname === it.href ||
                (!it.home && pathname.startsWith(it.href));
              if (here) {
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
              router.push(it.href);
            }}
          >
            <span className="tabbar__icon">
              <Icon name={it.icon} size={21} />
              {it.key === "collection" && newCount > 0 && (
                <i
                  className="tabbar__badge"
                  aria-label={`새로 담긴 항목 ${newCount}개`}
                >
                  {newCount > 99 ? "99+" : newCount}
                </i>
              )}
            </span>
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
