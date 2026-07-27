## 1. Infraestrutura de tema

- [x] 1.1 Criar `lib/theme/theme-preference.ts` com tipos, storage versionado e resolução `system`
- [x] 1.2 Criar tokens antd light/dark em `lib/theme/antd-theme.ts`
- [x] 1.3 Criar `ThemeProvider` aplicando algoritmo antd, `data-theme` e listener de `prefers-color-scheme`
- [x] 1.4 Adicionar variáveis CSS dark em `globals.css` e script anti-flash em `layout.tsx`

## 2. UI e integração

- [x] 2.1 Integrar `ThemeProvider` em `app/providers.tsx`
- [x] 2.2 Adicionar seletor de aparência em `components/settings/settings-view.tsx`
- [x] 2.3 Ajustar `app-shell.tsx` e `app-nav.tsx` para respeitar tema (tokens/CSS vars)

## 3. Testes

- [x] 3.1 Testes unitários para storage e resolução de tema em `lib/theme/theme-preference.test.ts`
