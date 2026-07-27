## Context

`components/transactions/meu-mes-transaction-lists.tsx` renderiza duas seções (`<section>` com título e conteúdo): Pendentes e Liquidados. Cada seção usa `antd Table` no desktop (`renderDesktopTable`, com `scroll={{ x: true }}` — só scroll horizontal) e `antd List` no mobile (`renderMobileList`, sem limite de altura). Hoje nenhuma das duas limita altura vertical, então a página inteira (`window`) é quem rola quando o mês acumula lançamentos.

O projeto já usa o padrão de scroll interno em dois lugares:
- `invoice-import-drawer.tsx`: `Table` com `scroll={{ y: 360 }}`.
- `installment-group-edit-form.tsx`: `List` com `style={{ maxHeight: 220, overflow: "auto" }}`.

As linhas de Pendentes/Liquidados são mais "altas" que as desses dois exemplos (descrição + indicador de grupo, badge de status, tags, ações), então a altura de referência precisa ser um pouco maior para não deixar visível só 1-2 itens.

## Goals / Non-Goals

**Goals:**
- Cada seção (Pendentes, Liquidados) tem altura máxima fixa; acima dela, aparece scroll vertical interno.
- O scroll de cada seção é independente (rolar Pendentes não afeta Liquidados).
- O título da seção fica fora da área rolável; no desktop, o cabeçalho da tabela (`thead`) fica fixo (sticky) durante o scroll, usando o suporte nativo do `antd Table` via `scroll.y`.
- Quando o conteúdo é menor que a altura máxima, nenhuma barra de scroll aparece — comportamento hoje já é esse via CSS `overflow: auto`.
- Nenhuma mudança de dados, ordenação, paginação ou contrato com a API.

**Non-Goals:**
- Virtualização de linhas (`Table` `virtual` prop) — volume esperado por mês não justifica agora.
- Altura responsiva por breakpoint (ex.: menor em telas pequenas) — fica como possível follow-up, não faz parte deste change.
- Alterar a barra de ações em lote (`MeuMesBulkActions`), que já é `position: fixed` e não depende do scroll das seções.

## Decisions

### 1. Altura máxima fixa de 420px para ambas as seções
Usar o mesmo valor para Pendentes e Liquidados, aplicado via:
- Desktop: `scroll={{ x: true, y: 420 }}` no `Table` (mantém o scroll horizontal existente e adiciona o vertical).
- Mobile: `style={{ maxHeight: 420, overflowY: "auto" }}` no `List`, seguindo exatamente o padrão já usado em `installment-group-edit-form.tsx`.

**Alternativas consideradas:**
- *Altura relativa à viewport (ex.: `60vh`)*: mais adaptável a telas grandes/pequenas, mas quebra o padrão de valores fixos já usado no projeto e é menos previsível ao testar. Descartada por ora; pode ser revisitada se 420px se mostrar ruim em telas muito baixas.
- *Alturas diferentes por seção (ex.: Pendentes menor, Liquidados maior)*: acrescenta uma variável sem ganho claro, já que a altura máxima só entra em jogo quando o conteúdo excede o espaço — com poucos itens não há diferença visual. Descartada em favor de um valor único, mais simples de manter.

### 2. Não duplicar o wrapper — usar os mecanismos nativos dos componentes antd
Em vez de envolver `Table`/`List` numa `<div>` extra com `overflow`, usar a prop `scroll.y` do `Table` (que já entrega sticky header de graça) e a prop `style` do próprio `List` (mesmo padrão já usado no código atual do projeto). Evita CSS duplicado e mantém consistência com o restante da base.

### 3. Não alterar as animações de entrada/saída de linha
`meu-mes-row--exiting`/`--entering` (definidas em `app/globals.css`) usam `translateY` + `opacity`. Dentro de um contêiner com `overflow: auto`, o efeito continua funcionando; o único cenário de degradação é uma linha saindo exatamente na borda inferior visível do contêiner, onde o `overflow` pode cortar visualmente parte da transição. Decisão: não tratar preventivamente — validar visualmente na implementação e só ajustar se o corte for perceptível.

## Risks / Trade-offs

- **Corte visual da animação de saída/entrada perto da borda do contêiner** → Mitigação: aceitável (a transição ainda comunica a saída/entrada); revisitar apenas se ficar visualmente ruim nos testes manuais.
- **Scroll duplo (seção + página) em telas muito baixas** → Mitigação: 420px é conservador; ainda cabe Hero + barra de ações + início de "Pendentes" na maioria das viewports comuns.
- **Sticky header do `Table` sem fundo opaco pode deixar conteúdo "vazando" por trás durante o scroll** → Mitigação: o `Table` já recebe `style={{ background: "#ffffff", ... }}`; o header sticky herda o mesmo contexto, sem necessidade de CSS adicional.
- **Poucos itens no mês**: nenhuma mudança visual perceptível (sem scrollbar) — comportamento esperado, não é risco real.

## Migration Plan

Mudança puramente de UI, sem dados ou API envolvidos. Deploy normal via PR; rollback é reverter o componente (`meu-mes-transaction-lists.tsx`) para a versão anterior sem `scroll.y`/`maxHeight`.

## Open Questions

- Vale tornar a altura máxima responsiva por breakpoint (ex.: menor em telas de celular) num follow-up, em vez de um valor fixo único?
- Se o volume de transações por mês crescer muito (ex.: muitos parcelamentos), vale avaliar virtualização de linhas (`Table` `virtual`) no futuro?
