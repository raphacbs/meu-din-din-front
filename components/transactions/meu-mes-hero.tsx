"use client";

import { LeftOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { Button, DatePicker, Progress, Space, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useState } from "react";

import { formatCurrency } from "@/lib/format/currency";
import type { MeuMesSummary, TagShare } from "@/lib/transactions/totals";

dayjs.locale("pt-br");

const { Text } = Typography;

interface MeuMesHeroProps {
  year: number;
  month: number;
  summary: MeuMesSummary | null;
  tagShares?: TagShare[];
  pulse?: boolean;
  onMonthChange: (year: number, month: number) => void;
  onCreate?: () => void;
}

export function MeuMesHero({
  year,
  month,
  summary,
  tagShares = [],
  pulse = false,
  onMonthChange,
  onCreate,
}: MeuMesHeroProps) {
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const monthValue = dayjs().year(year).month(month - 1).date(1);
  const planned = summary?.planned.balance ?? 0;
  const realized = summary?.realized.balance ?? 0;
  const activeCount = summary?.activeCount ?? 0;
  const settledCount = summary?.settledCount ?? 0;
  const progressPercent = activeCount > 0 ? Math.round((settledCount / activeCount) * 100) : 0;
  const plannedColor = planned >= 0 ? "var(--color-cash-green)" : "var(--color-debt-red)";

  function shiftMonth(delta: number) {
    const next = monthValue.add(delta, "month");
    onMonthChange(next.year(), next.month() + 1);
  }

  return (
    <section
      className={pulse ? "meu-mes-hero meu-mes-hero--pulse" : "meu-mes-hero"}
      style={{
        padding: "28px 28px 24px",
        borderRadius: 24,
        background:
          "radial-gradient(120% 140% at 0% 0%, #dff5e8 0%, transparent 55%), radial-gradient(100% 120% at 100% 0%, #e8f1ff 0%, transparent 50%), linear-gradient(160deg, #f7fbf8 0%, #eef4f8 100%)",
        border: "1px solid #d0dbd3",
        boxShadow: "0 18px 40px rgba(23, 33, 27, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 240px" }}>
          <Text
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgb(23 33 27 / 0.55)",
              marginBottom: 10,
            }}
          >
            Meu mês
          </Text>

          <Space size={4} align="center" wrap>
            <Button
              type="text"
              size="large"
              icon={<LeftOutlined />}
              aria-label="Mês anterior"
              onClick={() => shiftMonth(-1)}
              style={{ fontSize: 18, width: 40, height: 40 }}
            />
            <button
              type="button"
              onClick={() => setMonthPickerOpen(true)}
              aria-label={`Selecionar mês, atual ${monthValue.format("MMMM YYYY")}`}
              style={{
                appearance: "none",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 12,
                fontFamily: "var(--font-display), Georgia, serif",
                fontSize: 36,
                lineHeight: 1.1,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "var(--color-ink-ledger)",
                textTransform: "capitalize",
              }}
            >
              {monthValue.format("MMMM YYYY")}
            </button>
            <Button
              type="text"
              size="large"
              icon={<RightOutlined />}
              aria-label="Próximo mês"
              onClick={() => shiftMonth(1)}
              style={{ fontSize: 18, width: 40, height: 40 }}
            />
            <DatePicker
              picker="month"
              format="MMM/YYYY"
              allowClear={false}
              open={monthPickerOpen}
              onOpenChange={setMonthPickerOpen}
              value={monthValue}
              onChange={(value) => {
                if (value) {
                  onMonthChange(value.year(), value.month() + 1);
                  setMonthPickerOpen(false);
                }
              }}
              style={{
                position: "absolute",
                opacity: 0,
                width: 1,
                height: 1,
                pointerEvents: "none",
              }}
            />
          </Space>
        </div>

        {onCreate ? (
          <Button type="primary" icon={<PlusOutlined aria-hidden />} onClick={onCreate} size="large">
            Nova transação
          </Button>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: 28,
        }}
      >
        <div style={{ minWidth: 200, flex: "1 1 220px" }}>
          <Text
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "rgb(23 33 27 / 0.55)",
              marginBottom: 4,
            }}
          >
            Previsto
          </Text>
          <Text
            className="tabular-nums"
            style={{
              display: "block",
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: 48,
              lineHeight: 1.05,
              fontWeight: 600,
              color: plannedColor,
              letterSpacing: "-0.03em",
            }}
          >
            {formatCurrency(planned)}
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Se liquidar tudo neste mês
          </Text>
        </div>

        <div
          className="meu-mes-hero__realized"
          style={{
            minWidth: 160,
            flex: "0 1 180px",
            padding: "14px 16px",
            borderRadius: 16,
            background: "rgb(255 255 255 / 0.72)",
            border: "1px solid #d7ded8",
          }}
        >
          <Text
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgb(23 33 27 / 0.5)",
            }}
          >
            Realizado
          </Text>
          <Text
            className="tabular-nums"
            style={{
              display: "block",
              marginTop: 4,
              fontSize: 26,
              fontWeight: 700,
              color:
                realized >= 0 ? "var(--color-cash-green)" : "var(--color-debt-red)",
            }}
          >
            {formatCurrency(realized)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Já entrou / saiu
          </Text>
        </div>
      </div>

      <div style={{ marginTop: 24, maxWidth: 520 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 600 }}>
            {settledCount} de {activeCount} liquidados
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            a pagar {formatCurrency(summary?.pendingExpenseTotal ?? 0)} · a receber{" "}
            {formatCurrency(summary?.pendingRevenueTotal ?? 0)}
          </Text>
        </div>
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor="var(--color-cash-green)"
          trailColor="#d7ded8"
          size={["100%", 8]}
        />
        {tagShares.length > 0 ? (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgb(23 33 27 / 0.5)",
              }}
            >
              Por tag
            </Text>
            {tagShares.map((share) => (
              <div
                key={share.tag}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <Text style={{ fontSize: 13 }}>{share.tag}</Text>
                <Text className="tabular-nums" style={{ fontSize: 13, fontWeight: 600 }}>
                  {formatCurrency(share.amount)}
                </Text>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
