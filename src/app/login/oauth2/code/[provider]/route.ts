/* Google 로그인 콜백 — 사용자가 값을 복사·붙여넣기 하지 않도록, 이 경로가 대신 받는다.
   BE 의 SecurityFilterChain 은 `/login/oauth2/code/**` 로 오는 요청만 처리하고, 인증이 끝나면
   이 정확한 경로(BE 관점)로 액세스 토큰 JSON 을 직접 응답한다 — 화면을 쓰는 페이지가 아니다.
   Google 이 실제로 이 주소로 브라우저를 보내려면, BE 쪽 registration.redirect-uri 가
   (BE 자신의 host 가 아니라) 이 FE 주소로 고정돼 있어야 한다 — 지금은 아니라서, 이 경로는
   아직 브라우저에서 호출되지 않는다(로그인 화면의 "토큰 붙여넣기"가 그동안의 대체 수단이다).
   그 설정만 바뀌면 이 파일이 즉시 토큰을 받아 세션에 저장하고 홈으로 보낸다 — FE 쪽엔 추가로 할 일이 없다. */
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://127.0.0.1:8080";

interface BeLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

function readSetCookies(headers: Headers): string[] {
  const getSetCookie = (
    headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;
  if (typeof getSetCookie === "function") return getSetCookie.call(headers);
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function htmlResponse(body: string, setCookies: string[]) {
  const res = new NextResponse(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
  setCookies.forEach((cookie) => res.headers.append("set-cookie", cookie));
  return res;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  const beUrl = `${BACKEND_ORIGIN}/login/oauth2/code/${params.provider}${request.nextUrl.search}`;

  const beRes = await fetch(beUrl, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    redirect: "manual",
  });
  const setCookies = readSetCookies(beRes.headers);

  if (!beRes.ok) {
    return htmlResponse(
      `<!doctype html><meta charset="utf-8">` +
        `<script>location.replace("/login?authError=1");</script>` +
        `로그인에 실패했어요. 잠시 후 다시 시도해 주세요.`,
      setCookies,
    );
  }

  const body = (await beRes.json()) as BeLoginResponse;
  const session = {
    accessToken: body.access_token,
    tokenType: body.token_type,
    expiresIn: body.expires_in,
    issuedAt: Date.now(),
  };

  return htmlResponse(
    `<!doctype html><meta charset="utf-8"><script>` +
      `localStorage.setItem("keepgo.session.v1", ${JSON.stringify(JSON.stringify(session))});` +
      `location.replace("/home");` +
      `</script>`,
    setCookies,
  );
}
