## ADDED Requirements

### Requirement: Usuário agrupa Pendentes ou Liquidados por uma tag selecionada
O frontend SHALL oferecer, em cada seção (Pendentes e Liquidados) de Meu mês, um seletor independente "Agrupar por" listando apenas as tags presentes nas transações daquela seção. Por padrão nenhuma tag SHALL estar selecionada e a seção SHALL se comportar como hoje (sem agrupamento). Ao selecionar uma tag, as transações da seção que possuem essa tag SHALL ser reunidas em um grupo fixo no topo da lista, exibindo o total líquido (soma de RECEITA menos soma de DESPESA das transações do grupo) e a quantidade de itens do grupo. As transações que não possuem a tag selecionada SHALL permanecer fora do grupo, mantendo a mesma ordenação relativa que teriam sem agrupamento (urgência em Pendentes; mais recente primeiro em Liquidados). "Sem tag" NÃO SHALL ser oferecida como opção de agrupamento.

#### Scenario: Seletor lista apenas tags da própria seção
- **WHEN** o usuário abre o seletor "Agrupar por" de Pendentes
- **THEN** as opções SHALL ser apenas as tags presentes em transações pendentes daquele mês
- **AND** o seletor de Liquidados SHALL oferecer apenas as tags presentes em transações liquidadas, de forma independente

#### Scenario: Nenhuma tag selecionada por padrão
- **WHEN** o usuário abre Meu mês ou troca de mês
- **THEN** nenhum agrupamento SHALL estar ativo em Pendentes nem em Liquidados
- **AND** as listas SHALL exibir todas as transações normalmente, sem grupo

#### Scenario: Selecionar uma tag agrupa as transações correspondentes
- **WHEN** o usuário seleciona uma tag no seletor "Agrupar por" de uma seção
- **THEN** as transações dessa seção que possuem a tag selecionada SHALL aparecer reunidas em um grupo fixo no topo da lista
- **AND** o grupo SHALL exibir o total líquido (receitas menos despesas do grupo) e a quantidade de transações agrupadas

#### Scenario: Transações sem a tag continuam soltas e ordenadas
- **WHEN** há uma tag selecionada em uma seção
- **THEN** as transações que não possuem essa tag SHALL continuar listadas abaixo do grupo
- **AND** a ordenação entre elas SHALL seguir a mesma regra já vigente da seção (urgência em Pendentes; mais recente primeiro em Liquidados), sem influência da criação do grupo

#### Scenario: "Sem tag" não é opção de agrupamento
- **WHEN** o usuário abre o seletor "Agrupar por" de qualquer seção
- **THEN** a lista de opções NÃO SHALL incluir uma entrada "Sem tag" ou equivalente

#### Scenario: Seletor reseta ao trocar de mês
- **WHEN** o usuário troca o mês civil em Meu mês com uma tag de agrupamento selecionada em alguma seção
- **THEN** o frontend SHALL limpar a seleção do seletor "Agrupar por" daquela seção, retornando ao estado sem agrupamento

### Requirement: Seleção em lote respeita o agrupamento por tag no desktop
Quando uma seção estiver agrupada por tag no desktop, marcar o checkbox da linha de grupo SHALL selecionar todas as transações elegíveis do grupo para ações em lote; desmarcar SHALL removê-las da seleção. Transações do grupo bloqueadas pelo gate de edição de mês passado NÃO SHALL ser incluídas na seleção acionada pelo checkbox do grupo.

#### Scenario: Marcar o grupo seleciona suas transações
- **WHEN** o usuário marca o checkbox da linha de grupo em uma seção agrupada por tag
- **THEN** todas as transações elegíveis do grupo SHALL entrar em `selectedRowKeys`
- **AND** a barra de ações em lote SHALL refletir a quantidade selecionada

#### Scenario: Desmarcar o grupo remove suas transações da seleção
- **WHEN** o usuário desmarca o checkbox da linha de grupo, com transações do grupo previamente selecionadas
- **THEN** essas transações SHALL ser removidas de `selectedRowKeys`

#### Scenario: Transações bloqueadas não entram pela seleção do grupo
- **WHEN** o grupo contém transações bloqueadas pela preferência de bloqueio de mês passado
- **THEN** marcar o checkbox do grupo NÃO SHALL selecionar essas transações bloqueadas

### Requirement: Agrupamento por tag também funciona no mobile
Quando uma seção estiver agrupada por tag no mobile, o frontend SHALL exibir um bloco destacado no topo da lista de cards com o total líquido e a quantidade de itens do grupo, seguido pelos cards das transações do grupo, e SHALL manter os demais cards (sem a tag) abaixo, na ordenação normal da seção.

#### Scenario: Bloco de grupo destacado no topo do mobile
- **WHEN** o usuário seleciona uma tag para agrupar em uma seção, visualizando no mobile
- **THEN** o topo da lista de cards SHALL exibir um cabeçalho com o total líquido e a contagem de itens do grupo
- **AND** os cards das transações do grupo SHALL aparecer imediatamente após esse cabeçalho

#### Scenario: Cards fora do grupo mantêm a lista normal no mobile
- **WHEN** há um grupo ativo no mobile
- **THEN** os cards das transações sem a tag selecionada SHALL continuar exibidos após o bloco do grupo, na mesma ordenação que teriam sem agrupamento
