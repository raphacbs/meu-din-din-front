## ADDED Requirements

### Requirement: Meu mês usa hierarquia visual moderna com hero dual
A tela Meu mês SHALL apresentar composição moderna com o saldo Previsto como figura tipográfica principal, Realizado como secundário, e as listas Pendentes/Liquidados subordinadas — sem parecer um formulário/admin antd genérico. Cores financeiras SHALL usar tokens/identidade do ledger.

#### Scenario: Hero domina a primeira leitura
- **WHEN** Meu mês carrega com dados
- **THEN** Previsto é visualmente mais proeminente que Realizado
- **AND** controles de mês e chrome secundário não competem com o hero

#### Scenario: Listas escaneáveis
- **WHEN** Pendentes e Liquidados são exibidos
- **THEN** cada seção tem título claro e itens com valor, status e ações distinguíveis
- **AND** em desktop e mobile a hierarquia permanece escaneável (Table e/ou List conforme padrão do app)

### Requirement: Feedback visual de liquidação
O frontend SHALL fornecer feedback visual intencional ao liquidar (Quitar/Receber), incluindo animação CSS quando motion for permitido, alinhada à identidade Meu Din Din (ênfase em verde caixa / vermelho dívida conforme tipo, sem efeitos decorativos excessivos).

#### Scenario: Ênfase por tipo
- **WHEN** uma despesa é quitada com motion ativo
- **THEN** o feedback visual pode usar sotaque de despesa sem confundir com receita
- **WHEN** uma receita é recebida com motion ativo
- **THEN** o feedback visual pode usar sotaque de receita

#### Scenario: Acessibilidade de motion
- **WHEN** `prefers-reduced-motion: reduce` está ativo
- **THEN** o feedback NÃO depende de animação para comunicar sucesso (toast/atualização de estado bastam)
