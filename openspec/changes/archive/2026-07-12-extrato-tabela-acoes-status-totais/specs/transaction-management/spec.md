## ADDED Requirements

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

## MODIFIED Requirements

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

#### Scenario: Extract row actions
- **WHEN** o extrato exibe uma ou mais transações
- **THEN** cada linha inclui ações com ícones para anexar comprovante e, quando aplicável, pagar
- **AND** o extrato exibe o rodapé com totais de despesas, receitas e saldo
