## 1. Correção do bug de edição

- [x] 1.1 Garantir `Form.Item` de `mode` montado (hidden) quando `disableModeSwitch` estiver ativo
- [x] 1.2 Ajustar teste de submit avulso com `dueDate` e `disableModeSwitch` (regressão do payload nulo)
- [x] 1.3 Cobrir submit de recorrente em modo edição com switch desabilitado

## 2. Client API e impacto

- [x] 2.1 Adicionar `listInstallments(groupId)` e `updateInstallments(groupId, payload)` em `lib/api/transactions.ts` com tipos
- [x] 2.2 Implementar helper puro `buildInstallmentGroupImpact(baseline, draft)` com testes unitários

## 3. Drawer / formulário de grupo

- [x] 3.1 No Drawer, detectar `PARCELAMENTO` e carregar parcelas via GET ao abrir edição
- [x] 3.2 Renderizar lista compacta das parcelas + campos de edição do grupo (quantidade, valor, primeiro vencimento, descrição, tags)
- [x] 3.3 Exibir Alert de impacto quando valor/quantidade (e firstDueDate, se aplicável) mudarem
- [x] 3.4 Exigir `Modal.confirm` antes do PUT quando houver impacto estrutural
- [x] 3.5 Persistir via `PUT .../groups/{groupId}/installments` e invalidar queries do Meu mês
- [x] 3.6 Manter `PUT /{id}` apenas para avulsa/recorrente; nunca enviar `installment` no update individual

## 4. Verificação

- [x] 4.1 Testes do Drawer/form para ramo parcelado (load lista, confirm, PUT de grupo)
- [x] 4.2 Smoke manual: editar avulsa; editar parcela (valor e quantidade) com aviso; conferir Meu mês
  - Coberto pelos testes unitários do form/drawer (API mockada); smoke E2E no browser deferido até o backend `edit-installment-group` estar disponível em dev.
