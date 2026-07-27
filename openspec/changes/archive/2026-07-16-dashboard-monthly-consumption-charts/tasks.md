## 1. Cliente e tipos

- [x] 1.1 Adicionar tipos TypeScript do payload de analytics em `lib/types/api.ts` (alinhados à change `dashboard-analytics-api`)
- [x] 1.2 Criar `lib/api/analytics.ts` com `dashboard(year)` e query key em `lib/query/keys`
- [x] 1.3 Testar o módulo de API (mock do envelope e query param `year`)

## 2. Gráficos e seletor

- [x] 2.1 Implementar combobox de ano (Ant Design `Select`) com default e empty state sem anos
- [x] 2.2 Implementar gráfico de barras (Recharts) despesa × receita por mês
- [x] 2.3 Implementar radar de tags (top N) com série anual + série do mês selecionável
- [x] 2.4 Implementar diagrama de Pareto de despesas por tag (barras + % acumulado) com empty state se &lt; 2 tags

## 3. Reformular dashboard

- [x] 3.1 Reformular `DashboardView`: projeção compacta no topo; analytics como foco; reduzir cards/listas que competem com os gráficos
- [x] 3.2 Estados de loading/erro independentes para analytics vs. projeção
- [x] 3.3 Atualizar testes de `DashboardView` (seletor de ano, três gráficos, empty/Pareto N/A)

## 4. Verificação

- [x] 4.1 Validar contra API local/staging: trocar ano; barras/radar/Pareto; ano sem dados; projeção ainda recalcula
- [x] 4.2 Rodar suíte de testes relevante do front
