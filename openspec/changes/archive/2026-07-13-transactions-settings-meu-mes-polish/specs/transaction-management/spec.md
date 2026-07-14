## MODIFIED Requirements

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
