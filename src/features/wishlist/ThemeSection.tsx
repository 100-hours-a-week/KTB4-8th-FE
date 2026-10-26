"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ExtraTheme } from "./types";

/* 방탈출 테마 목록 — 테마마다 한 줄(이름 + 오른쪽 화살표)이고, 누르면 그 아래로 펼쳐진다.
   펼치면 소개 · 장르 · 플레이 시간 · 공포도 · 난이도, 포스터, 그 밑에 시간 배지(안내 문구 한 줄 + 시간 나열)가 차례로 나온다.
   여러 테마를 동시에 펼쳐 둘 수 있다. */

/** 사전 콘텐츠를 보고 10분 뒤에 테마가 시작한다 */
const PRE_CONTENT_MINUTES = 10;

export function ThemeSection({
  title,
  items,
}: {
  title: string;
  items: ExtraTheme[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<HTMLLIElement | null>(null);

  /* 테마를 펼치면 시트 안쪽이 스크롤돼야 끝까지 보이는 경우가 있어서, 공식 링크 · YouTube 구역처럼 펼친 테마의 끝이 보이게 자동으로 내린다.
     시트 높이가 정해진 뒤로 계산하려고 잠깐 기다린다. 이미 다 보이면 움직이지 않는다(block: "nearest"). */
  useEffect(() => {
    if (open === null) return;
    const id = window.setTimeout(
      () =>
        openRef.current?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        }),
      60,
    );
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <div className="wl__themes">
      <p className="wl__sched-title">{title}</p>
      <ul className="wl__theme-list">
        {items.map((t, i) => {
          const isOpen = open === i;
          return (
            <li
              key={t.name}
              className="wl__theme"
              ref={isOpen ? openRef : undefined}
            >
              <button
                className="wl__theme-head"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="wl__theme-name">{t.name}</span>
                {/* 공식 링크 · YouTube 구역과 같은 화살표 — 아래를 가리키다가 펼치면 위로 뒤집힌다 */}
                <span className={`wl__yt-chev${isOpen ? " is-open" : ""}`}>
                  <Icon name="chevronDown" size={20} />
                </span>
              </button>
              {isOpen && (
                <div className="wl__theme-body">
                  <p className="wl__theme-desc">{t.description}</p>
                  <p className="wl__theme-facts">
                    {t.genre} · {t.minutes}분 · 공포도 {t.fear}/5 · 난이도{" "}
                    {t.difficulty}/5
                  </p>
                  {/* 모바일에서도 사진이 화면을 다 덮지 않게, 왼쪽에 작게 두고 오른쪽에 테마 시간을 나란히 보여 준다 */}
                  <div className="wl__theme-split">
                    {/* 외부 이미지라 next/image 최적화 대상이 아니다 */}
                    <a
                      className="wl__theme-poster"
                      href={t.image}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.image}
                        alt={`${t.name} 포스터`}
                        loading="lazy"
                      />
                    </a>
                    <div className="wl__theme-times">
                      <p className="wl__theme-sub">테마 시간</p>
                      <p className="wl__theme-note">
                        테마는 {PRE_CONTENT_MINUTES}분 뒤에 시작해 {t.minutes}분
                        동안 진행돼요.
                      </p>
                      <ul className="wl__time-chips">
                        {t.times.map((time) => (
                          <li key={time} className="wl__time-chip">
                            {time}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
