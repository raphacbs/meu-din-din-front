"use client";

import { useQuery } from "@tanstack/react-query";

import { transactions } from "@/lib/api/transactions";
import { queryKeys } from "@/lib/query/keys";

export function useTagOptions(): string[] {
  const { data } = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: () => transactions.list(),
    staleTime: 30_000,
  });

  return [...new Set(data?.flatMap((transaction) => transaction.tags ?? []) ?? [])].sort();
}
