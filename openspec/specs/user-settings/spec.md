# user-settings

## Purpose

Preferências do usuário no frontend: tela de configurações e gates de mutação (ex.: bloqueio de edição/exclusão em meses passados).

## Requirements

### Requirement: Usuário acessa tela de configurações
O frontend SHALL expor a rota `/settings` com título “Configurações” e item correspondente na navegação lateral.

#### Scenario: Abrir configurações
- **WHEN** um usuário autenticado navega para `/settings`
- **THEN** o frontend exibe a tela de configurações
- **AND** o item de navegação “Configurações” aponta para `/settings` e fica ativo nessa rota

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

### Requirement: Seletor de aparência na tela de configurações
A tela `/settings` SHALL expor um controle para escolher a aparência do app entre **Claro**, **Escuro** e **Sistema**, com rótulos em português.

#### Scenario: Alterar tema nas configurações
- **WHEN** o usuário autenticado abre `/settings` e seleciona uma opção de aparência
- **THEN** o tema do app muda imediatamente
- **AND** a escolha fica persistida localmente para visitas futuras
