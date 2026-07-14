## ADDED Requirements

### Requirement: User can view transactions
The frontend SHALL display authenticated transaction data from `GET /api/transactions` and support an extract view using `GET /api/transactions/extract`.

#### Scenario: Transaction list loads
- **WHEN** an authenticated user opens the transactions screen
- **THEN** the frontend requests `/api/transactions` with `credentials: include`
- **AND** the frontend displays each transaction description, amount, type, date, due date when present, status, tags, and group indicators when present

#### Scenario: Empty transaction list
- **WHEN** the transaction list response contains no transactions
- **THEN** the frontend displays an empty state that explains there are no transactions yet
- **AND** the frontend offers an action to create a transaction

#### Scenario: Extract by period
- **WHEN** an authenticated user applies a from date or to date in the extract screen
- **THEN** the frontend requests `/api/transactions/extract` using `X-From-Date` and `X-To-Date` headers for the selected ISO dates
- **AND** the frontend displays only the returned transactions

### Requirement: User can create and edit transactions
The frontend SHALL provide forms for creating and editing income and expense transactions using the backend transaction schema.

#### Scenario: Create single transaction
- **WHEN** an authenticated user submits a valid single transaction form
- **THEN** the frontend sends `POST /api/transactions` with type, amount, description, transaction date, optional due date, optional payment date, optional tags, and optional status
- **AND** the frontend refreshes transaction data after success

#### Scenario: Edit transaction
- **WHEN** an authenticated user submits changes for an existing transaction
- **THEN** the frontend sends `PUT /api/transactions/{id}` with the updated transaction payload
- **AND** the frontend displays the updated transaction after success

#### Scenario: Validation error
- **WHEN** the backend rejects a transaction mutation with `400`
- **THEN** the frontend displays the validation or business-rule message without clearing the user's form input

### Requirement: User can manage installments and recurrence
The frontend SHALL allow the user to choose between single, installment, and recurring transaction modes and send the correct nested payload for the selected mode.

#### Scenario: Create installment transaction
- **WHEN** the user selects installment mode and submits installment count, installment amount, and first due date
- **THEN** the frontend sends an `installment` object with `installmentCount`, `installmentAmount`, and `firstDueDate`
- **AND** the frontend does not send a `recurrence` object

#### Scenario: Create recurring transaction
- **WHEN** the user selects recurring mode and submits frequency, interval count, next occurrence date, and optional end date
- **THEN** the frontend sends a `recurrence` object with `frequency`, `intervalCount`, `nextOccurrenceDate`, and optional `endDate`
- **AND** the frontend does not send an `installment` object

#### Scenario: Deactivate recurrence
- **WHEN** the user chooses to deactivate an active recurrence series
- **THEN** the frontend calls `POST /api/transactions/groups/{groupId}/recurrence/deactivate`
- **AND** the frontend updates the visible series status to inactive after success

#### Scenario: Delete installment group
- **WHEN** the user chooses to delete an installment group
- **THEN** the frontend calls `DELETE /api/transactions/groups/{groupId}/installments`
- **AND** the frontend removes the affected installments from the visible list after success

### Requirement: User can cancel and delete transactions
The frontend SHALL support cancellation and deletion actions with clear confirmation before destructive changes.

#### Scenario: Cancel transaction
- **WHEN** an authenticated user confirms cancellation for a transaction
- **THEN** the frontend calls `POST /api/transactions/{id}/cancel`
- **AND** the frontend displays the transaction with status `CANCELADA` after success

#### Scenario: Delete transaction
- **WHEN** an authenticated user confirms deletion for a transaction
- **THEN** the frontend calls `DELETE /api/transactions/{id}`
- **AND** the frontend removes the transaction from the current view after success

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
