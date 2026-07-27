## Why

Lançar cada item da fatura do cartão um a um no Meu mês é trabalhoso. O usuário precisa de um fluxo de importação: enviar o PDF, revisar os lançamentos detectados em uma grade editável (estilo planilha) e salvar só as linhas que escolher.

## What Changes

- Entrada de menu/ação de **Importar fatura** no hub Meu mês (junto ao fluxo de nova transação), abrindo o fluxo de importação em lote.
- Passo 1: selecionar arquivo PDF da fatura e o banco correspondente (v1: Inter; no futuro o banco poderá ser inferido por IA e o seletor poderá sumir).
- Passo 2: após o parse na API, exibir grade editável com todos os lançamentos detectados — editar descrição, valor e tags por linha; datas editáveis individualmente e em massa via campos de referência (ex.: aplicar `transactionDate` / `dueDate` a todas as linhas selecionadas ou a todas).
- Seleção por linha (checkbox): o usuário marca/desmarca quais transações serão salvas no lote.
- Enviar apenas as linhas selecionadas ao endpoint de criação em lote; invalidar queries de transações/projeção e feedback de sucesso/erro.
- Depende da change de API homônima em `meu-din-din` (parse PDF + batch create).

## Capabilities

### New Capabilities

- `invoice-import`: UI de importação de fatura (upload + banco, revisão estilo planilha, seleção de linhas e salvamento em lote).

### Modified Capabilities

- `meu-mes`: incluir ação/menu de importação de fatura no hub de criação de transações.

## Impact

- Frontend: novos componentes/fluxo de importação; cliente API multipart para parse e JSON para batch; reutilizar `TagSelect` e padrões de Drawer/tabela do Meu mês.
- API client: suporte a `FormData` sem forçar `Content-Type: application/json`.
- Sem mudança no formulário unitário de transação além da entrada de menu.
- Backend: change separada `import-inter-invoice-batch-transactions` no repositório da API.
