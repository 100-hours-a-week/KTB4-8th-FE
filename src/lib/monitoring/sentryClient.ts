import { sentryOptions } from "./sentryOptions";

/* Sentry SDK 는 gzip 으로도 60KB 가까이 돼서, 첫 로딩 번들에 넣으면 모든 화면이 느려진다.
   그래서 화면이 다 뜬 뒤 브라우저가 한가할 때 따로 내려받아 초기화한다.
   에러를 보낼 때는 항상 이 모듈을 거쳐서, 아직 안 불러왔으면 그때 불러온 뒤 보낸다. */

type SentryModule = typeof import("@sentry/nextjs");

let loading: Promise<SentryModule> | null = null;

/** SDK 를 불러와 한 번만 초기화한다. 이미 불러왔으면 같은 Promise 를 돌려준다. */
export function loadSentry(): Promise<SentryModule> {
  if (!loading) {
    loading = import("@sentry/nextjs").then((Sentry) => {
      Sentry.init(sentryOptions);
      return Sentry;
    });
  }
  return loading;
}

/** DSN 이 없으면(로컬 · CI) SDK 를 불러오지도 않고 아무것도 하지 않는다. */
export function withSentry(run: (Sentry: SentryModule) => void): void {
  if (!sentryOptions.dsn) return;
  loadSentry()
    .then(run)
    .catch(() => {
      /* 에러 보고가 화면 동작을 막으면 안 된다 */
    });
}
