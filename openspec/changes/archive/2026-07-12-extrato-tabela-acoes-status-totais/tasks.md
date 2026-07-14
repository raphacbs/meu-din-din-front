## 1. Cores de status e totais

- [x] 1.1 Ajustar mapeamento de cores em `TransactionStatusBadge` / `lib/format/status.ts` para cores distintas por status (`A_VENCER`, `VENCE_HOJE`, `ATRASADA`, `PAGO`, `PAGO_COM_ATRASO`, `CANCELADA`)
- [x] 1.2 Criar helper `lib/transactions/totals.ts` (ou equivalente) que calcula despesas, receitas e saldo excluindo `CANCELADA`
- [x] 1.3 Cobrir cores e totais com testes unitários

## 2. Ações de linha (pagar e anexar)

- [x] 2.1 Extrair/criar componente de ações em ícone (Pagar + Anexar) reutilizável na tabela e na lista mobile
- [x] 2.2 Implementar fluxo Pagar com confirmação obrigatória: ícone → `Modal.confirm` → só no OK dispara `PUT` com `paymentDate` = hoje a partir da `TransactionResponse` → invalidar queries; cancelar não altera nada
- [x] 2.3 Ocultar Pagar quando status for `PAGO`, `PAGO_COM_ATRASO` ou `CANCELADA`
- [x] 2.4 Implementar Modal de anexar comprovante reutilizando formulário de metadados de `TransactionAttachments`
- [x] 2.5 Integrar coluna/ações em `TransactionList` (desktop) e ações no item mobile

## 3. Rodapé de totais no extrato

- [x] 3.1 Adicionar `Table.summary` com Despesas, Receitas e Saldo no desktop
- [x] 3.2 Exibir o mesmo resumo abaixo da `List` no mobile
- [x] 3.3 Garantir formatação monetária consistente e labels claros

## 4. Testes e verificação

- [x] 4.1 Atualizar/criar testes de `TransactionList` / `ExtractView` para ações, confirmação de pagamento (abrir modal / cancelar / confirmar), ocultação de Pagar e totais
- [x] 4.2 Verificar regressão visual: tags coloridas, ícones com tooltip/`aria-label`, rodapé no período filtrado
