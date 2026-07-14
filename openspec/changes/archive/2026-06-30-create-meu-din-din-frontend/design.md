## Context

The repository currently contains OpenSpec configuration and project skills, but no frontend application. The backend contract is already described by the Meu Din Din API guidance: routes are under `/api/*`, authentication uses the HttpOnly `ACCESS_TOKEN` cookie, mutating requests require the `X-XSRF-TOKEN` header, and API responses are wrapped in an envelope with `data`, `meta`, and `links`.

The frontend should make the API usable without changing backend behavior. The initial product surface is a personal finance workspace: sign in, understand current projected balance, review transactions, and manage expenses/revenue including recurrence, installments, cancellation, attachments, and extraction by date range.

## Goals / Non-Goals

**Goals:**

- Create a TypeScript React/Next.js frontend that can be implemented from a clean repository.
- Integrate with the backend using cookies and CSRF exactly as documented.
- Provide authenticated screens for dashboard, transaction management, transaction detail, and extract filtering.
- Use predictable data-fetching, validation, loading, empty, and error states.
- Establish a distinctive but disciplined visual direction for financial data.
- Keep performance work practical from the first version: parallelize independent requests, avoid broad imports, and keep heavy UI isolated.

**Non-Goals:**

- Implement SDUI rendering in the MVP.
- Add a new backend endpoint or change backend authentication semantics.
- Build multi-user collaboration, bank account syncing, OFX import, budgeting, or category automation.
- Store JWTs, CSRF tokens, or sensitive session data in local storage.

## Decisions

### Use Next.js App Router with a client-side authenticated workspace

The frontend will use Next.js App Router, TypeScript, React, and colocated route segments. Public auth pages can render as normal React pages. Authenticated finance screens will use client-side data fetching because the backend authentication model is browser-cookie based and CSRF token retrieval depends on the `XSRF-TOKEN` cookie.

Alternative considered: a pure Vite SPA. That would be simpler, but Next.js gives a stronger structure for routing, layouts, metadata, future server-side rendering, and production deployment without preventing SPA-style authenticated data fetching.

Alternative considered: server-side fetching from Next.js route handlers. That adds proxy/session complexity immediately and is not necessary for the MVP because the API already supports browser credentials and CORS for the frontend origin.

### Run the frontend dev server on port 8081

The backend skill states that CORS allows `http://localhost:8081` and `http://localhost:19006` by default. The frontend package scripts should run Next.js on port `8081` so local development works without requiring backend configuration changes.

Alternative considered: use the Next.js default `3000` and require backend CORS changes. That creates avoidable setup friction for the first implementation.

### Centralize API access in a small typed client

The app will expose a single `apiFetch<T>` wrapper that:

- prefixes requests with `NEXT_PUBLIC_API_URL` falling back to `http://localhost:8080`;
- sends `credentials: "include"`;
- unwraps `EnvelopeResponse<T>` to return `data`;
- returns `undefined` for `204`;
- reads `XSRF-TOKEN` from `document.cookie` and sends `X-XSRF-TOKEN` for mutating requests when present;
- throws a typed `ApiError` with `status` and message.

Domain modules will wrap this client for auth, transactions, attachments, and projections. They must not use `Authorization: Bearer`.

Alternative considered: call `fetch` directly from components. That would duplicate error handling, CSRF behavior, and envelope parsing across the app.

### Use a server-state library for API data

Use TanStack Query or SWR for authenticated data. The implementation should prefer one library consistently. Queries for independent dashboard data, such as projection and transaction summaries, should start together rather than forming waterfalls.

Alternative considered: store all API state in React context. Context is appropriate for session/UI state, but it is weak for cache invalidation, background refetch, mutation states, and deduplication.

### Keep session state minimal

Because the JWT is HttpOnly, the app cannot inspect it directly and should not try to mirror it into local storage. Login/register responses provide `SessionResponse`, which can seed an in-memory/session-scoped user state. On page refresh, authenticated screens should bootstrap by calling a protected data endpoint and treat `401` as logged out.

