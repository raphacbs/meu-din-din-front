## ADDED Requirements

### Requirement: Usuário acessa tela de configurações
O frontend SHALL expor a rota `/settings` com título “Configurações” e item correspondente na navegação lateral.

#### Scenario: Abrir configurações
- **WHEN** um usuário autenticado navega para `/settings`
- **THEN** o frontend exibe a tela de configurações
- **AND** o item de navegação “Configurações” aponta para `/settings` e fica ativo nessa rota

### Requirement: Preferência bloqueia edição e exclusão de meses passados
O frontend SHALL expor a preferência booleana rotulada **“Bloquear edição e exclusão de meses passados”**, com default `true`. Quando `true`, o frontend SHALL bloquear edição e exclusão de transações cujo mês de referência (`dueDate` se presente, senão `transactionDate`) seja anterior ao mês civil atual. Mês atual e meses futuros SHALL permanecer sempre liberados para edição e exclusão, independentemente da preferência.

#### Scenario: Default protege histórico
- **WHEN** o usuário nunca definiu a preferência
- **THEN** o frontend trata `blockPastMonthMutations` como `true`
- **AND** ações de editar e excluir em transações de meses passados ficam bloqueadas

#### Scenario: Desligar libera meses passados
- **WHEN** o usuário define a preferência como `false` na tela de configurações
- **THEN** o frontend persiste o valor
- **AND** edição e exclusão de transações de meses passados ficam liberadas

#### Scenario: Mês atual e futuro nunca bloqueados
- **WHEN** a preferência está `true` e a transação pertence ao mês civil atual ou a um mês futuro
- **THEN** edição e exclusão permanecem disponíveis

### Requirement: Preferência persiste localmente até sync com API
O frontend SHALL persistir a preferência em `localStorage` nesta fase. Quando a API `GET`/`PUT` de preferências do usuário existir, o frontend SHALL poder hidratar e sincronizar o mesmo valor sem alterar o rótulo da configuração.

#### Scenario: Persistência local
- **WHEN** o usuário altera a preferência em Configurações
- **THEN** o valor é gravado em `localStorage`
- **AND** ao recarregar a aplicação o valor é restaurado
