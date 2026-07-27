## 1. Cliente API

- [x] 1.1 Ajustar `apiFetch` (ou helper dedicado) para aceitar `FormData` sem forçar `Content-Type: application/json`
- [x] 1.2 Criar funções `parseInvoice({ file, bank })` e `createBatch(items)` tipadas conforme contrato da API
- [x] 1.3 Tipar lançamento importado e relatório de batch (created/failures)

## 2. Entrada no Meu mês

- [x] 2.1 Adicionar ação “Importar fatura” no hero (Dropdown/menu junto a “Nova transação”)
- [x] 2.2 Abrir fluxo de importação sem abrir o Drawer unitário de nova transação

## 3. Passo de upload

- [x] 3.1 UI de seleção de PDF + Select de banco (Inter na v1) com validação local
- [x] 3.2 Chamar parse com loading/erro e avançar para revisão quando houver lançamentos

## 4. Grade de revisão

- [x] 4.1 Renderizar Table editável (descrição, valor, tags via `TagSelect`, datas)
- [x] 4.2 Implementar `rowSelection` com todas as linhas selecionadas por padrão
- [x] 4.3 Campos de referência de `transactionDate`/`dueDate` com aplicar às selecionadas (ou a todas se nenhuma selecionada)
- [x] 4.4 Impedir salvar com zero linhas selecionadas

## 5. Salvamento e feedback

- [x] 5.1 Enviar apenas linhas selecionadas ao batch create
- [x] 5.2 Tratar sucesso total e falhas parciais com mensagens claras
- [x] 5.3 Invalidar queries do Meu mês (extract/listas/hero) após criações
- [x] 5.4 Fechar/resetar o fluxo de importação após sucesso adequado

## 6. Testes

- [x] 6.1 Testes do fluxo de abertura pelo hero e validação do upload
- [x] 6.2 Testes da grade: edição, seleção, apply de datas e payload do batch
