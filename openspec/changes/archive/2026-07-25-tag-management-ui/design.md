## Context

Configurações já existem em `/settings` com preferências do usuário. Tags serão uma segunda seção na mesma página ou aba, seguindo padrão Ant Design do app.

## Goals / Non-Goals

**Goals:**
- Listar tags com `usageCount` da API.
- Renomear via modal com validação (não vazio, max 128).
- Excluir com `Popconfirm` (ação destrutiva).
- TagSelect consome API dedicada.

**Non-Goals:**
- Drag-and-drop, cores, merge visual de duplicatas sugeridas.
- Mobile (fora de escopo).

## Decisions

### Layout
- Seção "Tags" abaixo das preferências existentes em `settings/page.tsx`.
- Tabela Ant Design: colunas Nome, Usos, Ações (Renomear, Excluir).

### Data fetching
- `useQuery` com chave `queryKeys.tags`.
- Após rename/delete: invalidar `queryKeys.tags`, `queryKeys.transactions`, analytics keys.

### TagSelect
- Substituir `useTagOptions` para chamar `tags.list()` em vez de `transactions.list()`.
- Manter interface `value` / `onChange` inalterada.

## Risks

- Backend indisponível: TagSelect fallback para array vazio (usuário ainda cria tags inline).
