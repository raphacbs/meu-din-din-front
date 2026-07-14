## Context

O frontend Meu Din Din é um app Next.js 16 (App Router) com React 19, sem biblioteca de componentes externa. O design system atual é 100% customizado em Tailwind CSS 4: ~13 primitivos em `components/ui/`, formulários HTML nativos com validação manual via `useState`, navegação horizontal (header + AppNav) e inputs especializados simples (texto livre para tags, `inputMode="decimal"` para moeda).

A migração substitui esse sistema pelo Ant Design 5.x, adicionando três componentes especializados não disponíveis no antd nativamente: layout lateral (sidebar), teclado monetário virtual e seletor de tags com autocomplete.

Constraints relevantes:
- Next.js App Router exige tratamento explícito do CSS-in-JS do antd para evitar flash de estilos no SSR
- React 19 não é peer dep oficial do antd 5.x — warning esperado e aceito
- Sem mudanças no backend — tags extraídas client-side
- Tailwind CSS removido completamente ao final

## Goals / Non-Goals

**Goals:**
- Substituir todos os componentes visuais customizados por antd
- Introduzir sidebar de navegação com `antd Layout + Sider + Menu`
- Implementar teclado monetário virtual como Popover antd com acumulação em centavos
- Implementar seletor de tags com autocomplete + criação inline via `antd Select mode="tags"`
- Migrar formulários para `antd Form + Form.useForm()` com validação declarativa
- Substituir `InputNumber` antd com stepper nos campos numéricos (parcelas, intervalo)
- Remover Tailwind CSS e toda a infraestrutura relacionada

**Non-Goals:**
- Alterações no backend (sem novo endpoint de tags)
- Mudança de roteamento (Next.js App Router mantido)
- Troca de gerenciamento de estado (React Query + Context mantidos)
- Redesign da identidade visual (cores e metáfora de ledger preservadas via tokens antd)
- Adição de novos fluxos de negócio

## Decisions

### D1: antd 5.x com React 19 (peer dep warning aceito)

antd 5.x declara peer dep para React ^18. React 19 funciona na prática mas gera warning no install. antd 6.x teria suporte nativo mas está em RC com API instável.

**Alternativas consideradas:**
- antd 6.x RC → instabilidade de API e menor ecossistema de exemplos; descartado
- Downgrade para React 18 → regride o projeto sem ganho; descartado

**Decisão:** usar antd 5.x com `--legacy-peer-deps` na instalação.

---

### D2: SSR — `@ant-design/nextjs-registry` para resolver flash de estilos

O antd 5.x usa CSS-in-JS (Emotion/StyleSheet) por padrão. No Next.js App Router, o HTML gerado no servidor não inclui os estilos inline do antd, causando FOUC (Flash of Unstyled Content). A solução oficial é `@ant-design/nextjs-registry`, um Server Component que coleta os estilos críticos durante o render SSR e os injeta no `<head>`.

```
app/layout.tsx (Server Component)
└── AntdRegistry          ← coleta estilos SSR
      └── AppProviders    ← QueryClientProvider + SessionProvider + ConfigProvider
```

**Alternativa considerada:** `extractStyle` manual do `@ant-design/cssinjs` → mais complexo, mesmo resultado; descartado em favor do wrapper oficial.

---

### D3: Tailwind removido completamente — layout via antd `Space`, `Row/Col` e inline styles

antd tem seus próprios primitivos de layout: `Space`, `Flex`, `Row/Col`, `Grid`. Com Tailwind removido, o espaçamento e alinhamento dentro dos componentes usarão esses primitivos ou `style={{ ... }}` inline onde a expressividade do CSS-in-JS do antd for insuficiente.

**Alternativa considerada:** manter Tailwind para utilitários de layout + antd para componentes → convivência possível mas gera complexidade de build (dois sistemas de tokens e reset CSS conflitantes); descartado por complexidade.

---

### D4: Tema antd preservando identidade visual do ledger

O antd usa Design Tokens configuráveis via `ConfigProvider`. As cores da paleta atual (`cash-green`, `paper-mint`, `ink-ledger`, etc.) serão mapeadas para tokens antd:

```
token antd             ← valor atual do projeto
colorPrimary           ← --color-cash-green (#2d6a4f ou equivalente)
colorBgContainer       ← --color-surface
colorBgLayout          ← --color-surface-muted
colorBorderSecondary   ← --color-border
colorTextSecondary     ← --color-muted-foreground
```

O `ConfigProvider` fica em `AppProviders` (Client Component), abaixo do `AntdRegistry`.

---

### D5: Formulários — `antd Form` com `Form.useForm()`, validação declarativa

Formulários atualmente usam `useState` + validação manual em `lib/transactions/form.ts`. A migração para `antd Form` usa `Form.useForm()` para controle de campos e regras de validação inline em `Form.Item rules={[...]}`.

A lógica de negócio de `buildTransactionPayload` em `lib/transactions/form.ts` é preservada: o antd Form retorna os valores via `onFinish(values)`, que são passados para a função de payload existente.

```
onFinish(values) → buildTransactionPayload(values) → API call
```

Isso minimiza reescrita da lógica de negócio.

---

### D6: Teclado monetário virtual — acumulação em centavos, Popover antd

O teclado monetário é um componente `CurrencyInput` que encapsula:
1. Um `antd InputNumber` formatado em BRL (apenas display e fallback de teclado físico)
2. Um `antd Popover` aberto ao clicar/focar, contendo o `CurrencyKeyboard`

