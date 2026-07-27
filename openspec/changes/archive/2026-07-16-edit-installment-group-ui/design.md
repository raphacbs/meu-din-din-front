## Context

No Meu mês, o Drawer de edição reutiliza o mesmo `TransactionForm` da criação com `disableModeSwitch`. O `Form.Item` de `mode` deixa de montar; o antd não inclui `mode` no `onFinish`; `buildTransactionPayload` cai no branch de recorrência e retorna `null` → mensagem genérica. Em paralelo, parcelas são mapeadas para `mode: "installment"` e o payload de create é inviável no `PUT /{id}`.

O backend `edit-installment-group` define `GET`/`PUT .../groups/{groupId}/installments` com impacto no grupo (valor em todas; quantidade no fim).

## Goals / Non-Goals

**Goals:**

- Corrigir submit de edição (avulsa/recorrente) preservando `mode`.
- Fluxo de edição de `PARCELAMENTO`: lista das parcelas + form de grupo + aviso de impacto + `PUT` de grupo.
- Client API tipado para os novos endpoints.
- Testes cobrindo o bug do `mode` e o ramo parcelado.

**Non-Goals:**

- Edição estrutural de recorrência (só ocorrência via `PUT /{id}`).
- Dry-run no backend; impacto calculado no client.
- Redesign visual amplo do Drawer além do necessário para lista + alerta.

## Decisions

### 1. Preservar `mode` com Form.Item oculto

Sempre montar `<Form.Item name="mode" hidden>` (ou `noStyle` + input hidden) mesmo com `disableModeSwitch`, para o antd registrar o campo no store/submit.

**Alternativa:** injetar `mode` de `initialValues` em `handleFinish`. Aceitável como reforço; o Form.Item oculto é a correção canônica do antd.

### 2. Bifurcar submit no Drawer por tipo de grupo

```
edit + group.PARCELAMENTO → GET installments → form de grupo → PUT group
edit + demais             → form single/recurring → PUT /{id}
create                    → inalterado (POST com mode)
```

Não reutilizar `buildTransactionPayload` com `mode: "installment"` no update.

### 3. UI do Drawer parcelado

- Título: “Editar parcelamento” (ou equivalente).
- Lista compacta das parcelas (nº, vencimento, valor, status) carregada do GET.
- Campos editáveis alinhados ao request de grupo: quantidade, valor da parcela, primeiro vencimento, descrição, tags.
- `Alert` de impacto quando `installmentAmount` ou `installmentCount` diferirem do snapshot inicial (e, se útil, quando `firstDueDate` mudar): copy clara de que o valor vale para **todas** as parcelas; aumento cria no fim; redução remove do fim (e pode falhar se houver liquidadas).
- Confirmação no save: se houver impacto, `Modal.confirm` antes do PUT; se só descrição/tags, submit direto.

### 4. Helper de impacto no client

Função pura `buildInstallmentGroupImpact(baseline, draft)` → mensagens/contagens para o Alert/Modal. Testável sem UI.

### 5. Dependência do backend

Contrato espelhado no `lib/api/transactions.ts`. Se a API ainda não estiver disponível em dev, os testes mockam o client; implementação de UI não bloqueia em código morto.

## Risks / Trade-offs

- [Backend ainda não deployado] → Mitigação: change front pronta; integração E2E após apply do back; mocks nos unit tests.
- [Usuário não lê o aviso e altera valor de parcelas pagas] → Mitigação: Modal.confirm obrigatório quando amount/count mudam.
- [Lista longa de parcelas] → Mitigação: lista scrollável compacta no Drawer; sem virtualização neste change.

## Migration Plan

- Ship front após (ou junto com) endpoints do back.
- Rollback: reverter Drawer/API client; bug do mode pode shipar isolado se necessário (mesmo PR preferível).

## Open Questions

- _(nenhuma bloqueante)_
