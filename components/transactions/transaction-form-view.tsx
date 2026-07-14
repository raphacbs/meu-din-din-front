"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Result, Spin, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionActions } from "@/components/transactions/transaction-actions";
import { TransactionAttachments } from "@/components/transactions/transaction-attachments";
import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { mapTransactionToAntdFormValues } from "@/lib/transactions/form";
import { queryKeys } from "@/lib/query/keys";
import type { TransactionUpsertRequest } from "@/lib/types/api";

const { Paragraph, Title } = Typography;

interface TransactionFormViewProps {
  transactionId?: string;
}

function getMutationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "Não foi possível salvar a transação.";
  }

  return "Não foi possível salvar a transação.";
}

export function TransactionFormView({ transactionId }: TransactionFormViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | undefined>();

  const transactionQuery = useQuery({
    queryKey: queryKeys.transaction(transactionId ?? "new"),
    queryFn: () => transactions.getById(transactionId!),
    enabled: Boolean(transactionId),
  });

  const initialValues = useMemo(
    () => (transactionQuery.data ? mapTransactionToAntdFormValues(transactionQuery.data) : undefined),
    [transactionQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: TransactionUpsertRequest) =>
      transactionId
        ? transactions.update(transactionId, payload)
        : transactions.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      await queryClient.invalidateQueries({ queryKey: queryKeys.projection });
      router.push("/transactions");
    },
    onError: (error) => {
      setFormError(getMutationErrorMessage(error));
    },
  });

  if (transactionId && transactionQuery.isLoading) {
    return <Spin tip="Carregando transação..." style={{ display: "block", margin: "48px auto" }} />;
  }

  if (transactionId && transactionQuery.isError) {
    return (
      <Result
        status="error"
        title="Não foi possível carregar os dados da transação."
        extra={
          <button type="button" onClick={() => void transactionQuery.refetch()}>
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Title level={2} style={{ marginBottom: 8 }}>
          {transactionId ? "Editar transação" : "Nova transação"}
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640 }}>
          {transactionId
            ? "Atualize os dados da movimentação selecionada."
            : "Registre uma transação avulsa, parcelada ou recorrente."}
        </Paragraph>
      </div>

      <Card>
        <TransactionForm
          initialValues={initialValues}
          submitLabel={transactionId ? "Salvar alterações" : "Criar transação"}
          submittingLabel="Salvando..."
          formError={formError}
          disableModeSwitch={Boolean(transactionId)}
          onSubmit={async (payload) => {
            if (!payload) {
              setFormError("Revise os valores informados antes de enviar.");
              return;
            }

            setFormError(undefined);
            await saveMutation.mutateAsync(payload);
          }}
        />
      </Card>

      {transactionQuery.data ? (
        <>
          <TransactionActions transaction={transactionQuery.data} />
          <TransactionAttachments transactionId={transactionQuery.data.id} />
        </>
      ) : null}
    </div>
  );
}
