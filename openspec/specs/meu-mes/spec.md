# meu-mes

## Purpose

Workspace operacional do mês no frontend: seleção tipográfica de mês, hero dual Previsto/Realizado, CRUD de transações em Drawer, listas Pendentes/Liquidados, Quitar/Receber/desfazer e animação de liquidação.

## Requirements

### Requirement: Usuário acessa Meu mês pela rota dedicada
O frontend SHALL expor a tela operacional do mês em `/meu-mes` com título e navegação “Meu mês”, e SHALL redirecionar `/extract` para `/meu-mes`.

#### Scenario: Abrir Meu mês
- **WHEN** um usuário autenticado navega para `/meu-mes`
- **THEN** o frontend exibe a tela Meu mês
- **AND** o item de navegação correspondente aparece como “Meu mês” e aponta para `/meu-mes`

#### Scenario: Redirect da rota legada
- **WHEN** um usuário autenticado navega para `/extract` (com ou sem query string)
- **THEN** o frontend redireciona para `/meu-mes` preservando `from`/`to` quando presentes e válidos

### Requirement: Meu mês seleciona apenas o mês civil
Nesta tela o frontend SHALL permitir escolher somente um mês civil (seletor tipográfico e/ou navegação ◀ ▶), SHALL NÃO exibir modo customizado nem botão Filtrar, e SHALL aplicar o intervalo do mês imediatamente ao alterar a seleção, sincronizando `?from=&to=` e buscando `GET /api/transactions/extract` com `X-From-Date` e `X-To-Date`.

#### Scenario: Default mês atual
- **WHEN** o usuário abre `/meu-mes` sem `from`/`to` válidos
- **THEN** o frontend aplica o mês civil atual
- **AND** solicita o extract desse intervalo
- **AND** atualiza a URL com `from` e `to` do mês

#### Scenario: Troca de mês aplica imediatamente
- **WHEN** o usuário seleciona outro mês no seletor ou via ◀ ▶
- **THEN** o frontend aplica início e fim desse mês sem exigir Filtrar
- **AND** atualiza a URL e refetch do extract

#### Scenario: Sem UI de período customizado
- **WHEN** o usuário está em Meu mês
- **THEN** o frontend NÃO exibe Switch/Segmented de modo customizado
- **AND** NÃO exibe RangePicker nem botão Filtrar

### Requirement: Seletor de mês tem destaque tipográfico
O frontend SHALL apresentar o nome do mês selecionado como elemento tipográfico principal do hero (clicável para escolher o mês) com navegação ◀ ▶, sem depender de um DatePicker compacto como único sinal visual do mês.

#### Scenario: Mês legível e selecionável
- **WHEN** o usuário está em Meu mês
- **THEN** o nome do mês (ex.: “julho 2026”) aparece com tipografia de destaque
- **AND** o usuário pode mudar o mês pelas setas ou acionando o nome/seletor

### Requirement: Meu mês exibe hero dual de saldo
O frontend SHALL exibir no topo de Meu mês o saldo **Previsto** como figura principal e o saldo **Realizado** como figura secundária, ambos formatados como moeda, excluindo transações `CANCELADA` dos cálculos.

#### Scenario: Cálculo do Previsto
- **WHEN** o extract do mês está carregado
- **THEN** Previsto = soma de RECEITA − soma de DESPESA de todas as transações não canceladas do mês

#### Scenario: Cálculo do Realizado
- **WHEN** o extract do mês está carregado
- **THEN** Realizado = soma de RECEITA − soma de DESPESA apenas das transações com status `PAGO` ou `PAGO_COM_ATRASO`

#### Scenario: Progresso de liquidação
- **WHEN** há transações ativas (não canceladas) no mês
- **THEN** o hero exibe progresso com quantidade liquidada sobre total ativo (ex.: “8 de 12 liquidados”)
- **AND** pode exibir valores ainda a pagar e ainda a receber pendentes

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

### Requirement: Hero oferece criação de transação em Drawer
O frontend SHALL exibir no hero de Meu mês um botão “Nova transação” que abre um `antd Drawer` contendo o formulário de cadastro (`TransactionForm`). O hero SHALL também oferecer a ação “Importar fatura” para iniciar o fluxo de criação em lote a partir de PDF (capability `invoice-import`). Ao salvar com sucesso uma transação unitária, o Drawer SHALL fechar e o extract do mês SHALL ser atualizado.

