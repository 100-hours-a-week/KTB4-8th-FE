/* 지도 범위를 맞춘 뒤 "한 단계 더 확대해도 코스가 들어가는지" 계산한다(순수 계산).
   네이버 기본(래스터) 지도는 확대 단계가 정수뿐이라 fitBounds 가 조금이라도 빠듯하면 한 단계 낮은 쪽을 골라서,
   지도의 절반 이상이 빈 채로 남는 경우가 있다. 그래서 fitBounds 의 결과를 받아, 더 줄인 여백으로도 들어가면 한 단계 더 확대한다. */

export interface Pad {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Pt {
  x: number;
  y: number;
}

export interface TightenPlan {
  /** 더 확대할 단계 수(정수, 1 이상) */
  steps: number;
  /** 확대한 뒤 점들이 여백 안 한가운데 오도록, 지금 화면 기준으로 지도 가운데에 둘 위치(지도 칸 왼쪽 위 기준 px) */
  center: Pt;
}

/** points: 지금 확대 단계에서 점들의 화면 위치(지도 칸 왼쪽 위 기준 px). room: 더 올릴 수 있는 단계 수(한도까지) */
export function tightenPlan(
  points: Pt[],
  width: number,
  height: number,
  pad: Pad,
  room: number,
): TightenPlan | null {
  if (points.length < 2 || room < 1) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX;
  const h = maxY - minY;
  const availW = width - pad.left - pad.right;
  const availH = height - pad.top - pad.bottom;
  if (availW <= 0 || availH <= 0) return null;

  let steps = 0;
  while (
    steps < Math.floor(room) &&
    2 ** (steps + 1) * w <= availW &&
    2 ** (steps + 1) * h <= availH
  )
    steps++;
  if (steps < 1) return null;

  // 확대하면 지도 가운데를 기준으로 점들이 2^steps 배 멀어진다 — 점들의 한가운데가 여백 안 한가운데에 오게 가운데를 옮긴다
  const f = 2 ** steps;
  const bx = (minX + maxX) / 2;
  const by = (minY + maxY) / 2;
  const tx = pad.left + availW / 2;
  const ty = pad.top + availH / 2;
  return {
    steps,
    center: { x: bx - (tx - width / 2) / f, y: by - (ty - height / 2) / f },
  };
}
