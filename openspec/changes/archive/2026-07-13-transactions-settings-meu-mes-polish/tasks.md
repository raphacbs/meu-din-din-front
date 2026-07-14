## 1. Preferências via API

- [x] 1.1 Criar client API (`GET`/`PUT /api/users/me/preferences`) e tipos TypeScript
- [x] 1.2 Hidratar o store de preferências com o valor do servidor após autenticação (servidor como fonte da verdade)
- [x] 1.3 Fazer a tela de Configurações persistir via `PUT` e remover a dependência de `localStorage` como fonte da verdade
- [x] 1.4 Atualizar testes de preferências/gates conforme o novo fluxo

## 2. Vencimento obrigatório no formulário

- [x] 2.1 Exigir `dueDate` no modo avulso e recorrente (Ant Design + `validateTransactionForm`) para `DESPESA` e `RECEITA`
- [x] 2.2 Manter modo parcelado exigindo apenas `firstDueDate`
- [x] 2.3 Ajustar tipos/payload para não enviar avulso sem vencimento
- [x] 2.4 Atualizar testes do formulário

## 3. Exclusão de parcelamento no Meu mês

- [x] 3.1 Em `transaction-row-actions`, detectar `group.type === "PARCELAMENTO"` e chamar `deleteInstallments(groupId)`
- [x] 3.2 Modal de confirmação avisando que todas as parcelas (inclusive anteriores/pagas) serão removidas, sem opção “só esta”
- [x] 3.3 Preservar fluxos de exclusão avulsa e recorrência (“só esta” / “esta e futuras”)

## 4. Somatório por tags no hero

- [x] 4.1 Calcular shares com `calculateTagShares` a partir do extract do mês
- [x] 4.2 Renderizar lista compacta tag → total abaixo da barra de liquidados em `MeuMesHero` (ou imediatamente abaixo no `meu-mes-view`)
- [x] 4.3 Tratar “Sem tag” e mês sem transações ativas conforme a spec

## 5. Cores de status

- [x] 5.1 Alterar `getTransactionStatusColor` para `PAGO_COM_ATRASO` usar vermelho claro (distinto de `ATRASADA` e de `PAGO`)
- [x] 5.2 Atualizar testes em `format.test.ts` e alinhar copy da spec visual
