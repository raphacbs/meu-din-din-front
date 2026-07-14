## Why

A tela de extrato exige que o usuário escolha datas manuais e clique em filtrar antes de ver qualquer dado, o que atrasa o uso mais comum (consultar o mês atual). O app mobile já oferece modo mês + período customizado; o web precisa da mesma experiência, com o front calculando `from`/`to` e enviando à API existente.

## What Changes

- Adicionar modos de filtro **Mês** (padrão) e **Customizado** na tela de extrato
- No modo mês, usar **MonthPicker** do Ant Design; o front calcula início e fim do mês selecionado
- Manter o botão **Filtrar** para aplicar o período (mês ou customizado) e disparar a busca
- Ao abrir `/extract` sem query params, pré-selecionar modo mês + mês atual e já ter o intervalo pronto para filtrar (default aplicado)
- Introduzir um **store compartilhado** de período (`month | custom`, `from`, `to`) reutilizável por outras telas no futuro
- Sincronizar o período aplicado com a URL via `?from=&to=` (ISO `YYYY-MM-DD`)
- Continuar usando `GET /api/transactions/extract` com headers `X-From-Date` / `X-To-Date` — sem mudança de contrato de API

## Capabilities

### New Capabilities
- `period-selection`: seleção de período compartilhada (modo mês/customizado, MonthPicker, RangePicker, store, sync com `?from=&to=`)

### Modified Capabilities
- `transaction-management`: extrato passa a usar a seleção de período (default mês atual, botão Filtrar, headers derivados do store/URL)

## Impact

- **UI**: `components/transactions/extract-view.tsx` e testes associados
- **Estado**: novo store (ex.: Zustand) para período compartilhado
- **Roteamento**: sync de search params em `/extract`
- **API**: sem alteração no backend; client `transactions.extract` permanece
- **Dependências**: Ant Design `DatePicker` (`picker="month"`) + `RangePicker` + `Segmented` (ou equivalente já usado no projeto)
- **Base**: UI já migrada para antd (change arquivada `migrate-ui-to-antd`)
