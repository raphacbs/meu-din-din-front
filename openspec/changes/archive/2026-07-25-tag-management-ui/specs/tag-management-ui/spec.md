# tag-management-ui

## Purpose

Interface web para listar, renomear e excluir tags do usuário, integrada à API de tag management.

## Requirements

### Requirement: Usuário visualiza lista de tags
O frontend SHALL exibir na área de Configurações uma lista de tags retornadas por `GET /api/tags`, mostrando nome e contagem de uso.

#### Scenario: Lista carrega com sucesso
- **WHEN** o usuário autenticado abre Configurações
- **THEN** o frontend solicita `/api/tags` com credenciais
- **AND** exibe tabela ou lista com `name` e `usageCount` ordenados conforme a API

#### Scenario: Nenhuma tag cadastrada
- **WHEN** a API retorna lista vazia
- **THEN** o frontend exibe estado vazio amigável

### Requirement: Usuário renomeia uma tag
O frontend SHALL permitir renomear uma tag via `PUT /api/tags/rename` com CSRF em mutações.

#### Scenario: Renomeação bem-sucedida
- **WHEN** o usuário informa novo nome válido e confirma
- **THEN** o frontend envia `{ from, to }` normalizado (trim)
- **AND** atualiza a lista e invalida caches de transações/analytics

#### Scenario: Validação no cliente
- **WHEN** o novo nome é vazio ou igual ao atual
- **THEN** o frontend impede envio e exibe erro inline

### Requirement: Usuário exclui uma tag
O frontend SHALL permitir excluir uma tag com confirmação explícita via `DELETE /api/tags/{tagName}`.

#### Scenario: Exclusão confirmada
- **WHEN** o usuário confirma exclusão
- **THEN** o frontend chama DELETE com tag URL-encoded
- **AND** remove a tag da lista e invalida caches relacionados

### Requirement: TagSelect usa API de tags
O componente `TagSelect` SHALL obter sugestões de `GET /api/tags` em vez de derivar do list completo de transações.

#### Scenario: Autocomplete via API
- **WHEN** o campo de tags é renderizado
- **THEN** o frontend carrega nomes de tags da API dedicada
- **AND** mantém capacidade de criar tags novas inline ao salvar transação
