/* 네이버 지도 API v3 스크립트 로더 — 코스 상세 지도와 출발지 핀 선택 화면이 같이 쓴다.
   스크립트는 로드되는 즉시 브라우저 전역(window)을 건드리므로 브라우저에서만 호출해야 한다.
   이 모듈을 쓰는 화면은 next/dynamic({ ssr: false }) 로만 불러온다.

   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID(NAVER Cloud Platform Maps 애플리케이션의 Client ID)가
   없거나 스크립트 로드·인증에 실패하면 reject 한다. 각 화면은 이때 대체 화면으로 되돌린다. */

const NAVER_MAPS_SCRIPT_SRC = "https://oapi.map.naver.com/openapi/v3/maps.js";

let naverMapsPromise: Promise<typeof naver> | null = null;

/** 네이버 지도 스크립트를 한 번만 로드하고, 이후 호출은 같은 프로미스를 재사용한다 */
export function loadNaverMaps(): Promise<typeof naver> {
  if (typeof window !== "undefined" && window.naver?.maps) {
    return Promise.resolve(window.naver);
  }
  if (naverMapsPromise) return naverMapsPromise;
  naverMapsPromise = new Promise((resolve, reject) => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      reject(
        new Error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 가 설정되지 않았습니다."),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `${NAVER_MAPS_SCRIPT_SRC}?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps) resolve(window.naver);
      else reject(new Error("네이버 지도 스크립트를 불러오지 못했습니다."));
    };
    script.onerror = () => {
      naverMapsPromise = null; // 다음 시도 때 다시 로드할 수 있게 한다
      reject(new Error("네이버 지도 스크립트를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });
  return naverMapsPromise;
}
