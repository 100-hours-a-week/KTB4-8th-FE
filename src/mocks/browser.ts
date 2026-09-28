/* 브라우저에서 MSW 워커를 띄운다 — providers.tsx 가 앱 부팅 시 호출한다.
   실서버로 전환할 때는 NEXT_PUBLIC_USE_MOCK=false 로 두면 이 모듈은 불려오지도 않는다. */
import { setupWorker } from "msw/browser";
import { BACKEND_ROUTES } from "@/lib/api/backend";
import { API_BASE } from "@/lib/api/client";
import { MOCK_MODE } from "@/lib/constants";
import { handlers } from "./handlers";

/* 하이브리드: BE 가 실제로 응답하는 API 는 MSW 에서 빼서 프록시(/api → BACKEND_ORIGIN)로 흘려보낸다 */
function activeHandlers() {
  if (MOCK_MODE !== "hybrid") return handlers;
  const served = new Set(
    BACKEND_ROUTES.map((r) => {
      const [method, path] = r.key.split(" ");
      return `${method} ${API_BASE}${path}`;
    }),
  );
  return handlers.filter((h) => {
    const { method, path } = h.info as { method: string; path: string };
    return !served.has(`${String(method).toUpperCase()} ${path}`);
  });
}

/* 시작을 promise 로 캐시한다.
   React StrictMode 는 개발 모드에서 effect 를 두 번 실행하는데, 그때 워커가 두 번 뜨면
   같은 요청에 리스너가 둘 붙어 핸들러의 부수효과(보관함 추가 등)가 두 번 일어난다.
   불린 플래그를 await 뒤에 세우면 두 호출이 모두 통과하므로 promise 자체를 캐시해야 한다. */
let starting: Promise<void> | null = null;

export function startMockWorker(): Promise<void> {
  if (starting) return starting;
  const worker = setupWorker(...activeHandlers());
  starting = worker
    .start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    })
    .then(() => undefined);
  return starting;
}
