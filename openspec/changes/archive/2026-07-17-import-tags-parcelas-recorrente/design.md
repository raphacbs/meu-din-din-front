## Context

A importação de fatura (PDF Inter → parse → revisão em grade → `POST /api/transactions/import/batch`) já permite editar tags **por linha** e aplicar datas em massa, mas o batch sempre cria lançamentos **avulsos** (`installment=null`, `recurrence=null`). O parser preserva sufixos como `(Parcela 09 de 12)` na descrição sem estruturá-los. No domínio, `POST /api/transactions` já cria parcelamento (`installment`) e recorrência (`recurrence`), mas a série de parcelas sempre começa em `1..N` (sem `startingInstallmentNumber`).

Esta change evolui a tela de revisão e o contrato de batch (API em `meu-din-din`, coordenada) para tags em lote, parcelamento a partir da descrição e opção de recorrência.

## Goals / Non-Goals

**Goals:**

- Aplicar tags em lote às linhas selecionadas (ou a todas, se nenhuma selecionada), no mesmo padrão das datas de referência.
- Detectar padrão de parcela na descrição (`N de M`, `(Parcela NN de MM)`, variantes próximas) e, ao salvar, criar parcelamento com as **parcelas restantes incluindo a atual**.
- Permitir marcar linha como recorrente na revisão e enviar `recurrence` no batch.
- Impedir conflito parcelado × recorrente na mesma linha.
- Manter best-effort do batch e feedback parcial.

**Non-Goals:**

- Inferir recorrência automaticamente pelo texto da fatura (só marcação manual).
- Editar regra de recorrência avançada na grade (frequência custom, endDate opcional avançado) — defaults fixos na v1.
- Reconstruir histórico de parcelas já pagas (1..N-1) que não estão na fatura atual.
- Outros bancos além do fluxo já suportado.
- Alterar o formulário unitário além de extrair helpers compartilhados de payload/regex, se útil.

## Decisions

### 1. Bulk de tags espelha o bulk de datas

- **Decisão:** Barra de ferramentas com `TagSelect` de referência + botão “Aplicar tags” às selecionadas (ou a todas se nenhuma selecionada). Modo **substituir** o conjunto de tags das linhas-alvo (não merge), alinhado ao replace do update de tags na API.
- **Por quê:** Consistente com “Aplicar vencimento”; evita surpresa de tags duplicadas/acumuladas.
- **Alternativas:** merge (união) — útil, mas menos previsível; pode vir depois.

### 2. Detecção de parcela no frontend (com override)

- **Decisão:** Após o parse, para cada linha, aplicar regex local na descrição (ex.: `(?i)parcela\s*0*(\d+)\s*de\s*0*(\d+)` e fallback `0*(\d+)\s*de\s*0*(\d+)` com limites sensatos). Preencher estado da linha: `installmentCurrent`, `installmentTotal`, `asInstallment` (default `true` quando detectado e `current < total`). Usuário pode desligar o modo parcelado ou ajustar se a API/parse evoluir.
- **Por quê:** Não bloqueia o front em mudança de schema do parse; o texto Inter já vem com `(Parcela NN de MM)`.
- **Alternativas:** só no backend no parse — melhor a longo prazo; pode complementar depois devolvendo campos estruturados.

### 3. Quantidade de parcelas = restantes incluindo a atual

- **Decisão:** `installmentCount = installmentTotal - installmentCurrent + 1`. Ex.: `5 de 10` → **6** parcelas (5..10). Se `current === total`, tratar como avulsa (última parcela, sem série). Se `current > total` ou inválido, ignorar detecção.
- **Por quê:** “O que falta” no app, incluindo o lançamento da fatura atual, forma a série completa a partir do ponto em que o usuário está.
- **Alternativas:** `total - current` (só futuras, excluindo a atual) — o exemplo verbal “5 parcelas” bate com isso, mas deixa a linha atual órfã ou exige create duplo; rejeitado em favor da série coerente. Confirmar com usuário se preferirem excluir a atual.

### 4. Numeração da série e API

