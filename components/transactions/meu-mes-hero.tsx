"use client";



import {

  ImportOutlined,

  LeftOutlined,

  PlusOutlined,

  RightOutlined,

} from "@ant-design/icons";

import { Button, DatePicker, Progress, Space } from "antd";

import dayjs from "dayjs";

import "dayjs/locale/pt-br";

import { useState } from "react";



import { formatCurrency } from "@/lib/format/currency";

import type { MeuMesSummary, TagShare } from "@/lib/transactions/totals";



dayjs.locale("pt-br");



interface MeuMesHeroProps {

  year: number;

  month: number;

  summary: MeuMesSummary | null;

  tagShares?: TagShare[];

  pulse?: boolean;

  onMonthChange: (year: number, month: number) => void;

  onCreate?: () => void;

  onImport?: () => void;

}



export function MeuMesHero({

  year,

  month,

  summary,

  tagShares = [],

  pulse = false,

  onMonthChange,

  onCreate,

  onImport,

}: MeuMesHeroProps) {

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  const monthValue = dayjs().year(year).month(month - 1).date(1);

  const planned = summary?.planned.balance ?? 0;

  const realized = summary?.realized.balance ?? 0;

  const activeCount = summary?.activeCount ?? 0;

  const settledCount = summary?.settledCount ?? 0;

  const progressPercent = activeCount > 0 ? Math.round((settledCount / activeCount) * 100) : 0;

  const plannedColor = planned >= 0 ? "var(--color-cash-green)" : "var(--color-debt-red)";

  const realizedColor =

    realized >= 0 ? "var(--color-cash-green)" : "var(--color-debt-red)";



  function shiftMonth(delta: number) {

    const next = monthValue.add(delta, "month");

    onMonthChange(next.year(), next.month() + 1);

  }



  return (

    <section className={pulse ? "meu-mes-hero meu-mes-hero--pulse" : "meu-mes-hero"}>

      <div className="meu-mes-hero__header">

        <div className="meu-mes-hero__title-block">

          <span className="meu-mes-hero__eyebrow">Meu mês</span>



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

              className="meu-mes-hero__month"

              onClick={() => setMonthPickerOpen(true)}

              aria-label={`Selecionar mês, atual ${monthValue.format("MMMM YYYY")}`}

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

          <Space size={12} wrap>

            {onImport ? (

              <Button

                icon={<ImportOutlined aria-hidden />}

                onClick={onImport}

                size="large"

              >

                Importar fatura

              </Button>

            ) : null}

            <Button

              type="primary"

              icon={<PlusOutlined aria-hidden />}

              onClick={onCreate}

              size="large"

            >

              Nova transação

            </Button>

          </Space>

        ) : null}

      </div>



      <div className="meu-mes-hero__metrics">

        <div className="meu-mes-hero__planned-block">

          <span className="meu-mes-hero__metric-label">Previsto</span>

          <span

            className="meu-mes-hero__planned-value tabular-nums"

            style={{ color: plannedColor }}

          >

            {formatCurrency(planned)}

          </span>

          <span className="meu-mes-hero__hint">Se liquidar tudo neste mês</span>

        </div>



        <div className="meu-mes-hero__realized">

          <span className="meu-mes-hero__metric-label">Realizado</span>

          <span

            className="meu-mes-hero__realized-value tabular-nums"

            style={{ color: realizedColor }}

          >

            {formatCurrency(realized)}

          </span>

          <span className="meu-mes-hero__hint">Já entrou / saiu</span>

        </div>

      </div>



      <div className="meu-mes-hero__progress-block">

        <div className="meu-mes-hero__progress-header">

          <span className="meu-mes-hero__progress-count">

            {settledCount} de {activeCount} liquidados

          </span>

          <span className="meu-mes-hero__progress-meta">

            a pagar {formatCurrency(summary?.pendingExpenseTotal ?? 0)} · a receber{" "}

            {formatCurrency(summary?.pendingRevenueTotal ?? 0)}

          </span>

        </div>

        <Progress

          percent={progressPercent}

          showInfo={false}

          strokeColor="var(--color-cash-green)"

          trailColor="var(--meu-mes-hero-progress-trail)"

          size={["100%", 8]}

        />

        {tagShares.length > 0 ? (

          <div className="meu-mes-hero__tags">

            <span className="meu-mes-hero__tags-label">Por tag</span>

            {tagShares.map((share) => (

              <div key={share.tag} className="meu-mes-hero__tag-row">

                <span className="meu-mes-hero__tag-name">{share.tag}</span>

                <span className="meu-mes-hero__tag-value tabular-nums">

                  {formatCurrency(share.amount)}

                </span>

              </div>

            ))}

          </div>

        ) : null}

      </div>

    </section>

  );

}

