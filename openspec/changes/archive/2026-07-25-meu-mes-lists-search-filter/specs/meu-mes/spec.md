## MODIFIED Requirements

### Requirement: Meu mês lista Pendentes e Liquidados separadamente
O frontend SHALL renderizar duas listas distintas, excluindo `CANCELADA` de ambas. Cada lista SHALL ter altura máxima fixa; quando o conteúdo exceder essa altura, a lista SHALL exibir scroll vertical interno independente da outra lista e da rolagem da página. O título da seção (“Pendentes”/“Liquidados”) SHALL permanecer fora da área rolável. No desktop, o cabeçalho da tabela SHALL permanecer fixo (sticky) durante o scroll interno. Quando o conteúdo de uma lista for menor que a altura máxima, nenhuma barra de scroll SHALL aparecer. Cada seção SHALL oferecer campo de pesquisa e filtro por tipo de transação (Todos / Receita / Despesa), aplicados localmente de forma independente entre Pendentes e Liquidados.

#### Scenario: Conteúdo de Pendentes
- **WHEN** o extract contém transações não liquidadas e não canceladas
- **THEN** elas aparecem na lista Pendentes
- **AND** a ordenação SHALL ser: status `ATRASADA` primeiro, depois `VENCE_HOJE`, depois demais a vencer
- **AND** dentro do mesmo grupo a ordenação SHALL ser por data de vencimento ascendente (fallback data da transação)

#### Scenario: Conteúdo de Liquidados
- **WHEN** o extract contém transações com status `PAGO` ou `PAGO_COM_ATRASO`
- **THEN** elas aparecem na lista Liquidados
- **AND** a ordenação SHALL ser da mais recente para a mais antiga (por `paymentDate`, com fallback adequado)

#### Scenario: Canceladas omitidas
- **WHEN** o extract inclui transações `CANCELADA`
- **THEN** elas NÃO aparecem em Pendentes nem em Liquidados

#### Scenario: Empty states
- **WHEN** não há itens em Pendentes ou em Liquidados
- **THEN** cada lista vazia exibe empty state apropriado
- **WHEN** o mês inteiro não tem movimentações ativas
- **THEN** a tela explica que não há movimentações no mês

#### Scenario: Lista excede a altura máxima
- **WHEN** a quantidade de itens de Pendentes (ou de Liquidados) faz o conteúdo exceder a altura máxima da seção
- **THEN** a seção exibe scroll vertical interno para aquela lista
- **AND** o título da seção permanece visível fora da área rolável
- **AND** a outra lista mantém sua própria altura e scroll, sem ser afetada

#### Scenario: Lista cabe sem scroll
- **WHEN** a quantidade de itens de uma lista não excede a altura máxima da seção
- **THEN** a seção exibe todos os itens sem barra de scroll

#### Scenario: Cabeçalho da tabela fixo durante o scroll (desktop)
- **WHEN** o usuário rola o conteúdo de Pendentes ou Liquidados no desktop
- **THEN** o cabeçalho de colunas da tabela permanece visível (sticky) durante o scroll

#### Scenario: Filtragem por texto em Pendentes ou Liquidados
- **WHEN** o usuário digita texto no campo de pesquisa de uma seção
- **THEN** a lista exibe apenas transações cuja descrição ou alguma tag contém o texto (ignorando maiúsculas/minúsculas)

#### Scenario: Filtro por tipo de transação
- **WHEN** o usuário seleciona Receita ou Despesa no filtro de tipo de uma seção
- **THEN** a lista exibe apenas transações daquele tipo
- **WHEN** o usuário seleciona Todos
- **THEN** a lista exibe receitas e despesas (respeitando apenas a pesquisa por texto, se houver)

#### Scenario: Busca ou filtro sem resultados
- **WHEN** a seção possui transações mas a combinação de pesquisa e filtro não retorna itens
- **THEN** o frontend exibe estado vazio indicando que nenhum item corresponde à busca ou filtro

#### Scenario: Limpar pesquisa ou filtro
- **WHEN** o usuário limpa o campo de pesquisa ou restaura o filtro de tipo para Todos
- **THEN** a lista volta a exibir todos os itens elegíveis da seção (respeitando os demais critérios ainda ativos)
