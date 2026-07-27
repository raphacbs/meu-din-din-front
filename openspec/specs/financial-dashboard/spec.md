# financial-dashboard

## Purpose

Dashboard financeiro autenticado com projeção de saldo, analytics anuais (gráficos) e navegação para fluxos de trabalho.

## Requirements

### Requirement: User can view current projection
The frontend SHALL display the current projected balance from `GET /api/projections/current` on the authenticated dashboard.

#### Scenario: Projection loads successfully
- **WHEN** an authenticated user opens the dashboard
- **THEN** the frontend requests `/api/projections/current` with `credentials: include`
- **AND** the frontend displays the projected balance and generated timestamp from the response

#### Scenario: Projection is loading
- **WHEN** the projection request is pending
- **THEN** the frontend displays a loading state that preserves the dashboard layout

#### Scenario: Projection request fails
- **WHEN** the projection request fails with a non-auth error
- **THEN** the frontend displays an actionable error state for the projection area
- **AND** the rest of the dashboard remains usable when other data is available

### Requirement: User can manually recalculate projection
The frontend SHALL allow an authenticated user to trigger `POST /api/projections/recalculate` from the dashboard.

#### Scenario: Recalculate projection
- **WHEN** an authenticated user chooses to recalculate the projection
- **THEN** the frontend sends `POST /api/projections/recalculate` with CSRF protection when the token exists
- **AND** the frontend replaces the displayed projection with the recalculated response

#### Scenario: Recalculation in progress
- **WHEN** projection recalculation is in progress
- **THEN** the frontend disables the recalculation action
- **AND** the frontend communicates that recalculation is running

### Requirement: User can understand financial status at a glance
The frontend SHALL summarize relevant transactions on the dashboard using the transaction data available to the authenticated user.

#### Scenario: Dashboard summary loads
- **WHEN** the dashboard loads projection and transaction data
- **THEN** the frontend displays totals or grouped summaries for revenue, expenses, due-today items, overdue items, and paid items based on returned transaction statuses

#### Scenario: Independent dashboard requests
- **WHEN** the dashboard needs projection and transaction data
- **THEN** the frontend starts the independent API requests without waiting for one to finish before starting the other
- **AND** each dashboard region renders its own loading, success, or error state

### Requirement: User can navigate from dashboard to financial work
The frontend SHALL make the dashboard a launch point for transaction workflows.

#### Scenario: Create transaction from dashboard
- **WHEN** an authenticated user activates the primary new transaction action
- **THEN** the frontend opens or navigates to the transaction creation flow

#### Scenario: Open transaction from dashboard summary
- **WHEN** an authenticated user selects a transaction shown in a dashboard summary
- **THEN** the frontend opens the transaction detail or edit view for that transaction

### Requirement: Dashboard presents financial states accessibly
The frontend SHALL use text, color, and semantic labels together to communicate financial status.

#### Scenario: Status is represented visually
- **WHEN** the dashboard displays revenue, expense, overdue, due-today, paid, or canceled states
- **THEN** the frontend includes readable labels in addition to color treatment
- **AND** interactive dashboard controls expose visible focus states

### Requirement: User can select analysis year on dashboard
The frontend SHALL provide a year combobox on the dashboard that controls the analytics charts for that calendar year.

#### Scenario: Year selector loads with available years
- **WHEN** an authenticated user opens the dashboard and analytics data is available
- **THEN** the frontend displays a combobox listing the years returned by the analytics API
- **AND** the frontend selects a default year (current year if present among available years, otherwise the most recent available year)

#### Scenario: Changing year refreshes charts
- **WHEN** the user selects a different year in the combobox
- **THEN** the frontend requests analytics for that year
- **AND** all year-scoped charts update to reflect the selected year

#### Scenario: No years with data
- **WHEN** the analytics response has an empty list of available years
- **THEN** the frontend shows an empty state for the analytics section explaining that there are no transactions to analyze

### Requirement: Dashboard keeps projection as secondary panel
The frontend SHALL continue to expose current projection viewing and recalculation on the dashboard in a compact panel that does not replace the analytics section.

#### Scenario: Projection remains available beside analytics
- **WHEN** an authenticated user opens the dashboard
- **THEN** the frontend still loads and displays the projection panel with recalculate action
- **AND** the primary visual focus of the page is the analytics charts for the selected year
