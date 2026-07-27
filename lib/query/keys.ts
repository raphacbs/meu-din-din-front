export const queryKeys = {
  projection: ["projection"] as const,
  transactions: ["transactions"] as const,
  transaction: (id: string) => ["transaction", id] as const,
  tags: ["tags"] as const,
  analyticsDashboard: (year: number) => ["analytics", "dashboard", year] as const,
};
