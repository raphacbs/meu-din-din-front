import dayjs, { type Dayjs } from "dayjs";

import { formatBrazilianCurrencyInput, parseBrazilianCurrencyInput } from "@/lib/format/currency-input";
import type {
  RecurrenceFrequency,
  TransactionResponse,
  TransactionType,
  TransactionUpsertRequest,
} from "@/lib/types/api";

export type TransactionMode = "single" | "installment" | "recurring";

export interface TransactionAntdFormValues {
  mode: TransactionMode;
  type: TransactionType;
  amount?: number;
  description: string;
  transactionDate: Dayjs;
  dueDate?: Dayjs;
  paymentDate?: Dayjs;
  tags?: string[];
  installmentCount?: number;
  installmentAmount?: number;
  firstDueDate?: Dayjs;
  frequency?: RecurrenceFrequency;
  intervalCount?: number;
  nextOccurrenceDate?: Dayjs;
  endDate?: Dayjs;
}

export interface TransactionFormState {
  mode: TransactionMode;
  type: TransactionType;
  amountInput: string;
  description: string;
  transactionDate: string;
  dueDate: string;
  paymentDate: string;
  tagsInput: string;
  installmentCount: string;
  installmentAmountInput: string;
  firstDueDate: string;
  frequency: RecurrenceFrequency;
  intervalCount: string;
  nextOccurrenceDate: string;
  endDate: string;
}

export interface TransactionFormErrors {
  form?: string;
  amountInput?: string;
  description?: string;
  transactionDate?: string;
  dueDate?: string;
  installmentCount?: string;
  installmentAmountInput?: string;
  firstDueDate?: string;
  intervalCount?: string;
  nextOccurrenceDate?: string;
}

export const defaultTransactionFormState: TransactionFormState = {
  mode: "single",
  type: "DESPESA",
  amountInput: "",
  description: "",
  transactionDate: "",
  dueDate: "",
  paymentDate: "",
  tagsInput: "",
  installmentCount: "",
  installmentAmountInput: "",
  firstDueDate: "",
  frequency: "MONTHLY",
  intervalCount: "1",
  nextOccurrenceDate: "",
  endDate: "",
};

function parseTags(tagsInput: string): string[] | undefined {
  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return tags.length ? tags : undefined;
}

export function validateTransactionForm(state: TransactionFormState): TransactionFormErrors {
  const errors: TransactionFormErrors = {};

  if (!state.description.trim()) {
    errors.description = "Informe uma descrição.";
  }

  if (!state.transactionDate) {
    errors.transactionDate = "Informe a data da transação.";
  }

  if (state.mode === "single" || state.mode === "recurring") {
    if (parseBrazilianCurrencyInput(state.amountInput) === null) {
      errors.amountInput =
        state.mode === "recurring"
          ? "Informe o valor da recorrência."
          : "Informe o valor da transação.";
    }

    if (!state.dueDate) {
      errors.dueDate =
        state.mode === "recurring"
          ? "Informe o vencimento da recorrência."
          : "Informe a data de vencimento.";
    }
  }

  if (state.mode === "installment") {
    const installmentCount = Number(state.installmentCount);
    if (!Number.isInteger(installmentCount) || installmentCount < 2) {
      errors.installmentCount = "Informe ao menos 2 parcelas.";
    }

    if (parseBrazilianCurrencyInput(state.installmentAmountInput) === null) {
      errors.installmentAmountInput = "Informe o valor da parcela.";
    }

    if (!state.firstDueDate) {
      errors.firstDueDate = "Informe a data da primeira parcela.";
    }
  }

  if (state.mode === "recurring") {
    const intervalCount = Number(state.intervalCount);
    if (!Number.isInteger(intervalCount) || intervalCount < 1) {
      errors.intervalCount = "Informe um intervalo válido.";
    }

    if (!state.nextOccurrenceDate) {
      errors.nextOccurrenceDate = "Informe a próxima ocorrência.";
    }
  }

  return errors;
}

