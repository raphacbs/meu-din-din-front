## ADDED Requirements

### Requirement: Monthly income and expense bar chart
The frontend SHALL display a bar chart for the selected year with twelve months showing total expenses and total income per month from the analytics API.

#### Scenario: Bar chart renders monthly totals
- **WHEN** analytics for the selected year load successfully
- **THEN** the frontend renders a bar chart with months on the category axis
- **AND** each month shows expense and income totals from `monthlyTotals`
- **AND** amounts are formatted as currency in tooltips or labels

#### Scenario: Bar chart loading and error
- **WHEN** analytics are loading or fail
- **THEN** the bar chart region shows its own loading or actionable error state without blocking the projection panel

### Requirement: Tag radar chart for month and year totals
The frontend SHALL display a radar chart of tag expense totals for the selected year, including a year-total series and a monthly series for a chosen month.

#### Scenario: Radar shows year total and monthly series
- **WHEN** tag radar data is available for the selected year
- **THEN** the frontend renders a radar chart whose axes are the top tags by annual expense total (capped at a fixed maximum, e.g. 8)
- **AND** one series represents the year total per tag
- **AND** another series represents the selected month totals per tag
- **AND** the user can change which month feeds the monthly series

#### Scenario: Radar empty state
- **WHEN** there are no tagged expenses in the selected year for the radar axes
- **THEN** the frontend shows an empty state for the radar chart

### Requirement: Expense Pareto chart by tag
The frontend SHALL display a Pareto diagram of expenses by tag for the selected year when enough tag data exists.

#### Scenario: Pareto renders concentration of expenses
- **WHEN** at least two tags have expense totals in `expensePareto` for the selected year
- **THEN** the frontend renders bars ordered by descending expense amount
- **AND** a cumulative percentage line is shown using `cumulativePercent`

#### Scenario: Pareto not applicable
- **WHEN** fewer than two tags are present in `expensePareto`
- **THEN** the frontend shows an empty or “not applicable” state instead of a misleading chart

### Requirement: Frontend consumes analytics via typed API client
The frontend SHALL load dashboard analytics through a dedicated API module and React Query key scoped by year, independent from the full transactions list.

#### Scenario: Independent analytics request
- **WHEN** the dashboard needs analytics for a year
- **THEN** the frontend calls `GET /api/analytics/dashboard?year={yyyy}` with `credentials: include`
- **AND** does not require loading `GET /api/transactions` to render the charts
- **AND** changing the year uses a query key that includes the selected year
