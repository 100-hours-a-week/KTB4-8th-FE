/* 흑백요리사 식당 표시 — 카테고리 배지 오른쪽에 붙는 작은 아이콘(미쉐린 아이콘 옆 자리와 같다).
   아이콘 이미지는 제공받은 파일(public/icons/bw-chef-emblem.png, 배경이 투명한 192×192 정사각형)이다. */

export const BW_CHEF_LABEL = "흑백요리사 참가 셰프 식당";

export function BwChefMark({ size = 16 }: { size?: number }) {
  return (
    <span className="bwchef" role="img" aria-label={BW_CHEF_LABEL}>
      {/* 작은 아이콘이라 next/image 최적화 대상이 아니다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/bw-chef-emblem.png"
        alt=""
        aria-hidden
        width={size}
        height={size}
        style={{ display: "block" }}
      />
    </span>
  );
}

/** 상세의 수저 아이콘 — 흑수저는 검은 수저, 백수저는 흰 수저(검은 윤곽선). 제공받은 모양으로 만든 파일(public/icons/bw-spoon-*.png, 투명 배경, 높이 160px). 상세에서는 상징 아이콘(BwChefMark) 바로 오른쪽에 둔다 */
export function BwSpoon({
  spoon,
  height = 24,
}: {
  spoon: "black" | "white";
  height?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/bw-spoon-${spoon}.png`}
      alt=""
      aria-hidden
      height={height}
      style={{ display: "block", width: "auto", height }}
    />
  );
}
