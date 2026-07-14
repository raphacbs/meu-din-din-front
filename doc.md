# Relatório completo do frontend — `F:\repos\meu-din-din-front`

> **Nota importante:** este projeto **não possui diretório `src/`**. O código-fonte fica na raiz do repositório, com alias `@/*` apontando para `./*` (`tsconfig.json`). A estrutura equivalente ao que seria `src/` é a combinação de `app/`, `components/` e `lib/`.

---

## 1. Estrutura geral de pastas (equivalente a `src/`)

```
F:\repos\meu-din-din-front\
├── app\                          # Rotas e layouts (Next.js App Router)
│   ├── globals.css
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing (/)
│   ├── providers.tsx             # QueryClient + SessionProvider
│   ├── login\page.tsx
│   ├── register\page.tsx
│   └── (app)\                    # Grupo de rotas autenticadas
│       ├── layout.tsx            # SessionGuard + AppShell
│       ├── layout.test.tsx
│       ├── dashboard\page.tsx
│       ├── extract\page.tsx
│       └── transactions\
│           ├── page.tsx
│           ├── new\page.tsx
│           └── [id]\page.tsx
│
├── components\
│   ├── app\                      # Shell e navegação
│   ├── auth\                     # Login, registro, guards
│   ├── dashboard\                # Dashboard e painéis
│   ├── transactions\             # CRUD, listas, extrato
│   └── ui\                       # Design system customizado
│
├── lib\
│   ├── api\                      # Cliente HTTP e endpoints
│   ├── auth\                     # Sessão (Context + localStorage)
│   ├── dashboard\                # Lógica de resumo
│   ├── format\                   # Moeda, datas, status, etc.
│   ├── query\                    # React Query keys
│   ├── transactions\             # Form state/validação
│   ├── types\                    # Tipos da API
│   ├── utils\                    # cn() (classnames)
│   └── env.ts
│
├── openspec\                     # Especificações OpenSpec
├── .agents\skills\               # Skills do agente (não é código da app)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── vitest.config.mts
└── next-env.d.ts
```

**Arquivos de configuração na raiz:**
- `F:\repos\meu-din-din-front\package.json`
- `F:\repos\meu-din-din-front\tsconfig.json`
- `F:\repos\meu-din-din-front\next.config.ts`
- `F:\repos\meu-din-din-front\postcss.config.mjs`
- `F:\repos\meu-din-din-front\vitest.config.mts`
- `F:\repos\meu-din-din-front\app\globals.css`

**Não existe:** `public/`, `src/`, `middleware.ts`.

---

## 2. Páginas / rotas

Roteamento via **Next.js 16 App Router** (file-based). Não há `react-router`.

| Rota URL | Arquivo | Componente principal |
|----------|---------|----------------------|
| `/` | `F:\repos\meu-din-din-front\app\page.tsx` | Landing com links Entrar/Criar conta |
| `/login` | `F:\repos\meu-din-din-front\app\login\page.tsx` | `LoginForm` + `GuestGuard` |
| `/register` | `F:\repos\meu-din-din-front\app\register\page.tsx` | `RegisterForm` + `GuestGuard` |
| `/dashboard` | `F:\repos\meu-din-din-front\app\(app)\dashboard\page.tsx` | `DashboardView` |
| `/transactions` | `F:\repos\meu-din-din-front\app\(app)\transactions\page.tsx` | `TransactionsView` |
| `/transactions/new` | `F:\repos\meu-din-din-front\app\(app)\transactions\new\page.tsx` | `TransactionFormView` |
| `/transactions/[id]` | `F:\repos\meu-din-din-front\app\(app)\transactions\[id]\page.tsx` | `TransactionFormView` (edição) |
| `/extract` | `F:\repos\meu-din-din-front\app\(app)\extract\page.tsx` | `ExtractView` |

