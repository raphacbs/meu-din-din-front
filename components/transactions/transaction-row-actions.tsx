"use client";

import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PaperClipOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Modal, Space, Tooltip, Typography, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format/currency";
import {
  isPastMonthMutationBlocked,
  useUserPreferencesStore,
} from "@/lib/preferences/user-preferences";
import { queryKeys } from "@/lib/query/keys";
import type { TransactionResponse, TransactionStatus, TransactionUpsertRequest } from "@/lib/types/api";

const { Paragraph, Text } = Typography;

const NON_PAYABLE_STATUSES: ReadonlySet<TransactionStatus> = new Set([
  "PAGO",
  "PAGO_COM_ATRASO",
  "CANCELADA",
]);

const PAID_STATUSES: ReadonlySet<TransactionStatus> = new Set(["PAGO", "PAGO_COM_ATRASO"]);

export function canPayTransaction(status: TransactionStatus): boolean {
  return !NON_PAYABLE_STATUSES.has(status);
}

export function canUnpayTransaction(status: TransactionStatus): boolean {
  return PAID_STATUSES.has(status);
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

export function buildUnpayPayload(transaction: TransactionResponse): TransactionUpsertRequest {
  return {
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    transactionDate: transaction.transactionDate,
    dueDate: transaction.dueDate,
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
      unpayAction: "Desfazer recebimento",
      unpayTitle: "Desfazer recebimento?",
      unpayOk: "Desfazer recebimento",
      unpaySuccess: "Recebimento desfeito.",
      unpayError: "Não foi possível desfazer o recebimento.",
    };
  }

  return {
    action: "Quitar",
    confirmTitle: "Confirmar quitação?",
    confirmOk: "Confirmar quitação",
    doneWord: "paga",
    success: "Quitação registrada.",
    error: "Não foi possível registrar a quitação.",
    unpayAction: "Cancelar quitação",
    unpayTitle: "Cancelar quitação?",
    unpayOk: "Cancelar quitação",
    unpaySuccess: "Quitação cancelada.",
    unpayError: "Não foi possível cancelar a quitação.",
  };
}

interface TransactionRowActionsProps {
  transaction: TransactionResponse;
  attachmentCount?: number;
  onAttach: (transaction: TransactionResponse) => void;
  onEdit?: (transaction: TransactionResponse) => void;
  /** Quando informado, o caller controla invalidação (ex.: animação em Meu mês). */
  onSettleSuccess?: (transaction: TransactionResponse) => void;
  onMutationSuccess?: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return fallback;
}

function isEndpointUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 501);
}

