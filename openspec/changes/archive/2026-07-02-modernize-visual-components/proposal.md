## Why

A interface já comunica a metáfora de caderno de caixa, mas os componentes visuais ainda estão espalhados por telas e formulários, com estilos repetidos e pouca hierarquia entre estados, ações e dados financeiros. Esta mudança cria uma base visual moderna e consistente sem perder a identidade própria do Meu Din Din.

## What Changes

- Introduzir um sistema de componentes visuais reutilizáveis para botões, campos, cartões, badges, estados de carregamento, erro e vazio.
- Consolidar padrões de formulário para autenticação e transações, reduzindo repetição de classes e melhorando feedback visual.
- Evoluir tabelas e cartões responsivos de transações com melhor hierarquia, foco visível, densidade adequada e leitura clara em mobile.
- Modernizar o dashboard com uma linguagem visual mais autoral, usando a "faixa de caixa" como elemento assinatura para movimentações e vencimentos.
- Avaliar uso seletivo de componentes shadcn/Radix apenas para primitivas interativas que se beneficiam de comportamento acessível, como dialogs, sheets, tabs, selects e popovers.
- Preservar os contratos funcionais existentes de autenticação, dashboard financeiro e gestão de transações.

## Capabilities

### New Capabilities

- `visual-component-system`: cobre a base visual reutilizável, padrões de interação, estados de UI, responsividade e acessibilidade dos componentes visuais do frontend.

### Modified Capabilities

- Nenhuma. Os requisitos funcionais existentes permanecem os mesmos; esta mudança adiciona uma capacidade transversal de apresentação.

## Impact

- Afeta componentes em `components/ui`, `components/app`, `components/auth`, `components/dashboard` e `components/transactions`.
- Pode adicionar dependências leves se componentes shadcn/Radix forem adotados para primitivas interativas.
- Não altera endpoints, formatos de payload, autenticação, cache de dados ou contratos da API.
- Exige atualização de testes de componentes quando marcação, labels acessíveis ou estados visuais forem reorganizados.
