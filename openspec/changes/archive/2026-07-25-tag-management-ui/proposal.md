## Why

A API de gestão de tags (`tag-management-api`) expõe listagem, renomeação e exclusão em massa, mas o frontend ainda deriva sugestões carregando **todas** as transações e não oferece UI para manter tags organizadas. Usuários precisam de uma tela de gestão e autocomplete eficiente via `GET /api/tags`.

## What Changes

- Nova seção **Tags** em Configurações (ou rota `/settings/tags`) listando tags com contagem de uso.
- Ações de **renomear** e **excluir** tag com confirmação.
- `TagSelect` passa a usar `GET /api/tags` em vez de extrair tags do cache de transações.
- Invalidação de queries após rename/delete (transações, analytics, tags).

## Capabilities

### New Capabilities

- `tag-management-ui`: tela de gestão de tags e integração com API.

### Modified Capabilities

- `tag-selector`: autocomplete via endpoint dedicado de tags.

## Impact

- `lib/api/tags.ts`, `lib/query/keys.ts`
- `components/settings/tags-settings.tsx` (ou similar)
- `components/ui/tag-select.tsx`, `lib/transactions/use-tag-options.ts`
- Página/rota em `app/(app)/settings`
- Testes Vitest para componentes e hooks

## Dependencies

- Backend change `tag-management-api` implementada e disponível.
