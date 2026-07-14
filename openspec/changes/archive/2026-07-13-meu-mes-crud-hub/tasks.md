## 1. Preferências e Configurações

- [x] 1.1 Criar store/util de preferências com `blockPastMonthMutations` (default `true`) em `localStorage`
- [x] 1.2 Criar helper `isPastMonthMutationBlocked(transaction, prefs, today)` baseado em `dueDate` ?? `transactionDate`
- [x] 1.3 Criar rota `/settings` e view com Switch rotulado “Bloquear edição e exclusão de meses passados”
- [x] 1.4 Adicionar “Configurações” em `NAV_ITEMS` / `AppNav` com ícone

## 2. Shell e remoção de Transações

- [x] 2.1 Remover item “Transações” da navegação
- [x] 2.2 Remover botão “Nova transação” do header em `AppShell`
- [x] 2.3 Redirecionar `/transactions`, `/transactions/new` e `/transactions/[id]` para `/meu-mes`
- [x] 2.4 Ajustar CTA do dashboard para `/meu-mes?new=1` (ou equivalente que abra o Drawer)
- [x] 2.5 Atualizar testes do shell/nav/layout

## 3. Hero e seletor de mês

- [x] 3.1 Redesenhar `MeuMesHero` com mês tipograficamente destacado + setas; seletor acionado pelo título
- [x] 3.2 Adicionar botão “Nova transação” no hero com callback `onCreate`
- [x] 3.3 Atualizar testes de `meu-mes-view` / hero

## 4. Drawer de cadastro e edição

- [x] 4.1 Criar componente Drawer reutilizando `TransactionForm` (modos create/edit)
- [x] 4.2 Integrar Drawer em `MeuMesView` (estado, `?new=1`, POST/PUT, invalidação do extract)
- [x] 4.3 Ligar clique na descrição e botão Editar (ícone) às listas; respeitar gate de mês passado
- [x] 4.4 Testes de abertura/fechamento e mutações do Drawer

## 5. Ações de linha

- [x] 5.1 Estender `TransactionRowActions`: Editar, Cancelar quitação/recebimento (pago), Excluir (pendente e liquidado), manter Anexar/Quitar
- [x] 5.2 Implementar desfazer quitação com Modal + `PUT` sem `paymentDate`
- [x] 5.3 Implementar exclusão com confirmação; se `RECORRENCIA`, opções “Só esta” / “Esta e futuras”
- [x] 5.4 Adicionar método client `deleteRecurrenceFromHere` (contrato backend); tratar indisponibilidade com mensagem clara
- [x] 5.5 Aplicar gate de preferência em Editar/Excluir (disabled + tooltip)
- [x] 5.6 Atualizar testes de row actions e listas Meu mês

## 6. Limpeza e verificação

- [x] 6.1 Remover ou deixar sem rota a `transactions-view` e páginas órfãs; garantir imports quebrados
- [x] 6.2 Rodar testes unitários relevantes e checar regressão visual básica em Meu mês / settings
