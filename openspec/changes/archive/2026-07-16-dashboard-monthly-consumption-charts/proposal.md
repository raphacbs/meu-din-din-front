## Why

O dashboard atual é um resumo operacional (projeção, totais e listas), sem visão analítica do consumo ao longo do ano. O usuário precisa comparar despesas/receitas mês a mês, ver composição por tags e concentração de gastos — via gráficos anuais com seletor de ano.

## What Changes

- Reformular a tela `/dashboard` para priorizar gráficos de estatísticas de consumo mensal/anual.
- Adicionar seletor de ano (combobox) que controla todos os gráficos.
- Gráfico de barras do ano (12 meses): totais de **despesas** e **receitas**.
- Gráfico de radar: somatório das tags (série mensal selecionável + total anual).
- Diagrama de Pareto das despesas por tag, quando houver dados suficientes.
- Consumir `GET /api/analytics/dashboard?year={yyyy}` (contrato definido na change de back `dashboard-analytics-api`).
- Manter projeção de saldo como bloco compacto/secundário.
- Atualizar testes do dashboard e do cliente de API.

## Capabilities

### New Capabilities

- `dashboard-analytics`: comportamento dos gráficos e do cliente tipado que consome o endpoint de analytics (sem implementar a API neste repo).

### Modified Capabilities

- `financial-dashboard`: home autenticada centrada em analytics anuais com seletor de ano; projeção permanece, layout principal muda.

## Impact

- Frontend: `DashboardView`, novos componentes de gráfico (Recharts), `lib/api/analytics.ts`, tipos, query keys, testes.
- Dependência externa: API `dashboard-analytics-api` no repo `meu-din-din` deve estar disponível (ou mockável nos testes).
- Sem mudanças de código no backend nesta change.
