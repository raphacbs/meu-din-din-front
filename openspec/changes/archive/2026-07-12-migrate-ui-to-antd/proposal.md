## Why

A aplicação usa um design system customizado em Tailwind CSS com componentes primitivos escritos do zero, o que gera esforço de manutenção sem agregar diferencial de produto. Migrar para o Ant Design (antd 5.x) elimina esse overhead, entrega uma biblioteca de componentes madura com acessibilidade integrada, e permite introduzir três melhorias de UX altamente solicitadas: menu lateral de navegação, teclado monetário virtual para campos de valor, e seleção inteligente de tags com autocomplete.

## What Changes

- **BREAKING** Remoção completa do Tailwind CSS e de todos os componentes custom em `components/ui/`; substituição por componentes antd
- **BREAKING** Layout de navegação horizontal (header + nav) substituído por sidebar lateral com `antd Layout + Sider + Menu`
- Formulários migrados para `antd Form` com `Form.useForm()` e validação declarativa
- Campo de tags substituído por `antd Select mode="tags"` com autocomplete das tags extraídas das transações existentes e criação de novas tags inline
- Campos de valor monetário ganham teclado virtual tipo calculadora (popup abaixo do campo) construído com primitivas antd
- Campos numéricos de quantidade (parcelas, intervalo) substituídos por `antd InputNumber` com controles de incremento/decremento
- Adição de `@ant-design/nextjs-registry` para compatibilidade com Next.js App Router (SSR sem flash de estilos)
- Confirmações destrutivas migradas de inline `alertdialog` para `antd Modal.confirm`

## Capabilities

### New Capabilities

- `antd-app-shell`: Layout lateral com antd `Layout + Sider + Menu`, substituindo o header + nav horizontal atual
- `currency-keyboard`: Componente de teclado monetário virtual — popup tipo calculadora exibido abaixo do campo de valor, com acumulação interna em centavos
- `tag-selector`: Campo de seleção de tags com autocomplete baseado em tags existentes das transações e criação de novas tags inline

### Modified Capabilities

- `visual-component-system`: Todos os primitivos visuais (botões, inputs, selects, cards, badges, alertas, estados de carregamento/erro/vazio, tabelas, listas) passam a ser providos pelo antd; o design system customizado é removido
- `transaction-management`: O formulário de transação usa os novos campos especializados — `currency-keyboard` para valores, `tag-selector` para tags, `InputNumber` para quantidades

## Impact

- **Dependências**: adicionar `antd`, `@ant-design/nextjs-registry`; remover `tailwindcss`, `@tailwindcss/postcss`, `prettier-plugin-tailwindcss`
- **Arquivos modificados**: ~28 arquivos de componente e configuração
- **Arquivos removidos**: todos em `components/ui/` (13 arquivos)
- **Arquivos novos**: `components/ui/currency-keyboard.tsx`, `components/ui/currency-input.tsx`
- **Configuração**: `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/providers.tsx`
- **Testes existentes**: os testes de snapshot/unit que referenciam classes Tailwind precisarão ser atualizados
- **Backend**: nenhuma alteração necessária; tags são extraídas client-side das transações já carregadas
- **React 19 + antd 5.x**: peer dep warning esperado e aceito; funcional em produção
