# Referência completa de endpoints — Meu Din Din API

Base URL: `http://localhost:8080`  
Todas as rotas autenticadas requerem cookie `ACCESS_TOKEN` (HttpOnly JWT) e header `X-XSRF-TOKEN` (CSRF) em mutações.

---

## Autenticação `/api/auth`

### `POST /api/auth/register` — Público, sem CSRF
**Request:**
```json
{ "email": "user@example.com", "password": "min8chars" }
```
**Response 201:**
```json
{ "data": { "userId": "uuid", "email": "user@example.com" }, "meta": {}, "links": {} }
```
Define cookie `ACCESS_TOKEN` e `XSRF-TOKEN`.

---

### `POST /api/auth/session` — Público, sem CSRF
**Request:**
```json
{ "email": "user@example.com", "password": "min8chars" }
```
**Response 200:** igual ao register.  
Define cookie `ACCESS_TOKEN` e `XSRF-TOKEN`.

---

### `DELETE /api/auth/session` — Autenticado
**Response 204** — limpa o cookie `ACCESS_TOKEN`.

---

## Preferências `/api/users/me/preferences`

### `GET /api/users/me/preferences` — Autenticado
**Response 200:**
```json
{ "data": { "blockPastMonthMutations": true }, "meta": {}, "links": {} }
```
Default `true` quando o usuário ainda não alterou.

### `PUT /api/users/me/preferences` — Autenticado
**Request:**
```json
{ "blockPastMonthMutations": false }
```
**Response 200:** mesmo shape do GET.  
Nesta fase a API **não** enforça o gate em mutações de transações (regra no frontend).

---

## Transações `/api/transactions`

### `POST /api/transactions`
**Request:**
```json
{
  "type": "DESPESA",
  "amount": 150.00,
  "description": "Aluguel",
  "transactionDate": "2026-06-30",
  "dueDate": "2026-07-05",
  "paymentDate": null,
  "tags": ["moradia"],
  "recurrence": null,
  "installment": null,
  "status": "A_VENCER"
}
```
Para parcelamento, use `installment`:
```json
"installment": { "installmentCount": 12, "installmentAmount": 150.00, "firstDueDate": "2026-07-05" }
```
Para recorrência, use `recurrence`:
```json
"recurrence": { "frequency": "MONTHLY", "intervalCount": 1, "nextOccurrenceDate": "2026-07-30", "endDate": null }
```
**Response 201:** `EnvelopeResponse<TransactionResponse>`

---

### `GET /api/transactions`
**Response 200:** `EnvelopeResponse<TransactionResponse[]>`

---

### `GET /api/transactions/{id}`
**Response 200:** `EnvelopeResponse<TransactionResponse>`  
**Response 404:** se não encontrado ou de outro usuário.

---

### `GET /api/transactions/extract`
**Headers opcionais:**
- `X-From-Date: 2026-06-01` (ISO date)
- `X-To-Date: 2026-06-30` (ISO date)

**Response 200:** `EnvelopeResponse<TransactionResponse[]>` filtrado por período.

---

### `PUT /api/transactions/{id}`
**Request:** mesmo schema do POST.  
`paymentDate` pode ser `null` para desfazer liquidação (status recalcula para pendente).  
**Response 200:** `EnvelopeResponse<TransactionResponse>`

---

### `DELETE /api/transactions/{id}`
**Response 204**

---

### `DELETE /api/transactions/{id}/recurrence/from-here`
Exclui a ocorrência recorrente informada e todas as futuras do mesmo grupo (`RECORRENCIA`), ajustando a regra para não rematerializar.  
**Response 204**  
**Response 400:** se a transação não for de uma série recorrente.

---

### `POST /api/transactions/{id}/cancel`
**Response 200:** `EnvelopeResponse<TransactionResponse>` com `status: "CANCELADA"`.

---

### `DELETE /api/transactions/groups/{groupId}/installments`
Remove todas as parcelas de um grupo de parcelamento.  
**Response 204**

---

### `POST /api/transactions/groups/{groupId}/recurrence/deactivate`
Desativa uma série de recorrência.  
**Response 200:** `EnvelopeResponse<TransactionGroupResponse>`
```json
{ "id": "uuid", "type": "RECORRENCIA", "seriesStatus": "INATIVA" }
```