**Layouts:**
- `F:\repos\meu-din-din-front\app\layout.tsx` — root (fontes Google, `AppProviders`)
- `F:\repos\meu-din-din-front\app\(app)\layout.tsx` — autenticado (`SessionGuard` + `AppShell`)

---

## 3. Componentes de UI (todos os arquivos)

### `components/ui/` — Design system customizado
| Arquivo | Exportações principais |
|---------|------------------------|
| `F:\repos\meu-din-din-front\components\ui\alert.tsx` | `Alert` |
| `F:\repos\meu-din-din-front\components\ui\badge.tsx` | `Badge` |
| `F:\repos\meu-din-din-front\components\ui\button.tsx` | `Button`, `buttonClassName` |
| `F:\repos\meu-din-din-front\components\ui\card.tsx` | `Card` |
| `F:\repos\meu-din-din-front\components\ui\empty-state.tsx` | `EmptyState` |
| `F:\repos\meu-din-din-front\components\ui\error-state.tsx` | `ErrorState` |
| `F:\repos\meu-din-din-front\components\ui\field.tsx` | `Field`, `FieldLabel`, `FieldHelperText`, `FieldError` |
| `F:\repos\meu-din-din-front\components\ui\input.tsx` | `Input` |
| `F:\repos\meu-din-din-front\components\ui\loading-state.tsx` | `LoadingState` |
| `F:\repos\meu-din-din-front\components\ui\responsive-data-view.tsx` | `ResponsiveDataView`, `DataTableShell`, `DataCardList`, `DataCard` |
| `F:\repos\meu-din-din-front\components\ui\segmented-control.tsx` | `SegmentedControl` |
| `F:\repos\meu-din-din-front\components\ui\select.tsx` | `Select` |
| `F:\repos\meu-din-din-front\components\ui\transaction-data.tsx` | `CurrencyCell`, `TransactionStatusBadge`, `TransactionTagList`, `TransactionMetadata` |

**Testes UI:**
- `F:\repos\meu-din-din-front\components\ui\responsive-data-view.test.tsx`

### `components/app/`
| Arquivo | Função |
|---------|--------|
| `F:\repos\meu-din-din-front\components\app\app-shell.tsx` | Layout principal (header + nav + main) |
| `F:\repos\meu-din-din-front\components\app\app-nav.tsx` | Barra de navegação horizontal |
| `F:\repos\meu-din-din-front\components\app\app-shell.test.tsx` | Testes |
| `F:\repos\meu-din-din-front\components\app\app-nav.test.tsx` | Testes |

### `components/auth/`
| Arquivo | Função |
|---------|--------|
| `F:\repos\meu-din-din-front\components\auth\login-form.tsx` | Formulário de login |
| `F:\repos\meu-din-din-front\components\auth\register-form.tsx` | Formulário de registro |
| `F:\repos\meu-din-din-front\components\auth\session-guard.tsx` | `SessionGuard`, `GuestGuard` |
| `F:\repos\meu-din-din-front\components\auth\login-form.test.tsx` | Testes |
| `F:\repos\meu-din-din-front\components\auth\register-form.test.tsx` | Testes |
| `F:\repos\meu-din-din-front\components\auth\session-guard.test.tsx` | Testes |

### `components/dashboard/`
| Arquivo | Função |
|---------|--------|
| `F:\repos\meu-din-din-front\components\dashboard\dashboard-view.tsx` | Página do dashboard |
| `F:\repos\meu-din-din-front\components\dashboard\dashboard-panels.tsx` | `ProjectionPanel`, `SummaryCard`, `TransactionPreviewList` |
| `F:\repos\meu-din-din-front\components\dashboard\cash-ribbon.tsx` | Faixa visual de caixa |
| `F:\repos\meu-din-din-front\components\dashboard\dashboard-view.test.tsx` | Testes |

