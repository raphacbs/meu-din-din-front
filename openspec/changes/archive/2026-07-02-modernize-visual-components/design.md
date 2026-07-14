## Context

O frontend usa Next 16, React 19 e Tailwind 4, com uma identidade visual já iniciada em tokens como `ink-ledger`, `paper-mint`, `cash-green`, `due-amber`, `debt-red` e `graphite-line`. A aplicação tem componentes reutilizáveis pontuais em `components/ui`, mas muitos padrões de botão, campo, alerta, tabela e badge ainda são definidos diretamente nas telas.

A metáfora de produto mais forte é o caderno de caixa: papel, tinta, lançamentos, vencimentos e marcações. O design deve modernizar a interface sem substituir essa linguagem por uma aparência genérica de dashboard SaaS.

## Goals / Non-Goals

**Goals:**

- Criar uma camada consistente de componentes visuais reutilizáveis para ações, formulários, superfícies, estados e dados.
- Preservar e refinar a identidade de caderno de caixa do Meu Din Din.
- Melhorar a leitura de valores financeiros, status, vencimentos e ações em desktop e mobile.
- Reduzir repetição de classes Tailwind em formulários e listas.
- Manter foco visível, semântica adequada e labels textuais além de cor.
- Permitir uso seletivo de primitivas shadcn/Radix quando houver ganho real de acessibilidade ou comportamento.

**Non-Goals:**

- Não alterar fluxos de autenticação, payloads de transações, endpoints ou cache de dados.
- Não introduzir uma biblioteca visual completa que substitua a identidade existente.
- Não adicionar gráficos complexos ou novas análises financeiras nesta mudança.
- Não redesenhar a marca, nome, tom de voz ou arquitetura de navegação de produto além do necessário para os componentes visuais.

## Decisions

### 1. Evoluir um sistema visual próprio em vez de adotar um tema pronto

A base visual deve nascer dos tokens e metáforas existentes, com componentes próprios para `Button`, `Input`, `Field`, `Card`, `Badge`, `Alert`, `EmptyState`, `LoadingState`, `DataTable` e `DataCard`.

Alternativa considerada: instalar e usar shadcn/ui para todos os componentes básicos. Isso aceleraria a criação de arquivos, mas tende a aproximar a interface de uma estética comum. A escolha própria mantém a personalidade do produto e ainda permite incorporar padrões bons de acessibilidade.

### 2. Usar shadcn/Radix apenas para primitivas interativas complexas

Primitivas como `Dialog`, `Sheet`, `Tabs`, `Select`, `Popover` e possivelmente `Toast` podem usar shadcn/Radix quando forem necessárias, porque o comportamento acessível e teclado/foco são mais caros de manter manualmente.

Alternativa considerada: não adicionar dependências. Isso mantém o bundle menor, mas aumenta risco em componentes com gerenciamento de foco, fechamento por teclado e semântica ARIA.

### 3. Transformar a "faixa de caixa" no elemento assinatura

O dashboard deve usar a `CashRibbon` como componente autoral para organizar vencimentos, itens pagos e alertas em uma faixa de leitura financeira. Ela deve carregar a personalidade do produto enquanto o restante da UI fica mais disciplinado.

Alternativa considerada: trocar a faixa por cards e gráficos padrão. Isso facilitaria leitura convencional, mas perderia a metáfora diferenciada que já aparece no produto.

### 4. Criar padrões explícitos para formulários

Campos de login, cadastro e transações devem compartilhar componentes de campo com label, helper text, erro, estado desabilitado e foco. O seletor de modo da transação deve virar um controle segmentado acessível, mantendo radio inputs por baixo quando adequado.

Alternativa considerada: apenas ajustar classes nos formulários atuais. Isso melhora aparência localmente, mas não resolve a duplicação e dificulta manter consistência.

### 5. Modernizar listas como composição responsiva

A tabela desktop e os cards mobile devem continuar representando o mesmo dado, mas com componentes dedicados para cabeçalho, células de moeda, status, tags e metadados. A UI deve favorecer leitura escaneável e preservar acessibilidade sem depender apenas de cor.

Alternativa considerada: usar uma biblioteca de data table. A aplicação atual não exige ordenação, seleção, paginação avançada ou virtualização; uma solução local é mais simples e suficiente.

## Risks / Trade-offs

- Aumento inicial de arquivos em `components/ui` → Mitigar criando apenas primitivas usadas imediatamente.
- Reorganização de markup pode quebrar testes existentes → Mitigar atualizando testes por comportamento e labels, não por estrutura interna frágil.
- Dependências shadcn/Radix podem aumentar bundle se usadas sem critério → Mitigar adotando apenas primitivas necessárias e evitando importar blocos completos de dashboard.
- Visual mais autoral pode reduzir familiaridade em alguns pontos → Mitigar mantendo controles padrão reconhecíveis, textos claros e foco em tarefas financeiras.
- Mudança ampla pode ficar grande demais para revisar → Mitigar em fases: base visual, formulários/estados, dashboard/listagens.

## Migration Plan

1. Criar componentes visuais base em `components/ui` e migrar usos simples de botão, cartão, campo e badge.
2. Migrar autenticação e formulários de transação para os novos padrões de campo e ação.
3. Evoluir `ResponsiveDataView`, tabela de transações e cards mobile usando os componentes de dados.
4. Refinar dashboard, `CashRibbon`, cards de resumo e estados de carregamento/erro/vazio.
5. Atualizar testes afetados e validar lint/testes.

Rollback deve ser feito por etapa: como a mudança preserva contratos funcionais, cada migração de tela pode ser revertida independentemente para os componentes anteriores.

## Open Questions

- A modernização deve incluir ícones? Se sim, `lucide-react` é uma opção leve e alinhada ao ecossistema React.
- A navegação autenticada deve continuar como topo horizontal ou evoluir para sidebar/sheet em telas maiores?
- O projeto deve adotar toasts para feedback de ações ou manter feedback inline por enquanto?
