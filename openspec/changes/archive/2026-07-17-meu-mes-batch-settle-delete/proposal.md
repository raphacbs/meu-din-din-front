## Why

Na tela Meu mês, quitação e exclusão são apenas unitárias (uma linha por vez). Quem liquida ou limpa várias contas no mesmo mês precisa repetir o mesmo fluxo N vezes — confirmação, request e atualização — o que torna a operação lenta e propensa a erro.

## What Changes

- Adicionar seleção múltipla nas listas Pendentes e Liquidados de Meu mês (`rowSelection`).
- Expor barra de ações em lote: **Quitar/Receber selecionadas** (apenas itens elegíveis em Pendentes) e **Excluir selecionadas**.
- Consumir novos endpoints de batch do backend (`POST /api/transactions/batch/settle` e `POST /api/transactions/batch/delete`) em vez de N× `PUT`/`DELETE`.
- Manter confirmação explícita antes de mutações em lote; respeitar gate de mês passado e regras de escopo (avulsa, recorrência, parcelamento).
- Exibir feedback parcial (sucessos + falhas) quando o lote for best-effort.
- Ações unitárias por linha permanecem; o lote é complementar.

## Capabilities

### New Capabilities

- _(nenhuma)_ — a capacidade vive na tela Meu mês e no client de transações já existentes.

### Modified Capabilities

- `meu-mes`: multi-select nas listas; barra de ações em lote para liquidar e excluir; confirmação, feedback parcial e atualização do hero/listas após o lote.
- `transaction-management`: client API com métodos de settle/delete em lote e tipagem do relatório de resultado.

## Impact

- UI: `meu-mes-view`, `meu-mes-transaction-lists`, possível barra de bulk actions; reuso de padrões de `rowSelection` já usados em importação de fatura.
- API client: `lib/api/transactions.ts` — novos métodos batch; depende da change de backend `transactions-batch-settle-delete`.
- Preferências: gate “bloquear edição/exclusão de meses passados” aplica-se à seleção e às ações em lote.
- Specs: delta em `meu-mes` e `transaction-management`.