export function hasTransactionFormErrors(errors: TransactionFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildTransactionPayload(state: TransactionFormState): TransactionUpsertRequest | null {
  const amount = parseBrazilianCurrencyInput(state.amountInput);
  const payload: TransactionUpsertRequest = {
    type: state.type,
    amount: 0,
    description: state.description.trim(),
    transactionDate: state.transactionDate,
    dueDate: state.dueDate || undefined,
    paymentDate: state.paymentDate || undefined,
    tags: parseTags(state.tagsInput),
  };

  if (state.mode === "single") {
    if (amount === null || !state.dueDate) {
      return null;
    }

    payload.amount = amount;
    payload.dueDate = state.dueDate;
    return payload;
  }

  if (state.mode === "installment") {
    const installmentAmount = parseBrazilianCurrencyInput(state.installmentAmountInput);
    const installmentCount = Number(state.installmentCount);

    if (installmentAmount === null || !state.firstDueDate) {
      return null;
    }

    payload.amount = installmentAmount;
    payload.installment = {
      installmentCount,
      installmentAmount,
      firstDueDate: state.firstDueDate,
    };

    return payload;
  }

  const intervalCount = Number(state.intervalCount);
  if (amount === null || !state.dueDate || !state.nextOccurrenceDate) {
    return null;
  }

  payload.amount = amount;
  payload.dueDate = state.dueDate;
  payload.recurrence = {
    frequency: state.frequency,
    intervalCount,
    nextOccurrenceDate: state.nextOccurrenceDate,
    endDate: state.endDate || undefined,
  };

  return payload;
}

export function mapAntdFormValuesToState(values: TransactionAntdFormValues): TransactionFormState {
  return {
    mode: values.mode,
    type: values.type,
    amountInput:
      values.amount !== undefined ? formatBrazilianCurrencyInput(values.amount) : "",
    description: values.description,
    transactionDate: values.transactionDate.format("YYYY-MM-DD"),
    dueDate: values.dueDate?.format("YYYY-MM-DD") ?? "",
    paymentDate: values.paymentDate?.format("YYYY-MM-DD") ?? "",
    tagsInput: values.tags?.join(", ") ?? "",
    installmentCount:
      values.installmentCount !== undefined ? String(values.installmentCount) : "",
    installmentAmountInput:
      values.installmentAmount !== undefined
        ? formatBrazilianCurrencyInput(values.installmentAmount)
        : "",
    firstDueDate: values.firstDueDate?.format("YYYY-MM-DD") ?? "",
    frequency: values.frequency ?? "MONTHLY",
    intervalCount: values.intervalCount !== undefined ? String(values.intervalCount) : "1",
    nextOccurrenceDate: values.nextOccurrenceDate?.format("YYYY-MM-DD") ?? "",
    endDate: values.endDate?.format("YYYY-MM-DD") ?? "",
  };
}

export function mapTransactionToAntdFormValues(
  transaction: TransactionResponse,
): TransactionAntdFormValues {
  const state = mapTransactionToFormState(transaction);

  return {
    mode: state.mode,
    type: state.type,
    amount: transaction.amount,
    description: state.description,
    transactionDate: dayjsFromDateString(state.transactionDate),
    dueDate: state.dueDate ? dayjsFromDateString(state.dueDate) : undefined,
    paymentDate: state.paymentDate ? dayjsFromDateString(state.paymentDate) : undefined,
    tags: transaction.tags,
    installmentCount: state.installmentCount ? Number(state.installmentCount) : undefined,
    installmentAmount: transaction.amount,
    firstDueDate: state.firstDueDate ? dayjsFromDateString(state.firstDueDate) : undefined,
    frequency: state.frequency,
    intervalCount: Number(state.intervalCount),
    nextOccurrenceDate: state.nextOccurrenceDate
      ? dayjsFromDateString(state.nextOccurrenceDate)
      : undefined,
    endDate: state.endDate ? dayjsFromDateString(state.endDate) : undefined,
  };
}

function dayjsFromDateString(value: string): Dayjs {
  return dayjs(value);
}

export function mapTransactionToFormState(transaction: TransactionResponse): TransactionFormState {
  const hasInstallmentGroup = transaction.group?.type === "PARCELAMENTO";
  const hasRecurrenceGroup = transaction.group?.type === "RECORRENCIA";

  return {
    mode: hasInstallmentGroup ? "installment" : hasRecurrenceGroup ? "recurring" : "single",
    type: transaction.type,
    amountInput: transaction.amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    description: transaction.description,
    transactionDate: transaction.transactionDate,
    dueDate: transaction.dueDate ?? "",
    paymentDate: transaction.paymentDate ?? "",
    tagsInput: transaction.tags?.join(", ") ?? "",
    installmentCount: transaction.installmentCount ? String(transaction.installmentCount) : "",
    installmentAmountInput: transaction.amount.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    firstDueDate: transaction.dueDate ?? "",
    frequency: "MONTHLY",
    intervalCount: "1",
    nextOccurrenceDate: transaction.dueDate ?? transaction.transactionDate,
    endDate: "",
  };
}