### `components/transactions/`
| Arquivo | Função |
|---------|--------|
| `F:\repos\meu-din-din-front\components\transactions\transactions-view.tsx` | Lista de transações |
| `F:\repos\meu-din-din-front\components\transactions\transaction-list.tsx` | Tabela/cards responsivos |
| `F:\repos\meu-din-din-front\components\transactions\transaction-form-view.tsx` | Wrapper create/edit |
| `F:\repos\meu-din-din-front\components\transactions\transaction-form.tsx` | Formulário principal |
| `F:\repos\meu-din-din-front\components\transactions\transaction-actions.tsx` | Ações (cancelar, excluir, etc.) |
| `F:\repos\meu-din-din-front\components\transactions\transaction-attachments.tsx` | Anexos |
| `F:\repos\meu-din-din-front\components\transactions\extract-view.tsx` | Extrato com filtro de datas |
| `F:\repos\meu-din-din-front\components\transactions\*.test.tsx` | 6 arquivos de teste |

---

## 4. UI library / framework

**Stack de UI em produção (código da app):**

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 16.2.9 | Framework, roteamento, SSR |
| **React** | 19.2.4 | UI |
| **Tailwind CSS** | 4.x | Estilização (`@import "tailwindcss"`, tokens em `globals.css`) |
| **Componentes custom** | — | `components/ui/*` (HTML nativo estilizado) |

**Dependências de runtime (`package.json`):**
- `@tanstack/react-query` ^5.101.2
- `next`, `react`, `react-dom`

**Não instalado nem importado no código da app:**
- Ant Design (`antd`)
- shadcn/ui / Radix UI
- Material UI
- Chakra UI
- Lucide icons

> Existem skills de Ant Design em `.agents/skills/`, mas **não fazem parte do bundle da aplicação**.

**Fontes:** Libre Baskerville (display) + Source Sans 3 (body) via `next/font/google` em `app/layout.tsx`.

**Tema visual:** paleta “caderno de caixa” definida em `F:\repos\meu-din-din-front\app\globals.css` (cores `--color-cash-green`, `--color-paper-mint`, etc.).

---

## 5. Roteamento

- **Framework:** Next.js App Router (não react-router)
- **Navegação:** `next/link` + `useRouter` / `usePathname` de `next/navigation`
- **Grupo de rotas:** `(app)` agrupa rotas autenticadas com layout compartilhado
- **Guards:** `SessionGuard` redireciona para `/login`; `GuestGuard` redireciona para `/dashboard`
- **Rota dinâmica:** `[id]` em transações

---

## 6. Bibliotecas de formulário

**Nenhuma biblioteca de formulário dedicada** (sem react-hook-form, Formik, Zod no código da app).

**Abordagem atual:**
- Formulários HTML nativos com `onSubmit` + `useState` local
- Validação manual em:
  - `F:\repos\meu-din-din-front\lib\transactions\form.ts` — transações
  - `F:\repos\meu-din-din-front\lib\auth\session-storage.ts` — auth (importado pelos forms)
- Componentes de campo: `Field`, `FieldLabel`, `FieldError`, `FieldHelperText`
- `noValidate` nos forms para validação customizada

**Formulários existentes:**
| Arquivo | Campos |
|---------|--------|
| `login-form.tsx` | email, password |
| `register-form.tsx` | email, password |
| `transaction-form.tsx` | tipo, valor, descrição, datas, parcelas, recorrência, tags |
| `extract-view.tsx` | fromDate, toDate (filtro) |
| `transaction-attachments.tsx` | fileName, fileUrl, mimeType, fileSize |

---

## 7. Gerenciamento de estado

| Camada | Tecnologia | Arquivo(s) |
|--------|------------|------------|
| **Server/async state** | TanStack React Query | `app/providers.tsx`, views com `useQuery`/`useMutation` |
| **Autenticação** | React Context | `F:\repos\meu-din-din-front\lib\auth\session-context.tsx` |
| **Persistência de sessão** | localStorage | `F:\repos\meu-din-din-front\lib\auth\session-storage.ts` |
| **Form state** | `useState` local | Forms individuais |
| **Query keys** | Constantes | `F:\repos\meu-din-din-front\lib\query\keys.ts` |

