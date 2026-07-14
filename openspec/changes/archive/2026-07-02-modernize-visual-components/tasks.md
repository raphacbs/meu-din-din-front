## 1. Base Visual

- [x] 1.1 Revisar tokens em `app/globals.css` e adicionar apenas variáveis necessárias para superfícies, foco, sombras e tons financeiros.
- [x] 1.2 Criar componente compartilhado de botão com variantes primária, secundária, fantasma e destrutiva.
- [x] 1.3 Criar componentes compartilhados de campo, input, select, helper text e mensagem de erro.
- [x] 1.4 Criar componentes compartilhados de card, badge e alerta usando a paleta do Meu Din Din.
- [x] 1.5 Atualizar `LoadingState`, `ErrorState` e `EmptyState` para usar a nova base visual mantendo semântica acessível.

## 2. Formulários

- [x] 2.1 Migrar `LoginForm` para os componentes compartilhados de campo, erro e botão.
- [x] 2.2 Migrar `RegisterForm` para os componentes compartilhados de campo, erro e botão.
- [x] 2.3 Migrar campos básicos de `TransactionForm` para os componentes compartilhados.
- [x] 2.4 Criar ou consolidar controle segmentado para modo de transação mantendo comportamento de radio acessível.
- [x] 2.5 Atualizar testes de autenticação e formulário de transação afetados pela nova marcação.

## 3. Dados Financeiros Responsivos

- [x] 3.1 Evoluir `ResponsiveDataView`, `DataTableShell`, `DataCardList` e `DataCard` para a nova linguagem visual.
- [x] 3.2 Criar padrões reutilizáveis para célula de moeda, status badge, tags e metadados de transação.
- [x] 3.3 Migrar `TransactionList` para os padrões reutilizáveis mantendo todos os dados exibidos hoje.
- [x] 3.4 Garantir que a visualização mobile de transações não dependa de rolagem horizontal.
- [x] 3.5 Atualizar testes de listagem, extrato e responsive data view afetados.

## 4. Dashboard e Navegação

- [x] 4.1 Refinar cards de resumo e painel de projeção para usar os novos componentes de superfície, ação e estado.
- [x] 4.2 Evoluir `CashRibbon` como elemento assinatura com leitura clara de próximos vencimentos, pagos e itens do dia.
- [x] 4.3 Ajustar hierarquia visual do dashboard entre saldo projetado, métricas auxiliares e atividade recente.
- [x] 4.4 Modernizar `AppShell` e `AppNav` com padrões compartilhados de ação, foco e estado ativo.
- [x] 4.5 Atualizar testes de dashboard e navegação afetados.

## 5. Primitivas Interativas Opcionais

- [x] 5.1 Decidir se a primeira implementação precisa de shadcn/Radix para dialog, sheet, tabs, select, popover ou toast.
- [x] 5.2 Se necessário, adicionar apenas as dependências e componentes interativos usados imediatamente.
- [x] 5.3 Validar foco, fechamento por teclado e retorno de foco em overlays ou controles com disclosure.

## 6. Validação

- [x] 6.1 Executar lint e corrigir problemas introduzidos pela migração visual.
- [x] 6.2 Executar testes e atualizar expectativas que dependem de labels, roles ou estados visuais.
- [x] 6.3 Revisar telas em desktop e mobile para confirmar hierarquia, responsividade e contraste.
- [x] 6.4 Confirmar que endpoints, payloads e comportamento funcional permanecem inalterados.
