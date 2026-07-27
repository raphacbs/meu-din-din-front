## Context

`MeuMesTransactionLists` já renderiza Pendentes e Liquidados com agrupamento opcional por tag (`Select` “Agrupar por”), scroll interno e seleção múltipla. Os dados vêm do extract do mês já carregado; não há busca server-side.

## Goals / Non-Goals

**Goals:**

- `Input.Search` com `allowClear` e label acessível em cada seção, acima da tabela/lista.
- Filtro por substring em descrição e em qualquer tag da transação, normalizado (case-insensitive).
- `Select` de tipo com opções Todos / Receita / Despesa, independente por seção.
- Mensagem distinta quando há itens na seção mas busca/filtro não retornam resultados.
- Agrupamento por tag continua funcionando sobre a lista **já filtrada**.

**Non-Goals:**

- Busca server-side ou paginação.
- Persistir termos de busca/filtro na URL.
- Filtros adicionais (status, valor, data).

## Decisions

1. **Filtro client-side** — reutiliza o extract já em memória; zero latência e sem mudança no backend.
2. **Helper `filterMeuMesTransactions`** em `lib/transactions/filter.ts` — lógica testável isolada; normalização de texto com `normalizeTagName` para tags e upper-case trim para descrição.
3. **Estado local por seção** — `pendingSearch`, `settledSearch`, `pendingTypeFilter`, `settledTypeFilter`; reset automático não é necessário na troca de mês (o componente remonta com novos dados e estado local zera naturalmente se o pai remontar; caso contrário, filtros obsoletos apenas retornam lista vazia até limpar).
4. **Ordem de aplicação** — filtrar primeiro (busca + tipo), depois agrupar por tag sobre o subconjunto filtrado.

## Risks / Trade-offs

- **[Risco]** Seleção múltipla pode incluir itens ocultos pelo filtro → **Mitigação**: `rowSelection` já opera sobre `sectionItems` filtrados; ids selecionados fora do filtro permanecem no estado global até desmarcados manualmente ou limpos pelo pai (comportamento existente na troca de mês/lote).
