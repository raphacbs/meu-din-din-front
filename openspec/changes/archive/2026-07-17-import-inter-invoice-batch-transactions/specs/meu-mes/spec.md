## MODIFIED Requirements

### Requirement: Hero oferece criação de transação em Drawer
O frontend SHALL exibir no hero de Meu mês um botão “Nova transação” que abre um `antd Drawer` contendo o formulário de cadastro (`TransactionForm`). O hero SHALL também oferecer a ação “Importar fatura” para iniciar o fluxo de criação em lote a partir de PDF (capability `invoice-import`). Ao salvar com sucesso uma transação unitária, o Drawer SHALL fechar e o extract do mês SHALL ser atualizado.

#### Scenario: Abrir cadastro pelo hero
- **WHEN** o usuário aciona “Nova transação” no hero
- **THEN** o frontend abre um Drawer com o formulário de nova transação
- **AND** NÃO navega para `/transactions/new`

#### Scenario: Cadastro bem-sucedido
- **WHEN** o usuário submete um formulário válido no Drawer de criação
- **THEN** o frontend envia `POST /api/transactions`
- **AND** fecha o Drawer
- **AND** atualiza as listas e o hero do mês

#### Scenario: Abrir importação de fatura pelo hero
- **WHEN** o usuário aciona “Importar fatura” no hero
- **THEN** o frontend abre o fluxo de importação em lote
- **AND** NÃO abre o formulário unitário de nova transação
