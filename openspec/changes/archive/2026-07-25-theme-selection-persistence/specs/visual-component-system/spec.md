## MODIFIED Requirements

### Requirement: Visual identity reinforces the cash ledger metaphor

O frontend SHALL preserve the Meu Din Din cash ledger identity through antd design tokens configured in `ConfigProvider`, mapping the existing color palette to antd token names. A identidade SHALL funcionar nos modos claro e escuro, mantendo verde caixa, aviso e erro semanticamente distintos.

#### Scenario: A component uses brand color

- **WHEN** a component needs color for financial meaning or emphasis
- **THEN** it uses the antd token palette configured in `ConfigProvider` instead of ad hoc color values
- **AND** revenue, expense, warning and muted states remain visually and textually distinct
- **AND** tokens se adaptam ao tema resolvido (claro ou escuro)

#### Scenario: The dashboard displays the cash ribbon

- **WHEN** the dashboard has recent, paid, due-today or upcoming transactions to summarize
- **THEN** the cash ribbon presents those items as a financial timeline
- **AND** each item remains labeled with human-readable text
