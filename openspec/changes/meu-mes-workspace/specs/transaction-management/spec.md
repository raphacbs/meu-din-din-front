## MODIFIED Requirements

### Requirement: User can view transactions
O frontend SHALL exibir dados autenticados de transações de `GET /api/transactions`. A visão operacional do mês (anteriormente extrato) SHALL ser a tela Meu mês descrita na capability `meu-mes`, usando `GET /api/transactions/extract` com o intervalo do mês selecionado.

#### Scenario: Transaction list loads
- **WHEN** an authenticated user opens the transactions screen
- **THEN** the frontend requests `/api/transactions` with `credentials: include`
- **AND** the frontend displays each transaction description, amount, type, date, due date when present, status, tags, and group indicators when present

#### Scenario: Empty transaction list
- **WHEN** the transaction list response contains no transactions
- **THEN** the frontend displays an empty state that explains there are no transactions yet
- **AND** the frontend offers an action to create a transaction

## REMOVED Requirements

### Requirement: User can pay unpaid transactions from the extract list
**Reason:** Substituído pelo fluxo Quitar/Receber na tela Meu mês.
**Migration:** Ver requirements de liquidação em `meu-mes`.

### Requirement: User can attach receipts from the extract list
**Reason:** Anexos passam a ser exigidos na capability `meu-mes` (listas Pendentes/Liquidados).
**Migration:** Ver requirement de anexar comprovante em `meu-mes`.

### Requirement: Extract shows period totals footer
**Reason:** Totais do rodapé do extrato são substituídos pelo hero dual Previsto/Realizado em Meu mês.
**Migration:** Ver requirement de hero dual em `meu-mes`.
