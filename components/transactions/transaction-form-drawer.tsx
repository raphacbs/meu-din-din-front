"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, App, Drawer, Grid, Spin, message } from "antd";
import { useCallback, useState } from "react";

import { InstallmentGroupEditForm } from "@/components/transactions/installment-group-edit-form";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import {
  mapTransactionToAntdFormValues,
  type TransactionAntdFormValues,
} from "@/lib/transactions/form";
import { queryKeys } from "@/lib/query/keys";
import type {
  InstallmentGroupUpdateRequest,
  TransactionResponse,
  TransactionUpsertRequest,
} from "@/lib/types/api";

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

/** Drawer usa z-index 1000; confirmação precisa ficar acima. */
const INSTALLMENT_CONFIRM_Z_INDEX = 1100;

export function TransactionFormDrawer({
  open,
  mode,
  transaction,
  onClose,
  onSuccess,
}: TransactionFormDrawerProps) {
  const { modal } = App.useApp();
  const screens = Grid.useBreakpoint();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | undefined>();

  const confirmStructuralImpact = useCallback(
    (messages: string[]) =>
      new Promise<boolean>((resolve) => {
        let settled = false;
        const finish = (confirmed: boolean) => {
          if (settled) {
            return;
          }
          settled = true;
          resolve(confirmed);
        };

        modal.confirm({
          title: "Confirmar alteração do parcelamento",
          content: (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {messages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
          okText: "Confirmar",
          cancelText: "Voltar",
          zIndex: INSTALLMENT_CONFIRM_Z_INDEX,
          onOk: () => finish(true),
          onCancel: () => finish(false),
        });
      }),
    [modal],
  );
  const isEdit = mode === "edit" && Boolean(transaction);
  const isInstallmentGroupEdit =
    isEdit && transaction?.group?.type === "PARCELAMENTO" && Boolean(transaction.group.id);
  const groupId = isInstallmentGroupEdit ? transaction!.group!.id : undefined;

  const initialValues: Partial<TransactionAntdFormValues> | undefined =
    transaction && !isInstallmentGroupEdit
      ? mapTransactionToAntdFormValues(transaction)
      : undefined;

  const installmentsQuery = useQuery({
    queryKey: ["transaction-group-installments", groupId],
    queryFn: () => transactions.listInstallments(groupId!),
    enabled: open && Boolean(groupId),
  });

  async function invalidateMeuMesQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projection }),
    ]);
  }

  const saveMutation = useMutation({
    mutationFn: (payload: TransactionUpsertRequest) =>
      isEdit && transaction
        ? transactions.update(transaction.id, payload)
        : transactions.create(payload),
    onSuccess: async () => {
      await invalidateMeuMesQueries();
      message.success(isEdit ? "Transação atualizada." : "Transação criada.");
      setFormError(undefined);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      setFormError(getMutationErrorMessage(error));
    },
  });

  const updateInstallmentsMutation = useMutation({
    mutationFn: (payload: InstallmentGroupUpdateRequest) =>
      transactions.updateInstallments(groupId!, payload),
    onSuccess: async () => {
      await invalidateMeuMesQueries();
      if (groupId) {
        await queryClient.invalidateQueries({
          queryKey: ["transaction-group-installments", groupId],
        });
      }
      message.success("Parcelamento atualizado.");
      setFormError(undefined);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      setFormError(getMutationErrorMessage(error));
    },
  });

  const drawerTitle = isInstallmentGroupEdit
    ? "Editar parcelamento"
    : isEdit
      ? "Editar transação"
      : "Nova transação";

  const isPending = saveMutation.isPending || updateInstallmentsMutation.isPending;

  return (
    <Drawer
      title={drawerTitle}
      open={open}
      onClose={() => {
        if (!isPending) {
          setFormError(undefined);
          onClose();
        }
      }}
      width={screens.md ? 520 : "100%"}
      destroyOnHidden
      styles={{ body: { paddingBottom: 24 } }}
    >
      {isInstallmentGroupEdit ? (
        installmentsQuery.isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spin />
          </div>
        ) : installmentsQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message={getMutationErrorMessage(installmentsQuery.error)}
          />
        ) : (
          <InstallmentGroupEditForm
            key={groupId}
            installments={installmentsQuery.data ?? []}
            submitLabel="Salvar alterações"
            submittingLabel="Salvando..."
            formError={formError}
            onConfirmStructuralImpact={confirmStructuralImpact}
            onSubmit={async (payload) => {
              setFormError(undefined);
              await updateInstallmentsMutation.mutateAsync(payload);
            }}
          />
        )
      ) : (
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
      )}
    </Drawer>
  );
}
