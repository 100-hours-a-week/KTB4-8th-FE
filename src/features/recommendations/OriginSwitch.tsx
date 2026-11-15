"use client";

/* "출발지 포함" 스위치 — 코스 지도가 출발지까지 포함해 보여 줄지 고른다.
   꺼져 있으면(기본) 코스 장소만 크게 보여 주고, 켜면 출발지 핀까지 보이게 지도 범위를 넓힌다.
   앱의 다른 스위치(.switch__track)와 같은 모양이고 크기만 작다. */
export function OriginSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="지도에 출발지 포함"
      className="originsw"
      onClick={() => onChange(!checked)}
    >
      <span>출발지 포함</span>
      <span className="switch__track" aria-hidden="true" />
    </button>
  );
}
