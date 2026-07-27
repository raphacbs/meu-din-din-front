## ADDED Requirements

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
