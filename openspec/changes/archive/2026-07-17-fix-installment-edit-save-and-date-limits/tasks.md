## 1. Correção do save do parcelamento

- [x] 1.1 Diagnosticar o fluxo `Salvar alterações` → `confirmStructuralImpact` → `updateInstallments` (Modal atrás do Drawer, Promise ou validação silenciosa)
- [x] 1.2 Corrigir a confirmação para ficar visível/acionável sobre o Drawer (`zIndex` / `App.useApp().modal`) e resolver a Promise de forma estável no OK/Cancelar
- [x] 1.3 Garantir que, após confirmar impacto (quantidade e/ou valor), o `PUT /api/transactions/groups/{groupId}/installments` seja chamado e erros continuem no Alert do formulário

## 2. Limite de datas na transação avulsa

- [x] 2.1 Em `TransactionForm`, aplicar `disabledDate` (datas `> hoje` desabilitadas) nos DatePickers de **Data da transação** e **Pagamento** no modo avulsa (criar e editar)
- [x] 2.2 Confirmar que **Vencimento** e datas de parcelamento/recorrência não recebem essa restrição

## 3. Testes e verificação

- [x] 3.1 Atualizar/adicionar teste cobrindo confirmação + chamada de `updateInstallments` ao reduzir parcelas e alterar valor
- [x] 3.2 Adicionar ou ajustar teste assegurando `disabledDate` (ou comportamento equivalente) em data da transação e pagamento na avulsa
- [x] 3.3 Smoke manual: editar parcelamento 10→5 + valor → Alert → confirmar → salvar; criar/editar avulsa e tentar selecionar data futura
