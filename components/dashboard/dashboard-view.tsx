"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Empty, Result, Row, Space, Spin, Typography } from "antd";

import { AnalyticsYearSelect } from "@/components/dashboard/analytics-year-select";
import { ExpenseParetoChart } from "@/components/dashboard/expense-pareto-chart";
import { MonthlyTotalsBarChart } from "@/components/dashboard/monthly-totals-bar-chart";
import { ProjectionPanel } from "@/components/dashboard/dashboard-panels";
import { TagRadarChart } from "@/components/dashboard/tag-radar-chart";
import { analytics } from "@/lib/api/analytics";
import { projections } from "@/lib/api/projections";
import { ApiError } from "@/lib/api/client";
import { getDefaultAnalyticsYear } from "@/lib/dashboard/analytics-defaults";
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
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [hasSyncedDefaultYear, setHasSyncedDefaultYear] = useState(false);

  const projectionQuery = useQuery({
    queryKey: queryKeys.projection,
    queryFn: () => projections.current(),
  });

  const analyticsQuery = useQuery({
    queryKey: queryKeys.analyticsDashboard(selectedYear),
    queryFn: () => analytics.dashboard(selectedYear),
  });

  const recalculateMutation = useMutation({
    mutationFn: () => projections.recalculate(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.projection, data);
    },
  });

  useEffect(() => {
    if (!analyticsQuery.data || hasSyncedDefaultYear) {
      return;
    }

    const defaultYear = getDefaultAnalyticsYear(analyticsQuery.data.availableYears);

    if (defaultYear != null && defaultYear !== selectedYear) {
      setSelectedYear(defaultYear);
    }

    setHasSyncedDefaultYear(true);
  }, [analyticsQuery.data, hasSyncedDefaultYear, selectedYear]);

  const availableYears = analyticsQuery.data?.availableYears ?? [];
  const hasNoYears = analyticsQuery.isSuccess && availableYears.length === 0;

  return (
    <Space direction="vertical" size={32} style={{ width: "100%" }}>
      <Space align="end" style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Dashboard
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640 }}>
            Visão analítica do consumo anual com saldo projetado e gráficos por mês e tag.
          </Paragraph>
        </div>
        <Link href="/meu-mes?new=1">
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

      <section aria-label="Analytics anuais">
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Space align="center" style={{ width: "100%", justifyContent: "space-between" }} wrap>
            <div>
              <Title level={4} style={{ marginBottom: 4 }}>
                Estatísticas do ano
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Selecione o ano para atualizar todos os gráficos abaixo.
              </Paragraph>
            </div>
            <AnalyticsYearSelect
              availableYears={availableYears}
              value={hasNoYears ? null : selectedYear}
              onChange={setSelectedYear}
            />
          </Space>

          {analyticsQuery.isLoading ? (
            <Spin tip="Carregando estatísticas..." />
          ) : analyticsQuery.isError ? (
            <Result
              status="error"
              title="Estatísticas indisponíveis"
              subTitle={getErrorMessage(
                analyticsQuery.error,
                "Não foi possível carregar os gráficos de analytics.",
              )}
              extra={
                <Button onClick={() => void analyticsQuery.refetch()}>Tentar novamente</Button>
              }
            />
          ) : hasNoYears ? (
            <Empty description="Não há transações para analisar. Cadastre movimentações para ver os gráficos." />
          ) : analyticsQuery.data ? (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <MonthlyTotalsBarChart monthlyTotals={analyticsQuery.data.monthlyTotals} />
              </Col>
              <Col xs={24} lg={12}>
                <TagRadarChart year={selectedYear} tagRadar={analyticsQuery.data.tagRadar} />
              </Col>
              <Col xs={24} lg={12}>
                <ExpenseParetoChart expensePareto={analyticsQuery.data.expensePareto} />
              </Col>
            </Row>
          ) : null}
        </Space>
      </section>
    </Space>
  );
}
