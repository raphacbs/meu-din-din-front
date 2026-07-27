## Context

A gestão de tags em Configurações já carrega `GET /api/tags` e renderiza uma tabela antd. A API não expõe busca server-side; o volume típico de tags por usuário justifica filtro local sem nova rota.

## Goals / Non-Goals

**Goals:**

- Campo `Input.Search` com `allowClear` e label acessível acima da tabela.
- Filtro por substring no nome, normalizado com `normalizeTagName` (case-insensitive).
- Mensagem distinta quando há tags cadastradas mas a busca não retorna resultados.

**Non-Goals:**

- Paginação ou busca server-side na API.
- Sincronizar termo de busca com URL ou persistência.

## Decisions

1. **Filtro client-side** — reutiliza dados já carregados; zero latência e sem mudança no backend.
2. **`useMemo` para lista filtrada** — evita recomputar a cada render quando a query e o termo não mudam.
3. **`Input.Search` do antd** — consistente com o restante do app e oferece botão de limpar nativo.

## Risks / Trade-offs

- **[Risco]** Listas muito grandes (centenas de tags) podem ficar lentas no filtro → **Mitigação**: aceitável no escopo atual; paginação futura se necessário.