- **Decisão (contrato com backend):** Estender create de parcelamento com `startingInstallmentNumber` (default `1`). No import: `startingInstallmentNumber = current`, `installmentCount = remaining`, `installmentAmount = amount` da linha, `firstDueDate = dueDate` da linha (vencimentos `+0..count-1` meses). Labels das entidades: `installmentNumber` de `current` até `total`, `installmentCount` do grupo = `total` (total original da compra), não só o remaining — para UI “5/10” correta.
- **Detalhe de modelo:** Preferir persistir `installmentCount = total` (M) e números `current..total`, criando só `remaining` entidades. Isso exige ajuste em `createInstallmentPurchase` além do batch.
- **Fallback se API atrasar:** criar com `installmentCount = remaining` e números `1..remaining` (menos ideal na UI) — documentar como degradação temporária.
- **Por quê:** Sem `startingInstallmentNumber` / total original, o Meu mês mostra “1/6” em vez de “5/10”.

### 5. Tags em todas as parcelas do grupo

- **Decisão:** No create de parcelamento (API), propagar tags para **todas** as parcelas criadas (hoje só a parcela 1). Import se beneficia diretamente.
- **Por quê:** Bulk de tags na importação perderia sentido nas parcelas futuras.

### 6. Recorrência na grade

- **Decisão:** Coluna/toggle “Recorrente” por linha (só despesas selecionáveis no fluxo atual). Defaults ao marcar: `frequency: MONTHLY`, `intervalCount: 1`, `nextOccurrenceDate = dueDate` (ou `transactionDate` se due ausente), sem `endDate`. Parcelado e recorrente mutuamente exclusivos: ao marcar um, desliga o outro.
- **Por quê:** Cobre o caso típico de assinaturas na fatura sem poluir a grade com todos os campos do form unitário.
- **Alternativas:** abrir mini-form de recorrência — adiar.

### 7. Payload do batch

- **Decisão:** Estender `InvoiceBatchItemRequest` (e tipos TS) com `installment?: InstallmentRequest & { startingInstallmentNumber?: number; originalInstallmentCount?: number }` e `recurrence?: RecurrenceRequest` (espelhando `TransactionUpsertRequest`). `toUpsertRequest` passa esses campos para `TransactionService.create`. Front monta o objeto só quando a linha está em modo parcelado ou recorrente.
- **Por quê:** Reusa o caminho de create já validado; batch continua best-effort por índice.

### 8. Escopo de implementação neste repo

- **Decisão:** Artefatos e implementação UI/client em `meu-din-din-front`. Mudanças Java em `meu-din-din` são **dependência coordenada** (change/PR separado no backend); o front pode tipar o contrato e degradar com mensagem clara se a API ainda não aceitar os campos.
- **Por quê:** `allowedEditRoots` / planning home deste change é o front.

## Risks / Trade-offs

- **[Risco]** Interpretação “5 de 10 → 5 vs 6 parcelas” diverge da expectativa → **Mitigação:** preview na linha (“Será criado parcelamento 5/10…6/10 (6x)”) + Open Question; ajustar fórmula se o usuário confirmar.
- **[Risco]** Regex captura falso positivo (“loja 2 de 3 irmãos”) → **Mitigação:** preferir padrão com palavra `Parcela`; exigir `1 ≤ N ≤ M ≤ 360`; toggle off por linha.
- **[Risco]** Backend sem `startingInstallmentNumber` → **Mitigação:** numeração 1..remaining temporária; não bloquear tags/recorrência.
- **[Risco]** Recorrência materializa ~1 ano de ocorrências por linha marcada → **Mitigação:** default mensal; aviso sutil na UI; usuário desmarca linhas indevidas.
- **[Risco]** Grade mais densa (colunas modo) → **Mitigação:** colunas compactas (Switch/ícone); scroll horizontal já previsto.

## Migration Plan

1. Backend: estender batch + create installment (tags em todas; starting number / total).
2. Frontend: UI bulk tags, detecção/preview parcela, toggle recorrente, tipos e payload.
3. Rollback: reverter PRs; batch antigo ignora campos novos se `ignoreUnknown` / campos opcionais.

## Open Questions

1. Confirmar fórmula: `5 de 10` → **6** parcelas (5..10) inclusive, ou **5** futuras (6..10) além da linha atual?
2. No create parcelado do import, `dueDate` da fatura é sempre o vencimento da parcela corrente (primeira da série restante)?
3. Recorrência na v1 fica só mensal sem UI de frequência, ou já expor Segmented mínimo (semanal/mensal)?
