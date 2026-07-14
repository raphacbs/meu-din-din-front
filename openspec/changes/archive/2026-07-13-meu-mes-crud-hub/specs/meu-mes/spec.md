## ADDED Requirements

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

### Requirement: Seletor de mês tem destaque tipográfico
O frontend SHALL apresentar o nome do mês selecionado como elemento tipográfico principal do hero (clicável para escolher o mês) com navegação ◀ ▶, sem depender de um DatePicker compacto como único sinal visual do mês.

#### Scenario: Mês legível e selecionável
- **WHEN** o usuário está em Meu mês
- **THEN** o nome do mês (ex.: “julho 2026”) aparece com tipografia de destaque
- **AND** o usuário pode mudar o mês pelas setas ou acionando o nome/seletor

## MODIFIED Requirements

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