---

### `POST /api/transactions/{id}/attachments`
**Request:**
```json
{ "fileName": "nota.pdf", "fileUrl": "https://...", "mimeType": "application/pdf", "fileSize": 102400 }
```
**Response 201:** `EnvelopeResponse<AttachmentResponse>`

---

### `GET /api/transactions/{id}/attachments`
**Response 200:** `EnvelopeResponse<AttachmentResponse[]>`

---

### `DELETE /api/transactions/{id}/attachments/{attachmentId}`
**Response 204**

---

### `GET /api/transactions/sdui/listing`
Retorna tela SDUI da listagem de transações.  
**Headers opcionais:** `X-App-Version`, `X-Client-Cohort` (`beta` | `internal`)  
**Response 200:** `EnvelopeResponse<SduiScreen>` com meta `schemaVersion` e links `catalog`.

---

### `GET /api/transactions/sdui/extract`
Retorna tela SDUI do extrato.  
**Headers opcionais:** `X-App-Version`, `X-Client-Cohort`, `X-From-Date`, `X-To-Date`  
**Response 200:** `EnvelopeResponse<SduiScreen>`

---

## Projeções `/api/projections`

### `GET /api/projections/current`
Retorna o último snapshot de projeção financeira calculado (atualizado a cada 5 min pelo job).  
**Response 200:**
```json
{ "data": { "projectedBalance": 1200.50, "generatedAt": "2026-06-30T21:00:00" }, "meta": { "generatedAt": "..." }, "links": { "self": "..." } }
```

---

### `POST /api/projections/recalculate`
Força recálculo imediato da projeção.  
**Response 200:** igual ao GET acima.

---

### `GET /api/projections/sdui`
Retorna tela SDUI do dashboard de projeção.  
**Headers opcionais:** `X-App-Version`, `X-Client-Cohort`  
**Response 200:** `EnvelopeResponse<SduiScreen>`

---

## Catálogo SDUI `/api/sdui`

### `GET /api/sdui/catalog`
**Header opcional:** `X-App-Version` (default `1.0.0`)  
**Response 200:**
```json
{
  "data": {
    "supportedComponents": ["transaction-list@1", "..."],
    "compatibilityMatrix": { "1.0.0": [...], "1.1.0": [...] },
    "componentStructure": { "type": "string", "version": "string", "props": "object", "fallback": "component|null" }
  }
}
```

---

## Infraestrutura

### `GET /actuator/health` — Público
```json
{ "status": "UP" }
```

### `GET /swagger-ui/index.html` — Público (somente profile `dev`)
Interface Swagger para exploração interativa da API.

### `GET /v3/api-docs` — Público (somente profile `dev`)
Especificação OpenAPI 3 em JSON.

---

## Modelo `TransactionResponse` completo

```json
{
  "id": "uuid",
  "type": "DESPESA",
  "amount": 150.00,
  "description": "Aluguel",
  "transactionDate": "2026-06-30",
  "dueDate": "2026-07-05",
  "status": "A_VENCER",
  "paymentDate": null,
  "canceledAt": null,
  "tags": ["moradia"],
  "group": {
    "id": "uuid-group",
    "type": "RECORRENCIA",
    "seriesStatus": "ATIVA"
  },
  "installmentNumber": null,
  "installmentCount": null
}
```

`group` é `null` para transações simples. `installmentNumber` e `installmentCount` são preenchidos apenas para parcelamentos.

---

## Valores dos enums

| Enum | Valores |
|------|---------|
| `TransactionType` | `DESPESA`, `RECEITA` |
| `TransactionStatus` | `A_VENCER`, `VENCE_HOJE`, `ATRASADA`, `PAGO`, `PAGO_COM_ATRASO`, `CANCELADA` |
| `RecurrenceFrequency` | `DAILY`, `WEEKLY`, `MONTHLY` |
| `TransactionGroupType` | `PARCELAMENTO`, `RECORRENCIA` |
| `RecurrenceSeriesStatus` | `ATIVA`, `INATIVA` |
