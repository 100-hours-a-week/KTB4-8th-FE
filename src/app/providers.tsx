"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ConfirmHost } from "@/components/ui/Confirm";
import { ToastHost, setReloginHandler, toast } from "@/components/ui/Toast";
import {
  isApiError,
  setSessionExpiredHandler,
  writeSession,
} from "@/lib/api/client";
import { USE_MOCK } from "@/lib/constants";

/* ── Mock(MSW) ───────────────────────────────────────────
   NEXT_PUBLIC_USE_MOCK=true 이면 브라우저에서 서비스워커를 띄운다.
   백엔드 연동 후에는 환경변수만 false 로 내리면 된다. */
function useMockWorker() {
  const [ready, setReady] = useState(!USE_MOCK);

  useEffect(() => {
    if (!USE_MOCK) return;
    let cancelled = false;
    (async () => {
      const { startMockWorker } = await import("@/mocks/browser");
      await startMockWorker();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const mockReady = useMockWorker();

  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) => {
              // 4xx 는 재시도하지 않는다. 5xx 만 한 번 더.
              if (isApiError(error) && error.status < 500) return false;
              return count < 1;
            },
          },
        },
      }),
  );

  /* 세션 만료는 한 곳에서만 처리한다 (client.ts → 여기) */
  useEffect(() => {
    const expire = (text = "로그인이 만료되었어요. 다시 로그인해 주세요.") => {
      writeSession(null);
      client.clear();
      toast.warn(text, "다시 로그인");
      router.replace("/login");
    };
    setSessionExpiredHandler(() => expire());
    setReloginHandler(expire);
    return () => {
      setSessionExpiredHandler(null);
      setReloginHandler(null);
    };
  }, [client, router]);

  if (!mockReady) return null;

  return (
    <QueryClientProvider client={client}>
      {children}
      <ToastHost />
      <ConfirmHost />
    </QueryClientProvider>
  );
}
