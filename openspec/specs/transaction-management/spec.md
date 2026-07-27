# transaction-management

## Purpose

Gestão de transações financeiras no frontend: listagem, formulários, ações destrutivas e anexos. A visão operacional do mês vive na capability `meu-mes`.

## Requirements

### Requirement: User can view transactions
O frontend SHALL tratar Meu mês (`/meu-mes` + `GET /api/transactions/extract`) como a visão operacional de listagem. A rota `/transactions` NÃO SHALL ser oferecida na navegação; acessos a `/transactions`, `/transactions/new` e `/transactions/[id]` SHALL redirecionar para `/meu-mes`.

#### Scenario: Rotas legadas redirecionam
- **WHEN** um usuário autenticado navega para `/transactions`, `/transactions/new` ou `/transactions/[id]`
- **THEN** o frontend redireciona para `/meu-mes`

#### Scenario: Visão operacional é Meu mês
- **WHEN** o usuário precisa ver e operar transações do mês
- **THEN** o frontend usa a tela Meu mês e o extract do intervalo selecionado

### Requirement: User can create and edit transactions
O frontend SHALL fornecer formulários para criar e editar transações de receita e despesa usando `antd Form` com `Form.useForm()` dentro de um `antd Drawer` na tela Meu mês, SHALL usar `CurrencyInput` para campos de valor monetário, `TagSelect` para seleção de tags, e `antd InputNumber` para campos de quantidade. O frontend SHALL enviar `amount` válido para todo cadastro de transação. No modo avulso e no modo recorrente, o frontend SHALL exigir `dueDate` (vencimento) tanto para `DESPESA` quanto para `RECEITA` na criação e na edição. No modo avulso (criação e edição), os DatePickers de **Data da transação** e **Pagamento** SHALL permitir apenas datas menores ou iguais a hoje (datas futuras desabilitadas no calendário). Edição de grupo `PARCELAMENTO` SHALL usar o fluxo e endpoints de grupo (não o `PUT` individual com `installment`). O frontend NÃO SHALL depender de páginas dedicadas `/transactions/new` ou `/transactions/[id]` como fluxo principal.

#### Scenario: Create single transaction
- **WHEN** an authenticated user submits a valid single transaction form with type, amount, description, transaction date, due date, optional payment date, and optional tags
- **THEN** the frontend sends `POST /api/transactions` with type, amount greater than zero, description, transaction date, due date, optional payment date, optional tags, and no installment or recurrence object
- **AND** the frontend refreshes Meu mês extract data after success

#### Scenario: Reject single transaction without due date
- **WHEN** the user submits a single (avulso) transaction form without due date, for either `DESPESA` or `RECEITA`
- **THEN** the frontend blocks submit and shows a validation error on the due date field
- **AND** the frontend does not call the transactions API

#### Scenario: Datas de transação e pagamento limitadas a hoje na avulsa
- **WHEN** o usuário abre o formulário de transação avulsa (criar ou editar) e interage com o DatePicker de Data da transação ou de Pagamento
- **THEN** o calendário desabilita datas posteriores a hoje
- **AND** o usuário só consegue selecionar datas menores ou iguais à data civil atual

#### Scenario: Edit single or recurring transaction
- **WHEN** an authenticated user submits changes for an existing non-installment transaction from the Meu mês Drawer
- **THEN** the frontend sends `PUT /api/transactions/{id}` with the updated transaction payload including a valid amount and due date
- **AND** the frontend displays the updated transaction after success in Meu mês

#### Scenario: Edit installment uses group endpoints
- **WHEN** an authenticated user submits changes for a `PARCELAMENTO` group from the Meu mês Drawer
- **THEN** the frontend sends `PUT /api/transactions/groups/{groupId}/installments`
- **AND** the frontend does not send `installment` on `PUT /api/transactions/{id}`

#### Scenario: Validation error
- **WHEN** the backend rejects a transaction mutation with `400`
- **THEN** the frontend displays the validation or business-rule message via `antd Alert` or `antd Form` error without clearing the user's form input

### Requirement: Formulário de edição preserva o modo da transação
O frontend SHALL garantir que o campo `mode` participe do submit do `antd Form` mesmo quando o seletor de modo estiver oculto (`disableModeSwitch`), de forma que `buildTransactionPayload` receba o modo correto (`single`, `installment` ou `recurring`) na edição.

#### Scenario: Editar avulsa com switch de modo desabilitado
- **WHEN** o usuário salva uma transação avulsa existente no Drawer de edição sem alterar o modo
- **THEN** o frontend envia `PUT /api/transactions/{id}` com amount e dueDate válidos
- **AND** NÃO exibe a mensagem genérica “Revise os valores informados antes de enviar.” causada por payload nulo