**Sem:** Redux, Zustand, Jotai, Recoil.

**Hooks React Query usados em:**
- `dashboard-view.tsx` — projection + transactions + recalculate
- `transactions-view.tsx` — list
- `extract-view.tsx` — extract
- `transaction-form-view.tsx` — get + save
- `transaction-actions.tsx` — mutations
- `transaction-attachments.tsx` — list + add + delete

---

## 8. Layout / sidebar

**Não há sidebar.** O layout autenticado usa estrutura vertical:

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `AppShell` | `components/app/app-shell.tsx` | Header (logo, email, “Nova transação”, Sair) + nav + `<main>` |
| `AppNav` | `components/app/app-nav.tsx` | Nav horizontal com links: Dashboard, Transações, Extrato |

**Itens de navegação (`NAV_ITEMS`):**
- `/dashboard` — Dashboard
- `/transactions` — Transações
- `/extract` — Extrato

**Acessibilidade:** skip link “Ir para o conteúdo”, `aria-current="page"` nos links ativos.

---

## 9. Inventário de componentes visuais

### Componentes reutilizáveis (`components/ui/`)

| Tipo | Componente | Arquivo |
|------|------------|---------|
| **Input** | `Input` | `components/ui/input.tsx` |
| **Select** | `Select` | `components/ui/select.tsx` |
| **Button** | `Button`, `buttonClassName` | `components/ui/button.tsx` |
| **Radio group** | `SegmentedControl` | `components/ui/segmented-control.tsx` |
| **Label/field** | `Field`, `FieldLabel`, `FieldHelperText`, `FieldError` | `components/ui/field.tsx` |
| **Card** | `Card` (variants: default, muted, ledger, dashed) | `components/ui/card.tsx` |
| **Badge** | `Badge` (tones: default, primary, success, warning, danger, muted) | `components/ui/badge.tsx` |
| **Alert** | `Alert` | `components/ui/alert.tsx` |
| **Table shell** | `DataTableShell` | `components/ui/responsive-data-view.tsx` |
| **Card list** | `DataCardList`, `DataCard` | `components/ui/responsive-data-view.tsx` |
| **Responsive wrapper** | `ResponsiveDataView` | `components/ui/responsive-data-view.tsx` |
| **Loading** | `LoadingState` (spinner) | `components/ui/loading-state.tsx` |
| **Empty** | `EmptyState` | `components/ui/empty-state.tsx` |
| **Error** | `ErrorState` | `components/ui/error-state.tsx` |
| **Currency display** | `CurrencyCell` | `components/ui/transaction-data.tsx` |
| **Status badge** | `TransactionStatusBadge` | `components/ui/transaction-data.tsx` |
| **Tag list** | `TransactionTagList` | `components/ui/transaction-data.tsx` |
| **Metadata** | `TransactionMetadata` | `components/ui/transaction-data.tsx` |

### Modais / diálogos

**Não há componente Modal reutilizável.** Confirmações inline:
- `transaction-actions.tsx` — `role="alertdialog"` para confirmar ações
- `transaction-attachments.tsx` — confirmação inline de exclusão

### Inputs nativos fora do design system

Usados com classes Tailwind inline (não via `Input`):
- `extract-view.tsx` — 2× `<input type="date">`, 1× `<button>`
- `transaction-attachments.tsx` — 4× `<input>`, botões inline
- `transaction-actions.tsx` — botões inline estilizados manualmente
- `transactions-view.tsx`, `app/page.tsx` — links estilizados como botões

### Tipos de input por uso

| Tipo | Onde |
|------|------|
| `type="email"` | login, register |
| `type="password"` | login, register |
| `type="date"` | transaction-form, extract-view |
| `inputMode="decimal"` | valor, valor da parcela (transaction-form) |
| `inputMode="numeric"` | parcelas, intervalo (transaction-form), tamanho bytes (attachments) |
| `type="radio"` (sr-only) | SegmentedControl |
| Texto livre | descrição, tags, anexos |

