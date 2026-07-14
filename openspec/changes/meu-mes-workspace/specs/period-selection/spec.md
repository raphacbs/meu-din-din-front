## ADDED Requirements

### Requirement: Consumidor Meu mês aplica mês sem Filtrar e sem modo custom
Quando a tela Meu mês for o consumidor do store de período, o frontend SHALL operar apenas em modo `month`, SHALL aplicar o intervalo imediatamente ao alterar o mês, e SHALL NÃO exigir a ação Filtrar nem expor UI de modo `custom` nesse consumidor. O store MAY continuar suportando modo `custom` para outros consumidores.

#### Scenario: Apply imediato no Meu mês
- **WHEN** o usuário altera o mês na tela Meu mês
- **THEN** o período aplicado SHALL receber o `from`/`to` do mês selecionado sem clicar em Filtrar
- **AND** a URL SHALL ser atualizada com replace de `?from=&to=`

#### Scenario: Custom permanece disponível no store
- **WHEN** nenhum consumidor Meu mês está forçando a UI
- **THEN** o store ainda SHALL permitir modo `custom` para outras telas que o utilizem

## MODIFIED Requirements

### Requirement: Período só é aplicado ao filtrar
O frontend SHALL manter rascunho e período aplicado distintos e SHALL atualizar o período aplicado quando o usuário confirmar via ação Filtrar, **exceto** (1) na hidratação inicial descrita nas demais requirements e (2) no consumidor Meu mês, onde a troca de mês aplica imediatamente.

#### Scenario: Filtrar aplica o rascunho
- **WHEN** o usuário clica em Filtrar com um rascunho válido em um consumidor que usa Filtrar
- **THEN** o período aplicado SHALL receber os `from` e `to` do rascunho
- **AND** a URL SHALL ser atualizada com `?from=&to=` correspondentes

#### Scenario: Validação de período customizado incompleto
- **WHEN** o usuário está no modo customizado e clica em Filtrar sem ambas as datas
- **THEN** o frontend SHALL exibir erro de validação
- **AND** NÃO SHALL alterar o período aplicado nem a URL

#### Scenario: Validação from posterior a to
- **WHEN** o usuário está no modo customizado com `from` posterior a `to` e clica em Filtrar
- **THEN** o frontend SHALL exibir erro de validação
- **AND** NÃO SHALL alterar o período aplicado nem a URL

#### Scenario: Meu mês aplica sem Filtrar
- **WHEN** o consumidor é a tela Meu mês e o usuário troca o mês
- **THEN** o período aplicado SHALL atualizar imediatamente sem ação Filtrar
