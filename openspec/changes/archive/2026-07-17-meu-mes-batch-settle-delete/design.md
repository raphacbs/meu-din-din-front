## Context

Meu mês já concentra CRUD operacional: listas Pendentes/Liquidados, quitação unitária via `PUT` com `paymentDate`, exclusão unitária com escopos de recorrência/parcelamento. Não há multi-select nem ações em lote. O backend change `transactions-batch-settle-delete` introduz `POST /api/transactions/batch/settle` e `POST /api/transactions/batch/delete` com relatório best-effort — o frontend deve consumir esses contratos, não N× calls unitários.

## Goals / Non-Goals

**Goals:**

- Permitir selecionar várias linhas em Pendentes e Liquidados e liquidar ou excluir em lote.
- Confirmação explícita, respeito ao gate de mês passado e às regras de escopo já usadas nas ações unitárias.
- Feedback claro de sucesso parcial (ids ok + falhas) e refresh do extract/hero após o lote.
- Client tipado para os novos endpoints.

**Non-Goals:**

- Desfazer quitação em lote (pode vir depois; o settle com `paymentDate` nulo fica disponível na API, mas a UI de Meu mês nesta change foca em liquidar pendentes).
- Edição em lote, cancelamento soft em lote, ou batch no mobile.
- Alterar o layout do hero ou a lógica de totais além do refresh pós-lote.
- Implementar os endpoints no backend (change separada).

## Decisions

### 1. Multi-select com `antd Table` `rowSelection`

- **Escolha:** habilitar `rowSelection` nas tabelas de Pendentes e Liquidados (padrão já usado no drawer de importação).
- **Alternativa:** checkboxes manuais fora da Table — mais trabalho e inconsistente com antd.
- **Rationale:** alinhado ao design system e ao precedente da importação.

### 2. Barra de bulk actions contextual

- **Escolha:** toolbar flutuante ou sticky acima das listas quando `selectedRowKeys.length > 0`, com ações:
  - Em Pendentes (itens não liquidados selecionados): “Quitar/Receber selecionadas”.
  - Em ambas: “Excluir selecionadas”.
- **Copy:** se a seleção for só despesas → “Quitar”; só receitas → “Receber”; mista → “Liquidar selecionadas”.
- **Alternativa:** menu no hero — menos descoberta quando a seleção está nas listas.
- **Rationale:** ação perto do contexto da seleção.

### 3. Elegibilidade e gate

- **Settle em lote:** apenas itens selecionados que estejam pendentes (não `PAGO`/`PAGO_COM_ATRASO`/`CANCELADA`) e não bloqueados pelo gate de mês passado.
- **Delete em lote:** itens selecionados não bloqueados pelo gate; para `PARCELAMENTO`, escopo padrão = `INSTALLMENT_GROUP` (igual à exclusão unitária — avisa que remove o grupo inteiro); para `RECORRENCIA`, no lote usa escopo `SINGLE` por padrão (só a ocorrência visível no mês), com aviso no modal; se o usuário precisar de “esta e futuras”, continua usando a ação unitária.
- **Alternativa:** no lote oferecer escolha de escopo por item — UX pesada demais para v1.
- **Rationale:** simplifica o lote; casos avançados de recorrência ficam na linha.

### 4. Confirmação única por operação

- Modal único listando quantidade e resumo (ex.: “Liquidar 5 itens com data de hoje?” / “Excluir 3 itens? Parcelamentos removem o grupo inteiro.”).
- Um request batch após confirmar.

### 5. Client API

- Em `lib/api/transactions.ts`:
  - `settleBatch({ ids, paymentDate?: string | null })`
  - `deleteBatch({ items: { id, scope }[] })`
- Tipar resposta `{ succeeded: ..., failures: { id|index, message }[] }` conforme contrato do backend.
- Após sucesso (mesmo parcial), `refetch` do extract e limpar seleção; toast/alert com contagem de ok/falha.

### 6. Dependência de backend

- Implementação do frontend assume endpoints da change `transactions-batch-settle-delete` disponíveis (ou mock/MSW em testes). Ordem recomendada: aplicar backend antes ou em paralelo com contrato congelado no design/spec.

## Risks / Trade-offs

- **[Risco]** Backend ainda não deployado → Mitigation: contratos documentados nas duas changes; front pode desenvolver contra tipos/fixtures.
- **[Risco]** Usuário seleciona parcela sem entender exclusão do grupo → Mitigation: modal de confirmação com aviso explícito quando houver `PARCELAMENTO` na seleção.
- **[Risco]** Seleção grande (dezenas/centenas) → Mitigation: limite UX razoável (ex. aviso acima de N) se o backend definir max; senão confiar no best-effort.
- **[Trade-off]** Lote de recorrência só “esta ocorrência” → casos “esta e futuras” ficam unitários; aceitável na v1.

## Migration Plan

1. Backend `transactions-batch-settle-delete` em ambiente disponível.
2. Ship client + UI de Meu mês.
3. Sem migração de dados; rollback = remover UI/client (endpoints unitários permanecem).

## Open Questions

- Incluir “desfazer liquidação” em lote nesta change? **Decisão atual: não** (só liquidar pendentes + excluir).
- Limite máximo de ids por request: alinhar com o que o backend documentar (sugestão 100).
