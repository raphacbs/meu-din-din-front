## 1. Base — Instalar antd e configurar infraestrutura



- [x] 1.1 Instalar `antd` e `@ant-design/nextjs-registry` com `--legacy-peer-deps`

- [x] 1.2 Remover `tailwindcss`, `@tailwindcss/postcss` e `prettier-plugin-tailwindcss` do `package.json`

- [x] 1.3 Atualizar `postcss.config.mjs` removendo o plugin do Tailwind

- [x] 1.4 Limpar `app/globals.css` — remover `@import "tailwindcss"` e tokens Tailwind; manter apenas reset CSS mínimo e variáveis de cor que serão mapeadas para tokens antd

- [x] 1.5 Envolver `app/layout.tsx` com `AntdRegistry` (Server Component do `@ant-design/nextjs-registry`) para resolver flash de estilos no SSR

- [x] 1.6 Adicionar `ConfigProvider` antd ao `app/providers.tsx` com tema customizado mapeando a paleta do projeto (`colorPrimary`, `colorBgContainer`, `colorBgLayout`, etc.) para os tokens antd equivalentes



## 2. Shell — Substituir layout e navegação por sidebar antd



- [x] 2.1 Reescrever `components/app/app-shell.tsx` usando `antd Layout + Sider + Content`; o `Sider` contém logo, menu e footer (email + botão Sair)

- [x] 2.2 Substituir `components/app/app-nav.tsx` por `antd Menu` com `selectedKeys` derivado de `usePathname()`, links para Dashboard, Transações e Extrato

- [x] 2.3 Adicionar `collapsible` ao `Sider` do antd para suporte a telas menores

- [x] 2.4 Mover o botão "Nova transação" para o `Header` antd dentro do `AppShell`

- [x] 2.5 Atualizar testes de `app-shell.test.tsx` e `app-nav.test.tsx` para refletir a nova estrutura



## 3. Componentes UI base — Remover design system custom e usar antd direto



- [x] 3.1 Deletar `components/ui/button.tsx` — substituir importações por `antd Button`

- [x] 3.2 Deletar `components/ui/input.tsx` — substituir importações por `antd Input`

- [x] 3.3 Deletar `components/ui/select.tsx` — substituir importações por `antd Select`

- [x] 3.4 Deletar `components/ui/field.tsx` (Field, FieldLabel, FieldError, FieldHelperText) — substituir por `antd Form.Item`

- [x] 3.5 Deletar `components/ui/card.tsx` — substituir importações por `antd Card`

- [x] 3.6 Deletar `components/ui/badge.tsx` — substituir importações por `antd Tag` com cores por status

- [x] 3.7 Deletar `components/ui/alert.tsx` — substituir importações por `antd Alert`

- [x] 3.8 Deletar `components/ui/loading-state.tsx` — substituir importações por `antd Spin`

- [x] 3.9 Deletar `components/ui/empty-state.tsx` — substituir importações por `antd Empty`

- [x] 3.10 Deletar `components/ui/error-state.tsx` — substituir importações por `antd Result` com `status="error"`

- [x] 3.11 Deletar `components/ui/segmented-control.tsx` — substituir importações por `antd Segmented`

- [x] 3.12 Deletar `components/ui/responsive-data-view.tsx` — substituir importações por `antd Table` (desktop) e `antd List` (mobile)

- [x] 3.13 Atualizar `components/ui/transaction-data.tsx` — `CurrencyCell`, `TransactionStatusBadge`, `TransactionTagList`, `TransactionMetadata` passam a usar antd `Tag`, `Typography` e formatadores existentes



## 4. Formulários de autenticação — Migrar para antd Form



- [x] 4.1 Reescrever `components/auth/login-form.tsx` usando `antd Form` com `Form.useForm()`, `Form.Item` com regras de validação e `antd Input.Password`

- [x] 4.2 Reescrever `components/auth/register-form.tsx` usando `antd Form` com `Form.useForm()`, `Form.Item` com regras de validação e `antd Input.Password`

- [x] 4.3 Atualizar testes de `login-form.test.tsx` e `register-form.test.tsx` para usar queries semânticas (`getByRole`, `getByLabelText`)



## 5. Componentes especializados — CurrencyInput, TagSelect



- [x] 5.1 Criar `components/ui/currency-keyboard.tsx` — teclado virtual com grid 3×4 de botões antd, estado interno em centavos (acumulação inteira), display formatado em BRL, botão "Confirmar"