O `CurrencyKeyboard` mantém estado interno `centavos: number`:
- Cada dígito pressionado: `centavos = centavos * 10 + digit`
- Backspace: `centavos = Math.floor(centavos / 10)`
- Display: `(centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })`
- Ao fechar o Popover ou pressionar "OK": o valor `centavos / 100` é propagado ao `Form.Item` pai

```
CurrencyInput
├── antd InputNumber (formatter BRL, readOnly quando teclado aberto)
└── antd Popover
      └── CurrencyKeyboard
            ├── Display: "R$ 1.250,00"
            ├── Grid 3×4: [7][8][9] [4][5][6] [1][2][3] [,][0][⌫]
            └── [Confirmar]
```

O componente expõe `value: number | undefined` e `onChange: (v: number | undefined) => void` — interface compatível com `Form.Item`.

---

### D7: Seletor de tags — `Select mode="tags"` com opções extraídas de transações

Tags existentes são extraídas das transações já carregadas pelo React Query. Um hook `useTagOptions()` lê o cache de `transactions.list()` e deriva as opções:

```ts
function useTagOptions(): string[] {
  const { data } = useQuery({ queryKey: QUERY_KEYS.transactions, ... });
  return [...new Set(data?.flatMap(t => t.tags ?? []) ?? [])].sort();
}
```

O `Select mode="tags"` do antd exibe essas opções e permite criar novas tags digitando + Enter. O valor do campo é `string[]` diretamente, eliminando o parsing manual de vírgulas.

**Sem nova requisição de rede:** o cache React Query das transações já existe na maioria dos fluxos. Na tela de nova transação, se não houver cache, o Select funciona sem opções (criação livre apenas).

---

### D8: Sidebar — `antd Layout + Sider + Menu` claro com ícones e rota ativa

O `AppShell` usa `antd Layout` com `Sider` à esquerda em **tema claro** (`theme="light"`), alinhado à identidade do ledger (fundo branco, título em `cash-green`). O default escuro do antd (`siderBg: #001529`) é sobrescrito via tokens de `Layout`/`Menu` em `lib/theme/antd-theme.ts`.

O `Menu` usa `selectedKeys` derivado de `usePathname()`, ícones de `@ant-design/icons@5` (Dashboard, Transações, Extrato) e permanece colapsável via `collapsible`.

```
Layout (horizontal)
├── Sider (theme=light, collapsible)
│     ├── Logo "Meu Din Din" (verde da marca)
│     ├── Menu (ícones + labels)
│     │     ├── DashboardOutlined → /dashboard
│     │     ├── SwapOutlined → /transactions
│     │     └── FileTextOutlined → /extract
│     └── Footer: email + botão Sair
└── Layout (vertical)
      ├── Header: "Nova transação" (Button link)
      └── Content: {children}
```

**Nota de runtime:** `npm start` (`next start`) serve o build em `.next`; mudanças no shell só aparecem após `npm run build` ou com `npm run dev`.

## Risks / Trade-offs

**[React 19 peer dep warning]** → Aceito explicitamente. Usar `--legacy-peer-deps`. Monitorar se algum hook React 19 específico causa regressão no antd.

**[CSS-in-JS + SSR — flash de estilos]** → Mitigado por `@ant-design/nextjs-registry`. Risco residual: se o registry não for configurado corretamente, há FOUC perceptível.

**[Testes existentes com classes Tailwind]** → Os testes de componente que usam `getByClass` ou assertions em classes CSS quebrarão. Precisam ser reescritos para queries semânticas (`getByRole`, `getByText`, `getByLabelText`).

**[antd Popover + foco/teclado físico — conflito de input]** → O InputNumber dentro do CurrencyInput deve estar em `readOnly` quando o teclado virtual estiver aberto, para evitar que o teclado físico do dispositivo abra sobre o popup. Em desktop, o teclado físico pode ser permitido como fallback.

**[Tamanho do bundle — antd]** → antd 5.x usa tree-shaking automático por ES Modules. O bundle aumenta em relação ao Tailwind (que tem custo zero em runtime), mas é aceitável para um app interno.

**[Migração em fases — app temporariamente híbrida]** → Durante a implementação, partes do app usarão antd e partes usarão componentes custom. Isso é aceitável desde que cada fase mantenha a app funcional.

## Migration Plan

A migração segue 7 fases independentes, cada uma entregando valor sem quebrar a app:

1. **Base**: instalar antd + nextjs-registry, configurar AntdRegistry + ConfigProvider com tokens de cor, sem remover nada ainda
2. **Shell**: substituir AppShell + AppNav por antd Layout + Sider + Menu
3. **Componentes UI base**: substituir components/ui/* por antd direto (Button, Input, Card, Badge, Alert, etc.)
4. **Formulários auth**: login-form + register-form → antd Form
5. **Formulários de transação**: transaction-form → antd Form + campos especializados (CurrencyInput, TagSelect, InputNumber)
6. **Listagens e dashboard**: Table, List, confirmações Modal.confirm, dashboard Statistic + Card
7. **Limpeza final**: remover Tailwind e arquivos residuais, verificar testes

## Open Questions

- Nenhuma questão crítica em aberto. As decisões de D1–D8 cobrem todos os pontos identificados na exploração.
