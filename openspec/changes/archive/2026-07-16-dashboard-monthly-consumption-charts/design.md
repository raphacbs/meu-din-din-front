## Context

O `DashboardView` hoje resume projeção + transações no cliente. Já existe Recharts no extrato. A API de analytics (`GET /api/analytics/dashboard?year=`) é entregue pela change de back `dashboard-analytics-api`; esta change só consome o contrato e reformula a UI.

## Goals / Non-Goals

**Goals:**

- Dashboard centrado em gráficos do ano selecionado (barras, radar, Pareto).
- Combobox de ano alimentado por `availableYears`.
- Cliente tipado + React Query por ano.
- Projeção compacta no topo.

**Non-Goals:**

- Implementar ou alterar endpoints no backend.
- Analytics no app mobile.
- Comparação multi-ano no mesmo gráfico.
- Substituir o pizza chart do Meu mês.

## Decisions

### 1. Dependência da API

**Escolha:** consumir estritamente o payload de `dashboard-analytics-api`. Nos testes, mockar o módulo `analytics`. Se a API ainda não estiver deployada localmente, o dashboard mostra erro acionável na seção de analytics.

### 2. Radar no UI

**Escolha:** eixos = top 8 tags de `tagRadar.yearTotals` (despesas). Séries: total anual + mês selecionável (`Select` de mês); default = mês corrente se `year` for o ano atual, senão 12.

### 3. Pareto

**Escolha:** Recharts barra + linha de `cumulativePercent`. Empty state se `expensePareto.length < 2`.

### 4. Layout

**Escolha:** `ProjectionPanel` no topo; abaixo seletor de ano + três cards/seções de gráfico. Remover ou reduzir cards/listas que competem com analytics (manter CTA “Nova transação”).

### 5. Libs

Recharts + Ant Design `Select`/`Card`/`Spin`/`Empty`/`Result` — sem nova dependência.

## Risks / Trade-offs

- **[API indisponível]** Dashboard sem gráficos → Mitigação: erro localizado; projeção independente.
- **[Contrato drift]** Front e back divergem → Mitigação: tipar DTOs espelhando o design da change de API; validar juntos no QA.

## Migration Plan

1. Preferir API de analytics mergeada/disponível.
2. Deploy front.
3. Rollback front restaura dashboard antigo; API pode permanecer.

## Open Questions

- Nenhuma bloqueante.
