/* 네이버 지도 API v3 스크립트 로더 — 코스 상세 지도와 출발지 핀 선택 화면이 같이 쓴다.
   스크립트는 로드되는 즉시 브라우저 전역(window)을 건드리므로 브라우저에서만 호출해야 한다.
   이 모듈을 쓰는 화면은 next/dynamic({ ssr: false }) 로만 불러온다.

   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID(NAVER Cloud Platform Maps 애플리케이션의 Client ID)가
   없거나 스크립트 로드·인증에 실패하면 reject 한다. 각 화면은 이때 대체 화면으로 되돌린다. */

const NAVER_MAPS_SCRIPT_SRC = "https://oapi.map.naver.com/openapi/v3/maps.js";

/* 벡터(GL) 지도 — 소수점 확대 단계를 쓸 수 있다.
   기본(래스터) 지도는 확대 단계가 정수뿐이라 fitBounds 가 경로를 최대 2배까지 작게 · 크게 맞춘다(SDK 가 소수 줌을 반올림한다).
   GL 서브모듈(submodules=gl)을 켜면 소수 줌이 되고, 대신 지도 모양이 벡터 스타일로 바뀐다. 아직 모든 기기 · 화면에서 확인하지 못해서 기본은 꺼 둔다.
     · 주소 뒤에 ?mapgl=on 을 붙여 열면 그 브라우저에서 계속 켜진다(?mapgl=off 로 다시 끈다) — 배포 없이 비교해 볼 수 있다.
     · 빌드에 NEXT_PUBLIC_NAVER_MAP_GL=on 을 주면 모두에게 켠다.
   GL 모듈을 불러오면 map.getZoom() 숫자가 래스터 기준보다 1 작다(같은 화면이 한 단계 낮은 숫자) — zoomShift() 로 맞춘다. */
const GL_STORAGE_KEY = "keepgo.map.gl";

function decideGl(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get("mapgl");
    if (q === "on" || q === "off")
      window.localStorage.setItem(GL_STORAGE_KEY, q);
    const saved = window.localStorage.getItem(GL_STORAGE_KEY);
    if (saved === "on") return true;
    if (saved === "off") return false;
  } catch {
    /* 저장소가 막혀 있으면 빌드 설정을 따른다 */
  }
  return process.env.NEXT_PUBLIC_NAVER_MAP_GL === "on";
}

let glMode: boolean | null = null;

/** 이번 페이지에서 벡터(GL) 지도 스크립트를 쓰는가 — 처음 한 번 정하고 바꾸지 않는다 */
export function isNaverGl(): boolean {
  if (glMode === null) glMode = typeof window !== "undefined" && decideGl();
  return glMode;
}

/** GL 모듈을 불러온 페이지에서 확대 단계 숫자를 래스터 기준에서 옮기는 값(-1). 쓰지 않으면 0 */
export function zoomShift(): number {
  return isNaverGl() ? -1 : 0;
}

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
    script.src = `${NAVER_MAPS_SCRIPT_SRC}?ncpKeyId=${encodeURIComponent(clientId)}${isNaverGl() ? "&submodules=gl" : ""}`;
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
