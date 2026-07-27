## ADDED Requirements

### Requirement: Usuário inicia importação de fatura no Meu mês
O frontend SHALL oferecer uma ação “Importar fatura” acessível a partir do hero de Meu mês (junto ao fluxo de nova transação) que abre o fluxo de importação em lote sem navegar para `/transactions/new`.

#### Scenario: Abrir importação pelo hero
- **WHEN** o usuário autenticado aciona “Importar fatura” no Meu mês
- **THEN** o frontend abre o fluxo de importação (Drawer ou wizard equivalente)
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

### Requirement: Revisão estilo planilha dos lançamentos detectados
O frontend SHALL exibir os lançamentos retornados pelo parse em uma grade editável onde o usuário pode alterar descrição, valor e tags por linha, e editar datas individualmente.

#### Scenario: Editar campos de uma linha
- **WHEN** o usuário altera descrição, valor ou tags de um lançamento na grade
- **THEN** o frontend atualiza o estado local dessa linha
- **AND** NÃO persiste ainda na API

#### Scenario: Editar data individual
- **WHEN** o usuário altera `transactionDate` ou `dueDate` de uma linha
- **THEN** o frontend atualiza apenas essa linha

### Requirement: Aplicação em massa de datas de referência
O frontend SHALL disponibilizar campos de referência para data da transação e vencimento e permitir aplicá-los de uma vez às linhas-alvo (linhas selecionadas, ou todas se nenhuma estiver selecionada).

#### Scenario: Aplicar vencimento às selecionadas
- **WHEN** o usuário define uma data de referência de vencimento e há linhas selecionadas
- **THEN** ao confirmar a aplicação, o frontend atualiza `dueDate` de todas as linhas selecionadas

#### Scenario: Aplicar data da transação a todas
- **WHEN** o usuário define uma data de referência de transação e não há linhas selecionadas
- **THEN** ao confirmar a aplicação, o frontend atualiza `transactionDate` de todas as linhas da grade

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
- **WHEN** o usuário tenta salvar sem nenhuma linha selecionada
- **THEN** o frontend impede o envio e informa que é necessário selecionar ao menos uma

### Requirement: Conclusão do lote e atualização do Meu mês
Após o batch create, o frontend SHALL informar o resultado, fechar ou resetar o fluxo de importação em caso de sucesso total (ou parcial conforme relatório), e atualizar as listas/hero do mês.

#### Scenario: Lote criado com sucesso
- **WHEN** a API cria as transações solicitadas
- **THEN** o frontend exibe feedback de sucesso com a quantidade criada
- **AND** invalida/atualiza os dados do Meu mês (extract/listas/hero)

#### Scenario: Falhas parciais
- **WHEN** a API retorna relatório com falhas em alguns índices
- **THEN** o frontend exibe resumo do que foi criado e do que falhou
- **AND** permite ao usuário corrigir e tentar novamente as linhas com falha