If the backend later adds `GET /api/auth/session`, that can become the canonical session bootstrap endpoint. Until then, the first protected dashboard query is the practical session check.

### Design direction: "caderno de caixa vivo"

The interface should feel like a modern daily cashbook, not a generic fintech dashboard.

Palette:

- `ink-ledger` `#17211B` for primary text.
- `paper-mint` `#EEF6EF` for the app background.
- `cash-green` `#2F7D4C` for positive values and primary actions.
- `due-amber` `#C77A19` for due-today and warning states.
- `debt-red` `#B84232` for overdue/expense emphasis.
- `graphite-line` `#D7DED8` for dividers and grid structure.

Typography:

- Display: a restrained serif or slab face for key balances and section titles.
- Body: a highly legible sans face for forms and dense lists.
- Utility: tabular-number friendly styling for currency, dates, and status pills.

Signature element: a horizontal "cash ribbon" running through the dashboard that marks upcoming due dates and paid/canceled states as ledger ticks. This spends visual distinctiveness in one place while keeping forms and tables quiet.

```
┌─────────────────────────────────────────────────────┐
│ Meu Din Din                         Nova transação  │
├─────────────────────────────────────────────────────┤
│ Saldo projetado                                     │
│ R$ 1.200,50          recalculado há 5 min           │
│                                                     │
│ receita ━━━━━ despesa ━━━━━ vence hoje ━ pago       │
├──────────────────────────────┬──────────────────────┤
│ Próximos vencimentos         │ Extrato recente      │
│ Aluguel        05 jul        │ Mercado    -R$ 80   │
│ Internet       hoje          │ Salário    +R$ ...  │
└──────────────────────────────┴──────────────────────┘
```

### Form modeling follows transaction modes

The transaction form should make the financial mode explicit:

- single transaction;
- installment transaction;
- recurring transaction.

Only fields relevant to the selected mode are visible. Dates use ISO date values internally. Amounts are displayed in Brazilian currency format but normalized to numeric API payloads before submission.

### Testing focuses on contracts and critical flows

Unit tests should cover API envelope parsing, CSRF header behavior, date/amount normalization, and status mapping. Component/integration tests should cover login, expired session handling, transaction creation, extract filtering, and mutation error feedback.

## Risks / Trade-offs

- No dedicated session introspection endpoint → Bootstrap authenticated screens through protected data requests and redirect on `401`; capture a future backend improvement if refresh UX becomes noisy.
- CSRF token is browser-cookie dependent → Keep mutating API calls in client-executed code unless a proxy layer is intentionally designed later.
- Transaction forms can become complex → Model transaction mode explicitly and keep recurrence/installment subforms isolated.
- Dashboard can create request waterfalls → Start projection and transaction queries independently and render partial loading states.
- Dense financial data can hurt mobile usability → Use card-style responsive layouts on small screens and reserve table density for wider viewports.
- SDUI endpoints exist but are excluded → Keep API modules separate enough that a future SDUI renderer can be added without replacing REST-backed screens.

## Migration Plan

1. Scaffold the frontend app in the repository with Next.js, TypeScript, linting, formatting, and test tooling.
2. Configure local dev to run on port `8081`.
3. Implement the shared API client and domain API modules.
4. Build public auth pages and protected app shell.
5. Add dashboard, transactions, detail, extract, and form flows.
6. Add tests and verify against the local backend at `http://localhost:8080`.

Rollback is straightforward during initial adoption: revert the frontend app files and OpenSpec change artifacts. No backend or persisted data migration is required.

## Open Questions

- Should the first implementation use TanStack Query or SWR? TanStack Query is more explicit for mutations and invalidation; SWR is lighter.
- Should attachments be URL metadata only in the MVP, matching the current API, or should file upload storage be specified as a separate future capability?
- Should the backend add `GET /api/auth/session` later to make refresh/session bootstrap cleaner?
