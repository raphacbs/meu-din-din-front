## Context

No Meu mês, a criação de transações é unitária via Drawer (`TransactionForm`). Não há fluxo de importação, upload multipart nem grade editável em lote. A API (change homônima em `meu-din-din`) exporá `POST .../import/parse` (multipart) e `POST .../import/batch` (JSON). Tags já usam `TagSelect` free-form; o client `apiFetch` hoje força JSON quando há `body`, o que precisa de caminho para `FormData`.

## Goals / Non-Goals

**Goals:**

- Oferecer entrada clara de **Importar fatura** no hub Meu mês.
- Coletar PDF + banco (Inter na v1), chamar o parse e apresentar revisão estilo planilha.
- Permitir editar descrição, valor e tags por linha; editar datas individualmente e em massa via campos de referência; selecionar/deselecionar linhas antes de salvar.
- Enviar só as linhas selecionadas ao batch create e atualizar o Meu mês.

**Non-Goals:**

- Implementar parser/IA no frontend.
- Suportar outros bancos além do seletor preparado (v1: só Inter habilitado).
- Importar como parcelamento/recorrência.
- Persistência local offline do rascunho da grade.

## Decisions

### 1. Entrada no hero: Dropdown ou menu ao lado de “Nova transação”

- **Decisão:** Expor “Importar fatura” a partir do hero de Meu mês (Dropdown no botão principal ou item secundário no mesmo grupo de ações), abrindo um fluxo dedicado (Drawer largo ou tela/passo embutido) em vez de navegar para rota nova.
- **Por quê:** Mantém o hub operacional; alinhado ao padrão Drawer já usado.
- **Alternativas:** rota `/meu-mes/import` — possível depois se o fluxo crescer; por ora Drawer/wizard no Meu mês reduz navegação.

### 2. Wizard em dois passos

- **Decisão:**
  1. **Upload:** `Upload` antd (PDF) + `Select` de banco (`INTER`); botão “Ler fatura” → `FormData` para parse.
  2. **Revisão:** tabela editável com checkboxes; ações de aplicar datas de referência; “Salvar selecionadas” → batch.
- **Por quê:** Espelha o contrato da API e o pedido do usuário (revisar antes de persistir).

### 3. Grade estilo Excel

- **Decisão:** Usar `Table` antd com células editáveis (Input/InputNumber/`TagSelect`/DatePicker) e estado local controlado (array de rows). Colunas mínimas: seleção, descrição, valor, `transactionDate`, `dueDate`, tags. Cabeçalho ou barra de ferramentas com DatePickers de referência + botões “Aplicar data da transação” / “Aplicar vencimento” às linhas selecionadas (ou a todas, se nenhuma selecionada — documentar na UI).
- **Por quê:** Atende edição individual + em massa sem spreadsheet lib pesada.
- **Alternativas:** Handsontable/AG Grid — poder demais e custo de bundle; adiar.

### 4. Seleção de linhas

- **Decisão:** `rowSelection` do Table; default todas selecionadas após o parse; só as marcadas entram no payload do batch.
- **Por quê:** Usuário remove ruído (IOF, estornos indesejados) sem apagar da grade.

### 5. Cliente API

- **Decisão:** Novo módulo `lib/api/transactions-import.ts` (ou métodos em `transactions.ts`):
  - `parseInvoice({ file, bank })` com `FormData` e `apiFetch` que **não** define `Content-Type` manualmente (boundary do browser).
  - `createBatch(items)` JSON array/objeto conforme contrato da API.
- **Por quê:** Evita bug do `Content-Type: application/json` em multipart.

### 6. Pós-sucesso

- **Decisão:** Invalidar `queryKeys` de transactions/extract/projection como no Drawer; toast com quantidade criada; se a API retornar falhas parciais, mostrar resumo e manter na grade (ou listar) os índices que falharam.
- **Por quê:** Coerência com o restante do Meu mês.

### 7. Banco obrigatório na v1, extensível

- **Decisão:** Select com Inter; placeholder/comentário de que no futuro o campo poderá ser omitido com detecção automática.
- **Por quê:** Escopo explícito do pedido.

### 8. Créditos/pagamentos vindos do parse

- **Decisão:** Se a API marcar linhas de crédito (`+ R$`, ex. `PAGAMENTO ON LINE`), iniciar **desmarcadas** na grade; débitos iniciam selecionados.
- **Por quê:** No modelo Inter, pagamentos aparecem no mesmo extrato das despesas (páginas 3–6) e normalmente não devem virar `DESPESA` no Meu Din Din.

## Risks / Trade-offs

- **[Risco]** Drawer estreito para grade larga → **Mitigação:** `width` grande / `placement` ou fullscreen no mobile com scroll horizontal.
- **[Risco]** Muitas linhas → performance de re-render → **Mitigação:** editar células com estado por linha; evitar recriar colunas a cada keystroke; virtualização só se necessário.
- **[Risco]** API ainda não deployada → **Mitigação:** feature atrás da change de backend; mensagens de erro de parse claras.
- **[Risco]** CSRF + FormData → **Mitigação:** reutilizar headers de auth/CSRF do `apiFetch`.

## Migration Plan

- Deploy frontend após (ou junto) dos endpoints de import.
- Rollback: remover entrada de menu / reverter PR; sem migração de dados.

## Open Questions

- Drawer vs página dedicada se a grade ficar apertada em mobile — default Drawer largo; validar no implement.
- Comportamento exato de “aplicar data a todas” vs “somente selecionadas” — default proposto: se houver seleção, só selecionadas; senão, todas.
