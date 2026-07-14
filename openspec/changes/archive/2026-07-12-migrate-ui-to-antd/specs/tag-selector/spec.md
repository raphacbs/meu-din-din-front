## ADDED Requirements

### Requirement: Campo de tags permite selecionar tags existentes e criar novas

O frontend SHALL fornecer um componente `TagSelect` baseado em `antd Select mode="tags"` que exibe as tags previamente cadastradas pelo usuário como opções de autocomplete e permite a criação de novas tags inline sem navegação adicional.

#### Scenario: Campo exibe tags existentes como sugestões

- **WHEN** o usuário abre o campo de tags no formulário de transação
- **THEN** o campo exibe como opções de dropdown as tags únicas extraídas das transações existentes do usuário
- **AND** as opções são ordenadas alfabeticamente

#### Scenario: Usuário seleciona uma tag existente

- **WHEN** o usuário clica em uma tag listada no dropdown
- **THEN** a tag é adicionada ao campo como chip/token visível
- **AND** o campo permanece aberto para seleção de mais tags

#### Scenario: Usuário cria uma nova tag digitando

- **WHEN** o usuário digita um texto não presente nas opções existentes e pressiona Enter ou vírgula
- **THEN** a nova tag é adicionada ao campo como chip/token visível
- **AND** a nova tag será persistida associada à transação ao salvar o formulário

#### Scenario: Usuário remove uma tag selecionada

- **WHEN** o usuário clica no "×" de uma tag já adicionada ao campo
- **THEN** a tag é removida do campo
- **AND** as demais tags permanecem

#### Scenario: Tags sem transações carregadas

- **WHEN** o campo de tags é exibido e nenhuma transação foi carregada no cache do React Query
- **THEN** o campo funciona sem opções pré-carregadas
- **AND** o usuário pode criar novas tags livremente

### Requirement: TagSelect é compatível com antd Form

O componente `TagSelect` SHALL expor interface `value: string[]` e `onChange: (tags: string[]) => void`, compatível com o protocolo de controle de campo do `antd Form.Item`.

#### Scenario: TagSelect é usado dentro de Form.Item

- **WHEN** o componente `TagSelect` é utilizado como filho direto de um `antd Form.Item`
- **THEN** o Form.Item controla o valor do campo via `value` e recebe atualizações via `onChange`
- **AND** o valor resultante é um array de strings pronto para envio ao backend
