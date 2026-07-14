## MODIFIED Requirements

### Requirement: User can view transactions
O frontend SHALL tratar Meu mês (`/meu-mes` + `GET /api/transactions/extract`) como a visão operacional de listagem. A rota `/transactions` NÃO SHALL ser oferecida na navegação; acessos a `/transactions`, `/transactions/new` e `/transactions/[id]` SHALL redirecionar para `/meu-mes`.

#### Scenario: Rotas legadas redirecionam
- **WHEN** um usuário autenticado navega para `/transactions`, `/transactions/new` ou `/transactions/[id]`
- **THEN** o frontend redireciona para `/meu-mes`

#### Scenario: Visão operacional é Meu mês
- **WHEN** o usuário precisa ver e operar transações do mês
- **THEN** o frontend usa a tela Meu mês e o extract do intervalo selecionado

### Requirement: User can create and edit transactions
O frontend SHALL fornecer formulários para criar e editar transações de receita e despesa usando `antd Form` com `Form.useForm()` dentro de um `antd Drawer` na tela Meu mês, SHALL usar `CurrencyInput` para campos de valor monetário, `TagSelect` para seleção de tags, e `antd InputNumber` para campos de quantidade. O frontend SHALL enviar `amount` válido para todo cadastro de transação. O frontend NÃO SHALL depender de páginas dedicadas `/transactions/new` ou `/transactions/[id]` como fluxo principal.

#### Scenario: Create single transaction
- **WHEN** an authenticated user submits a valid single transaction form with type, amount, description, transaction date, optional due date, optional payment date, and optional tags
- **THEN** the frontend sends `POST /api/transactions` with type, amount greater than zero, description, transaction date, optional due date, optional payment date, optional tags, and no installment or recurrence object
- **AND** the frontend refreshes Meu mês extract data after success

#### Scenario: Edit transaction
- **WHEN** an authenticated user submits changes for an existing transaction from the Meu mês Drawer
- **THEN** the frontend sends `PUT /api/transactions/{id}` with the updated transaction payload including a valid amount
- **AND** the frontend displays the updated transaction after success in Meu mês

#### Scenario: Validation error
- **WHEN** the backend rejects a transaction mutation with `400`
- **THEN** the frontend displays the validation or business-rule message via `antd Alert` or `antd Form` error without clearing the user's form input

### Requirement: User can cancel and delete transactions
The frontend SHALL support deletion (and cancellation when applicable) using `antd Modal` confirmation before destructive changes, primarily from Meu mês row actions. Deletion of a recurrence occurrence SHALL offer scope “only this” versus “this and future” when `group.type` is `RECORRENCIA`.

#### Scenario: Delete transaction
- **WHEN** an authenticated user triggers deletion for a transaction from Meu mês
- **THEN** the frontend shows confirmation requesting confirmation
- **AND** upon confirmation the frontend calls `DELETE /api/transactions/{id}` for single-occurrence scope
- **AND** the frontend removes the transaction from the current view after success

#### Scenario: Delete this and future recurrence occurrences
- **WHEN** the user confirms deletion of a recurrent transaction including future occurrences
- **THEN** the frontend calls the backend from-here recurrence delete endpoint
- **AND** the frontend removes the affected occurrences from the current view after success

#### Scenario: Cancel transaction
- **WHEN** an authenticated user triggers cancellation for a transaction where that action is offered
- **THEN** the frontend shows confirmation requesting confirmation
- **AND** upon confirmation the frontend calls `POST /api/transactions/{id}/cancel`
- **AND** the frontend displays the transaction with status `CANCELADA` after success (or omits it from Meu mês lists per `meu-mes` rules)
