## Context

O frontend usa `ConfigProvider` com tokens fixos de tema claro em `lib/theme/antd-theme.ts`. Várias superfícies (AppShell, gráficos, listas) ainda aplicam cores hex hardcoded. Preferências de conta (`blockPastMonthMutations`) já sincronizam com a API; aparência é preferência puramente de cliente e deve funcionar antes/depois do login.

## Goals / Non-Goals

**Goals:**

- Três modos: `light`, `dark`, `system`.
- Persistência em `localStorage` com chave versionada.
- Resolução de `system` via `prefers-color-scheme` com listener para mudanças ao vivo.
- Tema antd via `theme.defaultAlgorithm` / `theme.darkAlgorithm` + tokens do ledger.
- Variáveis CSS em `:root` / `[data-theme="dark"]` para estilos globais e componentes custom.
- Seletor na tela de configurações.
- Script inline no layout para aplicar `data-theme` antes da hidratação.

**Non-Goals:**

- Persistir tema no backend / API de preferências do usuário.
- Refatorar todas as cores hardcoded do app nesta entrega (foco no shell, providers e CSS global).

## Decisions

1. **Persistência local (`localStorage`)** — tema é UX do dispositivo; não exige auth nem sync cross-device nesta fase.
2. **`ThemeProvider` dedicado** — contexto React + zustand leve para preferência e tema resolvido; `ConfigProvider` recebe algoritmo/tokens dinamicamente.
3. **`data-theme` no `<html>`** — alinha CSS custom e antd; script síncrono evita flash.
4. **Default `system`** — respeita preferência do SO/navegador na primeira visita.
5. **Tokens dark derivados do ledger** — manter `colorPrimary` verde caixa; inverter fundos/textos com contraste legível.

## Risks / Trade-offs

- **[Risk] Cores hardcoded restantes não acompanham dark mode** → Mitigação: ajustar AppShell, skip-link e CSS global; aceitar débito técnico em gráficos até refatoração futura.
- **[Risk] Flash na primeira visita** → Mitigação: script blocking no layout.
- **[Risk] Gráficos Recharts com cores fixas** → Mitigação: tooltip/bordas usam tokens onde tocado; charts fora do escopo mínimo.
