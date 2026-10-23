import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/monitoring/sentryOptions";

// Node 서버(BFF 라우트 /bff/*, 서버 렌더)에서 나는 에러
Sentry.init(sentryOptions);
