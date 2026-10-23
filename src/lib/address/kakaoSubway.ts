/* 카카오 로컬 API 의 지하철역(SW8) 결과를 다루는 공용 함수 — 서버(BFF)에서만 쓴다.
   카카오는 환승역을 노선마다 한 건씩 따로 준다.
     place_name    "왕십리역 2호선"
     category_name "교통,수송 > 지하철,전철 > 수도권2호선"
   그래서 역 이름(노선 꼬리표를 뗀 것)과 노선 식별자를 나눠서 다룬다. */

/** "교통,수송 > 지하철,전철 > 수도권2호선" → "수도권2호선" */
export function lineOf(categoryName: string): string {
  const last = categoryName.split(">").pop()?.trim() ?? "";
  return last;
}

/** "왕십리역 2호선" → "왕십리역". 노선 꼬리표는 공백 없는 한 덩어리로만 붙는다. */
export function stationNameOf(placeName: string, line: string): string {
  const name = placeName.trim();
  // place_name 의 꼬리표("2호선")와 category 의 노선명("수도권2호선")이 달라서 꼬리표부터 확인한다
  const tail = name.split(/\s+/).pop() ?? "";
  if (tail && tail !== name && /(호선|선|철도|경전철)$/.test(tail)) {
    return name.slice(0, name.length - tail.length).trim();
  }
  if (line && name.endsWith(line)) {
    return name.slice(0, name.length - line.length).trim();
  }
  return name;
}
