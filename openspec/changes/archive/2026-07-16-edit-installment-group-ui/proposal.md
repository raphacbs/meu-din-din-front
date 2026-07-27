## Why

Editar qualquer transação no Meu mês falha com “Revise os valores informados antes de enviar.” porque o `mode` some do submit do antd quando o switch está desabilitado. Além disso, editar uma parcela precisa tratar o **grupo inteiro**: listar as parcelas, avisar o impacto de mudar valor/quantidade e persistir via os novos endpoints de grupo do backend (`edit-installment-group`).

## What Changes

- Corrigir o formulário de edição para preservar `mode` (e demais campos não montados) no submit — desbloqueia edição de avulsas e recorrentes.
- Ao editar transação com `group.type === PARCELAMENTO`, abrir fluxo de edição de **grupo**: carregar lista das parcelas, exibir no Drawer, e permitir editar valor/quantidade/primeiro vencimento/descrição/tags do parcelamento.
- Quando valor ou quantidade mudarem em relação ao estado carregado, exibir aviso explícito do impacto (todas as parcelas / cria ou remove no fim) antes de confirmar o save.
- Integrar `GET` e `PUT /api/transactions/groups/{groupId}/installments` no client API e no Drawer.
- Edição de avulsa/recorrência continua via `PUT /api/transactions/{id}` (sem bloco `installment`).

## Capabilities

### New Capabilities

- _(nenhuma)_

### Modified Capabilities

- `transaction-management`: corrigir submit de edição; fluxo dedicado de edição de grupo parcelado com impacto e endpoints de grupo.
- `meu-mes`: Drawer de edição de parcela abre visão de grupo (lista + aviso) em vez do form “installment create” atual.

## Impact

- `TransactionForm`, `TransactionFormDrawer`, helpers em `lib/transactions/form.ts`, `lib/api/transactions.ts`.
- Testes do form/drawer e smoke no Meu mês.
- Depende da API irmã `edit-installment-group` no backend (GET/PUT de installments do grupo). Front pode implementar contra mock/contrato até o back estar deployado.
