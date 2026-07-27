## 1. Client API

- [x] 1.1 Tipar request/response de `batch/settle` e `batch/delete` em `lib/api/transactions.ts` (ou tipos adjacentes)
- [x] 1.2 Implementar `settleBatch({ ids, paymentDate })` apontando para `POST /api/transactions/batch/settle`
- [x] 1.3 Implementar `deleteBatch({ items })` apontando para `POST /api/transactions/batch/delete`
- [x] 1.4 Tratar erro de lote inteiro (4xx/rede) vs resposta 200 com `failures` parciais

## 2. Seleção nas listas

- [x] 2.1 Habilitar `rowSelection` nas tabelas Pendentes e Liquidados em `meu-mes-transaction-lists`
- [x] 2.2 Elevar estado de seleção para `meu-mes-view` (ou hook dedicado) e limpar ao trocar mês / após lote
- [x] 2.3 Respeitar gate de mês passado na elegibilidade visual (checkbox desabilitado ou exclusão da ação)

## 3. Barra e fluxos em lote

- [x] 3.1 Criar barra/toolbar de bulk actions visível quando houver seleção
- [x] 3.2 Ação liquidar: filtrar pendentes elegíveis, copy Quitar/Receber/Liquidar, modal de confirmação, chamar `settleBatch` com `paymentDate` de hoje
- [x] 3.3 Ação excluir: montar `scope` (`SINGLE` | `INSTALLMENT_GROUP`), modal com aviso de parcelamento, chamar `deleteBatch`
- [x] 3.4 Após resposta: refetch extract, atualizar hero/listas, limpar seleção, feedback de sucessos/falhas
- [x] 3.5 Garantir que ações unitárias por linha continuam funcionando sem regressão

## 4. Verificação

- [x] 4.1 Testar manualmente: liquidar N pendentes; excluir mix avulsa + parcela; seleção limpa na troca de mês
- [x] 4.2 Verificar comportamento com gate de mês passado ativo
- [x] 4.3 Verificar empty state / seleção só de liquidados (sem ação de liquidar)