---

## 10. Componentes / inputs relacionados a tags

| Item | Arquivo | Descrição |
|------|---------|-----------|
| **Input de tags** | `components/transactions/transaction-form.tsx` | Campo `transaction-tags`, texto livre separado por vírgula |
| **Parsing** | `lib/transactions/form.ts` | `parseTags()` — split por vírgula, trim |
| **Exibição** | `components/ui/transaction-data.tsx` | `TransactionTagList` — renderiza `Badge tone="muted"` por tag |
| **Lista/tabela** | `components/transactions/transaction-list.tsx` | Coluna “Tags” com `TransactionTagList` |
| **Estado do form** | `lib/transactions/form.ts` | `tagsInput: string` → `tags?: string[]` no payload |

**Não existe:** componente TagInput com chips, autocomplete de tags, ou seletor multi-tag.

---

## 11. Componentes / utilitários monetários

| Item | Arquivo | Descrição |
|------|---------|-----------|
| **Parser BRL** | `lib/format/currency-input.ts` | `parseBrazilianCurrencyInput()` — aceita `1.234,56`, `R$ 80,00` |
| **Formatter BRL** | `lib/format/currency-input.ts` | `formatBrazilianCurrencyInput()` — `toLocaleString("pt-BR")` |
| **Display BRL** | `lib/format/currency.ts` | `formatCurrency()`, `formatSignedCurrency()` via `Intl.NumberFormat` |
| **Input de valor** | `components/transactions/transaction-form.tsx` | `Input` genérico com `inputMode="decimal"`, placeholder `0,00` |
| **Input valor parcela** | idem | `installmentAmountInput` |
| **Célula de valor** | `components/ui/transaction-data.tsx` | `CurrencyCell` |
| **Dashboard** | `dashboard-view.tsx`, `dashboard-panels.tsx` | `formatCurrency` / `formatSignedCurrency` |
| **Validação** | `lib/transactions/form.ts` | Usa `parseBrazilianCurrencyInput` na validação e build do payload |

**Não existe:** componente dedicado `CurrencyInput` — é o `Input` padrão + lógica em `lib/format/currency-input.ts`.

---

## 12. Inputs numéricos / quantidade

| Campo | Arquivo | `inputMode` | Propósito |
|-------|---------|-------------|-----------|
| `installmentCount` | `transaction-form.tsx` | `numeric` | Número de parcelas |
| `intervalCount` | `transaction-form.tsx` | `numeric` | Intervalo da recorrência |
| `fileSize` | `transaction-attachments.tsx` | `numeric` | Tamanho do arquivo em bytes |
| `amountInput` | `transaction-form.tsx` | `decimal` | Valor monetário (tratado como moeda, não inteiro) |
| `installmentAmountInput` | `transaction-form.tsx` | `decimal` | Valor da parcela |

**Validação numérica** em `lib/transactions/form.ts`:
- Parcelas: parse de `installmentCount`
- Intervalo: parse de `intervalCount`
- Anexos: `Number(fileSize)` com checagem `Number.isFinite`

**Não existe:** componente `NumberInput` ou `QuantityInput` reutilizável.

---

## Resumo executivo

O frontend é um app **Next.js 16 + React 19** com **design system próprio** em Tailwind CSS 4, sem biblioteca de componentes externa no código. A estrutura é `app/` + `components/` + `lib/` na raiz (sem `src/`). Há 8 rotas de página, layout com **header + nav horizontal** (sem sidebar), estado assíncrono via **React Query** e sessão via **React Context**. Formulários são **nativos com validação manual**. Tags usam input de texto simples; moeda usa `Input` + utilitários BRL; quantidades usam `inputMode="numeric"`/`decimal` sem componentes especializados.