# invoice-import

## Purpose

Fluxo de importação de fatura de cartão (PDF) no Meu mês: wizard em três passos (arquivo, configurar, revisão), tags em lote, parcelamento a partir da descrição e opção de recorrência no batch.

## Requirements

### Requirement: Usuário inicia importação de fatura no Meu mês
O frontend SHALL oferecer uma ação “Importar fatura” acessível a partir do hero de Meu mês (junto ao fluxo de nova transação) que abre o fluxo de importação em lote sem navegar para `/transactions/new`.

#### Scenario: Abrir importação pelo hero
- **WHEN** o usuário autenticado aciona “Importar fatura” no Meu mês
- **THEN** o frontend abre o fluxo de importação em wizard (Modal)
- **AND** NÃO abre o formulário unitário de nova transação

### Requirement: Upload de PDF e seleção de banco
O frontend SHALL permitir selecionar um arquivo PDF da fatura e um banco suportado (na v1, Banco Inter) antes de solicitar a leitura na API.

#### Scenario: Enviar para leitura
- **WHEN** o usuário seleciona um PDF válido, escolhe o banco Inter e confirma a leitura
- **THEN** o frontend envia o arquivo e o banco ao endpoint de parse da API via multipart
- **AND** exibe estado de carregamento até a resposta

#### Scenario: Validação local antes do parse
- **WHEN** o usuário tenta ler a fatura sem arquivo ou sem banco selecionado
- **THEN** o frontend impede o envio e exibe feedback de validação

#### Scenario: Erro de parse
- **WHEN** a API retorna erro ou lista vazia não utilizável
- **THEN** o frontend exibe mensagem clara de falha na leitura
- **AND** permanece no passo de upload para nova tentativa

### Requirement: Wizard de importação em três passos
O frontend SHALL conduzir a importação em três passos sequenciais: (1) seleção do arquivo PDF e banco, (2) seleção e configuração das transações detectadas, (3) revisão final antes do salvamento.

#### Scenario: Avançar do arquivo para configurar
- **WHEN** o parse retorna lançamentos utilizáveis
- **THEN** o frontend avança para o passo de configurar com a grade editável
- **AND** mantém o passo de arquivo acessível via voltar

#### Scenario: Avançar de configurar para revisão
- **WHEN** o usuário seleciona ao menos uma linha válida e confirma revisão
- **THEN** o frontend exibe o passo de revisão apenas com as linhas selecionadas
- **AND** permite voltar para ajustar configurações

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

### Requirement: Aplicação em massa de datas de referência
O frontend SHALL disponibilizar campos de referência para data da transação e vencimento e permitir aplicá-los de uma vez às linhas-alvo (linhas selecionadas, ou todas se nenhuma estiver selecionada).

#### Scenario: Aplicar vencimento às selecionadas
- **WHEN** o usuário define uma data de referência de vencimento e há linhas selecionadas
- **THEN** ao confirmar a aplicação, o frontend atualiza `dueDate` de todas as linhas selecionadas

#### Scenario: Aplicar data da transação a todas
- **WHEN** o usuário define uma data de referência de transação e não há linhas selecionadas
- **THEN** ao confirmar a aplicação, o frontend atualiza `transactionDate` de todas as linhas da grade

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
O frontend SHALL detectar padrões de parcela na descrição do lançamento (incluindo formas como `N de M` e `(Parcela N de M)`), permitir ao usuário confirmar ou desativar o modo parcelado por linha, e ao salvar em lote SHALL enviar payload de parcelamento que cria as parcelas restantes **incluindo a atual** (`installmentCount = total - current + 1`), com valor e primeiro vencimento da linha.

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
O frontend SHALL permitir marcar uma linha da grade como recorrente antes do salvamento; ao salvar, SHALL enviar `recurrence` no item do batch com defaults mensais (`MONTHLY`, `intervalCount` 1, `nextOccurrenceDate` derivado do vencimento da linha).

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

### Requirement: Seleção de linhas para salvamento
O frontend SHALL permitir marcar e desmarcar cada lançamento; apenas as linhas selecionadas MUST ser enviadas no batch create.

#### Scenario: Default selecionado após parse
- **WHEN** o parse retorna lançamentos
- **THEN** as linhas de débito (despesas) iniciam selecionadas
- **AND** linhas de crédito/pagamento (quando identificadas pela API) iniciam desmarcadas

#### Scenario: Salvar somente selecionadas
- **WHEN** o usuário desmarca parte das linhas e confirma o salvamento
- **THEN** o frontend envia ao endpoint de batch apenas as linhas ainda selecionadas

#### Scenario: Nenhuma linha selecionada
- **WHEN** o usuário tenta avançar para revisão ou salvar sem nenhuma linha selecionada
- **THEN** o frontend impede o envio e informa que é necessário selecionar ao menos uma

### Requirement: Conclusão do lote e atualização do Meu mês
Após o batch create, o frontend SHALL informar o resultado, fechar o fluxo de importação em caso de sucesso total (ou parcial conforme relatório), retornar o usuário à tela Meu mês e atualizar as listas/hero do mês.

#### Scenario: Lote criado com sucesso
- **WHEN** a API cria as transações solicitadas
- **THEN** o frontend exibe feedback de sucesso com a quantidade criada
- **AND** fecha o wizard de importação
- **AND** invalida/atualiza os dados do Meu mês (extract/listas/hero)

#### Scenario: Falhas parciais
- **WHEN** a API retorna relatório com falhas em alguns índices
- **THEN** o frontend exibe resumo do que foi criado e do que falhou
- **AND** retorna ao passo de configurar com as linhas com falha para correção e nova tentativa
