export const queryKeys = {
  projection: ["projection"] as const,
  transactions: ["transactions"] as const,
  transaction: (id: string) => ["transaction", id] as const,
};
