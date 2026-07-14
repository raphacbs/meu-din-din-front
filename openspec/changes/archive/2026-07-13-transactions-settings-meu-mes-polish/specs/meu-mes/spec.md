## ADDED Requirements

### Requirement: Hero exibe somatorio por tags
O frontend SHALL exibir, no hero de Meu mês imediatamente abaixo da barra de progresso de liquidados, uma lista compacta de totais por tag das transações ativas (não canceladas) do extract do mês. Cada tag SHALL aparecer com seu total monetário. Transações sem tags SHALL agregar no rótulo “Sem tag”. O frontend NÃO SHALL usar gráfico de pizza como representação padrão desse somatório no hero.

#### Scenario: Lista de totais por tag abaixo do progresso
- **WHEN** o extract do mês contém transações ativas com tags
- **THEN** o hero lista cada tag com o respectivo total abaixo da barra de liquidados

#### Scenario: Sem tag agrega transacoes sem tags
- **WHEN** o extract do mês contém transações ativas sem tags
- **THEN** o hero inclui a entrada “Sem tag” com o total correspondente

#### Scenario: Sem transacoes ativas omite ou esvazia a lista
- **WHEN** não há transações ativas no mês
- **THEN** o hero não exibe somatório por tags com valores enganosos (lista ausente ou vazia)