#### Scenario: Editar recorrente com switch de modo desabilitado
- **WHEN** o usuário salva uma ocorrência recorrente existente com campos válidos no Drawer de edição
- **THEN** o frontend envia `PUT /api/transactions/{id}` com amount, dueDate e demais campos da ocorrência
- **AND** NÃO envia objeto `installment`

### Requirement: Usuário edita grupo de parcelamento
O frontend SHALL permitir editar um grupo `PARCELAMENTO` a partir do Meu mês carregando as parcelas via `GET /api/transactions/groups/{groupId}/installments`, exibindo a lista no Drawer, permitindo alterar quantidade, valor da parcela, primeiro vencimento, descrição e tags, e persistindo via `PUT /api/transactions/groups/{groupId}/installments`. Quando valor da parcela ou quantidade mudarem em relação ao estado carregado, o frontend SHALL informar o impacto (valor em todas as parcelas; criação/remoção no fim da série) e SHALL exigir confirmação explícita antes do PUT. A confirmação SHALL ser visível e utilizável enquanto o Drawer de edição estiver aberto (não SHALL ficar inacessível atrás do Drawer), e após o usuário confirmar, o frontend SHALL enviar o PUT do grupo.

#### Scenario: Abrir edição de parcela carrega o grupo
- **WHEN** o usuário edita uma transação com `group.type === PARCELAMENTO`
- **THEN** o frontend busca as parcelas do grupo
- **AND** exibe a lista das parcelas no Drawer junto ao formulário de edição do parcelamento

#### Scenario: Aviso e confirmação ao mudar valor
- **WHEN** o usuário altera o valor da parcela e aciona salvar
- **THEN** o frontend informa que o novo valor será aplicado a todas as parcelas do grupo
- **AND** só envia o `PUT` do grupo após confirmação

#### Scenario: Aviso e confirmação ao mudar quantidade
- **WHEN** o usuário altera a quantidade de parcelas e aciona salvar
- **THEN** o frontend informa o impacto (quantas parcelas serão criadas ou removidas no fim da série)
- **AND** só envia o `PUT` do grupo após confirmação

#### Scenario: Confirmação acessível sobre o Drawer
- **WHEN** o usuário aciona salvar com impacto estrutural (quantidade e/ou valor alterados) com o Drawer de edição aberto
- **THEN** o frontend exibe o diálogo de confirmação de forma visível e acionável (não oculto atrás do Drawer)
- **AND** ao confirmar, o frontend envia o `PUT` do grupo

#### Scenario: Persistir edição do grupo
- **WHEN** o usuário confirma o save de um parcelamento válido
- **THEN** o frontend envia `PUT /api/transactions/groups/{groupId}/installments` com quantidade, valor da parcela, primeiro vencimento, descrição e tags
- **AND** atualiza a visão Meu mês após sucesso
- **AND** NÃO envia `PUT /api/transactions/{id}` com objeto `installment`

#### Scenario: Erro de validação do grupo
- **WHEN** o backend rejeita o update do grupo com `400`
- **THEN** o frontend exibe a mensagem no Alert do formulário sem limpar os campos

### Requirement: User can manage installments and recurrence
O frontend SHALL permitir que o usuário escolha entre os modos avulso, parcelado e recorrente usando `antd Segmented`, SHALL exibir os campos monetários exigidos pelo modo selecionado usando `CurrencyInput`, SHALL usar `antd InputNumber` para campos de quantidade (parcelas, intervalo) e SHALL enviar o payload aninhado correto para o modo selecionado.

#### Scenario: Create installment transaction
- **WHEN** the user selects installment mode and submits installment count, installment amount greater than zero, transaction date, first due date, description, and optional tags
- **THEN** the frontend sends `POST /api/transactions` with `amount` greater than zero
- **AND** the frontend sends an `installment` object with `installmentCount`, `installmentAmount`, and `firstDueDate`
- **AND** the frontend does not send a `recurrence` object

#### Scenario: Create recurring transaction
- **WHEN** the user selects recurring mode and submits amount greater than zero, frequency, interval count, transaction date, due date, next occurrence date, optional end date, description, and optional tags
- **THEN** the frontend sends `POST /api/transactions` with `amount` greater than zero and `dueDate`
- **AND** the frontend sends a `recurrence` object with `frequency`, `intervalCount`, `nextOccurrenceDate`, and optional `endDate`
- **AND** the frontend does not send an `installment` object

#### Scenario: Numeric quantity field uses stepper controls
- **WHEN** the user enters a quantity value such as installment count or recurrence interval
- **THEN** the field uses `antd InputNumber` with visible increment and decrement controls
- **AND** the field enforces a minimum value of 1
- **AND** the user can adjust the value via keyboard arrows or by clicking the stepper buttons

