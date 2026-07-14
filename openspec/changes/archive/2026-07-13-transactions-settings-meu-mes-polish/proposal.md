## Why

Várias lacunas do Meu mês e das configurações já têm suporte parcial no código ou no backend, mas a UX ainda diverge do produto desejado: vencimento opcional no formulário (enquanto a API rejeita despesa sem data), exclusão de parcela apagando só um item, preferências só em `localStorage`, hero sem totais por tag e cor errada para `PAGO_COM_ATRASO`.

## What Changes

- Tornar a data de vencimento **obrigatória** no formulário de criação e edição (modo avulso e recorrente; parcelado continua com `firstDueDate`), alinhado ao backend que passa a exigir também para `RECEITA`.
- Ao excluir uma transação de grupo `PARCELAMENTO` no Meu mês, chamar `DELETE /api/transactions/groups/{groupId}/installments` e avisar que **todas** as parcelas (incluindo anteriores/pagas) serão removidas — sem opção “só esta”.
- Integrar a tela de Configurações com `GET`/`PUT /api/users/me/preferences` (preferência `blockPastMonthMutations`), substituindo a persistência só-local como fonte da verdade.
- No hero do Meu mês, abaixo da barra de liquidados, exibir uma **lista compacta** de somatório por tag (cada tag com seu total).
- Ajustar cores de status: manter a vencer=azul, pago=verde, em atraso=vermelho, vence hoje=laranja; mudar **pago com atraso** de cyan para vermelho claro.

## Capabilities

### New Capabilities

<!-- nenhuma -->

### Modified Capabilities

- `transaction-management`: vencimento obrigatório no formulário; exclusão de parcelamento no fluxo principal com aviso e endpoint de grupo.
- `meu-mes`: lista de totais por tag abaixo do progresso de liquidados no hero.
- `user-settings`: sincronizar preferências com a API de preferências do usuário.
- `visual-component-system`: cor de `PAGO_COM_ATRASO` passa a vermelho claro (distinto de `ATRASADA` e de `PAGO`).

## Impact

- Form/drawer de transações, `transaction-row-actions`, client API de preferências, store Zustand, `meu-mes-hero` / `meu-mes-view`, `lib/format/status.ts`.
- Depende do backend `mandatory-transaction-due-date` para `RECEITA` com `dueDate` obrigatório; exclusão de grupo e preferências já existem na API.
- Dados antigos só em `localStorage` devem ser migrados ou sobrescritos pela preferência do servidor no primeiro load autenticado.
