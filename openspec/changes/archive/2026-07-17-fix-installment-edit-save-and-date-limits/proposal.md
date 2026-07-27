## Why

Ao editar um parcelamento com impacto estrutural (ex.: reduzir de 10 para 5 parcelas e alterar o valor), o alerta de impacto aparece, mas clicar em **Salvar alterações** não conclui o fluxo — o usuário fica sem feedback e sem persistência. Além disso, no cadastro e na edição de transações avulsas, as datas de transação e de pagamento aceitam datas futuras, o que não deve ser permitido.

## What Changes

- Corrigir o fluxo de confirmação/salvamento na edição de grupo de parcelamento para que, após o alerta de impacto e a confirmação, o `PUT` do grupo seja de fato enviado e o Drawer feche com sucesso (ou mostre erro).
- Restringir, no formulário de transação avulsa (criar e editar), os DatePickers de **Data da transação** e **Pagamento** para aceitar apenas datas `<= hoje`, desabilitando no calendário as datas futuras.
- Manter vencimento (`dueDate`) e datas de parcelamento/recorrência sem essa restrição (fora do escopo do bug reportado).

## Capabilities

### New Capabilities

<!-- Nenhuma — mudanças em comportamento já coberto por transaction-management -->

### Modified Capabilities

- `transaction-management`: salvar edição de parcelamento com impacto estrutural deve completar confirmação + persistência; datas de transação e pagamento em avulsa limitadas a `<= hoje` no DatePicker.

## Impact

- Frontend: `InstallmentGroupEditForm`, `TransactionFormDrawer` (confirmação Modal × Drawer), `TransactionForm` (DatePicker `disabledDate`).
- Testes: cenários de edição de parcelamento com confirmação e restrição de datas em avulsa.
- Sem mudança de contrato de API; backend já espera datas válidas no update de grupo e no upsert de avulsa.
