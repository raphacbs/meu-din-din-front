---
name: meu-din-din-api-react
description: Guia completo de integração do frontend React com a API Meu Din Din. Use quando estiver implementando chamadas de API, autenticação, tipos TypeScript, hooks de dados, tratamento de erros ou qualquer integração com o backend Spring Boot deste projeto.
---

# Integração React ↔ API Meu Din Din

## Configuração base

**Base URL:** `http://localhost:8080`  
**Prefixo:** todas as rotas começam com `/api/`  
**Autenticação:** cookie `ACCESS_TOKEN` (HttpOnly JWT) — **não use `Authorization: Bearer`**  
**CSRF:** obrigatório em mutações — leia o token do cookie `XSRF-TOKEN` e envie no header `X-XSRF-TOKEN`

```ts
// api/client.ts
const BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:8080';

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const csrfToken = getCookie('XSRF-TOKEN');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: 'include',          // envia cookie JWT automaticamente
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, err.message);
  }

  if (res.status === 204) return undefined as T;
  const envelope = await res.json() as EnvelopeResponse<T>;
  return envelope.data;
}

function getCookie(name: string): string | null {
  return document.cookie.split('; ').find(r => r.startsWith(`${name}=`))?.split('=')[1] ?? null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
```

---

## Tipos TypeScript

```ts
// types/api.ts
export interface EnvelopeResponse<T> {
  data: T;
  meta: Record<string, unknown>;
  links: Record<string, unknown>;
}

// --- Auth ---
export interface RegisterRequest { email: string; password: string; }
export interface LoginRequest    { email: string; password: string; }
export interface SessionResponse { userId: string; email: string; }

// --- Enums ---
export type TransactionType    = 'DESPESA' | 'RECEITA';
export type TransactionStatus  = 'A_VENCER' | 'VENCE_HOJE' | 'ATRASADA' | 'PAGO' | 'PAGO_COM_ATRASO' | 'CANCELADA';
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type TransactionGroupType = 'PARCELAMENTO' | 'RECORRENCIA';
export type RecurrenceSeriesStatus = 'ATIVA' | 'INATIVA';

// --- Transactions ---
export interface RecurrenceRequest {
  frequency: RecurrenceFrequency;
  intervalCount: number;
  nextOccurrenceDate: string; // ISO date
  endDate?: string;           // ISO date
}

export interface InstallmentRequest {
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;       // ISO date
}

export interface TransactionUpsertRequest {
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;    // ISO date
  dueDate?: string;
  paymentDate?: string;
  tags?: string[];
  recurrence?: RecurrenceRequest;
  installment?: InstallmentRequest;
  status?: TransactionStatus;
}

export interface TransactionGroupResponse {
  id: string;
  type: TransactionGroupType;
  seriesStatus: RecurrenceSeriesStatus;
}

export interface TransactionResponse {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
  dueDate?: string;
  status: TransactionStatus;
  paymentDate?: string;
  canceledAt?: string;
  tags?: string[];
  group?: TransactionGroupResponse;
  installmentNumber?: number;
  installmentCount?: number;
}

export interface AttachmentRequest  { fileName: string; fileUrl: string; mimeType: string; fileSize: number; }
export interface AttachmentResponse { id: string; fileName: string; fileUrl: string; mimeType: string; fileSize: number; }

// --- Projections ---
export interface ProjectionResponse { projectedBalance: number; generatedAt: string; }

// --- SDUI ---
export interface SduiComponent { type: string; version: string; props: Record<string, unknown>; fallback?: SduiComponent; }
export interface SduiScreen    { screenId: string; components: SduiComponent[]; }
```

---

## Endpoints

Detalhes completos em [endpoints.md](endpoints.md).

### Autenticação

```ts
// api/auth.ts
export const auth = {
  register: (body: RegisterRequest) =>
    apiFetch<SessionResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: LoginRequest) =>
    apiFetch<SessionResponse>('/api/auth/session', { method: 'POST', body: JSON.stringify(body) }),

  logout: () =>
    apiFetch<void>('/api/auth/session', { method: 'DELETE' }),
};
```

