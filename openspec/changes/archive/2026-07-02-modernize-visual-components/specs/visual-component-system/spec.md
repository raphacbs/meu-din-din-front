## ADDED Requirements

### Requirement: Frontend exposes reusable visual primitives

O frontend SHALL provide reusable visual primitives for common interface patterns, including actions, form fields, cards, badges, alerts, empty states and loading states.

#### Scenario: A screen needs a primary action

- **WHEN** a screen renders a primary user action
- **THEN** the action uses the shared visual primitive for primary buttons
- **AND** the action exposes visible hover, disabled and focus-visible states

#### Scenario: A screen displays a status badge

- **WHEN** a transaction, dashboard summary or system state is represented as a badge
- **THEN** the badge uses a shared tone system
- **AND** the visible text communicates the status without relying only on color

#### Scenario: A screen displays loading, error or empty content

- **WHEN** data is loading, unavailable or empty
- **THEN** the screen uses shared state components with clear text and appropriate semantics
- **AND** actionable states expose the next available action when one exists

### Requirement: Forms use consistent field patterns

O frontend SHALL render authentication and transaction forms using consistent field, helper text, validation and action patterns.

#### Scenario: A form field has validation errors

- **WHEN** a field contains a validation error
- **THEN** the error message is associated with the field for assistive technology
- **AND** the field receives a visible error treatment
- **AND** the user's entered value remains available for correction

#### Scenario: A form is submitting

- **WHEN** a form submission is in progress
- **THEN** the submit action is disabled
- **AND** the form communicates the in-progress state with text visible to the user

#### Scenario: A transaction mode is selected

- **WHEN** the user chooses between single, installment and recurring transaction modes
- **THEN** the selected option is visually distinct
- **AND** the control remains operable by keyboard and understandable as a single-choice input

### Requirement: Financial data views remain responsive and scannable

O frontend SHALL present financial lists and summaries with visual hierarchy that supports quick scanning on desktop and mobile.

#### Scenario: Transactions render on desktop

- **WHEN** transactions are displayed on a desktop viewport
- **THEN** the UI presents them in a structured table or table-like view with readable column labels
- **AND** monetary values use tabular number styling
- **AND** status, tags and group indicators remain distinguishable as separate information

#### Scenario: Transactions render on mobile

- **WHEN** transactions are displayed on a mobile viewport
- **THEN** the UI presents them as cards or compact records optimized for narrow screens
- **AND** each record includes the transaction description, amount, date context and status without requiring horizontal scrolling

#### Scenario: Dashboard summaries render together

- **WHEN** the dashboard displays projection, totals and transaction summaries
- **THEN** the UI establishes a clear hierarchy between primary balance, supporting metrics and recent activity
- **AND** each dashboard region can show loading, success or error states independently

### Requirement: Visual identity reinforces the cash ledger metaphor

O frontend SHALL preserve and refine the Meu Din Din cash ledger identity through tokens, typography, surfaces and the cash ribbon pattern.

#### Scenario: A component uses brand color

- **WHEN** a component needs color for financial meaning or emphasis
- **THEN** it uses the shared token palette instead of ad hoc color values
- **AND** revenue, expense, warning and muted states remain visually and textually distinct

#### Scenario: The dashboard displays the cash ribbon

- **WHEN** the dashboard has recent, paid, due-today or upcoming transactions to summarize
- **THEN** the cash ribbon presents those items as an authored financial timeline or marking system
- **AND** each item remains labeled with human-readable text

### Requirement: Interactive primitives meet accessibility expectations

O frontend SHALL use accessible interaction patterns for components that manage focus, disclosure, selection or overlays.

#### Scenario: An overlay component opens

- **WHEN** a dialog, sheet or popover is opened
- **THEN** focus moves into the overlay
- **AND** the user can dismiss the overlay with keyboard interaction
- **AND** focus returns to a sensible trigger or follow-up element after dismissal

#### Scenario: A navigation or tab control is used

- **WHEN** the user navigates between app sections or tabbed content
- **THEN** the active destination or tab is communicated through semantics and visual state
- **AND** the control remains usable with keyboard navigation
