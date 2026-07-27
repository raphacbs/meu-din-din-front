## 1. Tipos e cliente de importação

- [x] 1.1 Estender tipos TS do batch item com `installment` e `recurrence` opcionais (espelhando o create unitário)
- [x] 1.2 Atualizar montagem do payload em `transactions-import` / drawer para enviar esses campos quando o modo da linha exigir
- [x] 1.3 Extrair helper de parse de parcela na descrição (`N de M` / `Parcela N de M`) com validação `1 ≤ current < total`

## 2. Bulk de tags na revisão

- [x] 2.1 Adicionar `TagSelect` de referência e botão “Aplicar tags” na barra de ferramentas da grade
- [x] 2.2 Implementar aplicação substituindo tags nas linhas selecionadas (ou em todas se nenhuma selecionada)

## 3. Parcelamento na grade

- [x] 3.1 Após o parse, detectar parcelas e preencher estado da linha (`current`, `total`, modo parcelado default)
- [x] 3.2 Exibir indicação/preview do intervalo restante e controle para ativar/desativar parcelamento por linha
- [x] 3.3 No save, montar `installment` com `installmentCount = total - current + 1`, amount e `firstDueDate` da linha (e starting/total quando o contrato da API estiver disponível)

## 4. Recorrência na grade

- [x] 4.1 Adicionar controle por linha para marcar como recorrente (defaults mensais)
- [x] 4.2 Garantir exclusão mútua entre modos parcelado e recorrente na mesma linha
- [x] 4.3 No save, montar `recurrence` (`MONTHLY`, `intervalCount: 1`, `nextOccurrenceDate` a partir do `dueDate`)

## 5. UX e regressão

- [x] 5.1 Atualizar texto de ajuda do drawer cobrindo tags em lote, parcelas detectadas e recorrência
- [x] 5.2 Validar fluxo: parse → editar → bulk tags → salvar avulso / parcelado / recorrente → Meu mês atualiza
- [x] 5.3 Validar falha parcial do batch ainda permite retentar linhas com erro

## 6. Dependência API (`meu-din-din`, PR coordenado)

- [x] 6.1 Estender `InvoiceBatchItemRequest` / `toUpsertRequest` para repassar `installment` e `recurrence`
- [x] 6.2 Suportar criação de série a partir de `startingInstallmentNumber` com `installmentCount` total original (números current..total)
- [x] 6.3 Propagar tags para todas as parcelas no create de parcelamento
