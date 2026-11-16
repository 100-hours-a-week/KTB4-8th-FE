import { naverMapUrl } from "./format";

/* 네이버 지도 길찾기 열기.
   - 모바일: 네이버 지도 앱의 URL Scheme(nmap://route/public?…)을 연다. 출발지를 생략하면 네이버 지도가
     "내 현재 위치"를 출발지로 쓴다(네이버 공식 문서의 기본값). 앱이 없어서 화면이 안 바뀌면 웹 장소 페이지로 이어 간다.
   - PC: 웹 길찾기 주소는 공식 문서에 없어서, 확인된 방식인 "도착 장소 페이지"를 새 탭으로 연다
     (거기서 네이버 지도의 [길찾기]를 누르면 된다).
   경로 계산은 네이버 지도가 하고, 이 앱은 출발지 · 도착지만 넘긴다.

   코스 전체(첫 장소 → 중간 장소들 → 마지막 장소)는 openNaverCourseRoute 가 경유지로 이어서 연다.
   경유지가 있는 길찾기는 도보로만 열려서, 멀 수 있는 사용자 출발지는 넣지 않고 코스의 장소끼리만 잇는다.
   - 앱: nmap://route/walk 의 경유지 파라미터(v1lat · v1lng · v1name … 최대 5개, 공식 문서). 문서의 경유지 예시는 자동차뿐이라,
     도보에서 경유지가 반영되는지는 실제 폰의 네이버 지도 앱에서 확인이 필요하다.
   - PC 웹: 문서에 없는 주소지만 브라우저로 열어 확인한 형식을 쓴다 — 네이버 지도가 바꾸면 이 부분이 먼저 깨질 수 있다.
       https://map.naver.com/p/directions/{출발}/{도착}/{경유1:경유2…}/walk   (각 지점은 "x,y,이름", x · y 는 웹 메르카토르 좌표) */

/** 네이버 지도에 알려 주는 앱 이름(통계용 식별자) */
const APP_NAME = "keepgo";
/** 앱이 안 열렸다고 보고 웹으로 넘어가기까지 기다리는 시간 */
const APP_OPEN_WAIT_MS = 1600;

export interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
}

/** 좌표가 둘 다 있을 때만 RoutePoint 로 만든다 */
export function toRoutePoint(
  name: string,
  lat: number | null | undefined,
  lng: number | null | undefined,
): RoutePoint | null {
  return typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
    ? { lat, lng, name }
    : null;
}

/** 네이버 지도 앱 길찾기 주소 — from 이 없으면 내 현재 위치에서 출발한다 */
export function naverAppRouteUrl(dest: RoutePoint, from?: RoutePoint | null) {
  const q: string[] = [];
  if (from) {
    q.push(
      `slat=${from.lat}`,
      `slng=${from.lng}`,
      `sname=${encodeURIComponent(from.name)}`,
    );
  }
  q.push(
    `dlat=${dest.lat}`,
    `dlng=${dest.lng}`,
    `dname=${encodeURIComponent(dest.name)}`,
    `appname=${APP_NAME}`,
  );
  return `nmap://route/public?${q.join("&")}`;
}

/** 길찾기를 연다 — 버튼을 누른 이벤트 안에서 불러야 새 탭이 막히지 않는다 */
export function openNaverRoute(dest: RoutePoint, from?: RoutePoint | null) {
  const web = naverMapUrl(dest.name);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) {
    window.open(web, "_blank", "noopener,noreferrer");
    return;
  }

  openAppWithWebFallback(naverAppRouteUrl(dest, from), web);
}

/** 앱 주소를 열고, 앱이 안 열렸으면(이 페이지가 그대로면) 웹 주소로 넘어간다 */
function openAppWithWebFallback(appUrl: string, webUrl: string) {
  let leftPage = false;
  const onHide = () => {
    if (document.visibilityState === "hidden") leftPage = true;
  };
  document.addEventListener("visibilitychange", onHide);
  window.location.href = appUrl;
  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onHide);
    // 앱이 열렸다면 이 페이지가 가려졌을 것이다. 그대로면 앱이 없는 것이니 웹으로 연다
    if (!leftPage) window.location.assign(webUrl);
  }, APP_OPEN_WAIT_MS);
}

/** 경유지는 네이버 지도가 받는 만큼(앱 문서 기준 최대 5개)만 넘긴다 */
const MAX_VIA = 5;

/** 위 · 경도 → 네이버 지도 웹 주소가 쓰는 좌표(웹 메르카토르, EPSG:3857) */
function toWebMercator(lat: number, lng: number): [number, number] {
  const R = 6378137;
  return [
    (R * lng * Math.PI) / 180,
    R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
  ];
}

function webPoint(p: RoutePoint) {
  const [x, y] = toWebMercator(p.lat, p.lng);
  return `${x.toFixed(7)},${y.toFixed(7)},${encodeURIComponent(p.name)}`;
}

/** 네이버 지도 웹 도보 길찾기 — 출발 → 경유지(차례대로) → 도착 */
export function naverWebCourseUrl(
  start: RoutePoint,
  via: RoutePoint[],
  dest: RoutePoint,
) {
  const v = via.length ? via.map(webPoint).join(":") : "-";
  return `https://map.naver.com/p/directions/${webPoint(start)}/${webPoint(dest)}/${v}/walk`;
}

/** 네이버 지도 앱 도보 길찾기 주소 — start 가 없으면 내 현재 위치에서 출발한다 */
export function naverAppCourseUrl(
  start: RoutePoint | null,
  via: RoutePoint[],
  dest: RoutePoint,
) {
  const q: string[] = [];
  if (start) {
    q.push(
      `slat=${start.lat}`,
      `slng=${start.lng}`,
      `sname=${encodeURIComponent(start.name)}`,
    );
  }
  q.push(
    `dlat=${dest.lat}`,
    `dlng=${dest.lng}`,
    `dname=${encodeURIComponent(dest.name)}`,
  );
  via.forEach((p, i) => {
    q.push(
      `v${i + 1}lat=${p.lat}`,
      `v${i + 1}lng=${p.lng}`,
      `v${i + 1}name=${encodeURIComponent(p.name)}`,
    );
  });
  q.push(`appname=${APP_NAME}`);
  return `nmap://route/walk?${q.join("&")}`;
}

/** 코스 전체 길찾기를 연다 — 첫 장소에서 출발해 중간 장소들을 경유지로 이어 마지막 장소까지(도보).
    버튼을 누른 이벤트 안에서 불러야 새 탭이 막히지 않는다. stops 는 좌표를 아는 장소만 순서대로 */
export function openNaverCourseRoute(stops: RoutePoint[]) {
  // 장소가 하나면 이어 줄 경로가 없다 — 그 장소 하나의 길찾기로 연다
  if (stops.length < 2) {
    if (stops[0]) openNaverRoute(stops[0]);
    return;
  }
  const start = stops[0];
  const dest = stops[stops.length - 1];
  const via = stops.slice(1, -1).slice(0, MAX_VIA);

  const web = naverWebCourseUrl(start, via, dest);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) {
    window.open(web, "_blank", "noopener,noreferrer");
    return;
  }
  openAppWithWebFallback(naverAppCourseUrl(start, via, dest), web);
}

/** i 번째 장소의 출발지 — 앞쪽에서 좌표를 아는 가장 가까운 장소. 없으면 null(내 현재 위치에서 출발) */
export function previousPoint(
  points: (RoutePoint | null)[],
  i: number,
): RoutePoint | null {
  for (let k = i - 1; k >= 0; k--) {
    const p = points[k];
    if (p) return p;
  }
  return null;
}
