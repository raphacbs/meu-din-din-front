## ADDED Requirements

### Requirement: Aplicação em massa de tags
O frontend SHALL disponibilizar um campo de tags de referência e permitir aplicá-las de uma vez às linhas-alvo (linhas selecionadas, ou todas se nenhuma estiver selecionada), substituindo as tags atuais dessas linhas.

#### Scenario: Aplicar tags às selecionadas
- **WHEN** o usuário define tags de referência e há linhas selecionadas
- **THEN** ao confirmar a aplicação, o frontend substitui as tags de todas as linhas selecionadas pelas tags de referência
- **AND** NÃO altera tags de linhas não selecionadas

#### Scenario: Aplicar tags a todas
- **WHEN** o usuário define tags de referência e não há linhas selecionadas
- **THEN** ao confirmar a aplicação, o frontend substitui as tags de todas as linhas da grade pelas tags de referência

### Requirement: Detecção e criação de parcelas restantes a partir da descrição
O frontend SHALL detectar padrões de parcela na descrição do lançamento (incluindo formas como `N de M` e `(Parcela N de M)`), permitir ao usuário confirmar ou desativar o modo parcelado por linha, e ao salvar em lote SHALL enviar payload de parcelamento que cria as parcelas restantes **incluindo a atual** (`installmentCount = total - current + 1`), com valor e primeiro vencimento da linha, desde que a API aceite o contrato de installment no batch.

#### Scenario: Detectar parcela após o parse
- **WHEN** o parse retorna um lançamento cuja descrição contém parcela válida (ex.: `(Parcela 05 de 10)` com current menor que total)
- **THEN** o frontend marca a linha como candidata a parcelamento
- **AND** exibe indicação do intervalo restante (ex.: 5/10 até 10/10)

#### Scenario: Usuário desativa parcelamento na linha
- **WHEN** a linha foi detectada como parcela e o usuário desativa o modo parcelado
- **THEN** o frontend trata a linha como lançamento avulso no salvamento
- **AND** NÃO envia objeto `installment` para essa linha

#### Scenario: Salvar linha com parcelas restantes
- **WHEN** o usuário salva uma linha selecionada com modo parcelado ativo, current=5 e total=10
- **THEN** o frontend envia no batch um item com `installment` cuja quantidade de parcelas criadas corresponde a 6 (da 5 à 10)
- **AND** usa o `amount` da linha como valor de cada parcela
- **AND** usa o `dueDate` da linha como primeiro vencimento da série restante

#### Scenario: Última parcela não gera série
- **WHEN** a descrição indica current igual a total (ex.: `10 de 10`)
- **THEN** o frontend NÃO ativa modo parcelado por padrão
- **AND** salva como lançamento avulso se o usuário não configurar outro modo

### Requirement: Marcar lançamento importado como recorrente
O frontend SHALL permitir marcar uma linha da grade como recorrente antes do salvamento; ao salvar, SHALL enviar `recurrence` no item do batch com defaults mensais (`MONTHLY`, `intervalCount` 1, `nextOccurrenceDate` derivado do vencimento da linha) quando a API aceitar recurrence no batch.

#### Scenario: Ativar recorrência na linha
- **WHEN** o usuário marca uma linha como recorrente
- **THEN** o frontend registra o modo recorrente nessa linha
- **AND** se a linha estava em modo parcelado, desativa o parcelamento dessa linha

#### Scenario: Salvar linha recorrente
- **WHEN** o usuário salva uma linha selecionada marcada como recorrente
- **THEN** o frontend envia no batch um item com objeto `recurrence` (frequência mensal, intervalo 1, próxima ocorrência baseada no `dueDate` da linha)
- **AND** NÃO envia objeto `installment` para essa linha

#### Scenario: Conflito parcela e recorrência
- **WHEN** o usuário tenta manter parcelado e recorrente ativos na mesma linha
- **THEN** o frontend impede o estado inválido (apenas um dos modos ativo)
- **AND** NÃO envia `installment` e `recurrence` juntos no mesmo item

## MODIFIED Requirements

### Requirement: Revisão estilo planilha dos lançamentos detectados
O frontend SHALL exibir os lançamentos retornados pelo parse em uma grade editável onde o usuário pode alterar descrição, valor e tags por linha, editar datas individualmente, e controlar por linha se o lançamento será salvo como avulso, parcelado (quando aplicável) ou recorrente.

#### Scenario: Editar campos de uma linha
- **WHEN** o usuário altera descrição, valor ou tags de um lançamento na grade
- **THEN** o frontend atualiza o estado local dessa linha
- **AND** NÃO persiste ainda na API

#### Scenario: Editar data individual
- **WHEN** o usuário altera `transactionDate` ou `dueDate` de uma linha
- **THEN** o frontend atualiza apenas essa linha

#### Scenario: Alterar modo da linha
- **WHEN** o usuário altera o modo de uma linha entre avulso, parcelado e recorrente (conforme opções disponíveis)
- **THEN** o frontend atualiza o estado local dessa linha
- **AND** NÃO persiste ainda na API
