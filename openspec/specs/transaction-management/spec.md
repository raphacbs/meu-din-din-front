# transaction-management

## Purpose

Gestão de transações financeiras no frontend: listagem, extrato, formulários, ações destrutivas e anexos.

## Requirements

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

#### Scenario: Extract row actions
- **WHEN** o extrato exibe uma ou mais transações
- **THEN** cada linha inclui ações com ícones para anexar comprovante e, quando aplicável, pagar
- **AND** o extrato exibe o rodapé com totais de despesas, receitas e saldo

### Requirement: User can pay unpaid transactions from the extract list
O frontend SHALL permitir marcar como paga uma transação ainda não paga diretamente a partir da listagem/extrato, usando ícone com tooltip/rótulo acessível. O frontend SHALL exigir confirmação explícita via `antd Modal.confirm` antes de qualquer chamada de pagamento, e somente após confirmação SHALL chamar `PUT /api/transactions/{id}` com `paymentDate` no dia corrente preservando os demais campos da transação.

#### Scenario: Pay action visible for unpaid transaction
- **WHEN** a transação do extrato tem status diferente de `PAGO`, `PAGO_COM_ATRASO` e `CANCELADA`
- **THEN** a linha exibe a ação de pagar com ícone
- **AND** a ação possui texto acessível (tooltip ou `aria-label`) indicando "Pagar"

#### Scenario: Pay action hidden for paid or canceled transaction
- **WHEN** a transação do extrato tem status `PAGO`, `PAGO_COM_ATRASO` ou `CANCELADA`
- **THEN** a ação de pagar não é exibida nessa linha

#### Scenario: Payment confirmation dialog is required
- **WHEN** o usuário aciona a ação de pagar em uma linha do extrato
- **THEN** o frontend exibe `antd Modal.confirm` pedindo confirmação do pagamento
- **AND** o frontend ainda não envia a requisição de pagamento

#### Scenario: User cancels payment confirmation
- **WHEN** o usuário cancela ou fecha o modal de confirmação de pagamento
- **THEN** o frontend não chama `PUT /api/transactions/{id}`
- **AND** a transação permanece com o status anterior na listagem

#### Scenario: User confirms payment from extract
- **WHEN** o usuário confirma o pagamento no modal
- **THEN** o frontend envia `PUT /api/transactions/{id}` com os dados atuais da transação e `paymentDate` igual à data de hoje em ISO `YYYY-MM-DD`
- **AND** após sucesso o frontend atualiza a listagem do extrato refletindo o novo status

#### Scenario: Payment failure
- **WHEN** o backend rejeita o pagamento após a confirmação
- **THEN** o frontend exibe mensagem de erro
- **AND** a transação permanece com o status anterior na listagem

### Requirement: User can attach receipts from the extract list
O frontend SHALL permitir anexar comprovante a partir da linha do extrato via ícone, abrindo um fluxo modal que reutiliza o cadastro de metadados de anexo (`POST /api/transactions/{id}/attachments`).

#### Scenario: Attach action opens modal
- **WHEN** o usuário aciona anexar comprovante em uma linha do extrato
- **THEN** o frontend abre um modal com o formulário de metadados do anexo (nome, URL, MIME type, tamanho)
- **AND** a ação usa ícone com tooltip/`aria-label` indicando "Anexar comprovante"

#### Scenario: Attachment metadata saved from extract
- **WHEN** o usuário submete metadados válidos no modal de anexo do extrato
- **THEN** o frontend chama `POST /api/transactions/{id}/attachments` com file name, file URL, MIME type e file size
- **AND** após sucesso o modal fecha ou limpa o formulário e confirma o anexo

### Requirement: Extract shows period totals footer
O frontend SHALL exibir no rodapé do extrato a soma de despesas, a soma de receitas e o saldo (receitas − despesas) das transações do período carregado, excluindo transações com status `CANCELADA`.

#### Scenario: Totals footer on desktop table
- **WHEN** o extrato exibe transações em `antd Table`
- **THEN** o rodapé mostra Despesas, Receitas e Saldo do conjunto carregado
- **AND** os valores monetários usam formatação de moeda consistente com o restante do app

#### Scenario: Totals on mobile list
- **WHEN** o extrato exibe transações em layout mobile (`antd List`)
- **THEN** o frontend exibe o mesmo resumo de Despesas, Receitas e Saldo abaixo da lista

#### Scenario: Totals ignore canceled transactions
- **WHEN** o período inclui transações com status `CANCELADA`
- **THEN** essas transações não entram nas somas de despesas, receitas nem saldo

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
