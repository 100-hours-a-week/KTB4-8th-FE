/* 지하철 출구 주변 주요 시설 — 국가철도공단 철도산업정보센터(KRIC) "역사별 출구정보" 데이터를
   미리 받아 정리한 정적 표다. 핀이 출구에 붙었을 때 카드에 한 줄로 보여 준다(서버/BFF 에서만 쓴다).

   - 형식: { 역 이름("왕십리역"): { 출구 번호("4"): ["시설", ...] } }
   - KRIC 는 호출할 때마다 가져오지 말고 1일 1회 배치로 받으라고 요청했다 — 그래서 실시간으로 부르지 않고
     scripts/build-exit-facilities.mjs 로 한 번 받아 이 표를 만든다(분기·반기마다 갱신되는 데이터).
   - 출처 표시가 필요한 데이터다(마이페이지의 데이터 출처 안내 참고).
   - 표는 exitFacilitiesData.json 에 있다. scripts/build-exit-facilities.mjs 가 만든 파일이다(통째로 다시 만들어진다). */
import data from "./exitFacilitiesData.json";

export const EXIT_FACILITIES: Record<string, Record<string, string[]>> = data;

/** 화면에 보여 줄 최대 시설 수 */
const MAX_FACILITIES = 3;

/* 같은 이름의 역이 여러 지역에 있으면 표에 "시청역@대전"처럼 지역을 붙여 담아 두었다.
   카카오가 준 역 주소("대전 중구 …")의 시·도로 지역을 정한다. 지역 묶음은 스크립트의 regionOf 와 같다. */
const REGION_BY_SIDO: Record<string, string> = {
  서울: "수도권",
  경기: "수도권",
  인천: "수도권",
  부산: "부산·울산",
  울산: "부산·울산",
  경남: "부산·울산", // 부산김해경전철의 김해 구간
  대구: "대구",
  경북: "대구", // 대경선(구미~경산)
  대전: "대전",
  광주: "광주",
  전남광주통합특별시: "광주", // 카카오 주소에 광주가 이렇게 나온다
};

function regionOfAddress(address: string | undefined): string | null {
  const sido = address?.trim().split(/\s+/)[0] ?? "";
  return REGION_BY_SIDO[sido] ?? null;
}

/** 역 이름과 출구 번호로 주변 시설을 찾는다. 없으면 빈 배열.
    stationAddress(카카오가 준 역 주소)는 같은 이름의 역이 여러 지역에 있을 때 지역을 고르는 데 쓴다. */
export function exitFacilities(
  stationName: string,
  exitNumber: string,
  stationAddress?: string,
): string[] {
  const region = regionOfAddress(stationAddress);
  const exits =
    (region ? EXIT_FACILITIES[`${stationName}@${region}`] : undefined) ??
    EXIT_FACILITIES[stationName];
  return (exits?.[exitNumber] ?? []).slice(0, MAX_FACILITIES);
}
