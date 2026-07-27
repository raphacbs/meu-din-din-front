## Why

Em Meu mês, as listas **Pendentes** e **Liquidados** crescem sem limite de altura: quando um mês tem muitos lançamentos (parcelamentos, recorrências), cada seção empurra a seguinte para baixo e o usuário precisa rolar a página inteira para sair de vista do Hero e da barra de ações em lote. Limitar a altura de cada lista com scroll interno mantém o contexto do mês (Hero, progresso, ações) sempre visível e torna a navegação por muitos lançamentos mais previsível.

## What Changes

- A lista **Pendentes** passa a ter altura máxima fixa; ao exceder essa altura, exibe scroll vertical interno em vez de empurrar o restante da página.
- A lista **Liquidados** recebe o mesmo comportamento, com scroll independente do de Pendentes.
- No desktop (`antd Table`), o cabeçalho da tabela permanece fixo (sticky) durante o scroll interno da seção.
- No mobile (`antd List`), o título da seção (“Pendentes”/“Liquidados”) permanece fora da área rolável; apenas os itens rolam.
- Quando o conteúdo de uma seção é menor que a altura máxima, nenhuma barra de scroll aparece (comportamento inalterado nesse caso).
- Sem mudança de contrato com a API, paginação ou ordenação das listas.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `meu-mes`: o requisito "Meu mês lista Pendentes e Liquidados separadamente" passa a exigir que cada lista tenha altura máxima com scroll vertical interno independente, preservando título fixo e (no desktop) cabeçalho de tabela fixo.

## Impact

- **Frontend**: `components/transactions/meu-mes-transaction-lists.tsx` (renderização das seções Pendentes/Liquidados, tabela desktop e lista mobile).
- **Estilos**: possível ajuste em `app/globals.css` caso as animações de entrada/saída de linha (`meu-mes-row--entering/--exiting`) precisem de tratamento dentro de um contêiner com `overflow`.
- Sem impacto em API, backend ou contratos de dados.
