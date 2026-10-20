import { isNumberedLine, resolveSubwayLine } from "@/lib/address/subwayLines";

/** 지하철 노선 배지 — 숫자 노선은 원, 그 밖의 노선은 알약 모양 */
export function SubwayLineBadge({ raw }: { raw: string }) {
  const line = resolveSubwayLine(raw);

  if (!isNumberedLine(line.label)) {
    return (
      <span
        className="subway-line subway-line--name"
        style={{ background: line.color }}
      >
        {line.label}
      </span>
    );
  }

  /* 숫자 노선은 원과 숫자를 한 SVG 로 그린다. HTML 글자는 줄 높이·소수 위치 때문에 원 안에서
     0.5~1px 치우치는데, SVG 안에서는 원과 숫자가 같은 좌표계라 늘 정중앙에 온다.
     y=16 은 숫자 윤곽의 세로 중심이 원의 중심(11.5)에 오도록 1·2·3배 화면에서 숫자 1~9를 재서 정한 값이다. */
  return (
    <span
      className="subway-line subway-line--num"
      role="img"
      aria-label={`${line.label}호선`}
    >
      <svg width="23" height="23" viewBox="0 0 23 23" aria-hidden="true">
        <circle cx="11.5" cy="11.5" r="11.5" fill={line.color} />
        <text
          x="11.5"
          y="16"
          textAnchor="middle"
          fill="#fff"
          fontSize="12.5"
          fontWeight="800"
        >
          {line.label}
        </text>
      </svg>
    </span>
  );
}
