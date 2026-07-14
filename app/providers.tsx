"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App, ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";
import { useState } from "react";

import { SessionProvider } from "@/lib/auth/session-context";
import { antdTheme } from "@/lib/theme/antd-theme";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme} locale={ptBR}>
        <App>
          <SessionProvider>{children}</SessionProvider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
