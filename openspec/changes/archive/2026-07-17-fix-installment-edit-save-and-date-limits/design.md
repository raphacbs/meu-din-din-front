## Context

A edição de grupo `PARCELAMENTO` já existe: `InstallmentGroupEditForm` calcula impacto via `buildInstallmentGroupImpact`, mostra `Alert` no formulário e, no submit, chama `onConfirmStructuralImpact` (`Modal.confirm` no `TransactionFormDrawer`) antes do `PUT /api/transactions/groups/{groupId}/installments`.

Na prática, após alterar quantidade/valor (Alert visível), **Salvar alterações** não completa o fluxo — sintoma clássico de `Modal.confirm` competindo com `Drawer` (z-index/foco) ou de Promise de confirmação que não resolve de forma confiável, impedindo o `mutateAsync`.

No formulário avulso (`TransactionForm`), os DatePickers de **Data da transação** e **Pagamento** não restringem datas futuras.

## Goals / Non-Goals

**Goals:**

- Garantir que confirmação de impacto estrutural seja visível e utilizável sobre o Drawer, e que o OK dispare o PUT do grupo.
- Impedir seleção de datas futuras em `transactionDate` e `paymentDate` no modo avulsa (criar e editar), via `disabledDate` no DatePicker.
- Cobrir com testes os dois comportamentos.

**Non-Goals:**

- Alterar regras de `dueDate`, primeiro vencimento de parcelas ou datas de recorrência.
- Mudar contrato da API ou regras de negócio do backend.
- Refatorar o formulário de parcelamento além do necessário para o save.

## Decisions

### 1. Confirmação de impacto: Modal acima do Drawer e Promise estável

- **Decisão:** Ajustar `confirmStructuralImpact` para o Modal ficar acima do Drawer (`zIndex` maior que o do Drawer, tipicamente ≥ 1100) e garantir resolução única da Promise (`onOk` → `true`, `onCancel`/fechamento → `false`), preferindo o padrão `App.useApp().modal` se o app já tiver `App` provider; senão, `Modal.confirm` com `zIndex` explícito.
- **Por quê:** Drawer e Modal do antd compartilham z-index padrão (~1000); o confirm pode abrir “invisível” atrás do Drawer — o usuário clica Salvar e “nada acontece”.
- **Alternativas:** renderizar confirmação dentro do Drawer (`getContainer`); trocar Modal por Popconfirm no botão. Preferimos Modal global com z-index/App porque o copy de impacto já é multi-linha e o padrão do projeto usa `Modal.confirm`.

### 2. Após confirmar, sempre tentar o PUT e expor erro

- **Decisão:** Manter o fluxo Alert (informativo) → Modal (bloqueante) → `updateInstallmentsMutation.mutateAsync`; em falha, Alert de erro no formulário (já existente).
- **Por quê:** O requisito atual já descreve esse fluxo; o bug é de execução/UI, não de regra.

### 3. Limite `<= hoje` só em data da transação e pagamento (avulsa)

- **Decisão:** Em `TransactionForm`, no modo `single` (e nos mesmos campos quando visíveis na edição avulsa), passar `disabledDate` que retorna `true` para `current.isAfter(dayjs(), 'day')` em `transactionDate` e `paymentDate`. Comparar por dia civil (não por hora).
- **Por quê:** Alinha ao pedido do usuário sem restringir vencimentos futuros legítimos.
- **Alternativas:** validação só no submit — pior UX; restrição também em create installment `transactionDate` — fora do escopo reportado (só avulsa).

### 4. Validação defensiva opcional no submit

- **Decisão:** Se couber sem escopo extra, rejeitar no submit datas futuras nos mesmos campos (mensagem clara). Prioridade é o DatePicker; regra de formulário é reforço.
- **Por quê:** Digitação manual / colagem ainda pode burlar só o calendário em alguns casos.

## Risks / Trade-offs

- **[Risco]** z-index fixo pode colidir com outros overlays → **Mitigação:** usar valor acima do Drawer do formulário; validar visualmente no Meu mês.
- **[Risco]** `App.useApp()` exige provider `App` → **Mitigação:** verificar layout; fallback `Modal.confirm` + `zIndex`.
- **[Risco]** Transações legadas com `paymentDate` futura na edição → **Mitigação:** `disabledDate` não remove valor já setado; se necessário, permitir exibir o valor atual mas bloquear novas escolhas futuras (comportamento padrão antd).

## Migration Plan

- Deploy só frontend; sem migração de dados.
- Rollback: reverter o PR.

## Open Questions

- Nenhuma bloqueante: se o Modal estiver visível e o PUT falhar, o Alert de erro já cobre; investigar na implementação se há segundo fator (validação silenciosa do Form) e, se houver, adicionar `onFinishFailed` com feedback.
