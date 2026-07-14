## Why

Meu Din Din já expõe uma API Spring Boot para autenticação, transações, anexos e projeções, mas ainda não há uma aplicação frontend neste repositório para transformar esses recursos em um fluxo utilizável. Criar o frontend agora estabelece a experiência principal do produto e valida o contrato da API em uma interface real.

## What Changes

- Criar uma aplicação frontend React/Next.js em TypeScript para o Meu Din Din.
- Implementar autenticação por email e senha usando cookie HttpOnly `ACCESS_TOKEN`, sem `Authorization: Bearer`.
- Criar uma área autenticada com dashboard financeiro, projeção de saldo, listagem/extrato de transações e ações de criação, edição, cancelamento e exclusão.
- Implementar cliente de API com `credentials: include`, envelopes `data/meta/links`, tratamento consistente de erros e envio de `X-XSRF-TOKEN` em mutações protegidas.
- Criar uma direção visual própria para finanças pessoais: clara, orientada a controle diário e legível em dados tabulares.
- Não implementar renderização SDUI no MVP; os endpoints SDUI permanecem disponíveis para evolução futura.

## Capabilities

### New Capabilities

- `frontend-auth`: Login, cadastro, logout, proteção de rotas autenticadas e recuperação de sessão local a partir das respostas da API.
- `transaction-management`: Listagem, extrato por período, criação, edição, cancelamento, exclusão, anexos, parcelamentos e recorrências de transações.
- `financial-dashboard`: Visualização da projeção financeira atual, recálculo manual e resumo de receitas, despesas e vencimentos relevantes.

### Modified Capabilities

- Nenhuma.

## Impact

- Novo app React/Next.js em TypeScript no repositório.
- Integração com a API em `http://localhost:8080` usando rotas `/api/*`, cookies HttpOnly e CSRF.
- Novas dependências frontend para framework, validação/formulários, estado de servidor, UI e testes.
- Novos testes unitários/de componente e testes de fluxo para autenticação e transações críticas.
