import type { Slots } from "./courseStore";

/* 코스 추천 팝업의 "빠른 시작" — 칩을 누르면 조건(slot)이 바로 채워진다. 서버(AI)는 거치지 않는다.
   칩을 바꾸거나 추가하려면 QUICK_STARTS 만 고치면 된다.
   · slots 에 적은 필드만 채우고, 적지 않은 필드는 사용자가 이미 정한 값을 그대로 둔다.
   · 출발지는 사용자의 현재 위치(또는 직접 고른 값)를 쓰므로 여기서 정하지 않는다.
   · 지역을 적지 않으면 "지역"은 비어 있어서, 사용자가 조건 카드에서 고르거나 말로 알려 준다(필수 조건). */

export interface QuickStart {
  /** 칩에 보이는 글자 — 대화에도 사용자 말풍선으로 남는다 */
  label: string;
  /** 날짜는 누르는 날을 기준으로 정해야 해서 함수로 둔다 */
  slots: (today: Date) => Partial<Slots>;
}

const p2 = (n: number) => String(n).padStart(2, "0");

/** 내일부터 세어 가장 가까운 토요일 — "yyyy-MM-dd". 오늘이 토요일이면 다음 주 토요일 */
export function upcomingSaturday(today: Date): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const ahead = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + ahead);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

export const QUICK_STARTS: readonly QuickStart[] = [
  {
    label: "성수 카페 투어",
    slots: (today) => ({
      region: "성수",
      date: upcomingSaturday(today),
      timeOfDay: "AFTERNOON",
      time: null,
      availableMinutes: 180,
      categories: ["CAFE", "DESSERT"],
    }),
  },
  {
    label: "주말 팝업 탐방",
    slots: (today) => ({
      date: upcomingSaturday(today),
      timeOfDay: "AFTERNOON",
      time: null,
      availableMinutes: 180,
      categories: ["POPUP"],
    }),
  },
  {
    label: "친구와 반나절 코스",
    slots: (today) => ({
      date: upcomingSaturday(today),
      timeOfDay: "AFTERNOON",
      time: null,
      availableMinutes: 360,
    }),
  },
];
