## Context

O Meu mês é o fluxo operacional principal, mas várias regras de produto ainda estão incompletas no frontend: formulário não exige vencimento no modo avulso; exclusão de parcela chama `DELETE /{id}` em vez do endpoint de grupo; Configurações usam Zustand + `localStorage` enquanto a API `GET`/`PUT /api/users/me/preferences` já existe; o hero não mostra totais por tag; `PAGO_COM_ATRASO` usa `cyan`.

## Goals / Non-Goals

**Goals:**

- Validar `dueDate` obrigatório em create/edit (avulso e recorrente); parcelado via `firstDueDate`.
- Excluir parcelamento inteiro a partir de qualquer parcela no Meu mês, com aviso explícito.
- Sincronizar preferências com a API (fonte da verdade no servidor).
- Lista compacta de somatório por tag abaixo da barra de liquidados no hero.
- Cor de `PAGO_COM_ATRASO` = vermelho claro.

**Non-Goals:**

- Reintroduzir pizza/segmentado de tags no Meu mês.
- Oferecer “excluir só esta parcela”.
- Gate de meses passados no backend.
- Alterar cálculo de Previsto/Realizado.

## Decisions

1. **Vencimento no form**  
   - `required` no Ant Design + `validateTransactionForm` para avulso e recorrente (DESPESA e RECEITA).  
   - Modo installment: continua exigindo só `firstDueDate`.

2. **Exclusão de PARCELAMENTO**  
   - Se `group.type === "PARCELAMENTO"`, modal único aviso (“todas as N parcelas, inclusive anteriores/pagas”) → `deleteInstallments(groupId)`.  
   - Sem escopo “só esta”. Recorrência mantém “só esta / esta e futuras”.

3. **Preferências**  
   - Client `lib/api/users.ts` (ou `preferences.ts`) para GET/PUT.  
   - No bootstrap autenticado: GET hidrata o store; toggle faz PUT e atualiza store.  
   - `localStorage` pode espelhar cache, mas servidor vence no load. Migrar valor local só se o servidor ainda estiver no default e o local for diferente — preferência simples: **servidor sempre vence** após login; documentar na UI se necessário.

4. **Totais por tag**  
   - Reusar `calculateTagShares` sobre o extract do mês (não canceladas).  
   - UI: lista compacta `tag → valor` abaixo do Progress no hero (não pizza).  
   - Transações sem tag agregam em “Sem tag” (comportamento atual do helper).

5. **Cor PAGO_COM_ATRASO**  
   - Trocar preset `cyan` por cor custom vermelho claro (ex. `#f87171` ou token CSS), distinta de `error` de `ATRASADA`.

## Risks / Trade-offs

- [Backend ainda permite RECEITA sem dueDate até deploy irmão] → Mitigação: front valida cedo; alinhar deploys.
- [Usuário perde preferência local ao sincronizar] → Mitigação: servidor é a fonte; default `true` no back cobre quem nunca salvou.
- [Tag em múltiplas tags “duplica” valor no somatório] → Mitigação: aceitar comportamento atual de `calculateTagShares` (mesmo valor entra em cada tag).

## Migration Plan

1. Implementar client + sync de preferências.
2. Form dueDate + exclusão de parcelamento.
3. Lista de tags no hero + cor de status.
4. Testes unitários dos helpers/form/status e smoke manual no Meu mês.

Rollback: reverter commits do change; preferências voltam ao local-only se necessário.

## Open Questions

- Nenhum bloqueante; tom exato do vermelho claro pode ser ajustado na implementação visual.
