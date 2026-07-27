## Context

`MeuMesTransactionLists` renderiza duas listas independentes (Pendentes e Liquidados), cada uma como `antd Table` no desktop (com `rowSelection`, scroll interno de altura fixa e cabeçalho sticky) e como `antd List` de cards no mobile. As transações têm `tags?: string[]` livres (sem entidade própria), e já existe uma convenção de agregação por tag no hero (`calculateTagShares`) e no `TagSharePieChart` (`calculateDistributionShares`), que soma o valor bruto da transação em cada tag que ela possui (duplicando quando há múltiplas tags).

A pedido do usuário, o agrupamento nas listas de Meu mês é deliberadamente mais simples que essa convenção: o usuário escolhe **uma única tag** por seção (Pendentes e Liquidados têm seletores independentes), e a tabela fixa em um grupo no topo apenas as transações que possuem essa tag, com total líquido e contagem. As demais permanecem soltas, na ordenação já vigente da seção. Isso evita o problema de "uma transação aparecer em N grupos" simplesmente não criando N grupos — só o grupo escolhido existe.

## Goals / Non-Goals

**Goals:**
- Permitir agrupar, por seção, as transações que têm uma tag escolhida pelo usuário, mostrando total líquido (receita − despesa) e contagem do grupo.
- Manter a ordenação já especificada (urgência em Pendentes; mais recente primeiro em Liquidados) tanto para as transações do grupo entre si quanto para as que ficam fora dele.
- Reaproveitar `rowSelection`/seleção em lote já existentes: marcar o checkbox do grupo seleciona/desmarca todas as suas transações.
- Cobrir desktop (`Table`) e mobile (`List`) com a mesma semântica.

**Non-Goals:**
- Não é uma tabela dinâmica multi-dimensional (sem cruzar tags × status, sem múltiplos níveis de agrupamento simultâneos).
- Não altera a convenção de agregação por tag já usada no hero/pizza (`calculateDistributionShares`), que continua duplicando valores entre tags — o novo agrupamento é uma feature paralela e mais restrita.
- Não introduz "Sem tag" como opção de agrupamento (decisão explícita do usuário).
- Não persiste a tag escolhida entre meses/sessões.

## Decisions

### 1. Seleção de tag única por seção, não multi-tag automático
Optou-se por um seletor (`Select` do antd) por seção, populado apenas com as tags presentes nas transações **daquela seção específica** (Pendentes só oferece tags de transações pendentes; Liquidados só as de liquidadas). Isso evita o dilema de transação com múltiplas tags: como só existe um grupo (o da tag escolhida), a transação simplesmente "tem" ou "não tem" a tag — sem duplicação, sem ambiguidade.

Alternativa descartada: agrupamento automático de todas as tags distintas de uma vez (como no hero). Rejeitado porque exigiria decidir como tratar transações multi-tag dentro da própria tabela (duplicar linha, escolher tag primária, etc.), o que o usuário explicitamente não quis.

### 2. Grupo como linha/bloco fixo no topo, resto mantém ordem original
O grupo aparece sempre no topo da lista (não "no lugar" da primeira ocorrência cronológica), funcionando como um resumo destacado. As transações fora do grupo mantêm a mesma sequência relativa que teriam sem agrupamento nenhum (a função de partição `groupTransactionsByTag` não deve reordenar o restante, só extrair as que combinam com a tag).

Alternativa descartada: inserir o cabeçalho de grupo "no lugar" da primeira transação com aquela tag. Rejeitado por ser mais complexo de implementar e de entender visualmente (a posição do grupo mudaria dependendo da tag escolhida).

### 3. Implementação desktop via tree data nativo do `antd Table`
No desktop, o `dataSource` passado à `Table` passa a ser: `[grupoSintético, ...transaçõesForaDoGrupo]` quando há tag selecionada (ou a lista normal, sem alterações, quando não há). O nó de grupo usa `children` com as transações que combinam, e a coluna de seleção usa o comportamento padrão do antd (`rowSelection` com `checkStrictly: false`) para propagar o check do pai para os filhos automaticamente — sem lógica extra de cascata.

Alternativa descartada: renderizar duas `Table`s separadas (uma só do grupo, outra do resto). Rejeitado porque duplicaria cabeçalho/scroll/sticky e complicaria a seleção unificada (`selectedRowKeys` já é compartilhado entre Pendentes/Liquidados no componente pai).

### 4. Implementação mobile via bloco de cards destacado
No mobile (`List`), o grupo é renderizado como um card de cabeçalho (total/contagem) seguido dos cards das transações do grupo, com um separador visual, e o restante dos cards segue depois, sem alterações. Cada card individual continua com seu próprio checkbox de seleção (sem "select all" nativo, que não existe em `List`); o card de cabeçalho do grupo ganha seu próprio checkbox que, ao ser marcado, marca/desmarca as chaves das transações do grupo via `onSelectedRowKeysChange`.

### 5. Total do grupo = saldo líquido (receita − despesa)
Consistente com o "Previsto" do hero. Como o grupo mistura tipos possivelmente, o valor pode ser negativo; a UI deve colorir conforme sinal (mesmo padrão de `plannedColor` já usado no hero).

### 6. Utilitário de partição isolado em `lib/transactions/totals.ts`
Nova função pura, por exemplo `partitionByTag(transactions, tag): { group: TransactionResponse[]; rest: TransactionResponse[]; total: number; count: number }`, testável isoladamente e reaproveitável entre desktop e mobile. Também uma função para extrair as tags distintas disponíveis em uma lista (`listDistinctTags(transactions): string[]`), usada para popular cada seletor.

## Risks / Trade-offs

- **[Risco]** Usuário pode estranhar que a mesma transação "desapareça" da posição cronológica de origem quando entra no grupo → **Mitigação**: o grupo é visualmente destacado (borda/fundo diferenciado) e mostra claramente que é um resumo, não uma reordenação da lista.
- **[Risco]** Seletor com muitas tags distintas pode ficar longo → **Mitigação**: usar `Select` com busca (`showSearch`) do antd, já disponível sem custo extra.
- **[Trade-off]** Ao não reaproveitar `calculateDistributionShares`, criamos uma segunda função de agregação por tag com semântica diferente (sem duplicação) → aceito conscientemente, pois representam necessidades de produto diferentes (resumo textual no hero vs. agrupamento operacional na tabela); nomear claramente para evitar confusão futura.
- **[Risco]** Em `checkStrictly: false`, marcar o grupo também seleciona transações eventualmente bloqueadas pelo gate de mês passado → **Mitigação**: manter `getCheckboxProps` retornando `disabled: true` para essas linhas, que o antd já respeita ao propagar seleção do pai (linhas desabilitadas não entram na seleção do grupo).

## Migration Plan

Mudança aditiva e reversível, sem alteração de API/backend. Pode ser lançada diretamente; rollback é reverter o componente (sem dados migrados a desfazer).

## Open Questions

- Nenhuma pendente após a fase de exploração — decisões acima refletem as escolhas confirmadas com o usuário.
