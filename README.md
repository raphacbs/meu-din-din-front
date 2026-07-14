# Meu Din Din — Frontend

Frontend Next.js do Meu Din Din: autenticação por cookie, dashboard financeiro, transações, extrato e anexos.

## Pré-requisitos

- Node.js 20+
- Backend Meu Din Din rodando em `http://localhost:8080`
- CORS do backend permitindo `http://localhost:8081` (padrão do projeto)

## Configuração local

```bash
cp .env.example .env.local
npm install
npm run dev
```

O frontend sobe em `http://localhost:8081`.

Variáveis:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base URL da API Spring Boot |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento na porta 8081 |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção na porta 8081 |
| `npm test` | Testes unitários e de componentes (Vitest) |
| `npm run lint` | ESLint |

## Integração com a API

- Rotas autenticadas usam `credentials: include` (cookie HttpOnly `ACCESS_TOKEN`).
- Mutações protegidas enviam `X-XSRF-TOKEN` a partir do cookie `XSRF-TOKEN`.
- Respostas seguem envelope `{ data, meta, links }`.
- Datas enviadas à API usam formato ISO `YYYY-MM-DD`.
- O extrato filtra com headers `X-From-Date` e `X-To-Date`.

## Segurança de sessão

- JWT, CSRF e senhas **não** são persistidos em `localStorage`.
- O estado de exibição do usuário (`userId`, `email`) fica apenas em `sessionStorage` para sobreviver a refresh leve da aba.
- Sessão expirada (`401`) redireciona para login.

## Estrutura principal

- `app/` — rotas públicas (`/login`, `/register`) e autenticadas (`/dashboard`, `/transactions`, `/extract`)
- `lib/api/` — cliente HTTP e módulos de domínio
- `components/` — UI reutilizável e telas
- `lib/format/` — formatação de moeda, datas, status e arquivos

## Verificação manual

1. Inicie o backend em `http://localhost:8080`.
2. Execute `npm run dev` e acesse `http://localhost:8081`.
3. Crie uma conta, faça login e valide dashboard, lista, extrato e criação de transação.
