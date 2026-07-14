## Why

A tela Extrato hoje é consultiva (histórico com filtro mês/custom) e não apoia o ritual principal do usuário: operar o mês — quitar despesas, receber receitas e acompanhar o saldo mensal. Essa vira a tela mais importante do app e precisa de um workspace operacional moderno, não de um extrato genérico.

## What Changes

- Renomear a experiência Extrato para **Meu mês** (nav, título, copy)
- **BREAKING** (rota): `/extract` passa a `/meu-mes`, com redirect permanente de `/extract` → `/meu-mes`
- Remover o filtro de período customizado **somente nesta tela** (permanece no store/spec para outros consumidores futuros)
- Seleção só por mês, com aplicação imediata ao trocar o mês (sem botão Filtrar)
- Hero dual de saldo: **Previsto** (figura principal) e **Realizado** (secundário), com progresso de liquidação
- Duas listas: **Pendentes** e **Liquidados**, com ordenação definida (atrasadas → vence hoje → a vencer; liquidados por mais recentes)
- Ações **Quitar** / **Receber** conforme tipo (DESPESA / RECEITA), no lugar do “Pagar” genérico
- Animação CSS curta ao confirmar liquidação (linha sai de Pendentes → hero atualiza → entra em Liquidados), respeitando `prefers-reduced-motion`
- Redesign visual moderno da superfície (antd como primitiva, não como look final)

## Capabilities

### New Capabilities

- `meu-mes`: Workspace operacional do mês — seleção só-mês, hero dual previsto/realizado, duas listas ordenadas, ações Quitar/Receber, animação de liquidação e rota `/meu-mes`

### Modified Capabilities

- `transaction-management`: Extrato deixa de ser a visão principal descrita; requisitos de extract/listagem/pagar/anexar/totais migram ou adaptam-se para Meu mês
- `period-selection`: Esta tela deixa de expor modo customizado e botão Filtrar; modo mês com apply imediato neste consumidor
- `visual-component-system`: Padrões visuais/animação para o hero dual, listas do Meu mês e feedback de liquidação

## Impact

- **Rotas/nav**: `app/(app)/extract` → `app/(app)/meu-mes`, redirect, `app-nav`, links do dashboard que apontem Extrato
- **UI**: `extract-view.tsx` (renomear), `transaction-list` / split em listas, `transaction-row-actions` (copy Quitar/Receber), novos componentes de hero/progresso
- **Libs**: helpers de totais dual + ordenação; CSS de animação; sem nova lib de motion no v1
- **API**: continua `GET /api/transactions/extract` e `PUT` de pagamento — sem mudança de contrato backend neste change
- **Specs/testes**: `extract-view` e specs de extrato/período/visual atualizados para Meu mês
- **Store**: `period-store` permanece com suporte a custom; Meu mês força/usa apenas modo mês
