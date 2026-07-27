import { normalizeTagName } from "@/lib/tags/constants";
import type { TransactionResponse, TransactionType } from "@/lib/types/api";

export type MeuMesTypeFilter = TransactionType | "ALL";

function normalizeSearchQuery(query: string): string {
  return query.trim().toUpperCase();
}

function transactionMatchesSearch(transaction: TransactionResponse, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  if (transaction.description.toUpperCase().includes(normalizedQuery)) {
    return true;
  }

  return (transaction.tags ?? []).some((tag) =>
    normalizeTagName(tag).includes(normalizedQuery),
  );
}

function transactionMatchesType(
  transaction: TransactionResponse,
  typeFilter: MeuMesTypeFilter,
): boolean {
  if (typeFilter === "ALL") {
    return true;
  }

  return transaction.type === typeFilter;
}

export function filterMeuMesTransactions(
  transactions: TransactionResponse[],
  options: {
    searchQuery?: string;
    typeFilter?: MeuMesTypeFilter;
  } = {},
): TransactionResponse[] {
  const normalizedQuery = normalizeSearchQuery(options.searchQuery ?? "");
  const typeFilter = options.typeFilter ?? "ALL";

  return transactions.filter(
    (transaction) =>
      transactionMatchesSearch(transaction, normalizedQuery) &&
      transactionMatchesType(transaction, typeFilter),
  );
}
