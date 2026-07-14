"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Modal, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type { TransactionResponse } from "@/lib/types/api";

const { Paragraph, Title } = Typography;

interface TransactionActionsProps {
  transaction: TransactionResponse;
}

type PendingAction = "cancel" | "delete" | "deleteInstallments" | "deactivateRecurrence";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return fallback;
}

function getConfirmMessage(action: PendingAction): string {
  switch (action) {
    case "cancel":
      return "A transação será marcada como cancelada.";
    case "delete":
      return "A transação será removida permanentemente.";
    case "deleteInstallments":
      return "Todas as parcelas do grupo serão removidas.";
    case "deactivateRecurrence":
      return "A série recorrente será desativada.";
  }
}

export function TransactionActions({ transaction }: TransactionActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function invalidateAndRefresh() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    await queryClient.invalidateQueries({ queryKey: queryKeys.projection });
    await queryClient.invalidateQueries({ queryKey: queryKeys.transaction(transaction.id) });
  }

  const cancelMutation = useMutation({
    mutationFn: () => transactions.cancel(transaction.id),
    onSuccess: invalidateAndRefresh,
    onError: (error) => setErrorMessage(getErrorMessage(error, "Não foi possível cancelar.")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => transactions.delete(transaction.id),
    onSuccess: async () => {
      await invalidateAndRefresh();
      router.push("/transactions");
    },
    onError: (error) => setErrorMessage(getErrorMessage(error, "Não foi possível excluir.")),
  });

  const deleteInstallmentsMutation = useMutation({
    mutationFn: () => transactions.deleteInstallments(transaction.group!.id),
    onSuccess: async () => {
      await invalidateAndRefresh();
      router.push("/transactions");
    },
    onError: (error) =>
      setErrorMessage(getErrorMessage(error, "Não foi possível excluir as parcelas.")),
  });

  const deactivateRecurrenceMutation = useMutation({
    mutationFn: () => transactions.deactivateRecurrence(transaction.group!.id),
    onSuccess: invalidateAndRefresh,
    onError: (error) =>
      setErrorMessage(getErrorMessage(error, "Não foi possível desativar a recorrência.")),
  });

  const isBusy =
    cancelMutation.isPending ||
    deleteMutation.isPending ||
    deleteInstallmentsMutation.isPending ||
    deactivateRecurrenceMutation.isPending;

  function confirmAction(action: PendingAction) {
    Modal.confirm({
      title: "Confirmar ação",
      content: getConfirmMessage(action),
      okText: "Confirmar",
      okType: "danger",
      cancelText: "Voltar",
      onOk: async () => {
        setErrorMessage(null);
        if (action === "cancel") {
          await cancelMutation.mutateAsync();
        } else if (action === "delete") {
          await deleteMutation.mutateAsync();
        } else if (action === "deleteInstallments") {
          await deleteInstallmentsMutation.mutateAsync();
        } else {
          await deactivateRecurrenceMutation.mutateAsync();
        }
      },
    });
  }

  return (
    <Card>
      <Title level={4}>Ações</Title>
      <Paragraph type="secondary">
        Confirme antes de cancelar, excluir ou alterar séries financeiras.
      </Paragraph>

      <Space wrap style={{ marginTop: 16 }}>
        {transaction.status !== "CANCELADA" ? (
          <Button danger disabled={isBusy} onClick={() => confirmAction("cancel")}>
            Cancelar transação
          </Button>
        ) : null}

        <Button danger disabled={isBusy} onClick={() => confirmAction("delete")}>
          Excluir transação
        </Button>

        {transaction.group?.type === "PARCELAMENTO" ? (
          <Button danger disabled={isBusy} onClick={() => confirmAction("deleteInstallments")}>
            Excluir parcelamento
          </Button>
        ) : null}

        {transaction.group?.type === "RECORRENCIA" &&
        transaction.group.seriesStatus === "ATIVA" ? (
          <Button disabled={isBusy} onClick={() => confirmAction("deactivateRecurrence")}>
            Desativar recorrência
          </Button>
        ) : null}
      </Space>

      {errorMessage ? <Alert type="error" message={errorMessage} showIcon style={{ marginTop: 16 }} /> : null}
    </Card>
  );
}
