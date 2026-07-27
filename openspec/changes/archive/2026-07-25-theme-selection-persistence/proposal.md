## Why

O app hoje só oferece tema claro fixo. Usuários que preferem dark mode ou seguem a preferência do sistema/navegador não têm controle sobre a aparência, o que reduz conforto visual em ambientes com pouca luz e ignora expectativas modernas de acessibilidade.

## What Changes

- Adicionar preferência de tema com três opções: **Claro**, **Escuro** e **Sistema** (segue `prefers-color-scheme` do navegador).
- Persistir a escolha em `localStorage` no cliente, independente da API de preferências do usuário.
- Aplicar o tema resolvido globalmente via `ConfigProvider` do antd e variáveis CSS do ledger.
- Expor seletor de tema na tela `/settings`.
- Evitar flash de tema incorreto na carga inicial com script síncrono no layout raiz.

## Capabilities

### New Capabilities

- `theme-preference`: seleção, resolução (light/dark/system) e persistência local do tema visual.

### Modified Capabilities

- `user-settings`: incluir controle de aparência na tela de configurações.
- `visual-component-system`: suportar identidade visual do ledger em modo claro e escuro via tokens.

## Impact

- `app/layout.tsx`, `app/providers.tsx`, `app/globals.css`
- `lib/theme/*` (novo provider, tokens light/dark)
- `components/settings/settings-view.tsx`
- `components/app/app-shell.tsx` e componentes com cores hardcoded críticas para chrome do app
