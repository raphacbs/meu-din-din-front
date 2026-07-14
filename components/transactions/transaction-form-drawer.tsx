"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Drawer, Grid, message } from "antd";
import { useState } from "react";

import { TransactionForm } from "@/components/transactions/transaction-form";
import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import {
  mapTransactionToAntdFormValues,
  type TransactionAntdFormValues,
} from "@/lib/transactions/form";
import { queryKeys } from "@/lib/query/keys";
import type { TransactionResponse, TransactionUpsertRequest } from "@/lib/types/api";

interface TransactionFormDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  transaction?: TransactionResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function getMutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "Não foi possível salvar a transação.";
  }

  return "Não foi possível salvar a transação.";
}

export function TransactionFormDrawer({
  open,
  mode,
  transaction,
  onClose,
  onSuccess,
}: TransactionFormDrawerProps) {
  const screens = Grid.useBreakpoint();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | undefined>();
  const isEdit = mode === "edit" && Boolean(transaction);

  const initialValues: Partial<TransactionAntdFormValues> | undefined = transaction
    ? mapTransactionToAntdFormValues(transaction)
    : undefined;

  const saveMutation = useMutation({
    mutationFn: (payload: TransactionUpsertRequest) =>
      isEdit && transaction
        ? transactions.update(transaction.id, payload)
        : transactions.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projection }),
      ]);
      message.success(isEdit ? "Transação atualizada." : "Transação criada.");
      setFormError(undefined);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      setFormError(getMutationErrorMessage(error));
    },
  });

  return (
    <Drawer
      title={isEdit ? "Editar transação" : "Nova transação"}
      open={open}
      onClose={() => {
        if (!saveMutation.isPending) {
          setFormError(undefined);
          onClose();
        }
      }}
      width={screens.md ? 520 : "100%"}
      destroyOnHidden
      styles={{ body: { paddingBottom: 24 } }}
    >
      <TransactionForm
        key={isEdit ? transaction!.id : "create"}
        initialValues={initialValues}
        submitLabel={isEdit ? "Salvar alterações" : "Criar transação"}
        submittingLabel="Salvando..."
        formError={formError}
        disableModeSwitch={isEdit}
        onSubmit={async (payload) => {
          if (!payload) {
            setFormError("Revise os valores informados antes de enviar.");
            return;
          }

          setFormError(undefined);
          await saveMutation.mutateAsync(payload);
        }}
      />
    </Drawer>
  );
}
