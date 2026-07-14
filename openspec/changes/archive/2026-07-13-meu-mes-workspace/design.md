## Context

A tela `/extract` (`ExtractView`) é um extrato consultivo: store de período com modos `month`/`custom`, botão Filtrar, lista única via `TransactionList`, totais agregados (previsto implícito) e ação genérica “Pagar”. O ritual desejado é operar o mês — liquidar pendências e ver saldo dual — como tela principal do produto.

Constraints: manter `GET /api/transactions/extract` e o fluxo de `PUT` de pagamento; não introduzir lib de motion no v1; custom period permanece no store para outros consumidores; design moderno obrigatório (skill `frontend-design`).

## Goals / Non-Goals

**Goals:**

- Workspace **Meu mês** em `/meu-mes` com redirect de `/extract`
- Só mês nesta UI, apply imediato
- Hero dual (Previsto principal, Realizado secundário) + progresso
- Duas listas ordenadas (Pendentes / Liquidados)
- Copy Quitar/Receber + animação CSS de liquidação com reduced-motion
- Specs e testes alinhados; superfície visual moderna

**Non-Goals:**

- Mudança de contrato da API de extract/pagamento
- Remover modo `custom` do `period-store` / spec global
- Framer-motion ou animação “linha voando” entre listas
- Reescrever cadastro/edição de transações ou dashboard completo (só links/nav se apontarem Extrato)

## Decisions

### 1. Rota `/meu-mes` + redirect

- **Escolha:** nova rota App Router `app/(app)/meu-mes`; `next.config` ou `redirects()` de `/extract` → `/meu-mes`; nav label “Meu mês”.
- **Alternativas:** manter `/extract` só com rename de copy (rejeitado — produto e URL desalinhados); slug `/month` (rejeitado — produto em pt-BR).

### 2. Componente e dados

- **Escolha:** renomear `ExtractView` → `MeuMesView` (ou equivalente); continuar `transactions.extract(from, to)` com intervalo do mês; query key pode migrar de `"extract"` → `"meu-mes"` sem mudar endpoint.
- **Alternativas:** endpoint novo no backend (fora de escopo).

### 3. Período só-mês neste consumidor

- **Escolha:** Meu mês não renderiza Switch/RangePicker/Filtrar; ao mudar mês (picker ou ◀ ▶), calcula range, `apply`, sync URL e refetch. Store ainda suporta `custom` para outras telas.
- **Alternativas:** deletar custom do store agora (rejeitado — “por enquanto só aqui”).

### 4. Totais dual

- **Previsto:** receitas − despesas de não-`CANCELADA` (comportamento atual de `calculatePeriodTotals`).
- **Realizado:** mesma fórmula só com status `PAGO` | `PAGO_COM_ATRASO`.
- Expor também contagem liquidados/total ativos e somas “ainda a pagar / a receber” para subtítulo do hero.
- **UI:** Previsto figura principal; Realizado secundário ao lado.

### 5. Duas listas + ordenação

- **Pendentes:** status ∉ {`PAGO`, `PAGO_COM_ATRASO`, `CANCELADA`}; ordem: `ATRASADA` → `VENCE_HOJE` → demais, desempate por `dueDate` asc (fallback `transactionDate`).
- **Liquidados:** `PAGO` | `PAGO_COM_ATRASO`; ordem por `paymentDate` desc (fallback data da transação).
- **Canceladas:** fora das duas listas (e fora dos totais, como hoje).

### 6. Quitar / Receber

- Mesmo `buildPayPayload` / `PUT`; labels, aria e modal: DESPESA → Quitar; RECEITA → Receber.

### 7. Animação de liquidação (CSS)

Após sucesso da mutation:

1. Linha em Pendentes: feedback ✓ + fade/slide out (~300–450ms)
2. Hero: Realizado/progresso atualizam com pulse leve
3. Item entra no topo de Liquidados (fade/slide in)

Sem lib nova. Com `prefers-reduced-motion: reduce`: pular motion, só invalidar query + toast.

### 8. Design visual

Hero dual como signature; listas e chrome do mês subordinados; tokens de marca; evitar look admin antd genérico.

## Risks / Trade-offs

- **[URL antiga em favoritos]** → Redirect `/extract` → `/meu-mes`
- **[Hydrate URL com range custom parcial]** → Nesta tela, se `from`/`to` não forem mês civil completo, normalizar para o mês de `from` (ou mês atual) e replace na URL — documentar no apply
- **[Animação vs refetch React Query]** → Manter item em estado local de “exiting” até fim da animação, depois invalidar; ou animar com dados otimistas — preferir otimista/local exit para não “piscar”
- **[Duplicação Table/List]** → Extrair row compartilhada; duas seções reutilizam o mesmo row renderer
- **[period-selection ainda fala em Filtrar]** → Delta: exceção explícita para consumidor Meu mês

## Migration Plan

1. Entregar `/meu-mes` + redirect antes de remover pasta `extract`
2. Atualizar nav e testes de rota
3. Rollback: reverter redirect e restaurar rota antiga se necessário (git revert do change)

## Open Questions

Nenhuma bloqueante — decisões de produto fechadas na exploração.
