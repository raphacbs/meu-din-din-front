"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Empty, Result, Space, Spin } from "antd";
import dayjs from "dayjs";

import { MeuMesHero } from "@/components/transactions/meu-mes-hero";
import { MeuMesTransactionLists } from "@/components/transactions/meu-mes-transaction-lists";
import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { inferPeriodMode, monthRange } from "@/lib/period/date-range";
import { parsePeriodSearchParams, replacePeriodInUrl } from "@/lib/period/url";
import { queryKeys } from "@/lib/query/keys";
import { usePeriodStore } from "@/lib/stores/period-store";
import {
  calculateMeuMesSummary,
  splitMeuMesLists,
} from "@/lib/transactions/totals";
import type { TransactionResponse } from "@/lib/types/api";

const EXIT_MS = 360;
const ENTER_MS = 380;

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "Não foi possível carregar Meu mês.";
  }

  return "Não foi possível carregar Meu mês.";
}

function buildMeuMesQueryKey(fromDate?: string, toDate?: string) {
  return [...queryKeys.transactions, "meu-mes", fromDate ?? "", toDate ?? ""] as const;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function MeuMesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [heroPulse, setHeroPulse] = useState(false);
  const timersRef = useRef<number[]>([]);

  const draft = usePeriodStore((state) => state.draft);
  const applied = usePeriodStore((state) => state.applied);
  const applyMonth = usePeriodStore((state) => state.applyMonth);
  const applyCurrentMonthDefault = usePeriodStore((state) => state.applyCurrentMonthDefault);

  useEffect(() => {
    const parsed = parsePeriodSearchParams(searchParams);

    if (parsed) {
      const fromDate = dayjs(parsed.from);
      const year = fromDate.year();
      const month = fromDate.month() + 1;
      const range = monthRange(year, month);
      applyMonth(year, month);

      if (
        inferPeriodMode(parsed.from, parsed.to) !== "month" ||
        parsed.from !== range.from ||
        parsed.to !== range.to
      ) {
        replacePeriodInUrl(router, pathname, range.from, range.to);
      }
    } else {
      const range = applyCurrentMonthDefault();
      replacePeriodInUrl(router, pathname, range.from, range.to);
    }

    setHydrated(true);
    // Hydrate once on mount from URL or current month default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const meuMesQuery = useQuery({
    queryKey: buildMeuMesQueryKey(applied?.from, applied?.to),
    queryFn: () => transactions.extract(applied!.from, applied!.to),
    enabled: hydrated && Boolean(applied?.from && applied?.to),
  });

  const lists = useMemo(
    () => splitMeuMesLists(meuMesQuery.data ?? []),
    [meuMesQuery.data],
  );
  const summary = useMemo(
    () => calculateMeuMesSummary(meuMesQuery.data ?? []),
    [meuMesQuery.data],
  );

  function handleMonthChange(year: number, month: number) {
    const range = applyMonth(year, month);
    replacePeriodInUrl(router, pathname, range.from, range.to);
  }

  async function invalidateAfterSettle() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projection }),
    ]);
  }

  function handleSettleSuccess(transaction: TransactionResponse) {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    if (prefersReducedMotion()) {
      void invalidateAfterSettle();
      return;
    }

    setExitingId(transaction.id);
    setHeroPulse(true);

    const exitTimer = window.setTimeout(() => {
      void invalidateAfterSettle().then(() => {
        setExitingId(null);
        setEnteringId(transaction.id);

        const enterTimer = window.setTimeout(() => {
          setEnteringId(null);
          setHeroPulse(false);
        }, ENTER_MS);
        timersRef.current.push(enterTimer);
      });
    }, EXIT_MS);

    timersRef.current.push(exitTimer);
  }

  const hasActiveItems = summary.activeCount > 0;

  return (
    <Space direction="vertical" size={28} style={{ width: "100%" }}>
      <MeuMesHero
        year={draft.year}
        month={draft.month}
        summary={hydrated ? summary : null}
        pulse={heroPulse}
        onMonthChange={handleMonthChange}
      />

      {!hydrated || !applied || meuMesQuery.isLoading ? (
        <Spin tip="Carregando Meu mês...">
          <div style={{ minHeight: 160 }} />
        </Spin>
      ) : meuMesQuery.isError ? (
        <Result
          status="error"
          title={getErrorMessage(meuMesQuery.error)}
          extra={<Button onClick={() => void meuMesQuery.refetch()}>Tentar novamente</Button>}
        />
      ) : !hasActiveItems ? (
        <Empty description="Nenhuma movimentação neste mês." />
      ) : (
        <MeuMesTransactionLists
          pending={lists.pending}
          settled={lists.settled}
          exitingId={exitingId}
          enteringId={enteringId}
          onSettleSuccess={handleSettleSuccess}
        />
      )}
    </Space>
  );
}
