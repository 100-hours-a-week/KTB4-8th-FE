/* 지하철 노선 배지에 쓰는 색·라벨.
   키는 카카오 키워드 검색의 category_name 마지막 조각을 그대로 쓴다
   (예: "교통,수송 > 지하철,전철 > 수도권2호선" → "수도권2호선").
   "2호선"이 아니라 "수도권2호선"/"부산2호선"으로 들어오는 덕에 지역별 같은 번호를
   서로 다른 색으로 구분할 수 있다(수도권 2호선 초록 vs 부산 2호선 연두).

   색은 위키백과 '대한민국의 도시철도'와 각 운영사 노선색을 따랐다. */

export interface SubwayLine {
  /** 배지에 찍는 짧은 라벨 — 숫자 노선은 숫자만, 이름 노선은 '선'을 뗀 이름 */
  label: string;
  color: string;
}

const LINES: Record<string, SubwayLine> = {
  // ── 수도권 ──
  수도권1호선: { label: "1", color: "#0052A4" },
  수도권2호선: { label: "2", color: "#00A84D" },
  수도권3호선: { label: "3", color: "#EF7C1C" },
  수도권4호선: { label: "4", color: "#00A5DE" },
  수도권5호선: { label: "5", color: "#996CAC" },
  수도권6호선: { label: "6", color: "#CD7C2F" },
  수도권7호선: { label: "7", color: "#747F00" },
  수도권8호선: { label: "8", color: "#E6186C" },
  수도권9호선: { label: "9", color: "#BDB092" },
  경의중앙선: { label: "경의중앙", color: "#77C4A3" },
  수인분당선: { label: "수인분당", color: "#F5A200" },
  신분당선: { label: "신분당", color: "#D4003B" },
  공항철도: { label: "공항", color: "#0090D2" },
  경춘선: { label: "경춘", color: "#0C8E72" },
  경강선: { label: "경강", color: "#003DA5" },
  서해선: { label: "서해", color: "#8FC31F" },
  우이신설경전철: { label: "우이신설", color: "#B7C452" },
  신림선: { label: "신림", color: "#6789CA" },
  김포골드라인: { label: "김포", color: "#A17800" },
  의정부경전철: { label: "의정부", color: "#FDA600" },
  용인경전철: { label: "에버라인", color: "#509F22" },
  인천1호선: { label: "인천1", color: "#7CA8D5" },
  인천2호선: { label: "인천2", color: "#ED8B00" },
  // ── 부산 ──
  부산1호선: { label: "1", color: "#F06A00" },
  부산2호선: { label: "2", color: "#81BF48" },
  부산3호선: { label: "3", color: "#BB8C00" },
  부산4호선: { label: "4", color: "#217DCB" },
  부산김해경전철: { label: "부산김해", color: "#8652A1" },
  동해선: { label: "동해", color: "#0E8E45" },
  // ── 그 외 지역 ──
  대구1호선: { label: "1", color: "#D93F5C" },
  대구2호선: { label: "2", color: "#00AA80" },
  대구3호선: { label: "3", color: "#FFB100" },
  대전1호선: { label: "1", color: "#007448" },
  광주1호선: { label: "1", color: "#009088" },
};

/** 표에 없는 노선(신설 등)도 배지는 나오게 한다 — 숫자면 숫자만, 아니면 '선'을 떼고 회색으로 */
const FALLBACK_COLOR = "#8a8894";

export function resolveSubwayLine(raw: string): SubwayLine {
  const known = LINES[raw];
  if (known) return known;

  const numbered = raw.match(/(\d+)호선$/);
  if (numbered) return { label: numbered[1], color: FALLBACK_COLOR };

  return {
    label: raw.replace(/(경전철|선|철도)$/, "") || raw,
    color: FALLBACK_COLOR,
  };
}

/** 라벨이 숫자 한 자리면 원형 배지, 아니면 알약형 배지로 그린다 */
export function isNumberedLine(label: string): boolean {
  return /^\d+$/.test(label);
}
