import { NextRequest, NextResponse } from "next/server";

const KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

interface KakaoPlaceDocument {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
}

interface KakaoKeywordResponse {
  documents: KakaoPlaceDocument[];
}

/* 카카오는 환승역을 노선마다 한 건씩 따로 준다.
     place_name    "왕십리역 2호선"
     category_name "교통,수송 > 지하철,전철 > 수도권2호선"
   그래서 역 이름(노선 꼬리표를 뗀 것)과 노선 식별자를 나눠서 돌려주고,
   합치는 일은 호출하는 쪽(address.ts)에서 한다. */

/** "교통,수송 > 지하철,전철 > 수도권2호선" → "수도권2호선" */
function lineOf(categoryName: string): string {
  const last = categoryName.split(">").pop()?.trim() ?? "";
  return last;
}

/** "왕십리역 2호선" → "왕십리역". 노선 꼬리표는 공백 없는 한 덩어리로만 붙는다. */
function stationNameOf(placeName: string, line: string): string {
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

/**
 * 카카오 REST API 키를 브라우저에 노출하지 않기 위한 Next BFF.
 * 키워드 장소 검색 결과 중 지하철역(SW8)만 반환한다.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) {
    return NextResponse.json(
      { error: "KAKAO_REST_API_KEY_MISSING", data: [] },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({
    query,
    category_group_code: "SW8",
    size: "15",
    sort: "accuracy",
  });

  try {
    const response = await fetch(`${KAKAO_KEYWORD_URL}?${params}`, {
      headers: { Authorization: `KakaoAK ${restApiKey}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "KAKAO_LOCAL_API_ERROR", data: [] },
        { status: response.status },
      );
    }

    const payload = (await response.json()) as KakaoKeywordResponse;
    const data = payload.documents
      .filter((place) => place.category_group_code === "SW8")
      .map((place) => {
        const line = lineOf(place.category_name);
        return {
          id: place.id,
          name: stationNameOf(place.place_name, line),
          address: place.address_name || place.road_address_name,
          line,
          latitude: Number(place.y),
          longitude: Number(place.x),
        };
      })
      .filter(
        (place) =>
          Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
      );

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "KAKAO_LOCAL_API_UNAVAILABLE", data: [] },
      { status: 502 },
    );
  }
}
