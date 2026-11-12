/* 앱 홈 화면의 주소.
   로그인한 사용자가 keepgo.kr/ 로 들어오면 앱 홈이 보이고(로그인 전에는 랜딩페이지), 예전 주소 /home 도 그대로 열린다.
   "지금 홈에 있는지"를 가를 때는 주소를 직접 견주지 말고 isHomePath 를 쓴다 — / 와 /home 이 같은 화면이다. */

/** 로그인 뒤에 보내는 홈 주소 */
export const HOME_PATH = "/";

/** 앱 홈 화면(/ 또는 /home)인지 — 하위 화면(/home/places 등)은 해당하지 않는다 */
export function isHomePath(pathname: string | null | undefined): boolean {
  return pathname === "/" || pathname === "/home";
}

/** 하단 탭의 "홈" 강조 여부 — 홈과 그 하위 화면(/home/places · /home/events) */
export function isHomeTabActive(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/home");
}
