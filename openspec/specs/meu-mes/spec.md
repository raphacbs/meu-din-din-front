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
O frontend SHALL exibir no hero de Meu mês um botão “Nova transação” que abre um `antd Drawer` contendo o formulário de cadastro (`TransactionForm`). Ao salvar com sucesso, o Drawer SHALL fechar e o extract do mês SHALL ser atualizado.

#### Scenario: Abrir cadastro pelo hero
- **WHEN** o usuário aciona “Nova transação” no hero
- **THEN** o frontend abre um Drawer com o formulário de nova transação
- **AND** NÃO navega para `/transactions/new`

#### Scenario: Cadastro bem-sucedido
- **WHEN** o usuário submete um formulário válido no Drawer de criação
- **THEN** o frontend envia `POST /api/transactions`
- **AND** fecha o Drawer
- **AND** atualiza as listas e o hero do mês

### Requirement: Meu mês lista Pendentes e Liquidados separadamente
O frontend SHALL renderizar duas listas distintas, excluindo `CANCELADA` de ambas.

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
O frontend SHALL permitir editar uma transação nas listas Pendentes e Liquidados via botão explícito com ícone e via clique na descrição, ambos abrindo o mesmo Drawer em modo edição (quando o gate de mês passado permitir).

#### Scenario: Editar pelo botão
- **WHEN** o usuário aciona o botão Editar em uma linha liberada
- **THEN** o frontend abre o Drawer com o formulário preenchido
- **AND** ao salvar envia `PUT /api/transactions/{id}` e atualiza a visão

#### Scenario: Editar pelo clique na descrição
- **WHEN** o usuário clica na descrição de uma transação liberada
- **THEN** o frontend abre o mesmo Drawer de edição

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
