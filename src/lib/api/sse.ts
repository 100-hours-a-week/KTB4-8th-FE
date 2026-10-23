/* SSE(text/event-stream) 본문 읽기 — 로그인 토큰을 헤더(Bearer)로 보내야 해서 EventSource 를 못 쓰고,
   fetch 응답 스트림을 직접 읽는다. 외부 의존성이 없는 순수 코드다. */

export interface SseMessage {
  /** event: 줄의 값. 없으면 "message" */
  event: string;
  /** data: 줄들을 줄바꿈으로 이은 값 */
  data: string;
  id: string | null;
}

/** 빈 줄로 끝나는 한 덩어리를 메시지로 바꾼다. data 가 하나도 없으면(주석·핑 등) null */
function parseBlock(block: string): SseMessage | null {
  let event = "message";
  let id: string | null = null;
  const data: string[] = [];
  for (const line of block.split(/\r\n|\n|\r/)) {
    if (!line || line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon < 0 ? line : line.slice(0, colon);
    let value = colon < 0 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
    else if (field === "id") id = value;
  }
  return data.length ? { event, data: data.join("\n"), id } : null;
}

/** 응답 스트림을 읽으면서 메시지마다 onMessage 를 부른다.
    onMessage 가 true 를 돌려주면 거기서 읽기를 멈추고 연결을 닫는다. 청크 경계가 어디에 걸려도 같은 결과다. */
export async function readSse(
  body: ReadableStream<Uint8Array>,
  onMessage: (message: SseMessage) => boolean | void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const SEPARATOR = /\r\n\r\n|\n\n|\r\r/;
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      for (let m = SEPARATOR.exec(buffer); m; m = SEPARATOR.exec(buffer)) {
        const message = parseBlock(buffer.slice(0, m.index));
        buffer = buffer.slice(m.index + m[0].length);
        if (message && onMessage(message) === true) return;
      }
      if (done) break;
    }
    // 마지막 메시지가 빈 줄 없이 끝난 경우
    const rest = parseBlock(buffer);
    if (rest) onMessage(rest);
  } finally {
    reader.cancel().catch(() => {});
  }
}
