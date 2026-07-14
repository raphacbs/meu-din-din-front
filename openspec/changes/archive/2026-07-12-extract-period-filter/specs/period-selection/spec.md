## ADDED Requirements

### Requirement: Usuário pode escolher o modo de período
O frontend SHALL oferecer os modos de seleção de período `month` (Mês) e `custom` (Customizado), com modo `month` como padrão.

#### Scenario: Modo padrão é mês
- **WHEN** o store de período é inicializado sem período aplicado prévio
- **THEN** o modo SHALL ser `month`
- **AND** o mês selecionado SHALL ser o mês civil atual

#### Scenario: Alternar para customizado
- **WHEN** o usuário seleciona o modo Customizado
- **THEN** o frontend SHALL exibir o seletor de intervalo de datas (RangePicker)
- **AND** NÃO SHALL alterar o período aplicado até o usuário filtrar

#### Scenario: Alternar de volta para mês
- **WHEN** o usuário seleciona o modo Mês após estar em Customizado
- **THEN** o frontend SHALL exibir o MonthPicker
- **AND** o rascunho SHALL recalcular `from` e `to` como início e fim do mês selecionado no draft

### Requirement: Usuário seleciona mês com MonthPicker
No modo mês, o frontend SHALL usar o MonthPicker do Ant Design (`DatePicker` com `picker="month"`) e SHALL derivar as datas ISO de início e fim do mês selecionado.

#### Scenario: Calcular intervalo do mês
- **WHEN** o usuário escolhe um mês e ano no MonthPicker
- **THEN** o rascunho SHALL definir `from` como o primeiro dia desse mês em `YYYY-MM-DD`
- **AND** o rascunho SHALL definir `to` como o último dia desse mês em `YYYY-MM-DD`

### Requirement: Usuário seleciona período customizado
No modo customizado, o frontend SHALL permitir escolher data início e data fim via RangePicker.

#### Scenario: Intervalo customizado no rascunho
- **WHEN** o usuário seleciona um intervalo válido no RangePicker
- **THEN** o rascunho SHALL armazenar `from` e `to` em `YYYY-MM-DD`

### Requirement: Período só é aplicado ao filtrar
O frontend SHALL manter rascunho e período aplicado distintos e SHALL atualizar o período aplicado somente quando o usuário confirmar via ação Filtrar, exceto na hidratação inicial descrita nas demais requirements.

#### Scenario: Filtrar aplica o rascunho
- **WHEN** o usuário clica em Filtrar com um rascunho válido
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

### Requirement: Store compartilhado de período
O frontend SHALL manter um store compartilhado de período acessível por mais de uma tela, contendo ao menos modo, rascunho (`from`/`to` e mês quando aplicável) e período aplicado (`from`/`to`).

#### Scenario: Estado compartilhado entre consumidores
- **WHEN** um consumidor atualiza o período aplicado no store
- **THEN** outros consumidores do mesmo store SHALL observar o mesmo `from` e `to` aplicados

### Requirement: Sincronização com query string from e to
O frontend SHALL sincronizar o período aplicado com os search params `from` e `to` em formato ISO `YYYY-MM-DD`.

#### Scenario: Hidratar a partir da URL
- **WHEN** a rota é aberta com `?from=` e `?to=` válidos
- **THEN** o store SHALL hidratar rascunho e período aplicado com esses valores
- **AND** se `from` e `to` forem início e fim do mesmo mês civil, o modo SHALL ser `month`
- **AND** caso contrário o modo SHALL ser `custom`

#### Scenario: URL inválida ou incompleta
- **WHEN** a rota é aberta com `from`/`to` ausentes, incompletos ou inválidos
- **THEN** o frontend SHALL usar o mês civil atual como período padrão
- **AND** SHALL aplicar esse período e atualizar a URL com os `from` e `to` correspondentes

#### Scenario: Atualizar URL ao filtrar
- **WHEN** o usuário aplica um novo período via Filtrar
- **THEN** o frontend SHALL substituir os search params `from` e `to` pelos valores aplicados sem criar entrada desnecessária no histórico (replace)
