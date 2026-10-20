"use client";

import { AppBar } from "@/components/ui/AppBar";

/* 데이터 출처 — 서비스가 쓰는 외부 데이터의 제공처. OpenStreetMap 은 ODbL 에 따라 표기가 필요해
   라이선스 페이지로 이어지는 링크를 둔다(OSMF 표기 가이드라인). */

const GROUPS = [
  {
    title: "지하철 출구 주변 시설",
    items: [{ name: "국가철도공단 철도산업정보센터 (KRIC)" }],
  },
  {
    title: "지도 · 주소",
    items: [
      { name: "네이버 지도" },
      { name: "카카오 로컬" },
      {
        name: "OpenStreetMap",
        credit: {
          label: "© OpenStreetMap contributors",
          href: "https://www.openstreetmap.org/copyright",
        },
      },
    ],
  },
];

export default function DataSourcesPage() {
  return (
    <>
      <AppBar back title="데이터 출처" />
      <div className="me__body">
        {GROUPS.map((group) => (
          <div className="me__group" key={group.title}>
            <p className="me__group-title">{group.title}</p>
            <ul className="src__list">
              {group.items.map((item) => (
                <li className="src__item" key={item.name}>
                  <p className="src__name">{item.name}</p>
                  {"credit" in item && item.credit && (
                    <a
                      className="src__credit"
                      href={item.credit.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.credit.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
