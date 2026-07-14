## 1. Project Setup

- [x] 1.1 Scaffold a Next.js TypeScript app in the repository.
- [x] 1.2 Configure the dev script to run the frontend on port `8081`.
- [x] 1.3 Add linting, formatting, test tooling, and baseline project scripts.
- [x] 1.4 Configure environment variables with `NEXT_PUBLIC_API_URL` defaulting to `http://localhost:8080`.
- [x] 1.5 Add global styles, design tokens, typography setup, and accessible focus defaults.

## 2. API Integration Foundation

- [x] 2.1 Define shared API envelope, error, auth, transaction, attachment, and projection TypeScript types.
- [x] 2.2 Implement `apiFetch<T>` with `credentials: include`, envelope unwrapping, `204` handling, and typed `ApiError`.
- [x] 2.3 Implement CSRF cookie reading and `X-XSRF-TOKEN` injection for protected mutating requests.
- [x] 2.4 Add domain API modules for auth, transactions, attachments, and projections.
- [x] 2.5 Add tests for envelope parsing, error handling, credential behavior, and CSRF header behavior.

## 3. Auth Experience

- [x] 3.1 Build login and registration routes with validated email/password forms.
- [x] 3.2 Implement successful login and registration navigation into the authenticated workspace.
- [x] 3.3 Implement auth error feedback for validation, duplicate account, and invalid credential responses.
- [x] 3.4 Build protected route/session handling that redirects unauthenticated users to login.
- [x] 3.5 Implement logout and local session display-state clearing.
- [x] 3.6 Add tests for login, registration failure, logout, and expired-session redirect.

## 4. Authenticated App Shell

- [x] 4.1 Build the authenticated layout with primary navigation for dashboard, transactions, and extract.
- [x] 4.2 Implement responsive layout behavior for desktop tables and mobile cards.
- [x] 4.3 Add loading, empty, and error state primitives used across authenticated screens.
- [x] 4.4 Add currency, date, status, and file-size formatting utilities.
- [x] 4.5 Verify keyboard navigation and visible focus states across the shell.

## 5. Financial Dashboard

- [x] 5.1 Implement projection query for `GET /api/projections/current`.
- [x] 5.2 Implement manual projection recalculation with `POST /api/projections/recalculate`.
- [x] 5.3 Start projection and transaction summary requests independently to avoid waterfalls.
- [x] 5.4 Build dashboard cards for projected balance, revenue, expenses, due-today items, overdue items, and paid items.
- [x] 5.5 Implement the dashboard cash ribbon visual treatment for upcoming and paid/canceled financial states.
- [x] 5.6 Add tests for projection loading, recalculation, partial error handling, and dashboard navigation actions.

## 6. Transaction List and Extract

- [x] 6.1 Implement transaction list query for `GET /api/transactions`.
- [x] 6.2 Build transaction list UI with amount, type, dates, status, tags, and group indicators.
- [x] 6.3 Implement empty state and new-transaction action from the list.
- [x] 6.4 Implement extract filters with ISO date values.
- [x] 6.5 Send `X-From-Date` and `X-To-Date` headers for extract filtering.
- [x] 6.6 Add tests for list loading, empty state, extract filtering, and API error display.

## 7. Transaction Forms and Mutations

- [x] 7.1 Build transaction creation form with single, installment, and recurring modes.
- [x] 7.2 Normalize Brazilian currency input to numeric API payload amounts.
- [x] 7.3 Normalize date fields to ISO date strings.
- [x] 7.4 Implement `POST /api/transactions` for transaction creation.
- [x] 7.5 Implement transaction detail/edit flow using `GET /api/transactions/{id}` and `PUT /api/transactions/{id}`.
- [x] 7.6 Preserve form input and show backend messages when mutation validation fails.
- [x] 7.7 Add tests for single, installment, recurring, edit, and validation-error flows.

## 8. Transaction Actions and Attachments

- [x] 8.1 Implement cancel transaction action with confirmation and `POST /api/transactions/{id}/cancel`.
- [x] 8.2 Implement delete transaction action with confirmation and `DELETE /api/transactions/{id}`.
- [x] 8.3 Implement delete installment group action with `DELETE /api/transactions/groups/{groupId}/installments`.
- [x] 8.4 Implement deactivate recurrence action with `POST /api/transactions/groups/{groupId}/recurrence/deactivate`.
- [x] 8.5 Implement attachment list for transaction details.
- [x] 8.6 Implement add and delete attachment metadata flows.
- [x] 8.7 Add tests for destructive confirmations, recurrence deactivation, installment deletion, and attachment flows.

## 9. Quality and Verification

- [x] 9.1 Run linting and fix reported issues.
- [x] 9.2 Run unit and component tests.
- [x] 9.3 Verify local integration against the backend at `http://localhost:8080`.
- [x] 9.4 Verify no frontend code stores JWTs, CSRF tokens, or passwords in local storage.
- [x] 9.5 Verify bundle-sensitive imports avoid broad barrel imports for heavy UI modules.
- [x] 9.6 Document local setup and required backend assumptions in the README.
