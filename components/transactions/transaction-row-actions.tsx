"use client";

import { CheckCircleOutlined, PaperClipOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Modal, Space, Tooltip, Typography, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format/currency";
import { queryKeys } from "@/lib/query/keys";
import type { TransactionResponse, TransactionStatus, TransactionUpsertRequest } from "@/lib/types/api";

const { Paragraph, Text } = Typography;

const NON_PAYABLE_STATUSES: ReadonlySet<TransactionStatus> = new Set([
  "PAGO",
  "PAGO_COM_ATRASO",
  "CANCELADA",
]);

export function canPayTransaction(status: TransactionStatus): boolean {
  return !NON_PAYABLE_STATUSES.has(status);
}

export function buildPayPayload(
  transaction: TransactionResponse,
  paymentDate: string,
): TransactionUpsertRequest {
  return {
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    transactionDate: transaction.transactionDate,
    dueDate: transaction.dueDate,
    paymentDate,
    tags: transaction.tags,
  };
}

function settleLabels(type: TransactionResponse["type"]) {
  if (type === "RECEITA") {
    return {
      action: "Receber",
      confirmTitle: "Confirmar recebimento?",
      confirmOk: "Confirmar recebimento",
      doneWord: "recebida",
      success: "Recebimento registrado.",
      error: "Não foi possível registrar o recebimento.",
    };
  }

  return {
    action: "Quitar",
    confirmTitle: "Confirmar quitação?",
    confirmOk: "Confirmar quitação",
    doneWord: "paga",
    success: "Quitação registrada.",
    error: "Não foi possível registrar a quitação.",
  };
}

interface TransactionRowActionsProps {
  transaction: TransactionResponse;
  attachmentCount?: number;
  onAttach: (transaction: TransactionResponse) => void;
  /** Quando informado, o caller controla invalidação (ex.: animação em Meu mês). */
  onSettleSuccess?: (transaction: TransactionResponse) => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return fallback;
}

export function TransactionRowActions({
  transaction,
  attachmentCount = 0,
  onAttach,
  onSettleSuccess,
}: TransactionRowActionsProps) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const labels = settleLabels(transaction.type);

  const payMutation = useMutation({
    mutationFn: () => {
      const paymentDate = dayjs().format("YYYY-MM-DD");
      return transactions.update(transaction.id, buildPayPayload(transaction, paymentDate));
    },
    onSuccess: async () => {
      setConfirmOpen(false);
      if (onSettleSuccess) {
        onSettleSuccess(transaction);
      } else {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
          queryClient.invalidateQueries({ queryKey: queryKeys.projection }),
          queryClient.invalidateQueries({ queryKey: queryKeys.transaction(transaction.id) }),
        ]);
      }
      message.success(labels.success);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, labels.error));
    },
  });

  return (
    <>
      <Space size={4}>
        {canPayTransaction(transaction.status) ? (
          <Tooltip title={labels.action}>
            <Button
              type="primary"
              ghost
              icon={<CheckCircleOutlined />}
              aria-label={labels.action}
              style={{ color: "var(--color-cash-green)", borderColor: "var(--color-cash-green)" }}
              onClick={() => setConfirmOpen(true)}
            />
          </Tooltip>
        ) : null}
        <Tooltip title="Anexar comprovante">
          <Badge count={attachmentCount} size="small" offset={[-2, 2]}>
            <Button
              type="default"
              icon={<PaperClipOutlined />}
              aria-label={
                attachmentCount > 0
                  ? `Anexar comprovante (${attachmentCount})`
                  : "Anexar comprovante"
              }
              style={{ color: "#1d6fbf", borderColor: "#91caff" }}
              onClick={() => onAttach(transaction)}
            />
          </Badge>
        </Tooltip>
      </Space>

      <Modal
        title={labels.confirmTitle}
        open={confirmOpen}
        okText={labels.confirmOk}
        cancelText="Cancelar"
        confirmLoading={payMutation.isPending}
        onOk={() => payMutation.mutateAsync()}
        onCancel={() => {
          if (!payMutation.isPending) {
            setConfirmOpen(false);
          }
        }}
        okButtonProps={{ type: "primary" }}
        destroyOnHidden
      >
        <Paragraph style={{ marginBottom: 8 }}>
          Marcar <Text strong>{transaction.description}</Text> como {labels.doneWord} hoje?
        </Paragraph>
        <Text
          className="tabular-nums"
          style={{
            display: "block",
            fontSize: 22,
            fontWeight: 700,
            color:
              transaction.type === "DESPESA"
                ? "var(--color-debt-red)"
                : "var(--color-cash-green)",
          }}
        >
          {formatCurrency(transaction.amount)}
        </Text>
      </Modal>
    </>
  );
}
