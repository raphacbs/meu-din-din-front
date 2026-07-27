export interface InstallmentGroupDraft {
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  description: string;
  tags?: string[];
}

export interface InstallmentGroupImpact {
  hasStructuralImpact: boolean;
  amountChanged: boolean;
  countChanged: boolean;
  firstDueDateChanged: boolean;
  countDelta: number;
  messages: string[];
}

export function buildInstallmentGroupImpact(
  baseline: InstallmentGroupDraft,
  draft: InstallmentGroupDraft,
): InstallmentGroupImpact {
  const amountChanged = draft.installmentAmount !== baseline.installmentAmount;
  const countChanged = draft.installmentCount !== baseline.installmentCount;
  const firstDueDateChanged = draft.firstDueDate !== baseline.firstDueDate;
  const countDelta = draft.installmentCount - baseline.installmentCount;
  const messages: string[] = [];

  if (amountChanged) {
    messages.push("O novo valor será aplicado a todas as parcelas do grupo, inclusive as já liquidadas.");
  }

  if (countDelta > 0) {
    messages.push(
      `Serão criadas ${countDelta} parcela${countDelta === 1 ? "" : "s"} no fim da série.`,
    );
  } else if (countDelta < 0) {
    const removed = Math.abs(countDelta);
    messages.push(
      `Serão removidas ${removed} parcela${removed === 1 ? "" : "s"} do fim da série (apenas parcelas não liquidadas).`,
    );
  }

  if (firstDueDateChanged) {
    messages.push("Os vencimentos de todas as parcelas serão recalculados a partir do novo primeiro vencimento.");
  }

  return {
    hasStructuralImpact: amountChanged || countChanged,
    amountChanged,
    countChanged,
    firstDueDateChanged,
    countDelta,
    messages,
  };
}
