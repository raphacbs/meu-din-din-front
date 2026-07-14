## Context

O extrato (`ExtractView` + `TransactionList`) já filtra por período e renderiza uma `antd Table` no desktop / `List` no mobile. Status usa `TransactionStatusBadge` com tons mapeados, mas as cores de alguns estados (ex.: `A_VENCER` e `CANCELADA` ambos `default`) ficam pouco distintas. Não há coluna de ações na listagem; pagar hoje só é possível editando a transação (no app mobile, “Pagar” faz `PUT` com `paymentDate` = hoje). Anexos existem só na tela de detalhe via metadados (`fileName`, `fileUrl`, `mimeType`, `fileSize`). Não há endpoint dedicado de pagamento.

## Goals / Non-Goals

**Goals:**

- Ações rápidas com ícones na linha do extrato: Pagar (condicional) e Anexar comprovante
- Tags de status com cores semânticas claras por status
- Rodapé com totais de despesas, receitas e saldo do período filtrado
- Reutilizar APIs e componentes existentes (update, attachments, Badge)

**Non-Goals:**

- Upload real de arquivo / storage (continua metadados URL como hoje)
- Endpoint novo de “pay” no backend
- Alterar formulário completo de edição ou ações destrutivas (cancelar/excluir) na tabela
- Totais server-side ou paginação server-side do extrato

## Decisions

### 1. Pagar via `PUT` com `paymentDate` = hoje

- **Escolha**: Espelhar o app mobile — `transactions.update(id, { ...campos atuais, paymentDate: today })`. O backend recalcula o status (`PAGO` / `PAGO_COM_ATRASO`).
- **Alternativa**: Endpoint `POST .../pay` — rejeitada por não existir e estar fora do escopo.
- **Visibilidade**: Exibir botão só se status ∉ `{ PAGO, PAGO_COM_ATRASO, CANCELADA }`.
- **Confirmação obrigatória**: Ao clicar em Pagar, abrir `antd Modal.confirm` com título/conteúdo claros (ex.: “Confirmar pagamento?” / descrição + valor). Só dispara o `PUT` no `onOk`. Cancelar/fechar o modal **não** altera a transação.
- **Feedback**: Invalidar queries de extrato/transações/projection; toast ou mensagem de erro via `Alert`/`message`.

### 2. Anexar comprovante via Modal na linha

- **Escolha**: Botão com ícone abre `Modal` reutilizando o formulário de metadados de `TransactionAttachments` (extrair formulário compartilhável se necessário), sem navegar para o detalhe.
- **Alternativa**: Link para `/transactions/{id}` com âncora de anexos — pior UX para “ação rápida”.
- **Ícones**: `@ant-design/icons` — ex. `DollarOutlined` / `CheckCircleOutlined` para pagar, `PaperClipOutlined` para anexar; `Button type="text"` + `Tooltip` com label acessível (`aria-label`).

### 3. Totais no rodapé da Table

- **Escolha**: Calcular no client a partir das transações do extrato carregado:
  - Despesas = soma de `DESPESA` ativas (exclui `CANCELADA`)
  - Receitas = soma de `RECEITA` ativas
  - Saldo = receitas − despesas
- **UI**: `Table.summary` no desktop; bloco equivalente abaixo da `List` no mobile.
- **Alternativa**: Reusar `summarizeTransactions` do dashboard — preferível extrair helper compartilhado (ex. `lib/transactions/totals.ts`) para evitar drift.

### 4. Cores de status explícitas

- **Escolha**: Mapear cada `TransactionStatus` para cor antd distinta (não só tone genérico):
  - `A_VENCER` → `blue` / `processing`
  - `VENCE_HOJE` → `warning` (laranja)
  - `ATRASADA` → `error` (vermelho)
  - `PAGO` → `success` (verde)
  - `PAGO_COM_ATRASO` → `cyan` ou `geekblue` (pago, mas distinto de `PAGO`)
  - `CANCELADA` → `default` (cinza)
- Manter texto legível sem depender só da cor (`formatTransactionStatus`).

### 5. Escopo da listagem

- **Escolha**: Ações e rodapé aplicam-se ao `TransactionList` usado pelo extrato. Se a lista de `/transactions` reutilizar o mesmo componente, as ações aparecem lá também — aceitável e consistente. Se precisar restringir, passar prop `showRowActions` / `showSummary` (default `true` no extrato).

## Risks / Trade-offs

- **[Risk]** PUT de pagamento sobrescreve campos se o payload estiver incompleto → **Mitigation**: montar payload a partir da `TransactionResponse` completa da linha (type, amount, description, dates, tags).
- **[Risk]** Anexos por metadados de URL continuam pouco “upload” → **Mitigation**: fora de escopo; UX deixa claro o formulário atual.
- **[Risk]** Totais incluem não pagas e podem confundir com “caixa realizado” → **Mitigation**: rótulos claros (“Despesas”, “Receitas”, “Saldo”) do período filtrado; canceladas fora da soma.
- **[Risk]** Mobile sem coluna → **Mitigation**: ícones de ação no item da `List` + bloco de totais abaixo.

## Migration Plan

1. Ajustar cores de status + helper de totais
2. Adicionar coluna/ações e Modal de anexos
3. Rodapé `Table.summary` + mobile
4. Testes e regressão visual do extrato
5. Rollback = reverter o PR de frontend (sem migração de dados)

## Open Questions

- Nenhum bloqueante: decisão de payload de pagamento e exclusão de canceladas nos totais alinhadas ao mobile/dashboard.
