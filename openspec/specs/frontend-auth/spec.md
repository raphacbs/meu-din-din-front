# frontend-auth

## Purpose

Autenticação e proteção de sessão no frontend Meu Din Din, usando cookies HttpOnly e CSRF conforme o contrato da API.

## Requirements

### Requirement: User can register and start a session
The frontend SHALL allow a new user to register with email and password using `POST /api/auth/register`, relying on the backend to set the `ACCESS_TOKEN` and `XSRF-TOKEN` cookies.

#### Scenario: Successful registration
- **WHEN** a visitor submits a valid email and password on the registration screen
- **THEN** the frontend sends the registration request without an `Authorization` header and with `credentials: include`
- **AND** the frontend stores only non-sensitive session display data from the response
- **AND** the frontend navigates the user to the authenticated workspace

#### Scenario: Duplicate or invalid registration
- **WHEN** the registration request fails with a validation or conflict error
- **THEN** the frontend displays the backend error message near the form
- **AND** the frontend keeps the user on the registration screen

### Requirement: User can log in and log out
The frontend SHALL allow an existing user to create and destroy a session using `POST /api/auth/session` and `DELETE /api/auth/session`.

#### Scenario: Successful login
- **WHEN** a visitor submits valid credentials on the login screen
- **THEN** the frontend sends the login request without an `Authorization` header and with `credentials: include`
- **AND** the frontend navigates the user to the authenticated workspace

#### Scenario: Failed login
- **WHEN** the login request returns `401`
- **THEN** the frontend displays an invalid credentials message
- **AND** the frontend does not navigate to the authenticated workspace

#### Scenario: Logout
- **WHEN** an authenticated user chooses to log out
- **THEN** the frontend calls `DELETE /api/auth/session` with `credentials: include`
- **AND** the frontend clears local session display state
- **AND** the frontend navigates the user to the login screen

### Requirement: Authenticated routes handle expired sessions
The frontend SHALL protect finance screens from unauthenticated access and treat backend `401` responses as session expiration.

#### Scenario: Visitor opens a protected route
- **WHEN** a visitor without a known active session opens an authenticated route
- **THEN** the frontend redirects the visitor to the login screen before showing protected financial data

#### Scenario: API reports expired session
- **WHEN** an authenticated screen receives `401` from a protected API request
- **THEN** the frontend clears local session display state
- **AND** the frontend redirects the user to the login screen

### Requirement: Mutating requests include CSRF token when available
The frontend SHALL read the `XSRF-TOKEN` cookie and send it as `X-XSRF-TOKEN` on protected mutating requests.

#### Scenario: Protected mutation with CSRF cookie
- **WHEN** the frontend sends a protected `POST`, `PUT`, or `DELETE` request and the `XSRF-TOKEN` cookie exists
- **THEN** the request includes an `X-XSRF-TOKEN` header with the cookie value
- **AND** the request includes `credentials: include`

#### Scenario: Public auth mutation
- **WHEN** the frontend sends login or registration requests
- **THEN** the request does not require a CSRF token
- **AND** the request still includes `credentials: include` so response cookies are stored by the browser