### Transações

```ts
// api/transactions.ts
export const transactions = {
  create:  (body: TransactionUpsertRequest) =>
    apiFetch<TransactionResponse>('/api/transactions', { method: 'POST', body: JSON.stringify(body) }),

  list:    () => apiFetch<TransactionResponse[]>('/api/transactions'),

  getById: (id: string) => apiFetch<TransactionResponse>(`/api/transactions/${id}`),

  extract: (from?: string, to?: string) =>
    apiFetch<TransactionResponse[]>('/api/transactions/extract', {
      headers: {
        ...(from ? { 'X-From-Date': from } : {}),
        ...(to   ? { 'X-To-Date': to }     : {}),
      },
    }),

  update:  (id: string, body: TransactionUpsertRequest) =>
    apiFetch<TransactionResponse>(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete:  (id: string) => apiFetch<void>(`/api/transactions/${id}`, { method: 'DELETE' }),

  cancel:  (id: string) =>
    apiFetch<TransactionResponse>(`/api/transactions/${id}/cancel`, { method: 'POST' }),

  deleteInstallments: (groupId: string) =>
    apiFetch<void>(`/api/transactions/groups/${groupId}/installments`, { method: 'DELETE' }),

  deactivateRecurrence: (groupId: string) =>
    apiFetch<TransactionGroupResponse>(`/api/transactions/groups/${groupId}/recurrence/deactivate`, { method: 'POST' }),

  addAttachment:    (id: string, body: AttachmentRequest) =>
    apiFetch<AttachmentResponse>(`/api/transactions/${id}/attachments`, { method: 'POST', body: JSON.stringify(body) }),

  listAttachments:  (id: string) =>
    apiFetch<AttachmentResponse[]>(`/api/transactions/${id}/attachments`),

  deleteAttachment: (id: string, attachmentId: string) =>
    apiFetch<void>(`/api/transactions/${id}/attachments/${attachmentId}`, { method: 'DELETE' }),
};
```

### Projeções

```ts
// api/projections.ts
export const projections = {
  current:     () => apiFetch<ProjectionResponse>('/api/projections/current'),
  recalculate: () => apiFetch<ProjectionResponse>('/api/projections/recalculate', { method: 'POST' }),
};
```

---

## Tratamento de erros

| Status | Significado | Ação sugerida |
|--------|-------------|---------------|
| 400 | Validação ou regra de negócio | Exibir `error.message` |
| 401 | Sessão expirada ou inválida | Redirecionar para login |
| 403 | Sem permissão | Exibir feedback "acesso negado" |
| 404 | Recurso não encontrado | Exibir "não encontrado" |
| 409 | Email já cadastrado | Informar duplicidade |

```ts
try {
  await auth.login({ email, password });
} catch (err) {
  if (err instanceof ApiError) {
    if (err.status === 401) router.push('/login');
    else setError(err.message);
  }
}
```

---

## Dicas de integração

- **CORS:** o backend aceita `http://localhost:8081` e `http://localhost:19006` por padrão. Ajuste `app.security.allowed-origins` para outros origins.
- **CSRF:** rotas `POST /api/auth/register` e `POST /api/auth/session` são isentas de CSRF. Todas as outras mutações precisam do header `X-XSRF-TOKEN`.
- **Datas:** use formato ISO 8601 (`YYYY-MM-DD`) para `transactionDate`, `dueDate`, `paymentDate`, `X-From-Date`, `X-To-Date`.
- **Sessão:** o JWT expira em 8h. Ao receber 401, limpe o estado de sessão local e redirecione para login.
- **SDUI:** use os endpoints `/sdui/listing`, `/sdui/extract` e `/api/projections/sdui` apenas se o frontend implementar o protocolo SDUI. Para integrações REST normais, use os endpoints de dados puros.

---

## Recursos adicionais

- Referência completa de todos os 22 endpoints: [endpoints.md](endpoints.md)
- Swagger UI (somente ambiente dev): `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON (dev): `http://localhost:8080/v3/api-docs`
