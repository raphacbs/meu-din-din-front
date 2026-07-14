## 1. Fundação do período

- [x] 1.1 Adicionar dependência `zustand` ao projeto
- [x] 1.2 Criar helpers de intervalo de mês (`startOf`/`endOf` → `YYYY-MM-DD`) e inferência de modo a partir de `from`/`to`
- [x] 1.3 Criar store compartilhado de período (draft + applied, modos `month`/`custom`, ações setMode/setMonth/setCustomRange/apply)
- [x] 1.4 Criar helpers de sync com search params `from`/`to` (parse, validação, `replace`)

## 2. UI do extrato

- [x] 2.1 Atualizar `ExtractView` com `Segmented` Mês/Customizado, MonthPicker e RangePicker ligados ao draft do store
- [x] 2.2 Manter botão Filtrar: validar draft, aplicar no store, atualizar URL e disparar query
- [x] 2.3 Na montagem de `/extract`, hidratar de `?from=&to=` ou aplicar mês atual como default e sincronizar URL
- [x] 2.4 Ligar `useQuery` do extrato ao período aplicado (`X-From-Date` / `X-To-Date`)

## 3. Testes e acabamento

- [x] 3.1 Atualizar/criar testes do store e helpers (mês atual, intervalo do mês, inferência de modo, validação)
- [x] 3.2 Atualizar testes de `ExtractView` (default mês atual, Filtrar mês, Filtrar custom, URL, validação)
- [x] 3.3 Ajustar copy da tela (remover menção técnica a “headers ISO” se ainda existir) e revisar estados loading/erro/vazio
