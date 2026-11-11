/* 멱등성 키(Idempotency-Key) — 같은 POST 가 두 번 이상 도착해도 서버가 한 번만 처리하게 하는 요청 고유 번호(UUID v4).
   BE 가 이 헤더를 읽어 처리해야 효과가 있다(헤더를 모르는 서버는 그냥 무시한다).

   키는 "같은 요청"마다 정한다 — 같은 주소 + 같은 본문이면 같은 요청이다.
   · 응답을 못 받았거나(네트워크 오류 · 시간 초과) 서버 오류(5xx · 408)로 끝나서 서버가 처리했는지 모를 때는
     키를 남겨 둔다 → 사용자가 "다시 시도"를 눌러도 같은 키로 보내서 중복 처리를 막는다.
   · 서버가 분명한 답을 준 경우(성공 · 4xx)에는 키를 버린다 → 그다음 같은 요청은 새로 한 번 더 하는 것으로 본다.
   · 같은 요청이 동시에 두 번 나가면(더블 탭 등) 같은 키를 쓴다.
   남겨 둔 키는 REUSE_MS 가 지나면 버린다(서버가 키를 기억하는 기간보다 짧게 둔다). */

export const IDEMPOTENCY_HEADER = "Idempotency-Key";

/** 응답을 모르는 채 끝난 요청의 키를 다시 쓰는 시간 */
export const REUSE_MS = 10 * 60 * 1000;

interface Entry {
  key: string;
  at: number;
  /** 지금 진행 중인 같은 요청 수 */
  refs: number;
}

const entries = new Map<string, Entry>();

function newKey(): string {
  const c: Crypto | undefined =
    typeof crypto !== "undefined" ? crypto : undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  // randomUUID 가 없는 오래된 브라우저 — UUID v4 모양으로 직접 만든다
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h
    .slice(6, 8)
    .join("")}-${h.slice(8, 10).join("")}-${h.slice(10).join("")}`;
}

/** 요청 본문을 비교용 글자로 — 같은 본문이면 같은 글자가 된다 */
function bodyFingerprint(body: BodyInit | null | undefined): string {
  if (body == null) return "";
  if (typeof body === "string") return body;
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    const parts: string[] = [];
    body.forEach((value, name) => {
      parts.push(
        typeof value === "string"
          ? `${name}=${value}`
          : `${name}=file:${value.name}:${value.size}:${value.lastModified}`,
      );
    });
    return `form:${parts.join("&")}`;
  }
  if (typeof Blob !== "undefined" && body instanceof Blob)
    return `blob:${body.size}:${body.type}`;
  return String(body);
}

function purgeExpired(now: number) {
  for (const [fp, e] of entries) {
    if (e.refs === 0 && now - e.at > REUSE_MS) entries.delete(fp);
  }
}

/** 이 요청에 쓸 키를 얻는다. 끝나면 release 를 한 번 부른다.
    settled: 서버가 분명한 답을 줬다 → 키를 버린다 / unknown: 처리됐는지 모른다 → 키를 남긴다 */
export function acquireIdempotencyKey(
  method: string,
  url: string,
  body: BodyInit | null | undefined,
  now: number = Date.now(),
): { key: string; release: (outcome: "settled" | "unknown") => void } {
  purgeExpired(now);
  const fingerprint = `${method.toUpperCase()} ${url} ${bodyFingerprint(body)}`;
  let entry = entries.get(fingerprint);
  if (entry && entry.refs === 0 && now - entry.at > REUSE_MS) entry = undefined;
  if (!entry) {
    entry = { key: newKey(), at: now, refs: 0 };
    entries.set(fingerprint, entry);
  }
  entry.refs += 1;
  const mine = entry;
  let released = false;
  return {
    key: mine.key,
    release: (outcome) => {
      if (released) return;
      released = true;
      mine.refs -= 1;
      if (outcome === "settled") {
        if (entries.get(fingerprint) === mine) entries.delete(fingerprint);
      } else {
        mine.at = Date.now();
      }
    },
  };
}

/** 서버가 요청을 처리했는지 알 수 없는 상태인지 — 서버 오류(5xx) · 시간 초과(408) */
export function isUnknownOutcome(status: number): boolean {
  return status >= 500 || status === 408;
}

/** fetch 와 같다. POST 면 Idempotency-Key 헤더를 붙이고, 응답 결과에 따라 키를 남기거나 버린다.
    (SSE 응답도 헤더가 오면 서버가 요청을 받은 것이라 키를 버린다 — 스트림 중간에 끊겨도 서버 쪽 처리는 BE 가 맡는다.) */
export async function idempotentFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  if (method !== "POST") return fetch(url, init);

  const idem = acquireIdempotencyKey(method, url, init.body);
  const headers = new Headers(init.headers);
  headers.set(IDEMPOTENCY_HEADER, idem.key);
  try {
    const res = await fetch(url, { ...init, headers });
    idem.release(isUnknownOutcome(res.status) ? "unknown" : "settled");
    return res;
  } catch (e) {
    // 응답을 못 받았다(연결 끊김 · 시간 초과 · 취소) — 서버가 처리했는지 모른다
    idem.release("unknown");
    throw e;
  }
}
