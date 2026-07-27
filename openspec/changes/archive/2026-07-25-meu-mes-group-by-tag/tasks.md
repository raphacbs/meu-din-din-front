## 1. Utilitários de agrupamento

- [x] 1.1 Em `lib/transactions/totals.ts`, criar `listDistinctTags(transactions: TransactionResponse[]): string[]` retornando as tags distintas presentes na lista (ordenadas, sem "Sem tag")
- [x] 1.2 Criar `partitionByTag(transactions: TransactionResponse[], tag: string | null): { group: TransactionResponse[]; rest: TransactionResponse[]; total: number; count: number }`, onde `rest` preserva a ordem original de `transactions` e `total` é o saldo líquido (receita − despesa) do grupo
- [x] 1.3 Cobrir as duas funções com testes unitários: sem tag selecionada, tag sem correspondência, transações mistas de tipo, preservação de ordem em `rest`

## 2. Seletor "Agrupar por" por seção

- [x] 2.1 Adicionar estado local em `MeuMesTransactionLists` (ou no componente pai, se precisar sobreviver a re-render) para a tag de agrupamento de Pendentes e de Liquidados, independentes
- [x] 2.2 Renderizar um `Select` (com `showSearch`) por seção, populado via `listDistinctTags` da respectiva lista, com opção de limpar seleção
- [x] 2.3 Resetar ambos os estados de agrupamento ao trocar de mês (mesmo gatilho que já limpa `selectedRowKeys`)

## 3. Renderização agrupada no desktop (`Table`)

- [x] 3.1 Construir `dataSource` condicional: quando há tag selecionada, montar `[grupoSintético, ...rest]`, onde `grupoSintético` tem `children` = `group` e campos derivados (`isGroup`, `total`, `count`)
- [x] 3.2 Ajustar colunas para renderizar a linha de grupo de forma diferenciada (rótulo da tag, contagem, total líquido com cor conforme sinal) ocupando a linha inteira ou as colunas relevantes
- [x] 3.3 Configurar `expandable`/tree data do antd Table para a linha de grupo, com `defaultExpandAllRows` (ou equivalente) garantindo o grupo já expandido ao selecionar a tag
- [x] 3.4 Ajustar `rowSelection` para que marcar/desmarcar o checkbox do grupo propague para as transações filhas, respeitando `getCheckboxProps` (linhas bloqueadas por mês passado permanecem não selecionáveis mesmo dentro do grupo)
- [x] 3.5 Garantir que o `rowKey` da linha de grupo não colida com ids reais de transação (ex.: prefixo `group:<tag>`)

## 4. Renderização agrupada no mobile (`List`)

- [x] 4.1 Quando há tag selecionada, renderizar um card de cabeçalho de grupo (total líquido + contagem) no topo da `List`, seguido pelos cards das transações do grupo
- [x] 4.2 Renderizar os cards do restante (`rest`) após o bloco do grupo, mantendo estilo e ações atuais de cada card
- [x] 4.3 Adicionar checkbox no cabeçalho do grupo que marca/desmarca as chaves das transações do grupo via `onSelectedRowKeysChange`, respeitando transações bloqueadas por mês passado

## 5. Testes e verificação

- [x] 5.1 Atualizar/adicionar testes de `meu-mes-transaction-lists` (ou criar novo arquivo) cobrindo: seletor populado corretamente por seção, agrupamento exibe total/contagem, transações fora do grupo mantêm ordenação original, reset ao trocar de mês
- [x] 5.2 Testar seleção em lote com grupo ativo: marcar grupo seleciona elegíveis, desmarcar remove, bloqueadas por mês passado não entram
- [x] 5.3 Rodar a suíte de testes do frontend (`npm test` ou equivalente do projeto) e lint antes de finalizar
