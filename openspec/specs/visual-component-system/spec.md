# visual-component-system

## Purpose

Sistema visual reutilizável do frontend Meu Din Din baseado em Ant Design: primitivas de UI, padrões de formulário, hierarquia de dados financeiros e identidade visual do ledger via tokens.

## Requirements

### Requirement: Frontend exposes reusable visual primitives

O frontend SHALL provide reusable visual primitives for common interface patterns using antd components, including actions (Button), form fields (Input, Select, DatePicker), cards (Card), badges (Tag), alerts (Alert), empty states (Empty), loading states (Spin) and error states (Result).

#### Scenario: A screen needs a primary action

- **WHEN** a screen renders a primary user action
- **THEN** the action uses `antd Button` with `type="primary"`
- **AND** the action exposes visible hover, disabled and focus-visible states provided by antd

#### Scenario: A screen displays a status badge

- **WHEN** a transaction, dashboard summary or system state is represented as a badge
- **THEN** the badge uses `antd Tag` with a color corresponding to the specific transaction status (not only a generic tone bucket)
- **AND** the visible text communicates the status without relying only on color

#### Scenario: A screen displays loading, error or empty content

- **WHEN** data is loading
- **THEN** the screen uses `antd Spin` centered in the content area
- **WHEN** data is unavailable due to error
- **THEN** the screen uses `antd Result` with `status="error"` and a descriptive message
- **WHEN** data is empty
- **THEN** the screen uses `antd Empty` with an explanatory description and, when applicable, an action button

#### Scenario: Row icon actions in financial tables

- **WHEN** a financial table exposes inline actions such as pay or attach receipt
- **THEN** the actions use `antd Button` with icons (`type="text"` or equivalente compacto)
- **AND** each action exposes an accessible label via tooltip or `aria-label`

### Requirement: Transaction status tags use distinct semantic colors
O frontend SHALL renderizar tags de status de transação com cores distintas por status, usando `antd Tag` com cor semântica e texto legível independente da cor.

#### Scenario: Status tag colors in extract and lists
- **WHEN** uma transação é exibida no Meu mês ou na listagem com badge de status
- **THEN** o status `A_VENCER` usa cor azul/processing
- **AND** o status `VENCE_HOJE` usa cor de aviso (warning)
- **AND** o status `ATRASADA` usa cor de erro (error)
- **AND** o status `PAGO` usa cor de sucesso (success)
- **AND** o status `PAGO_COM_ATRASO` usa cor distinta de `PAGO` (ex.: cyan)
- **AND** o status `CANCELADA` usa cor neutra/default
- **AND** o texto do status permanece legível sem depender apenas da cor

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

### Requirement: Forms use consistent field patterns

O frontend SHALL render authentication and transaction forms using `antd Form` with `Form.useForm()`, `Form.Item` with declarative validation rules, and antd input components.

#### Scenario: A form field has validation errors

- **WHEN** a field contains a validation error
- **THEN** the `antd Form.Item` displays the error message below the field with `validateStatus="error"`
- **AND** the field receives a visible error treatment via antd's built-in error styling
- **AND** the user's entered value remains available for correction

#### Scenario: A form is submitting

- **WHEN** a form submission is in progress
- **THEN** the submit `antd Button` has `loading={true}` and is disabled
- **AND** the loading state is visually communicated by the button spinner

#### Scenario: A transaction mode is selected

- **WHEN** the user chooses between single, installment and recurring transaction modes
- **THEN** the selected option uses `antd Segmented` component
- **AND** the active segment is visually distinct
- **AND** the control remains operable by keyboard

### Requirement: Financial data views remain responsive and scannable

O frontend SHALL present financial lists and summaries using `antd Table` on desktop and `antd List` on mobile, maintaining visual hierarchy for quick scanning.

#### Scenario: Transactions render on desktop

- **WHEN** transactions are displayed on a desktop viewport
- **THEN** the UI presents them using `antd Table` with readable column labels
- **AND** monetary values use tabular number styling
- **AND** status, tags and group indicators remain distinguishable as separate columns

#### Scenario: Transactions render on mobile

- **WHEN** transactions are displayed on a mobile viewport
- **THEN** the UI presents them using `antd List` with compact card-like items
- **AND** each item includes description, amount, date context and status without horizontal scrolling

#### Scenario: Dashboard summaries render together

- **WHEN** the dashboard displays projection, totals and transaction summaries
- **THEN** the UI uses `antd Card` and `antd Statistic` to establish hierarchy
- **AND** each dashboard region can show loading, success or error states independently using antd primitives

### Requirement: Visual identity reinforces the cash ledger metaphor

O frontend SHALL preserve the Meu Din Din cash ledger identity through antd design tokens configured in `ConfigProvider`, mapping the existing color palette to antd token names.

#### Scenario: A component uses brand color

- **WHEN** a component needs color for financial meaning or emphasis
- **THEN** it uses the antd token palette configured in `ConfigProvider` instead of ad hoc color values
- **AND** revenue, expense, warning and muted states remain visually and textually distinct

#### Scenario: The dashboard displays the cash ribbon

- **WHEN** the dashboard has recent, paid, due-today or upcoming transactions to summarize
- **THEN** the cash ribbon presents those items as a financial timeline
- **AND** each item remains labeled with human-readable text

### Requirement: Interactive primitives meet accessibility expectations

O frontend SHALL use antd's built-in accessible interaction patterns for all overlays, confirmations and navigation controls.

#### Scenario: A confirmation dialog opens

- **WHEN** a destructive action requires user confirmation
- **THEN** `antd Modal.confirm` is used to present the confirmation
- **AND** focus moves into the modal
- **AND** the user can dismiss with Escape key
- **AND** focus returns to the trigger after dismissal

#### Scenario: A navigation control is used

- **WHEN** the user navigates between app sections via the sidebar menu
- **THEN** the active destination is communicated through `antd Menu` selectedKeys
- **AND** the control remains usable with keyboard navigation