export function TransactionRowActions({
  transaction,
  attachmentCount = 0,
  onAttach,
  onEdit,
  onSettleSuccess,
  onMutationSuccess,
}: TransactionRowActionsProps) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unpayOpen, setUnpayOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const labels = settleLabels(transaction.type);
  const isRecurring = transaction.group?.type === "RECORRENCIA";
  const isInstallment = transaction.group?.type === "PARCELAMENTO";
  const installmentGroupId = transaction.group?.id;

  const hydrate = useUserPreferencesStore((state) => state.hydrate);
  const blockPastMonthMutations = useUserPreferencesStore(
    (state) => state.blockPastMonthMutations,
  );

  useEffect(() => {
    void hydrate().catch(() => {
      // Preferências já tentam hidratar no SessionProvider; default protege o gate.
    });
  }, [hydrate]);

  const pastBlocked = isPastMonthMutationBlocked(transaction, { blockPastMonthMutations });
  const pastBlockTooltip =
    "Edição e exclusão de meses passados estão bloqueadas. Altere em Configurações.";

  async function invalidateAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projection }),
      queryClient.invalidateQueries({ queryKey: queryKeys.transaction(transaction.id) }),
    ]);
  }

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
        await invalidateAll();
      }
      message.success(labels.success);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, labels.error));
    },
  });

  const unpayMutation = useMutation({
    mutationFn: () => transactions.update(transaction.id, buildUnpayPayload(transaction)),
    onSuccess: async () => {
      setUnpayOpen(false);
      await invalidateAll();
      onMutationSuccess?.();
      message.success(labels.unpaySuccess);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, labels.unpayError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (scope: "single" | "fromHere" | "installments") => {
      if (scope === "fromHere") {
        return transactions.deleteRecurrenceFromHere(transaction.id);
      }
      if (scope === "installments") {
        if (!installmentGroupId) {
          return Promise.reject(new Error("Grupo de parcelamento não encontrado."));
        }
        return transactions.deleteInstallments(installmentGroupId);
      }
      return transactions.delete(transaction.id);
    },
    onSuccess: async () => {
      setDeleteOpen(false);
      await invalidateAll();
      onMutationSuccess?.();
      message.success(
        isInstallment ? "Parcelamento excluído." : "Transação excluída.",
      );
    },
    onError: (error) => {
      if (isEndpointUnavailable(error)) {
        message.error(
          "Exclusão de ocorrências futuras ainda não está disponível no servidor. Exclua só esta ocorrência ou tente mais tarde.",
        );
        return;
      }
      message.error(getErrorMessage(error, "Não foi possível excluir a transação."));
    },
  });

  return (
    <>
      <Space size={4} wrap>
        {onEdit ? (
          <Tooltip title={pastBlocked ? pastBlockTooltip : "Editar"}>
            <Button
              type="default"
              icon={<EditOutlined />}
              aria-label="Editar"
              disabled={pastBlocked}
              onClick={() => onEdit(transaction)}
            />
          </Tooltip>
        ) : null}

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

        {canUnpayTransaction(transaction.status) ? (
          <Tooltip title={labels.unpayAction}>
            <Button
              type="default"
              icon={<UndoOutlined />}
              aria-label={labels.unpayAction}
              onClick={() => setUnpayOpen(true)}
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

        <Tooltip title={pastBlocked ? pastBlockTooltip : "Excluir"}>
          <Button
            type="default"
            danger
            icon={<DeleteOutlined />}
            aria-label="Excluir"
            disabled={pastBlocked}
            onClick={() => setDeleteOpen(true)}
          />
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

      <Modal
        title={labels.unpayTitle}
        open={unpayOpen}
        okText={labels.unpayOk}
        cancelText="Voltar"
        confirmLoading={unpayMutation.isPending}
        onOk={() => unpayMutation.mutateAsync()}
        onCancel={() => {
          if (!unpayMutation.isPending) {
            setUnpayOpen(false);
          }
        }}
        destroyOnHidden
      >
        <Paragraph style={{ marginBottom: 0 }}>
          Remover a data de pagamento de <Text strong>{transaction.description}</Text> e
          devolvê-la para pendentes?
        </Paragraph>
      </Modal>

      <Modal
        title={isInstallment ? "Excluir parcelamento?" : "Excluir transação?"}
        open={deleteOpen}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setDeleteOpen(false);
          }
        }}
        footer={
          isRecurring ? (
            <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteOpen(false)}
              >
                Voltar
              </Button>
              <Button
                danger
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutateAsync("single")}
              >
                Só esta
              </Button>
              <Button
                type="primary"
                danger
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutateAsync("fromHere")}
              >
                Esta e futuras
              </Button>
            </Space>
          ) : (
            undefined
          )
        }
        okText={isRecurring ? undefined : "Excluir"}
        cancelText={isRecurring ? undefined : "Voltar"}
        okButtonProps={isRecurring ? undefined : { danger: true }}
        confirmLoading={!isRecurring && deleteMutation.isPending}
        onOk={
          isRecurring
            ? undefined
            : () =>
                deleteMutation.mutateAsync(isInstallment ? "installments" : "single")
        }
        destroyOnHidden
      >
        <Paragraph style={{ marginBottom: 8 }}>
          Excluir <Text strong>{transaction.description}</Text> ({formatCurrency(transaction.amount)}
          )?
        </Paragraph>
        {isInstallment ? (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Todas as parcelas deste parcelamento serão removidas, inclusive as anteriores e as já
            pagas.
            {transaction.installmentCount
              ? ` (${transaction.installmentCount} parcelas no total.)`
              : null}
          </Paragraph>
        ) : null}
        {isRecurring ? (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Esta é uma ocorrência recorrente. Escolha excluir só esta ou esta e todas as futuras da
            série.
          </Paragraph>
        ) : null}
      </Modal>
    </>
  );
}
