## MODIFIED Requirements

### Requirement: User can view transactions
O frontend SHALL exibir dados autenticados de transações de `GET /api/transactions` e SHALL oferecer a visão de extrato via `GET /api/transactions/extract` usando a seleção de período compartilhada (modos mês e customizado).

#### Scenario: Transaction list loads
- **WHEN** an authenticated user opens the transactions screen
- **THEN** the frontend requests `/api/transactions` with `credentials: include`
- **AND** the frontend displays each transaction description, amount, type, date, due date when present, status, tags, and group indicators when present

#### Scenario: Empty transaction list
- **WHEN** the transaction list response contains no transactions
- **THEN** the frontend displays an empty state that explains there are no transactions yet
- **AND** the frontend offers an action to create a transaction

#### Scenario: Extract loads with default current month
- **WHEN** an authenticated user opens the extract screen without valid `from`/`to` query params
- **THEN** the frontend SHALL select period mode month with the current calendar month
- **AND** the frontend SHALL apply that month range as `from` (first day) and `to` (last day) in ISO `YYYY-MM-DD`
- **AND** the frontend SHALL request `/api/transactions/extract` using `X-From-Date` and `X-To-Date` for that range
- **AND** the frontend SHALL sync the applied range to `?from=&to=`

#### Scenario: Extract by applied period
- **WHEN** an authenticated user clicks Filtrar with a valid draft period (month or custom)
- **THEN** the frontend SHALL apply the draft `from` and `to`
- **AND** the frontend SHALL request `/api/transactions/extract` using `X-From-Date` and `X-To-Date` for the applied ISO dates
- **AND** the frontend SHALL display only the returned transactions
- **AND** the frontend SHALL update `?from=&to=` to match the applied period

#### Scenario: Extract hydrates from URL
- **WHEN** an authenticated user opens the extract screen with valid `?from=` and `?to=` query params
- **THEN** the frontend SHALL hydrate the shared period store from those params
- **AND** the frontend SHALL request `/api/transactions/extract` using those dates in `X-From-Date` and `X-To-Date`
- **AND** the frontend SHALL display only the returned transactions