- [x] 5.2 Criar `components/ui/currency-input.tsx` — `antd InputNumber` formatado em BRL + `antd Popover` contendo `CurrencyKeyboard`; interface `value: number | undefined` / `onChange` compatível com `Form.Item`

- [x] 5.3 Criar hook `lib/transactions/use-tag-options.ts` — extrai tags únicas do cache React Query de `transactions.list()`, retorna `string[]` ordenado

- [x] 5.4 Criar `components/ui/tag-select.tsx` — `antd Select mode="tags"` usando as opções de `useTagOptions()`; interface `value: string[]` / `onChange` compatível com `Form.Item`



## 6. Formulário de transação — Migrar para antd Form + campos especializados



- [x] 6.1 Reescrever `components/transactions/transaction-form.tsx` usando `antd Form` com `Form.useForm()`; substituir `SegmentedControl` por `antd Segmented`

- [x] 6.2 Substituir campos de valor monetário (`amountInput`, `installmentAmountInput`) por `CurrencyInput` dentro de `Form.Item`

- [x] 6.3 Substituir campos de quantidade (`installmentCount`, `intervalCount`) por `antd InputNumber` com `min={1}` dentro de `Form.Item`

- [x] 6.4 Substituir campo de tags por `TagSelect` dentro de `Form.Item`

- [x] 6.5 Substituir `Select` nativo (tipo, frequência) por `antd Select` com opções como `options={[...]}` dentro de `Form.Item`

- [x] 6.6 Substituir campos de data por `antd DatePicker` com locale `pt_BR` dentro de `Form.Item`

- [x] 6.7 Preservar a função `buildTransactionPayload` de `lib/transactions/form.ts` — adaptar a receber os valores do `antd Form` via `onFinish(values)`

- [x] 6.8 Atualizar `components/transactions/transaction-form-view.tsx` para passar valores iniciais ao `antd Form` via `form.setFieldsValue()` no modo de edição

- [x] 6.9 Atualizar testes do `transaction-form`



## 7. Listagens e ações destrutivas — Migrar para antd Table, List e Modal



- [x] 7.1 Reescrever `components/transactions/transaction-list.tsx` usando `antd Table` com colunas para desktop e `antd List` com itens para mobile; detecção de breakpoint via `antd Grid.useBreakpoint()`

- [x] 7.2 Reescrever `components/transactions/transaction-actions.tsx` substituindo confirmações inline por `antd Modal.confirm` para cancelar, excluir e desativar recorrência

- [x] 7.3 Reescrever `components/transactions/transaction-attachments.tsx` usando `antd Form`, `antd Input`, `antd Button` e `antd Modal.confirm` para exclusão

- [x] 7.4 Atualizar testes de `transaction-list.test.tsx` e `transaction-actions.test.tsx`



## 8. Extrato — Migrar filtros e listagem



- [x] 8.1 Reescrever `components/transactions/extract-view.tsx` substituindo inputs de data por `antd DatePicker.RangePicker` com locale `pt_BR` e listagem por `antd Table` ou `antd List`



## 9. Dashboard — Migrar painéis para antd



- [x] 9.1 Reescrever `components/dashboard/dashboard-panels.tsx` substituindo `Card` custom por `antd Card` e valores numéricos por `antd Statistic`

- [x] 9.2 Atualizar `components/dashboard/cash-ribbon.tsx` para usar primitivas antd (Tag, Typography, Space)

- [x] 9.3 Atualizar `components/dashboard/dashboard-view.tsx` — estados de loading com `antd Spin`, erro com `antd Result`, atualizar testes



## 10. Páginas de autenticação e landing — Ajustes finais



- [x] 10.1 Atualizar `app/page.tsx` (landing) — links estilizados como botões usando `antd Button`

- [x] 10.2 Verificar `app/login/page.tsx` e `app/register/page.tsx` — layouts centrados sem sidebar (as páginas de auth ficam fora do `(app)` layout)



## 11. Limpeza — Remover resíduos e verificar cobertura



- [x] 11.1 Verificar que nenhum arquivo importa de `tailwindcss` ou usa classes `className="..."` com utilitários Tailwind

- [x] 11.2 Verificar que todos os arquivos de `components/ui/` marcados para deleção foram removidos

- [x] 11.3 Executar `npm run build` e corrigir erros de TypeScript restantes

- [x] 11.4 Executar `npm run test` e corrigir testes que falharem após a migração

- [x] 11.5 Verificar visualmente no browser: sidebar, formulário de transação com teclado monetário, seleção de tags e campos de quantidade com stepper


