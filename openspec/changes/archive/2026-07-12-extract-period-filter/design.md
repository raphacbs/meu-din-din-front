## Context

A tela `/extract` hoje usa apenas `RangePicker` + submit manual, sem valor padrão e sem fetch até o usuário filtrar. A API já filtra por headers `X-From-Date` / `X-To-Date`. O app mobile já possui `periodStore` (Zustand) com modos `month | custom`. No web ainda não há Zustand nem sync de período com a URL.

Este change introduz seleção de período compartilhada no front web, usada primeiro pelo extrato, sem alterar o backend.

## Goals / Non-Goals

**Goals:**

- Modos **Mês** (padrão) e **Customizado** na UI do extrato
- MonthPicker (antd) no modo mês; RangePicker no modo customizado
- Front calcula `from`/`to` do mês (`startOf` / `endOf` month, ISO `YYYY-MM-DD`)
- Botão **Filtrar** aplica o rascunho e dispara a busca
- Default: modo mês + mês atual; na primeira visita (sem query) o período padrão é aplicado para carregar o extrato
- Store compartilhado de período (reutilizável)
- Sync bidirecional com `?from=&to=`

**Non-Goals:**

- Alterar contrato da API ou defaults do backend (últimos 30 dias quando headers omitidos)
- Navegação por setas ◀ ▶ (fica só MonthPicker)
- Auto-fetch a cada mudança de picker (só no Filtrar / hidratação inicial ou via URL)
- Filtros de período no dashboard ou em Transações nesta change (store preparado, UI só no extrato)

## Decisions

### 1. Store compartilhado com Zustand

- **Escolha:** adicionar `zustand` e criar `lib/stores/period-store.ts` (ou equivalente), espelhando o modelo do mobile: `mode`, `year`/`month` (modo mês), `from`/`to`, ações `setMode`, `setMonth`, `setCustomRange`, `apply` / `getDateRange`.
- **Por quê:** store sem provider, fácil de reutilizar; paridade com o app; dependência leve.
- **Alternativas:** React Context (mais boilerplate, precisa Provider); estado só em `ExtractView` (não atende “store compartilhado”).

Separar **rascunho (draft)** da UI do **período aplicado (applied)** que alimenta a query e a URL:

```
┌─────────────┐   Filtrar    ┌─────────────┐     ┌──────────────┐
│ Draft UI    │ ───────────▶ │ Applied     │ ──▶ │ React Query  │
│ mode/month/ │              │ from / to   │     │ extract      │
│ range       │◀── hydrate ──│ + URL       │     └──────────────┘
└─────────────┘              └─────────────┘
```

### 2. MonthPicker do Ant Design

- **Escolha:** `DatePicker picker="month"` com locale pt-BR já configurado no app; label “Mês”.
- **Alternativa rejeitada:** setas ◀ ▶ como no mobile (decisão explícita a favor do MonthPicker).

Ao mudar o mês no draft: recalcular `from`/`to` do rascunho com dayjs (`startOf('month')` / `endOf('month')`).

### 3. Botão Filtrar permanece

- **Escolha:** alteração de MonthPicker/RangePicker/modo só atualiza o draft; **Filtrar** valida e aplica.
- **Exceção de UX:** na montagem de `/extract`:
  - Se `?from=&to=` válidos → hidratar store + applied e buscar
  - Senão → draft = mês atual, aplicar default (e escrever URL) para o extrato carregar sem clique extra na primeira visita
- Mudanças posteriores ao default exigem Filtrar de novo.

Validação no customizado: ambas as datas obrigatórias e `from <= to`.

### 4. Sync com `?from=&to=`

- **Escolha:** search params ISO `YYYY-MM-DD`; ao aplicar (Filtrar ou default), `router.replace` atualiza a query sem poluir o history stack.
- Inferência de modo ao hidratar: se `from`/`to` coincidem com início/fim do mesmo mês → `mode: 'month'`; caso contrário → `mode: 'custom'`.
- Params inválidos ou incompletos → fallback para mês atual.
- **Alternativa rejeitada:** `?month=2026-07` (usuário pediu explicitamente `from`/`to`).

### 5. Integração com extrato

- `ExtractView` lê applied do store + draft para os controles; `useQuery` com `enabled` quando applied tem `from` e `to`.
- Continua chamando `transactions.extract(from, to)` (headers existentes).
- UI: `Segmented` “Mês” | “Customizado” (padrão já usado no form de transação).

### 6. dayjs

- Usar dayjs (já transitivo via antd) para intervalo do mês e formatação; alinhar com o RangePicker atual.

## Risks / Trade-offs

- **[Nova dependência Zustand]** → Mitigação: dep pequena e alinhada ao mobile; alternativa Context se o time preferir zero deps novas (improvável).
- **[Default auto-aplicado vs. “sempre Filtrar”]** → Mitigação: auto-apply só na ausência de URL / primeira carga; depois Filtrar é obrigatório — documentado nas specs.
- **[Store global “sujo” entre telas]** → Mitigação: escopo inicial só extrato; applied/URL como fonte da verdade na entrada da rota; outras telas opt-in depois.
- **[Inferência mês vs custom pela URL]** → Mitigação: regra início/fim de mês documentada; edge cases (mês parcial) caem em custom — comportamento aceitável.
- **[Concorrência draft vs URL]** → Mitigação: hidratar uma vez na montagem; updates de URL só via apply.

## Migration Plan

1. Adicionar Zustand e store de período + helpers de intervalo/URL
2. Refatorar `ExtractView` + testes
3. Sem migração de dados; sem feature flag
4. Rollback: reverter UI/store; API inalterada

## Open Questions

- Nenhuma bloqueante. Opcional futuro: outras telas consumirem o mesmo store; setas de mês como atalho além do MonthPicker.
