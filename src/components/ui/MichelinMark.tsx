import type { Michelin } from "@/features/wishlist/types";

/* 미쉐린 가이드 표시 — 카테고리 배지 오른쪽에 붙는 작은 아이콘.
   스타(1~3개): 미쉐린 공식 꽃 모양 SVG 를 개수만큼, 별 사이 간격은 공식 안내 이미지의 비율(별 폭의 약 0.28배)로 둔다.
   빕 구르망: 빕 마스코트 로고 이미지. 스타는 미쉐린 빨강(#D3072B). 높이는 배지 글자 크기에 맞춘다(em 단위). */

const RED = "#D3072B";
/** 공식 안내 이미지에서 잰 별 사이 간격 ÷ 별 폭(55px 폭에 간격 15~17px) */
const STAR_GAP = 0.28;

function Star({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 -150 916 1000"
      width={size * 0.916}
      height={size}
      aria-hidden
      focusable="false"
    >
      <path
        fill={RED}
        d="M624 69v-49q0 -74 -47 -122t-119 -48q-78 0 -122 49t-44 131v15q0 4 1 7l1 17q-74 -53 -133 -53q-46 0 -88 31q-40 29 -59 76q-14 33 -14 66q0 101 116 154l15 7q-131 60 -131 162q0 69 48 121t114 52q60 0 119 -43l13 -10q-2 20 -2 48q0 75 47 122.5t119 47.5     q79 0 122.5 -49.5t43.5 -129.5v-39q74 53 132 53q65 0 112.5 -52.5t47.5 -120.5q0 -102 -116 -155l-15 -7q131 -60 131 -161q0 -65 -47 -119t-113.5 -54t-117.5 42zM540 238q116 -169 215 -169q41 0 74.5 37t33.5 83q0 124 -268 147v29q133 11 200.5 48t67.5 99     q0 45 -32.5 82.5t-75.5 37.5q-101 0 -215 -170l-26 15q57 116 57 196q0 124 -113 124q-54 0 -84 -33q-29 -35 -29 -88q0 -80 57 -199l-26 -15q-114 170 -215 170q-41 0 -74.5 -35.5t-33.5 -84.5q0 -124 267 -147v-29q-267 -22 -267 -147q0 -44 32 -82t76 -38q99 0 215 169     l26 -14q-57 -117 -57 -200q0 -53 29 -88q30 -33 84 -33q113 0 113 123q0 81 -57 198z"
      />
    </svg>
  );
}

/** 빕 구르망 마스코트 — 제공받은 로고 이미지(public/icons/michelin-bib.png, 배경이 투명한 240×220) */
function Bib({ size }: { size: number }) {
  return (
    // 작은 아이콘이라 next/image 최적화 대상이 아니다
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/michelin-bib.png"
      alt=""
      aria-hidden
      width={size * (240 / 220)}
      height={size}
      style={{ display: "block" }}
    />
  );
}

export function michelinLabel(m: Michelin): string {
  return m === "bib" ? "미쉐린 가이드 빕 구르망" : `미쉐린 스타 ${m}개`;
}

export function MichelinMark({
  michelin,
  size = 16,
}: {
  michelin: Michelin;
  /** 아이콘 높이(px) */
  size?: number;
}) {
  const count = michelin === "bib" ? 0 : michelin;
  return (
    <span
      className="michelin"
      role="img"
      aria-label={michelinLabel(michelin)}
      style={{ gap: michelin === "bib" ? 0 : size * 0.916 * STAR_GAP }}
    >
      {michelin === "bib" ? (
        <Bib size={size + 2} />
      ) : (
        Array.from({ length: count }, (_, i) => <Star key={i} size={size} />)
      )}
    </span>
  );
}
