"use client";

import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Modal, Space, Typography, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import {
  isPastMonthMutationBlocked,
  type UserPreferences,
} from "@/lib/preferences/user-preferences";
import { canPayTransaction } from "@/components/transactions/transaction-row-actions";
import type {
  TransactionBatchDeleteItemRequest,
  TransactionBatchDeleteResponse,
  TransactionBatchSettleResponse,
  TransactionResponse,
} from "@/lib/types/api";

const { Text } = Typography;

/** Barra fixa usa z-index 1000; confirmação precisa ficar acima. */
const BULK_CONFIRM_Z_INDEX = 1100;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  return fallback;
}

function toApiId(id: string | number): number {
  return Number(id);
}

function reportBatchResult(
  label: string,
  result: TransactionBatchSettleResponse | TransactionBatchDeleteResponse,
) {
  const ok = result.succeeded.length;
  const failed = result.failures.length;

  if (failed === 0) {
    message.success(`${ok} ${label}${ok === 1 ? "" : "s"} processada${ok === 1 ? "" : "s"}.`);
    return;
  }

  if (ok === 0) {
    message.error(`Nenhuma transação foi processada. ${failed} falha${failed === 1 ? "" : "s"}.`);
    return;
  }

  message.warning(
    `${ok} processada${ok === 1 ? "" : "s"}, ${failed} falha${failed === 1 ? "" : "s"}.`,
  );
}

function buildSettleLabel(items: TransactionResponse[]): string {
  const hasExpense = items.some((t) => t.type === "DESPESA");
  const hasIncome = items.some((t) => t.type === "RECEITA");
  if (hasExpense && !hasIncome) {
    return "Quitar selecionadas";
  }
  if (hasIncome && !hasExpense) {
    return "Receber selecionadas";
  }
  return "Liquidar selecionadas";
}

function buildDeleteScope(
  transaction: TransactionResponse,
): TransactionBatchDeleteItemRequest["scope"] {
  if (transaction.group?.type === "PARCELAMENTO") {
    return "INSTALLMENT_GROUP";
  }
  return "SINGLE";
}

export interface MeuMesBulkActionsProps {
  selected: TransactionResponse[];
  selectedCount: number;
  prefs: Pick<UserPreferences, "blockPastMonthMutations">;
  onClearSelection: () => void;
  onSuccess: () => void | Promise<void>;
}

export function MeuMesBulkActions({
  selected,
  selectedCount,
  prefs,
  onClearSelection,
  onSuccess,
}: MeuMesBulkActionsProps) {
  const [settleOpen, setSettleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const settleMutation = useMutation({
    mutationFn: (items: TransactionResponse[]) =>
      transactions.settleBatch({
        ids: items.map((t) => String(toApiId(t.id))),
        paymentDate: dayjs().format("YYYY-MM-DD"),
      }),
    onSuccess: async (result) => {
      setSettleOpen(false);
      reportBatchResult("transação liquidada", result);
      await onSuccess();
      onClearSelection();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Não foi possível liquidar as transações selecionadas."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (items: TransactionResponse[]) =>
      transactions.deleteBatch({
        items: items.map((t) => ({
          id: String(toApiId(t.id)),
          scope: buildDeleteScope(t),
        })),
      }),
    onSuccess: async (result) => {
      setDeleteOpen(false);
      reportBatchResult("transação excluída", result);
      await onSuccess();
      onClearSelection();
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Não foi possível excluir as transações selecionadas."));
    },
  });

  if (selectedCount === 0) {
    return null;
  }

  const eligibleForSettle = selected.filter(
    (t) => canPayTransaction(t.status) && !isPastMonthMutationBlocked(t, prefs),
  );
  const eligibleForDelete = selected.filter((t) => !isPastMonthMutationBlocked(t, prefs));
  const hasInstallment = eligibleForDelete.some((t) => t.group?.type === "PARCELAMENTO");
  const settleLabel = buildSettleLabel(eligibleForSettle);
  const busy = settleMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div className="meu-mes-bulk-bar">
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <span className="meu-mes-bulk-bar__count">
            {selectedCount} selecionada{selectedCount === 1 ? "" : "s"}
          </span>
          <Space wrap>
            <Button onClick={onClearSelection} disabled={busy}>
              Limpar
            </Button>
            {eligibleForSettle.length > 0 ? (
              <Button
                type="primary"
                onClick={() => setSettleOpen(true)}
                loading={settleMutation.isPending}
                disabled={busy}
              >
                {settleLabel} ({eligibleForSettle.length})
              </Button>
            ) : null}
            {eligibleForDelete.length > 0 ? (
              <Button
                danger
                onClick={() => setDeleteOpen(true)}
                loading={deleteMutation.isPending}
                disabled={busy}
              >
                Excluir ({eligibleForDelete.length})
              </Button>
            ) : null}
          </Space>
        </Space>
      </div>

      <Modal
        title={settleLabel}
        open={settleOpen}
        okText={settleLabel}
        cancelText="Cancelar"
        confirmLoading={settleMutation.isPending}
        zIndex={BULK_CONFIRM_Z_INDEX}
        onOk={() => settleMutation.mutateAsync(eligibleForSettle)}
        onCancel={() => {
          if (!settleMutation.isPending) {
            setSettleOpen(false);
          }
        }}
        destroyOnHidden
      >
        <Text>
          Liquidar {eligibleForSettle.length} item
          {eligibleForSettle.length === 1 ? "" : "s"} com data de hoje?
        </Text>
      </Modal>

      <Modal
        title="Excluir selecionadas"
        open={deleteOpen}
        okText="Excluir"
        cancelText="Cancelar"
        confirmLoading={deleteMutation.isPending}
        zIndex={BULK_CONFIRM_Z_INDEX}
        okButtonProps={{ danger: true }}
        onOk={() => deleteMutation.mutateAsync(eligibleForDelete)}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setDeleteOpen(false);
          }
        }}
        destroyOnHidden
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Text>
            Excluir {eligibleForDelete.length} item
            {eligibleForDelete.length === 1 ? "" : "s"}? Esta ação não pode ser desfeita.
          </Text>
          {hasInstallment ? (
            <Alert
              type="warning"
              showIcon
              message="Parcelamentos removem o grupo inteiro de parcelas, incluindo as já liquidadas."
            />
          ) : null}
        </Space>
      </Modal>
    </>
  );
}
