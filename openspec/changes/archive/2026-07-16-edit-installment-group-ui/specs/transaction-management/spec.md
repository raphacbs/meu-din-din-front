## ADDED Requirements

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
O frontend SHALL permitir editar um grupo `PARCELAMENTO` a partir do Meu mês carregando as parcelas via `GET /api/transactions/groups/{groupId}/installments`, exibindo a lista no Drawer, permitindo alterar quantidade, valor da parcela, primeiro vencimento, descrição e tags, e persistindo via `PUT /api/transactions/groups/{groupId}/installments`. Quando valor da parcela ou quantidade mudarem em relação ao estado carregado, o frontend SHALL informar o impacto (valor em todas as parcelas; criação/remoção no fim da série) e SHALL exigir confirmação explícita antes do PUT.

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

#### Scenario: Persistir edição do grupo
- **WHEN** o usuário confirma o save de um parcelamento válido
- **THEN** o frontend envia `PUT /api/transactions/groups/{groupId}/installments` com quantidade, valor da parcela, primeiro vencimento, descrição e tags
- **AND** atualiza a visão Meu mês após sucesso
- **AND** NÃO envia `PUT /api/transactions/{id}` com objeto `installment`

#### Scenario: Erro de validação do grupo
- **WHEN** o backend rejeita o update do grupo com `400`
- **THEN** o frontend exibe a mensagem no Alert do formulário sem limpar os campos

## MODIFIED Requirements

### Requirement: User can create and edit transactions
O frontend SHALL fornecer formulários para criar e editar transações de receita e despesa usando `antd Form` com `Form.useForm()` dentro de um `antd Drawer` na tela Meu mês, SHALL usar `CurrencyInput` para campos de valor monetário, `TagSelect` para seleção de tags, e `antd InputNumber` para campos de quantidade. O frontend SHALL enviar `amount` válido para todo cadastro de transação. No modo avulso e no modo recorrente, o frontend SHALL exigir `dueDate` (vencimento) tanto para `DESPESA` quanto para `RECEITA` na criação e na edição. Edição de grupo `PARCELAMENTO` SHALL usar o fluxo e endpoints de grupo (não o `PUT` individual com `installment`). O frontend NÃO SHALL depender de páginas dedicadas `/transactions/new` ou `/transactions/[id]` como fluxo principal.

#### Scenario: Create single transaction
- **WHEN** an authenticated user submits a valid single transaction form with type, amount, description, transaction date, due date, optional payment date, and optional tags
- **THEN** the frontend sends `POST /api/transactions` with type, amount greater than zero, description, transaction date, due date, optional payment date, optional tags, and no installment or recurrence object
- **AND** the frontend refreshes Meu mês extract data after success

#### Scenario: Reject single transaction without due date
- **WHEN** the user submits a single (avulso) transaction form without due date, for either `DESPESA` or `RECEITA`
- **THEN** the frontend blocks submit and shows a validation error on the due date field
- **AND** the frontend does not call the transactions API

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
