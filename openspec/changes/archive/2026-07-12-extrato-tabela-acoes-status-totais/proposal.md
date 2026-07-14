## Why

A tabela do extrato hoje só lista dados: o usuário precisa abrir cada transação para pagar ou anexar comprovantes, e não enxerga de imediato o total do período filtrado. Tags de status já existem, mas a tela precisa reforçar a leitura visual por cor e expor ações rápidas com ícones direto na linha.

## What Changes

- Adicionar coluna de **ações** na tabela do extrato (e equivalentes no layout mobile) com ícones:
  - **Pagar**: disponível apenas quando a transação ainda não está paga (`PAGO` / `PAGO_COM_ATRASO`) nem cancelada; **exige confirmação** (`Modal.confirm`) antes de marcar pagamento com `paymentDate` = hoje via `PUT /api/transactions/{id}`
  - **Anexar comprovante**: abre fluxo para adicionar anexo (reutilizando o padrão de metadados de anexos já existente)
- Garantir que as **tags de status** usem cores distintas por status (A vencer, Vence hoje, Atrasada, Pago, Pago com atraso, Cancelada)
- Exibir **rodapé de totais** no extrato com soma de despesas, receitas e saldo (receitas − despesas) do período carregado
- Sem alteração de contrato de API no backend

## Capabilities

### New Capabilities

<!-- Nenhuma capability nova: o comportamento é extensão da gestão de transações / extrato. -->

### Modified Capabilities

- `transaction-management`: ações de pagar e anexar comprovante a partir da listagem/extrato; rodapé com totais de despesas, receitas e saldo do período
- `visual-component-system`: tags de status do extrato/listagem com cores semânticas explícitas por status

## Impact

- **UI**: `components/transactions/transaction-list.tsx`, `extract-view.tsx`, possivelmente `components/ui/transaction-data.tsx` e `lib/format/status.ts`
- **Ações**: novo fluxo de “pagar” (update com `paymentDate`) e modal/drawer de anexos a partir da linha; invalidação de queries de extrato/transações
- **Totais**: cálculo no front a partir das transações retornadas por `GET /api/transactions/extract` (excluir canceladas do saldo, se alinhado ao dashboard)
- **API**: reutiliza `PUT /api/transactions/{id}` e endpoints de attachments existentes — sem endpoints novos
- **Testes**: `extract-view.test.tsx`, `transaction-list` (se houver) e cobertura das novas ações/totais