#### Scenario: Deactivate recurrence
- **WHEN** the user chooses to deactivate an active recurrence series
- **THEN** the frontend calls `POST /api/transactions/groups/{groupId}/recurrence/deactivate`
- **AND** the frontend updates the visible series status to inactive after success

#### Scenario: Delete installment group
- **WHEN** the user chooses to delete an installment group
- **THEN** the frontend calls `DELETE /api/transactions/groups/{groupId}/installments`
- **AND** the frontend removes the affected installments from the visible list after success

### Requirement: User can cancel and delete transactions
The frontend SHALL support deletion (and cancellation when applicable) using `antd Modal` confirmation before destructive changes, primarily from Meu mês row actions. Deletion of a recurrence occurrence SHALL offer scope “only this” versus “this and future” when `group.type` is `RECORRENCIA`. When `group.type` is `PARCELAMENTO`, the frontend SHALL delete the entire installment group (all installments, including previous and settled ones), SHALL warn the user explicitly in the confirmation modal, and SHALL NOT offer a “only this installment” option.

#### Scenario: Delete single transaction
- **WHEN** an authenticated user triggers deletion for a transaction without installment group (`PARCELAMENTO`) from Meu mês
- **THEN** the frontend shows confirmation requesting confirmation
- **AND** upon confirmation the frontend calls `DELETE /api/transactions/{id}` for single-occurrence scope
- **AND** the frontend removes the transaction from the current view after success

#### Scenario: Delete installment group from Meu mês
- **WHEN** the user triggers deletion for a transaction whose `group.type` is `PARCELAMENTO`
- **THEN** the frontend shows a confirmation warning that all installments of the group will be removed, including previous and settled ones
- **AND** upon confirmation the frontend calls `DELETE /api/transactions/groups/{groupId}/installments`
- **AND** the frontend removes the affected installments from the current view after success

#### Scenario: Delete this and future recurrence occurrences
- **WHEN** the user confirms deletion of a recurrent transaction including future occurrences
- **THEN** the frontend calls the backend from-here recurrence delete endpoint
- **AND** the frontend removes the affected occurrences from the current view after success

#### Scenario: Cancel transaction
- **WHEN** an authenticated user triggers cancellation for a transaction where that action is offered
- **THEN** the frontend shows confirmation requesting confirmation
- **AND** upon confirmation the frontend calls `POST /api/transactions/{id}/cancel`
- **AND** the frontend displays the transaction with status `CANCELADA` after success (or omits it from Meu mês lists per `meu-mes` rules)

### Requirement: User can manage transaction attachments
The frontend SHALL display and manage attachment metadata using the backend attachment endpoints.

#### Scenario: List attachments
- **WHEN** an authenticated user opens a transaction detail screen
- **THEN** the frontend requests `GET /api/transactions/{id}/attachments`
- **AND** the frontend displays each attachment file name, type, size, and URL

#### Scenario: Add attachment metadata
- **WHEN** an authenticated user submits attachment metadata for a transaction
- **THEN** the frontend calls `POST /api/transactions/{id}/attachments` with file name, file URL, MIME type, and file size
- **AND** the frontend displays the new attachment after success

#### Scenario: Delete attachment
- **WHEN** an authenticated user confirms attachment deletion
- **THEN** the frontend calls `DELETE /api/transactions/{id}/attachments/{attachmentId}`
- **AND** the frontend removes the attachment from the transaction detail view after success

### Requirement: Client API de quitação e exclusão em lote
O frontend SHALL expor no client de transações métodos tipados para `POST /api/transactions/batch/settle` e `POST /api/transactions/batch/delete`, incluindo tipagem do relatório `{ succeeded, failures }`, e SHALL usar esses métodos nas ações em lote de Meu mês em vez de N chamadas unitárias de `update`/`delete`.

#### Scenario: settleBatch envia ids e paymentDate
- **WHEN** o frontend liquida um lote de transações
- **THEN** chama `settleBatch` com a lista de ids e `paymentDate` no dia corrente
- **AND** NÃO dispara um `PUT /api/transactions/{id}` por item para essa operação

#### Scenario: deleteBatch envia itens com escopo
- **WHEN** o frontend exclui um lote de transações
- **THEN** chama `deleteBatch` com `{ id, scope }` por item
- **AND** interpreta `succeeded` e `failures` da resposta para feedback ao usuário

#### Scenario: Erro de rede ou 4xx no batch
- **WHEN** a chamada batch falha por rede ou erro de validação do lote inteiro
- **THEN** o frontend exibe erro
- **AND** NÃO remove itens da visão como se tivessem sido processados
