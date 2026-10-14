import { loadSentry } from "@/lib/monitoring/sentryClient";
import { sentryOptions } from "@/lib/monitoring/sentryOptions";

/* 브라우저 에러 수집 시작.
   SDK 는 화면이 다 뜬 뒤 한가할 때 불러온다(첫 로딩 번들을 키우지 않으려고).
   그 사이에 난 에러는 아래 임시 수집기가 모아 두었다가 SDK 가 준비되면 같이 보낸다. */
if (sentryOptions.dsn) {
  const early: unknown[] = [];
  const MAX_EARLY = 20;

  const onError = (e: ErrorEvent) => {
    if (early.length < MAX_EARLY) early.push(e.error ?? new Error(e.message));
  };
  const onRejection = (e: PromiseRejectionEvent) => {
    if (early.length < MAX_EARLY) early.push(e.reason);
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  const start = () => {
    const run = () =>
      void loadSentry()
        .then((Sentry) => {
          // SDK 가 자체 감지를 시작했으니 임시 수집기는 걷고, 모아 둔 에러를 보낸다
          window.removeEventListener("error", onError);
          window.removeEventListener("unhandledrejection", onRejection);
          early.splice(0).forEach((err) => Sentry.captureException(err));
        })
        .catch(() => {
          /* 불러오기에 실패해도 화면은 그대로 동작한다 */
        });
    // Safari 등 requestIdleCallback 이 없는 브라우저는 잠깐 뒤에 시작한다
    if (typeof window.requestIdleCallback === "function")
      window.requestIdleCallback(run, { timeout: 4000 });
    else window.setTimeout(run, 2000);
  };

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