#### Scenario: Abrir cadastro pelo hero
- **WHEN** o usuário aciona “Nova transação” no hero
- **THEN** o frontend abre um Drawer com o formulário de nova transação
- **AND** NÃO navega para `/transactions/new`

#### Scenario: Cadastro bem-sucedido
- **WHEN** o usuário submete um formulário válido no Drawer de criação
- **THEN** o frontend envia `POST /api/transactions`
- **AND** fecha o Drawer
- **AND** atualiza as listas e o hero do mês

#### Scenario: Abrir importação de fatura pelo hero
- **WHEN** o usuário aciona “Importar fatura” no hero
- **THEN** o frontend abre o fluxo de importação em lote
- **AND** NÃO abre o formulário unitário de nova transação

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

### Requirement: Usuário quita despesas e recebe receitas a partir de Pendentes
O frontend SHALL permitir liquidar itens pendentes com confirmação explícita (`antd Modal`), chamando `PUT /api/transactions/{id}` com `paymentDate` no dia corrente e demais campos preservados. A ação e o copy SHALL ser **Quitar** para `DESPESA` e **Receber** para `RECEITA`.

#### Scenario: Ação Quitar em despesa pendente
- **WHEN** uma despesa pendente é exibida em Pendentes
- **THEN** a linha oferece ação acessível “Quitar”

#### Scenario: Ação Receber em receita pendente
- **WHEN** uma receita pendente é exibida em Pendentes
- **THEN** a linha oferece ação acessível “Receber”

#### Scenario: Confirmação obrigatória
- **WHEN** o usuário aciona Quitar ou Receber
- **THEN** o frontend exibe modal de confirmação antes de enviar o PUT
- **AND** ao cancelar o modal NÃO envia a requisição

#### Scenario: Liquidação bem-sucedida
- **WHEN** o usuário confirma e a API aceita
- **THEN** o item deixa de constar em Pendentes e passa a constar em Liquidados
- **AND** o hero dual e o progresso são atualizados

#### Scenario: Falha na liquidação
- **WHEN** a API rejeita após confirmação
- **THEN** o frontend exibe erro
- **AND** o item permanece em Pendentes

### Requirement: Usuário edita transação a partir de Meu mês
O frontend SHALL permitir editar uma transação nas listas Pendentes e Liquidados via botão explícito com ícone e via clique na descrição, ambos abrindo o mesmo Drawer em modo edição (quando o gate de mês passado permitir). Para transações de grupo `PARCELAMENTO`, o Drawer SHALL carregar e exibir a lista das parcelas do grupo e persistir alterações estruturais via endpoints de grupo. Para demais transações, o Drawer SHALL persistir via `PUT /api/transactions/{id}`.

#### Scenario: Editar pelo botão
- **WHEN** o usuário aciona o botão Editar em uma linha liberada que não é parcelamento
- **THEN** o frontend abre o Drawer com o formulário preenchido
- **AND** ao salvar envia `PUT /api/transactions/{id}` e atualiza a visão

#### Scenario: Editar parcela pelo botão
- **WHEN** o usuário aciona o botão Editar em uma linha liberada de grupo `PARCELAMENTO`
- **THEN** o frontend abre o Drawer de edição do parcelamento com a lista das parcelas do grupo
- **AND** ao salvar (após confirmação de impacto quando cabível) envia `PUT /api/transactions/groups/{groupId}/installments` e atualiza a visão

#### Scenario: Editar pelo clique na descrição
- **WHEN** o usuário clica na descrição de uma transação liberada
- **THEN** o frontend abre o mesmo Drawer de edição apropriado ao tipo (ocorrência ou grupo parcelado)

#### Scenario: Edição bloqueada em mês passado
- **WHEN** a preferência “Bloquear edição e exclusão de meses passados” está `true` e a transação é de mês passado
- **THEN** o botão Editar fica indisponível
- **AND** o clique na descrição NÃO abre o Drawer de edição

### Requirement: Usuário desfaz quitação ou recebimento
O frontend SHALL permitir, em Liquidados (e qualquer linha com status pago), cancelar a quitação/recebimento com confirmação explícita, enviando `PUT /api/transactions/{id}` com os campos preservados e `paymentDate` nulo, e atualizando Pendentes/Liquidados e o hero.

