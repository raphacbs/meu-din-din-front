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
O frontend SHALL fornecer formulários para criar e editar transações de receita e despesa usando `antd Form` com `Form.useForm()` dentro de um `antd Drawer` na tela Meu mês, SHALL usar `CurrencyInput` para campos de valor monetário, `TagSelect` para seleção de tags, e `antd InputNumber` para campos de quantidade. O frontend SHALL enviar `amount` válido para todo cadastro de transação. No modo avulso e no modo recorrente, o frontend SHALL exigir `dueDate` (vencimento) tanto para `DESPESA` quanto para `RECEITA` na criação e na edição. O frontend NÃO SHALL depender de páginas dedicadas `/transactions/new` ou `/transactions/[id]` como fluxo principal.

#### Scenario: Create single transaction
- **WHEN** an authenticated user submits a valid single transaction form with type, amount, description, transaction date, due date, optional payment date, and optional tags
- **THEN** the frontend sends `POST /api/transactions` with type, amount greater than zero, description, transaction date, due date, optional payment date, optional tags, and no installment or recurrence object
- **AND** the frontend refreshes Meu mês extract data after success

#### Scenario: Reject single transaction without due date
- **WHEN** the user submits a single (avulso) transaction form without due date, for either `DESPESA` or `RECEITA`
- **THEN** the frontend blocks submit and shows a validation error on the due date field
- **AND** the frontend does not call the transactions API

#### Scenario: Edit transaction
- **WHEN** an authenticated user submits changes for an existing transaction from the Meu mês Drawer
- **THEN** the frontend sends `PUT /api/transactions/{id}` with the updated transaction payload including a valid amount and due date
- **AND** the frontend displays the updated transaction after success in Meu mês

#### Scenario: Validation error
- **WHEN** the backend rejects a transaction mutation with `400`
- **THEN** the frontend displays the validation or business-rule message via `antd Alert` or `antd Form` error without clearing the user's form input

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
