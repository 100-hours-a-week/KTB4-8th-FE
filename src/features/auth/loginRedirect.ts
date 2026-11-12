/* 구글 로그인에 성공하면 BE(OidcLoginSuccessHandler)가 앱 루트로 리다이렉트하면서 토큰을 URL 에 담아 준다.

     새 방식(BE #377)  /#accessToken=…&expiresIn=1800&initialLogin=true   ← fragment(#)
     옛 방식           /?accessToken=…&expiresIn=1800&initialLogin=true   ← 쿼리(?)

   쿼리는 서버 접속 로그와 Referer 헤더로 새어 나갈 수 있어서 fragment 로 바뀌었다. fragment 는 브라우저 안에서만 쓰이고
   서버로 전송되지 않는다. BE 가 먼저 배포돼도, FE 가 먼저 배포돼도 로그인이 깨지지 않게 두 방식을 모두 읽는다
   (같은 이름이 둘 다 있으면 fragment 가 우선). 옛 방식을 읽는 부분은 BE 배포가 끝나면 지워도 된다. */

export interface LoginRedirect {
  accessToken: string;
  /** 초 단위 — 없거나 숫자가 아니면 undefined(세션 기본값을 쓴다) */
  expiresIn?: number;
  /** 처음 가입한 계정이면 true — 온보딩으로 보낸다 */
  initialLogin: boolean;
}

const LOGIN_KEYS = ["accessToken", "expiresIn", "initialLogin"] as const;

/** location.search · location.hash 에서 로그인 결과를 읽는다. 토큰이 없으면 null */
export function readLoginRedirect(
  search: string,
  hash: string,
): LoginRedirect | null {
  const fromHash = new URLSearchParams(hash.replace(/^#/, ""));
  const fromQuery = new URLSearchParams(search);
  const pick = (key: (typeof LOGIN_KEYS)[number]) =>
    fromHash.get(key) ?? fromQuery.get(key);

  const accessToken = pick("accessToken");
  if (!accessToken) return null;
  return {
    accessToken,
    expiresIn: Number(pick("expiresIn")) || undefined,
    initialLogin: pick("initialLogin") === "true",
  };
}

/** 주소에서 로그인 결과(토큰 · 만료 · 가입 여부)만 지운 상대 주소 — 다른 쿼리는 그대로 둔다.
    history.replaceState 로 바꿔 두면 토큰이 주소창 · 방문 기록에 남지 않는다. */
export function stripLoginRedirect(
  pathname: string,
  search: string,
  hash: string,
): string {
  const query = new URLSearchParams(search);
  const frag = new URLSearchParams(hash.replace(/^#/, ""));
  for (const key of LOGIN_KEYS) {
    query.delete(key);
    frag.delete(key);
  }
  const q = query.toString();
  const f = frag.toString();
  return `${pathname}${q ? `?${q}` : ""}${f ? `#${f}` : ""}`;
}
