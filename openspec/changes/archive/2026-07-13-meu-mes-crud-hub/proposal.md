## Why

A gestão operacional de transações está espalhada entre Meu mês, a listagem `/transactions` e rotas de formulário dedicadas. O usuário precisa de um único hub no mês civil — criar, editar, liquidar, desfazer quitação e excluir — com proteção opcional do histórico passado.

## What Changes

- Concentrar cadastro, edição e exclusão de transações na tela Meu mês via `antd Drawer` com o formulário existente.
- Adicionar botão "Nova transação" no hero de Meu mês; remover o botão equivalente do header do shell.
- Expandir ações de linha (Pendentes e Liquidados): editar (ícone + clique na descrição), cancelar quitação (quando paga), excluir com confirmação; se recorrente, oferecer excluir só esta ou esta e futuras.
- Criar tela `/settings` com preferência **"Bloquear edição e exclusão de meses passados"** (default `true`), persistida em `localStorage` até existir API de preferências.
- Aplicar o gate: mês atual e futuros sempre liberados; meses passados bloqueados quando a preferência estiver `true`.
- Destacar o seletor de mês no hero (título tipográfico forte + navegação ◀ ▶), sem depender do DatePicker compacto como sinal principal.
- **BREAKING (UX):** remover item de menu "Transações" e a listagem `/transactions`; redirecionar `/transactions`, `/transactions/new` e `/transactions/[id]` para `/meu-mes`.
- Ajustar CTAs do dashboard que apontavam para `/transactions/new` para abrir o fluxo de Meu mês (drawer via query ou navegação para `/meu-mes`).

## Capabilities

### New Capabilities

- `user-settings`: tela de configurações e preferência local de bloqueio de meses passados (com contrato futuro de sync via API).

### Modified Capabilities

- `meu-mes`: hero com CTA e seletor em destaque; drawer de create/edit; ações de desfazer quitação, editar e excluir (incluindo escopo recorrente); gate de meses passados.
- `antd-app-shell`: menu sem Transações; item Configurações; remoção do botão "Nova transação" do header.
- `transaction-management`: listagem dedicada deixa de ser a visão operacional; cancel/delete e create/edit passam a ser exigidos a partir de Meu mês; rotas legadas redirecionam.

## Impact

- Componentes: `meu-mes-hero`, `meu-mes-view`, `meu-mes-transaction-lists`, `transaction-row-actions`, `app-shell`, `app-nav`, `transaction-form` (reuso em Drawer), nova view de settings.
- Rotas: adicionar `/settings`; redirecionar rotas `/transactions*`; remover/deprecar `transactions-view` como destino de navegação.
- API cliente: `PUT` com `paymentDate` nulo (desfazer quitação); `DELETE` unitário; consumo futuro de delete-from-here e preferências (backend change `user-prefs-and-recurrence-delete`).
- Specs/tests de shell, Meu mês e transaction-management.
