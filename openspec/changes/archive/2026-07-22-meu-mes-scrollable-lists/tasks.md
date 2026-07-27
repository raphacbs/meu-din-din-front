## 1. Desktop (Table)

- [x] 1.1 Em `renderDesktopTable` (`components/transactions/meu-mes-transaction-lists.tsx`), adicionar `y: 420` ao `scroll` do `Table` (mantendo `x: true`), aplicado igualmente às seções Pendentes e Liquidados.
- [x] 1.2 Validar visualmente que o cabeçalho da tabela permanece fixo (sticky) durante o scroll interno.

## 2. Mobile (List)

- [x] 2.1 Em `renderMobileList`, adicionar `maxHeight: 420` e `overflowY: "auto"` ao `style` do componente `List` (mesmo padrão usado em `installment-group-edit-form.tsx`).
- [x] 2.2 Confirmar que o título da seção (`Title level={4}`) permanece fora da área rolável, já que está fora do `List`.

## 3. Validação visual e de comportamento

- [x] 3.1 Testar com um mês com poucos itens em Pendentes/Liquidados: confirmar que nenhuma barra de scroll aparece.
- [x] 3.2 Testar com um mês com muitos itens (ex.: parcelamento longo) em cada seção: confirmar scroll vertical interno independente entre Pendentes e Liquidados.
- [x] 3.3 Testar liquidação de um item pendente (animação `meu-mes-row--exiting`/`--entering`) com a lista rolada e não rolada; confirmar que a transição continua compreensível (ver risco de corte visual no `design.md`).
- [x] 3.4 Testar com `prefers-reduced-motion: reduce` ativo; confirmar que o scroll interno não interfere no comportamento sem animação já existente.
- [x] 3.5 Testar em viewport mobile (breakpoint `< md`) e desktop, garantindo que a barra de ações em lote (fixed) continua acessível e sem sobreposição.

## 4. Especificação e revisão

- [x] 4.1 Rodar `openspec validate meu-mes-scrollable-lists --strict` e corrigir eventuais erros de formatação da spec delta.
- [x] 4.2 Revisar o diff final do componente contra os cenários adicionados em `specs/meu-mes/spec.md` (lista excede altura máxima / cabe sem scroll / cabeçalho fixo).
