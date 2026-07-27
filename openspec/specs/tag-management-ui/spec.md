# tag-management-ui

## Purpose

Interface web para listar, editar (nome e cor), renomear e excluir tags do usuário, integrada à API de tag management, com normalização de nomes em maiúsculas.

## Requirements

### Requirement: Normalização de nomes de tag no frontend
O frontend MUST normalizar nomes de tag para maiúsculas (trim + uppercase) antes de enviar mutações à API e ao atualizar estado local de seleção de tags.

#### Scenario: Criação inline no TagSelect
- **WHEN** o usuário digita `"mercado"` como nova tag
- **THEN** o frontend persiste e exibe `MERCADO`

#### Scenario: Edição em Configurações
- **WHEN** o usuário renomeia uma tag para `"Fixo"`
- **THEN** o frontend envia `to: "FIXO"` na API de rename

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

### Requirement: Usuário edita nome e cor de uma tag
O frontend SHALL permitir editar nome e cor via modal, usando `PUT /api/tags/rename` (quando o nome muda) e `PUT /api/tags` (upsert de cor/nome).

#### Scenario: Alteração de cor
- **WHEN** o usuário seleciona nova cor no picker
- **THEN** o frontend envia upsert com nome normalizado e cor hex
- **AND** atualiza a lista e invalida caches relacionados

#### Scenario: Renomeação bem-sucedida
- **WHEN** o usuário informa novo nome válido e confirma
- **THEN** o frontend envia `{ from, to }` normalizados (trim + maiúsculas) com CSRF
- **AND** atualiza a lista e invalida caches de transações/analytics

#### Scenario: Validação no cliente
- **WHEN** o novo nome é vazio ou igual ao atual (após normalização)
- **THEN** o frontend impede envio e exibe erro inline

### Requirement: Usuário exclui uma tag
O frontend SHALL permitir excluir uma tag com confirmação explícita via `DELETE /api/tags/{tagName}`.

#### Scenario: Exclusão confirmada
- **WHEN** o usuário confirma exclusão
- **THEN** o frontend chama DELETE com tag URL-encoded e normalizada
- **AND** remove a tag da lista e invalida caches relacionados

### Requirement: Tags coloridas na UI
O frontend SHALL renderizar tags com a cor do catálogo (`ColoredTag`) em listas de transações e agrupamentos (ex.: Meu mês), consultando o hook de catálogo de tags.

#### Scenario: Cor do catálogo aplicada
- **WHEN** uma transação exibe a tag `MERCADO` e o catálogo define cor `#FF5733`
- **THEN** o chip da tag usa `#FF5733`
- **AND** tags sem cor catalogada usam a cor padrão

### Requirement: TagSelect usa API de tags
O componente `TagSelect` SHALL obter sugestões de `GET /api/tags` em vez de derivar do list completo de transações.

#### Scenario: Autocomplete via API
- **WHEN** o campo de tags é renderizado
- **THEN** o frontend carrega nomes e cores de tags da API dedicada
- **AND** mantém capacidade de criar tags novas inline com modal de cor ao salvar transação

