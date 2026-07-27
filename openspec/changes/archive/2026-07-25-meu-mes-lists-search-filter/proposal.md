## Why

As listas **Pendentes** e **Liquidados** em Meu mês podem acumular dezenas de transações no mês. Hoje só é possível agrupar por tag; não há como localizar rapidamente uma despesa ou receita específica por descrição ou restringir a visualização por tipo.

## What Changes

- Adicionar campo de pesquisa em cada seção (Pendentes e Liquidados), independentes entre si.
- Filtrar localmente por descrição e tags, ignorando maiúsculas/minúsculas.
- Adicionar filtro por tipo de transação (Todos / Receita / Despesa) em cada seção.
- Exibir estado vazio específico quando a busca ou o filtro não retornam resultados, mas a seção ainda tem itens.
- Cobrir filtragem e estados vazios com testes Vitest.

## Capabilities

### New Capabilities

_(nenhuma)_

### Modified Capabilities

- `meu-mes`: incluir pesquisa e filtro por tipo nas listas Pendentes e Liquidados.

## Impact

- `components/transactions/meu-mes-transaction-lists.tsx`
- `components/transactions/meu-mes-transaction-lists.test.tsx`
- `lib/transactions/filter.ts` (helper de filtragem reutilizável)
