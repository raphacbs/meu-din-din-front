## ADDED Requirements

### Requirement: Client API de quitação e exclusão em lote
O frontend SHALL expor no client de transações métodos tipados para `POST /api/transactions/batch/settle` e `POST /api/transactions/batch/delete`, incluindo tipagem do relatório `{ succeeded, failures }`, e SHALL usar esses métodos nas ações em lote de Meu mês em vez de N chamadas unitárias de `update`/`delete`.

#### Scenario: settleBatch envia ids e paymentDate
- **WHEN** o frontend liquida um lote de transações
- **THEN** chama `settleBatch` com a lista de ids e `paymentDate` no dia corrente
- **AND** NÃO dispara um `PUT /api/transactions/{id}` por item para essa operação

#### Scenario: deleteBatch envia itens com escopo
- **WHEN** o frontend exclui um lote de transações
- **THEN** chama `deleteBatch` com `{ id, scope }` por item
- **AND** interpreta `succeeded` e `failures` da resposta para feedback ao usuário

#### Scenario: Erro de rede ou 4xx no batch
- **WHEN** a chamada batch falha por rede ou erro de validação do lote inteiro
- **THEN** o frontend exibe erro
- **AND** NÃO remove itens da visão como se tivessem sido processados
