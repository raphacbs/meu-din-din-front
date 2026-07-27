# tag-selector

## Purpose

Seleção e criação inline de tags de transação com autocomplete via API dedicada, cores do catálogo e normalização de nomes em maiúsculas.

## Requirements

### Requirement: Campo de tags permite selecionar tags existentes e criar novas

O frontend SHALL fornecer um componente `TagSelect` baseado em `antd Select mode="tags"` que exibe tags do catálogo (`GET /api/tags`) como opções de autocomplete e permite a criação de novas tags inline com escolha de cor.

#### Scenario: Campo exibe tags existentes como sugestões

- **WHEN** o usuário abre o campo de tags no formulário de transação
- **THEN** o campo exibe como opções de dropdown as tags retornadas por `GET /api/tags`
- **AND** as opções são ordenadas alfabeticamente

#### Scenario: Usuário seleciona uma tag existente

- **WHEN** o usuário clica em uma tag listada no dropdown
- **THEN** a tag é adicionada ao campo como chip/token visível
- **AND** o campo permanece aberto para seleção de mais tags

#### Scenario: Usuário cria uma nova tag digitando

- **WHEN** o usuário digita um texto não presente nas opções existentes e confirma
- **THEN** o frontend abre modal para escolher cor da nova tag
- **AND** após confirmar, a tag normalizada em maiúsculas é adicionada ao campo
- **AND** a nova tag será persistida associada à transação ao salvar o formulário

#### Scenario: Usuário remove uma tag selecionada

- **WHEN** o usuário clica no "×" de uma tag já adicionada ao campo
- **THEN** a tag é removida do campo
- **AND** as demais tags permanecem

#### Scenario: Tags sem catálogo carregado

- **WHEN** o campo de tags é exibido e a API de tags ainda não respondeu
- **THEN** o campo funciona sem opções pré-carregadas
- **AND** o usuário pode criar novas tags livremente após o carregamento ou via digitação

### Requirement: Nomes de tag normalizados em maiúsculas

O `TagSelect` SHALL normalizar todos os valores emitidos via `onChange` para maiúsculas, deduplicando variações de caixa.

#### Scenario: Deduplicação por caixa

- **WHEN** o usuário adiciona `"mercado"` e depois `"Mercado"`
- **THEN** o campo mantém apenas `MERCADO`

### Requirement: TagSelect é compatível com antd Form

O componente `TagSelect` SHALL expor interface `value: string[]` e `onChange: (tags: string[]) => void`, compatível com o protocolo de controle de campo do `antd Form.Item`.

#### Scenario: TagSelect é usado dentro de Form.Item

- **WHEN** o componente `TagSelect` é utilizado como filho direto de um `antd Form.Item`
- **THEN** o Form.Item controla o valor do campo via `value` e recebe atualizações via `onChange`
- **AND** o valor resultante é um array de strings normalizadas pronto para envio ao backend