#### Scenario: Desfazer quitação de despesa
- **WHEN** o usuário confirma “Cancelar quitação” (ou copy equivalente) em uma despesa paga
- **THEN** o frontend envia `PUT` sem data de pagamento
- **AND** o item deixa Liquidados e volta a Pendentes quando aplicável

#### Scenario: Desfazer recebimento de receita
- **WHEN** o usuário confirma desfazer recebimento em uma receita paga
- **THEN** o frontend envia `PUT` sem data de pagamento
- **AND** atualiza as listas e o hero

#### Scenario: Cancelar o modal não altera
- **WHEN** o usuário fecha o modal de confirmação sem confirmar
- **THEN** o frontend NÃO envia a requisição

### Requirement: Usuário exclui transação a partir de Meu mês
O frontend SHALL oferecer exclusão com confirmação em Pendentes e Liquidados. Para recorrência (`group.type === RECORRENCIA`), o confirm SHALL oferecer excluir só a ocorrência ou a ocorrência e todas as futuras. Exclusão em mês passado SHALL respeitar o gate de preferências.

#### Scenario: Excluir ocorrência avulsa
- **WHEN** o usuário confirma exclusão de uma transação sem grupo de recorrência
- **THEN** o frontend chama `DELETE /api/transactions/{id}`
- **AND** remove o item da visão após sucesso

#### Scenario: Excluir só esta ocorrência recorrente
- **WHEN** a transação é recorrente e o usuário escolhe excluir somente esta
- **THEN** o frontend chama `DELETE /api/transactions/{id}`
- **AND** as demais ocorrências da série permanecem

#### Scenario: Excluir esta e futuras
- **WHEN** a transação é recorrente e o usuário escolhe excluir esta e todas as futuras
- **THEN** o frontend chama o endpoint de exclusão a partir da ocorrência (contrato backend)
- **AND** remove da visão a ocorrência alvo e as futuras afetadas após sucesso

#### Scenario: Exclusão bloqueada em mês passado
- **WHEN** a preferência de bloqueio está `true` e a transação é de mês passado
- **THEN** a ação Excluir fica indisponível

### Requirement: Anexar comprovante permanece disponível nas listas de Meu mês
O frontend SHALL manter a ação de anexar comprovante nas linhas de Meu mês, reutilizando o fluxo modal existente de metadados de anexo.

#### Scenario: Anexar a partir de Pendentes ou Liquidados
- **WHEN** o usuário aciona anexar comprovante em uma linha
- **THEN** o modal de metadados de anexo é aberto para aquela transação

### Requirement: Animação ao confirmar liquidação
Após liquidação bem-sucedida, o frontend SHALL executar uma animação CSS curta (na ordem de 300–450ms): feedback visual na linha pendente, atualização do hero, entrada do item em Liquidados. Quando `prefers-reduced-motion: reduce` estiver ativo, o frontend SHALL omitir a animação e apenas atualizar os dados.

#### Scenario: Motion completo
- **WHEN** a liquidação sucede e reduced-motion NÃO está ativo
- **THEN** a linha pendente exibe feedback e sai com transição
- **AND** o hero (Realizado/progresso) atualiza com ênfase visual breve
- **AND** o item aparece em Liquidados com transição de entrada

#### Scenario: Reduced motion
- **WHEN** a liquidação sucede e `prefers-reduced-motion: reduce` está ativo
- **THEN** as listas e o hero atualizam sem animação de slide/fade elaborada

### Requirement: Usuário seleciona múltiplas transações em Meu mês
O frontend SHALL permitir seleção múltipla nas listas Pendentes e Liquidados de Meu mês via `rowSelection` do `antd Table`. A seleção SHALL ser limpa ao trocar de mês, após mutação em lote bem-sucedida (mesmo parcial) e quando o usuário desmarcar todos.

#### Scenario: Selecionar linhas em Pendentes
- **WHEN** o usuário marca uma ou mais linhas na lista Pendentes
- **THEN** o frontend mantém as chaves selecionadas
- **AND** exibe a barra de ações em lote com a quantidade selecionada

#### Scenario: Selecionar linhas em Liquidados
- **WHEN** o usuário marca uma ou mais linhas na lista Liquidados
- **THEN** o frontend mantém as chaves selecionadas
- **AND** exibe a barra de ações em lote

