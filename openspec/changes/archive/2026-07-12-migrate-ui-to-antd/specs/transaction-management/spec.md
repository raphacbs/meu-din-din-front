## MODIFIED Requirements

### Requirement: User can create and edit transactions

O frontend SHALL fornecer formulários para criar e editar transações de receita e despesa usando `antd Form` com `Form.useForm()`, SHALL usar `CurrencyInput` para campos de valor monetário, `TagSelect` para seleção de tags, e `antd InputNumber` para campos de quantidade. O frontend SHALL enviar `amount` válido para todo cadastro de transação.

#### Scenario: Create single transaction

- **WHEN** an authenticated user submits a valid single transaction form with type, amount, description, transaction date, optional due date, optional payment date, and optional tags
- **THEN** the frontend sends `POST /api/transactions` with type, amount greater than zero, description, transaction date, optional due date, optional payment date, optional tags, and no installment or recurrence object
- **AND** the frontend refreshes transaction data after success

#### Scenario: Edit transaction

- **WHEN** an authenticated user submits changes for an existing transaction
- **THEN** the frontend sends `PUT /api/transactions/{id}` with the updated transaction payload including a valid amount
- **AND** the frontend displays the updated transaction after success

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

The frontend SHALL support cancellation and deletion actions using `antd Modal.confirm` for confirmation before destructive changes.

#### Scenario: Cancel transaction

- **WHEN** an authenticated user triggers cancellation for a transaction
- **THEN** the frontend shows `antd Modal.confirm` requesting confirmation
- **AND** upon confirmation the frontend calls `POST /api/transactions/{id}/cancel`
- **AND** the frontend displays the transaction with status `CANCELADA` after success

#### Scenario: Delete transaction

- **WHEN** an authenticated user triggers deletion for a transaction
- **THEN** the frontend shows `antd Modal.confirm` requesting confirmation
- **AND** upon confirmation the frontend calls `DELETE /api/transactions/{id}`
- **AND** the frontend removes the transaction from the current view after success
