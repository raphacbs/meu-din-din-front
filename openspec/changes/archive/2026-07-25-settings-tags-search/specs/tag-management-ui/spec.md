## MODIFIED Requirements

### Requirement: Usuário visualiza lista de tags
O frontend SHALL exibir na área de Configurações uma lista de tags retornadas por `GET /api/tags`, mostrando nome, cor e contagem de uso, com campo de pesquisa para filtrar localmente por nome.

#### Scenario: Lista carrega com sucesso
- **WHEN** o usuário autenticado abre Configurações
- **THEN** o frontend solicita `/api/tags` com credenciais
- **AND** exibe tabela com `name`, `color` e `usageCount` ordenados conforme a API

#### Scenario: Nenhuma tag cadastrada
- **WHEN** a API retorna lista vazia
- **THEN** o frontend exibe estado vazio amigável

#### Scenario: Filtragem por texto parcial
- **WHEN** o usuário digita texto no campo de pesquisa da seção Tags
- **THEN** a tabela exibe apenas tags cujo nome contém o texto (ignorando maiúsculas/minúsculas)

#### Scenario: Busca sem resultados
- **WHEN** o usuário pesquisa um texto que não corresponde a nenhuma tag cadastrada
- **THEN** o frontend exibe estado vazio indicando que nenhuma tag foi encontrada para a busca

#### Scenario: Limpar pesquisa
- **WHEN** o usuário limpa o campo de pesquisa
- **THEN** a tabela volta a exibir todas as tags carregadas
