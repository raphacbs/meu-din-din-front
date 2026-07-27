## Why

A seção **Tags** em Configurações lista todas as tags do usuário, mas sem filtro local. Com muitas tags cadastradas, encontrar uma específica para editar ou excluir fica trabalhoso.

## What Changes

- Adicionar campo de pesquisa acima da tabela de tags em Configurações.
- Filtrar a lista client-side por nome, ignorando maiúsculas/minúsculas.
- Exibir estado vazio específico quando a busca não encontra resultados.
- Cobrir filtragem e estado vazio com testes Vitest.

## Capabilities

### Modified Capabilities

- `tag-management-ui`: incluir pesquisa local na lista de tags em Configurações.

## Impact

- `components/settings/tags-settings.tsx`
- `components/settings/tags-settings.test.tsx`
