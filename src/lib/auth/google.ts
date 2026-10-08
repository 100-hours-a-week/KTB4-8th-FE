/* Google OAuth(인가 코드 방식) — 인증 화면으로 보내고, 돌아온 코드를 BE 가 토큰으로 교환한다. */
export const GOOGLE_STATE_KEY = "keepgo.oauth.state";

/** Google 이 인가 코드를 돌려줄 주소 — Google Cloud Console 의 승인된 리디렉션 URI 에 등록해야 한다 */
export function oauthRedirectUri() {
  return `${window.location.origin}/oauth`;
}

export function googleAuthUrl(state: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: oauthRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
