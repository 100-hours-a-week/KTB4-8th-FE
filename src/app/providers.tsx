"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ConfirmHost } from "@/components/ui/Confirm";
import { ToastHost, setReloginHandler, toast } from "@/components/ui/Toast";
import {
  isApiError,
  readSession,
  setSessionExpiredHandler,
  subscribeSession,
  writeSession,
} from "@/lib/api/client";
import { useClarity } from "@/lib/clarity";
import { useThemeSync } from "@/features/theme/theme";
import { useFixedPin } from "@/lib/useFixedPin";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  useFixedPin();
  useThemeSync();
  useClarity();

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

  /* 세션 만료는 한 곳에서만 처리한다 (client.ts → 여기).
     만료 안내는 다시 로그인하기 전까지 **한 번만** 낸다. API 클라이언트(notifySessionExpired)와
     화면이 에러를 보여 주려고 부르는 toast.fromError(→ setReloginHandler)가 같은 expire 를 각각 부르는데,
     버튼을 눌러 요청한 화면이 아직 떠 있으면 둘 다 도착해서 토스트가 2개(문구도 다르게) 떴다. */
  useEffect(() => {
    let shown = false;
    // 새 세션이 생기면(다시 로그인하면) 다음 만료 때 다시 안내할 수 있게 풀어 둔다
    const unsubscribe = subscribeSession(() => {
      if (readSession()) shown = false;
    });
    const expire = (text = "로그인이 만료되었어요. 다시 로그인해 주세요.") => {
      if (shown) return;
      shown = true;
      writeSession(null);
      client.clear();
      toast.warn(text, "다시 로그인");
      router.replace("/login");
    };
    setSessionExpiredHandler(() => expire());
    setReloginHandler(expire);
    return () => {
      unsubscribe();
      setSessionExpiredHandler(null);
      setReloginHandler(null);
    };
  }, [client, router]);

  return (
    <QueryClientProvider client={client}>
      {children}
      <ToastHost />
      <ConfirmHost />
    </QueryClientProvider>
  );
}
