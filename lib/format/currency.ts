export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatSignedCurrency(amount: number, type: "DESPESA" | "RECEITA"): string {
  const formatted = formatCurrency(Math.abs(amount));
  return type === "DESPESA" ? `-${formatted}` : `+${formatted}`;
}
