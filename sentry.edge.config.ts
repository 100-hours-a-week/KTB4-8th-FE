import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/monitoring/sentryOptions";

// 엣지 런타임에서 나는 에러(지금은 쓰는 곳이 없지만 미들웨어를 추가해도 잡히도록 둔다)
Sentry.init(sentryOptions);
