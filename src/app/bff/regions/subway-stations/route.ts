import { NextRequest, NextResponse } from "next/server";
import { lineOf, stationNameOf } from "@/lib/address/kakaoSubway";

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
