"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Form,
  Result,
  Space,
  Spin,
  Switch,
  Typography,
} from "antd";
import dayjs from "dayjs";

import { TransactionList } from "@/components/transactions/transaction-list";
import { transactions } from "@/lib/api/transactions";
import { ApiError } from "@/lib/api/client";
import { validateCustomRange } from "@/lib/period/date-range";
import { parsePeriodSearchParams, replacePeriodInUrl } from "@/lib/period/url";
import { queryKeys } from "@/lib/query/keys";
import { usePeriodStore } from "@/lib/stores/period-store";

const { RangePicker } = DatePicker;
const { Paragraph, Title } = Typography;

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "Não foi possível carregar o extrato.";
  }

  return "Não foi possível carregar o extrato.";
}

function buildExtractQueryKey(fromDate?: string, toDate?: string) {
  return [...queryKeys.transactions, "extract", fromDate ?? "", toDate ?? ""] as const;
}

export function ExtractView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const draft = usePeriodStore((state) => state.draft);
  const applied = usePeriodStore((state) => state.applied);
  const setMode = usePeriodStore((state) => state.setMode);
  const setMonth = usePeriodStore((state) => state.setMonth);
  const setCustomRange = usePeriodStore((state) => state.setCustomRange);
  const apply = usePeriodStore((state) => state.apply);
  const hydrate = usePeriodStore((state) => state.hydrate);
  const applyCurrentMonthDefault = usePeriodStore((state) => state.applyCurrentMonthDefault);

  useEffect(() => {
    const parsed = parsePeriodSearchParams(searchParams);

    if (parsed) {
      hydrate(parsed.from, parsed.to);
    } else {
      const range = applyCurrentMonthDefault();
      replacePeriodInUrl(router, pathname, range.from, range.to);
    }

    setHydrated(true);
    // Hydrate once on mount from URL or current month default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extractQuery = useQuery({
    queryKey: buildExtractQueryKey(applied?.from, applied?.to),
    queryFn: () => transactions.extract(applied!.from, applied!.to),
    enabled: hydrated && Boolean(applied?.from && applied?.to),
  });

  function handleSubmit() {
    if (draft.mode === "custom") {
      const error = validateCustomRange(draft.from, draft.to);
      if (error) {
        setValidationError(error);
        return;
      }
    }

    setValidationError(null);
    const range = apply();
    if (!range) {
      return;
    }

    replacePeriodInUrl(router, pathname, range.from, range.to);
  }

  const monthValue = dayjs()
    .year(draft.year)
    .month(draft.month - 1)
    .date(1);

  const customRangeValue =
    draft.from && draft.to ? ([dayjs(draft.from), dayjs(draft.to)] as [dayjs.Dayjs, dayjs.Dayjs]) : null;

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div
        style={{
          padding: "20px 22px",
          borderRadius: 18,
          background: "linear-gradient(120deg, #e8f7ee 0%, #e8f3ff 55%, #fff4e8 100%)",
          border: "1px solid #d7ded8",
        }}
      >
        <Title level={2} style={{ marginBottom: 8, color: "var(--color-cash-green)" }}>
          Extrato
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: 640 }}>
          Filtre movimentações por mês ou por um período personalizado.
        </Paragraph>
      </div>

      <Form
        layout="vertical"
        onFinish={handleSubmit}
        style={{
          padding: 16,
          borderRadius: 14,
          background: "#ffffff",
          border: "1px solid #d7ded8",
        }}
      >
        <Space wrap align="end">
          <Form.Item label="Modo" style={{ marginBottom: 0 }}>
            <Switch
              checkedChildren="Mês"
              unCheckedChildren="Customizado"
              checked={draft.mode === "month"}
              onChange={(checked) => setMode(checked ? "month" : "custom")}
            />
          </Form.Item>

          {draft.mode === "month" ? (
            <Form.Item label="Mês" style={{ marginBottom: 0 }}>
              <DatePicker
                picker="month"
                format="MM/YYYY"
                value={monthValue}
                onChange={(value) => {
                  if (value) {
                    setMonth(value.year(), value.month() + 1);
                  }
                }}
              />
            </Form.Item>
          ) : (
            <Form.Item label="Período" style={{ marginBottom: 0 }}>
              <RangePicker
                value={customRangeValue}
                format="DD/MM/YYYY"
                onChange={(values) => {
                  setCustomRange(
                    values?.[0]?.format("YYYY-MM-DD") ?? null,
                    values?.[1]?.format("YYYY-MM-DD") ?? null,
                  );
                }}
              />
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit">
            Filtrar
          </Button>
        </Space>
        {validationError ? (
          <Alert type="error" message={validationError} showIcon style={{ marginTop: 16 }} />
        ) : null}
      </Form>

      {!hydrated || !applied ? (
        <Spin tip="Carregando extrato...">
          <div style={{ minHeight: 120 }} />
        </Spin>
      ) : extractQuery.isLoading ? (
        <Spin tip="Carregando extrato...">
          <div style={{ minHeight: 120 }} />
        </Spin>
      ) : extractQuery.isError ? (
        <Result
          status="error"
          title={getErrorMessage(extractQuery.error)}
          extra={<Button onClick={() => void extractQuery.refetch()}>Tentar novamente</Button>}
        />
      ) : !extractQuery.data?.length ? (
        <Empty description="Nenhuma movimentação no período selecionado." />
      ) : (
        <TransactionList transactions={extractQuery.data} />
      )}
    </Space>
  );
}
