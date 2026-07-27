## Why

Nas listas Pendentes e Liquidados de Meu mês, o usuário só consegue ver transações em ordem cronológica/de urgência. Para entender rapidamente quanto está pendente ou liquidado dentro de uma categoria específica (ex.: "Casa", "Cartão"), ele precisa somar manualmente. Uma agregação por tag, com total e contagem, reduz esse esforço e reaproveita a convenção de tags livres já usada no hero e no gráfico de distribuição.

## What Changes

- Cada seção (Pendentes e Liquidados) de Meu mês passa a ter um seletor independente "Agrupar por" com as tags presentes naquela seção (default: nenhuma tag selecionada, comportamento atual inalterado).
- Ao selecionar uma tag, as transações daquela seção que possuem essa tag são reunidas em um grupo fixo no topo da lista/tabela, exibindo o total líquido (receitas − despesas) e a contagem de itens do grupo.
- As demais transações (sem a tag selecionada) continuam listadas normalmente abaixo do grupo, mantendo a ordenação já especificada para Pendentes (urgência) e Liquidados (mais recente primeiro).
- No desktop, o grupo é uma linha expansível na `Table` existente; marcar o checkbox da linha de grupo seleciona/desmarca todas as transações do grupo de uma vez (aproveitando `rowSelection` já existente para ações em lote).
- No mobile, o grupo aparece como um bloco destacado no topo da lista de cards, com cabeçalho de total/contagem, seguido pelos cards das demais transações.
- O seletor de tag reseta para "nenhuma" ao trocar de mês, assim como a seleção múltipla já faz hoje.
- Apenas tags reais criadas pelo usuário aparecem no seletor; "Sem tag" não é uma opção de agrupamento.

## Capabilities

### New Capabilities

(nenhuma — a funcionalidade estende a capability existente `meu-mes`)

### Modified Capabilities

- `meu-mes`: adiciona a capacidade de agrupar Pendentes e/ou Liquidados por uma tag selecionada pelo usuário, com total e contagem por grupo, e ajusta a listagem para acomodar o grupo fixo no topo sem alterar a ordenação das demais transações.

## Impact

- `components/transactions/meu-mes-transaction-lists.tsx`: adiciona seletor de tag por seção, lógica de particionamento (grupo vs. resto), renderização de linha de grupo expansível na `Table` (desktop) e bloco destacado na `List` (mobile), e propagação de seleção em lote para as filhas do grupo.
- `lib/transactions/totals.ts` (ou novo módulo utilitário): nova função para extrair tags distintas de um conjunto de transações e calcular total líquido/contagem de um grupo por tag.
- Nenhuma mudança de API/backend — usa dados já presentes em `TransactionResponse.tags`.
- Sem impacto em `MeuMesHero`, `TagSharePieChart` ou outras capabilities.
