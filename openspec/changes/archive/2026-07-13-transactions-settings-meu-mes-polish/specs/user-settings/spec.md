## MODIFIED Requirements

### Requirement: Preferência bloqueia edição e exclusão de meses passados
O frontend SHALL expor a preferência booleana rotulada **“Bloquear edição e exclusão de meses passados”**, com default `true`. Quando `true`, o frontend SHALL bloquear edição e exclusão de transações cujo mês de referência (`dueDate` se presente, senão `transactionDate`) seja anterior ao mês civil atual. Mês atual e meses futuros SHALL permanecer sempre liberados para edição e exclusão, independentemente da preferência. O frontend SHALL carregar e persistir essa preferência via `GET` e `PUT /api/users/me/preferences`, usando o valor do servidor como fonte da verdade após autenticação.

#### Scenario: Default protege histórico
- **WHEN** o usuário nunca definiu a preferência e o servidor retorna o default
- **THEN** o frontend trata `blockPastMonthMutations` como `true`
- **AND** ações de editar e excluir em transações de meses passados ficam bloqueadas

#### Scenario: Desligar libera meses passados
- **WHEN** o usuário define a preferência como `false` na tela de configurações
- **THEN** o frontend envia `PUT /api/users/me/preferences` com `blockPastMonthMutations` `false`
- **AND** edição e exclusão de transações de meses passados ficam liberadas

#### Scenario: Mês atual e futuro nunca bloqueados
- **WHEN** a preferência está `true` e a transação pertence ao mês civil atual ou a um mês futuro
- **THEN** edição e exclusão permanecem disponíveis

#### Scenario: Hidrata preferência do servidor no login
- **WHEN** um usuário autenticado abre o app (ou a tela de configurações)
- **THEN** o frontend chama `GET /api/users/me/preferences`
- **AND** aplica `blockPastMonthMutations` retornado pelo servidor ao estado usado pelos gates de mutação

## REMOVED Requirements

### Requirement: Preferência persiste localmente até sync com API
**Reason**: A API `GET`/`PUT /api/users/me/preferences` já existe; a persistência só-local deixa de ser a fonte da verdade.
**Migration**: Usar sync com a API conforme o requirement modificado de bloqueio de meses passados; `localStorage` pode permanecer apenas como cache opcional, nunca sobrescrevendo o valor do servidor após hidratação.
