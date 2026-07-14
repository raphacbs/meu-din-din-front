"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Result, Row, Space, Spin, Typography } from "antd";

import {
  ProjectionPanel,
  SummaryCard,
  TransactionPreviewList,
} from "@/components/dashboard/dashboard-panels";
import { CashRibbon } from "@/components/dashboard/cash-ribbon";
import { summarizeTransactions } from "@/lib/dashboard/summary";
import { projections } from "@/lib/api/projections";
import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { formatCurrency, formatSignedCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { formatTransactionStatus } from "@/lib/format/status";
import { queryKeys } from "@/lib/query/keys";

const { Paragraph, Title } = Typography;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return fallback;
}

export function DashboardView() {
  const queryClient = useQueryClient();

  const projectionQuery = useQuery({
    queryKey: queryKeys.projection,
    queryFn: () => projections.current(),
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions,
    queryFn: () => transactions.list(),
  });

  const recalculateMutation = useMutation({
    mutationFn: () => projections.recalculate(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.projection, data);
    },
  });

  const summary = transactionsQuery.data
    ? summarizeTransactions(transactionsQuery.data)
    : undefined;

  return (
    <Space direction="vertical" size={32} style={{ width: "100%" }}>
      <Space align="end" style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Dashboard
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640 }}>
            Visão do caderno de caixa com saldo projetado, vencimentos e movimentações recentes.
          </Paragraph>
        </div>
        <Link href="/transactions/new">
          <Button type="primary">Nova transação</Button>
        </Link>
      </Space>

      <section aria-label="Projeção financeira">
        <ProjectionPanel
          projection={projectionQuery.data}
          isLoading={projectionQuery.isLoading}
          isRecalculating={recalculateMutation.isPending}
          errorMessage={
            projectionQuery.isError
              ? getErrorMessage(projectionQuery.error, "Não foi possível carregar a projeção.")
              : undefined
          }
          onRecalculate={() => recalculateMutation.mutate()}
          onRetry={() => void projectionQuery.refetch()}
        />
      </section>

      {summary ? (
        <section aria-label="Faixa de caixa e resumo">
          <CashRibbon summary={summary} />
        </section>
      ) : null}

      {transactionsQuery.isLoading ? (
        <Spin tip="Carregando resumo financeiro..." />
      ) : transactionsQuery.isError ? (
        <Result
          status="error"
          title="Resumo indisponível"
          subTitle={getErrorMessage(
            transactionsQuery.error,
            "Não foi possível carregar as transações.",
          )}
          extra={<Button onClick={() => void transactionsQuery.refetch()}>Tentar novamente</Button>}
        />
      ) : summary ? (
        <>
          <section aria-label="Métricas auxiliares">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} xl={5}>
                <SummaryCard
                  title="Receitas"
                  value={formatCurrency(summary.revenueTotal)}
                  description="Total de entradas ativas"
                  tone="success"
                />
              </Col>
              <Col xs={24} sm={12} xl={5}>
                <SummaryCard
                  title="Despesas"
                  value={formatCurrency(summary.expenseTotal)}
                  description="Total de saídas ativas"
                  tone="danger"
                />
              </Col>
              <Col xs={24} sm={12} xl={5}>
                <SummaryCard
                  title="Vence hoje"
                  value={String(summary.dueToday.length)}
                  description="Itens com vencimento hoje"
                  tone="warning"
                />
              </Col>
              <Col xs={24} sm={12} xl={5}>
                <SummaryCard
                  title="Atrasadas"
                  value={String(summary.overdue.length)}
                  description="Itens em atraso"
                  tone="danger"
                />
              </Col>
              <Col xs={24} sm={12} xl={4}>
                <SummaryCard
                  title="Pagas"
                  value={String(summary.paid.length)}
                  description="Itens quitados"
                  tone="success"
                />
              </Col>
            </Row>
          </section>

          <section aria-label="Atividade recente">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <TransactionPreviewList
                  title="Próximos vencimentos"
                  emptyLabel="Nenhum vencimento futuro registrado."
                  transactions={summary.upcoming.slice(0, 5).map((transaction) => ({
                    id: transaction.id,
                    description: transaction.description,
                    amountLabel: formatSignedCurrency(transaction.amount, transaction.type),
                    metaLabel: transaction.dueDate
                      ? formatDate(transaction.dueDate)
                      : formatTransactionStatus(transaction.status),
                  }))}
                />
              </Col>
              <Col xs={24} lg={12}>
                <TransactionPreviewList
                  title="Liquidados recentes"
                  emptyLabel="Nenhuma movimentação recente."
                  transactions={summary.paid.slice(0, 5).map((transaction) => ({
                    id: transaction.id,
                    description: transaction.description,
                    amountLabel: formatSignedCurrency(transaction.amount, transaction.type),
                    metaLabel: formatTransactionStatus(transaction.status),
                  }))}
                />
              </Col>
            </Row>
          </section>
        </>
      ) : null}
    </Space>
  );
}