#### Scenario: Troca de mês limpa seleção
- **WHEN** o usuário troca o mês civil em Meu mês com itens selecionados
- **THEN** o frontend limpa a seleção
- **AND** oculta a barra de ações em lote

### Requirement: Usuário liquida transações em lote a partir de Pendentes
O frontend SHALL permitir liquidar as transações pendentes selecionadas em uma única operação, com confirmação explícita (`antd Modal`), enviando `POST /api/transactions/batch/settle` com os ids elegíveis e `paymentDate` no dia corrente. Itens já liquidados, cancelados ou bloqueados pelo gate de mês passado SHALL NÃO ser incluídos no request. O copy do botão SHALL ser “Quitar selecionadas” se só houver despesas, “Receber selecionadas” se só houver receitas, ou “Liquidar selecionadas” se a seleção for mista.

#### Scenario: Ação de liquidação em lote aparece
- **WHEN** há ao menos uma transação pendente elegível selecionada
- **THEN** a barra de ações oferece a ação de liquidação em lote com o copy adequado ao tipo da seleção

#### Scenario: Confirmação obrigatória no lote
- **WHEN** o usuário aciona a liquidação em lote
- **THEN** o frontend exibe modal de confirmação informando a quantidade de itens
- **AND** ao cancelar o modal NÃO envia o request

#### Scenario: Liquidação em lote bem-sucedida
- **WHEN** o usuário confirma e a API retorna sucessos
- **THEN** o frontend atualiza o extract do mês (listas e hero)
- **AND** limpa a seleção
- **AND** informa quantos itens foram liquidados

#### Scenario: Liquidação em lote parcial
- **WHEN** a API retorna sucessos e falhas no mesmo lote
- **THEN** o frontend atualiza a visão com base nos sucessos
- **AND** exibe as falhas de forma compreensível
- **AND** limpa a seleção

#### Scenario: Nenhum item elegível para liquidar
- **WHEN** a seleção não contém pendentes elegíveis (ex.: só liquidados ou bloqueados)
- **THEN** o frontend NÃO oferece a ação de liquidação em lote ou a desabilita com motivo claro

### Requirement: Usuário exclui transações em lote em Meu mês
O frontend SHALL permitir excluir as transações selecionadas em Pendentes ou Liquidados em uma única operação, com confirmação explícita, enviando `POST /api/transactions/batch/delete`. Para cada item, o escopo SHALL ser: `INSTALLMENT_GROUP` quando `group.type === PARCELAMENTO`; `SINGLE` para avulsas e para ocorrências de `RECORRENCIA`. Itens bloqueados pelo gate de mês passado SHALL NÃO ser incluídos. Quando a seleção incluir parcelamento, o modal SHALL avisar que a exclusão remove o grupo inteiro de parcelas.

#### Scenario: Exclusão em lote de avulsas
- **WHEN** o usuário confirma exclusão em lote de transações sem grupo de parcelamento
- **THEN** o frontend envia `POST /api/transactions/batch/delete` com escopo `SINGLE` para cada id
- **AND** atualiza a visão após a resposta
- **AND** limpa a seleção

#### Scenario: Exclusão em lote com parcelamento
- **WHEN** a seleção inclui ao menos uma transação `PARCELAMENTO` e o usuário confirma após o aviso
- **THEN** o frontend envia escopo `INSTALLMENT_GROUP` para esses itens
- **AND** atualiza a visão removendo as parcelas afetadas presentes no mês

#### Scenario: Recorrência no lote usa só esta ocorrência
- **WHEN** a seleção inclui recorrência e o usuário confirma exclusão em lote
- **THEN** o frontend envia escopo `SINGLE` para essas ocorrências
- **AND** NÃO envia `RECURRENCE_FROM_HERE` no fluxo de lote

#### Scenario: Exclusão em lote bloqueada por mês passado
- **WHEN** a preferência de bloqueio está ativa e os selecionados são só de mês passado
- **THEN** a ação Excluir em lote fica indisponível ou nenhum id bloqueado é enviado

#### Scenario: Falha parcial na exclusão em lote
- **WHEN** a API retorna falhas para parte dos itens
- **THEN** o frontend reflete os sucessos na visão
- **AND** comunica as falhas ao usuário
