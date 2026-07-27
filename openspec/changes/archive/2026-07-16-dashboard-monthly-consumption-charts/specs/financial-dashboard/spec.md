## ADDED Requirements

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
