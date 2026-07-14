## ADDED Requirements

### Requirement: Transaction status tags use distinct semantic colors
O frontend SHALL renderizar tags de status de transação com cores distintas por status, usando `antd Tag` com cor semântica e texto legível independente da cor.

#### Scenario: Status tag colors in extract and lists
- **WHEN** uma transação é exibida no extrato ou na listagem com badge de status
- **THEN** o status `A_VENCER` usa cor azul/processing
- **AND** o status `VENCE_HOJE` usa cor de aviso (warning)
- **AND** o status `ATRASADA` usa cor de erro (error)
- **AND** o status `PAGO` usa cor de sucesso (success)
- **AND** o status `PAGO_COM_ATRASO` usa cor distinta de `PAGO` (ex.: cyan)
- **AND** o status `CANCELADA` usa cor neutra/default
- **AND** o texto do status permanece legível sem depender apenas da cor

## MODIFIED Requirements

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
