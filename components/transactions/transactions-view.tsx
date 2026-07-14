"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Empty, Result, Space, Spin, Typography } from "antd";

import { TransactionList } from "@/components/transactions/transaction-list";
import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";

const { Paragraph, Title } = Typography;

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "Não foi possível carregar as transações.";
  }

  return "Não foi possível carregar as transações.";
}

export function TransactionsView() {
  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: () => transactions.list(),
  });

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Space align="end" style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Transações
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640 }}>
            Acompanhe receitas, despesas, parcelamentos e recorrências em um só lugar.
          </Paragraph>
        </div>
        <Link href="/transactions/new">
          <Button type="primary">Nova transação</Button>
        </Link>
      </Space>

      {transactionsQuery.isLoading ? (
        <Spin tip="Carregando transações..." />
      ) : transactionsQuery.isError ? (
        <Result
          status="error"
          title={getErrorMessage(transactionsQuery.error)}
          extra={
            <Button onClick={() => void transactionsQuery.refetch()}>Tentar novamente</Button>
          }
        />
      ) : !transactionsQuery.data?.length ? (
        <Empty description="Nenhuma transação ainda">
          <Link href="/transactions/new">
            <Button type="primary">Criar transação</Button>
          </Link>
        </Empty>
      ) : (
        <TransactionList transactions={transactionsQuery.data} />
      )}
    </Space>
  );
}
