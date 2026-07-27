## Why

Na revisão da importação de fatura, o usuário ainda precisa etiquetar linha a linha, não transforma automaticamente parcelas detectadas na descrição (ex.: “Parcela 5 de 10”) em um parcelamento completo e não consegue marcar um lançamento como recorrente antes de salvar. Isso força trabalho manual pós-importação e perde o contexto que a própria fatura já traz.

## What Changes

- Permitir **aplicar tags em lote** na grade de revisão (às linhas selecionadas ou a todas), além da edição por linha já existente.
- **Detectar padrão de parcela na descrição** (ex.: `5 de 10`, `(Parcela 05 de 10)`) e, ao salvar, criar um **parcelamento com as parcelas restantes incluindo a atual** (ex.: `5 de 10` → 6 parcelas, da 5 à 10), em vez de um lançamento avulso.
- Oferecer **opção por linha** para marcar o lançamento como **recorrente** no batch (com defaults sensatos, alinhados ao formulário unitário).
- Parcelamento e recorrência em uma mesma linha permanecem **mutuamente exclusivos**; se ambos forem aplicáveis, a UI deixa isso explícito e impede o conflito.
- Depende de evolução do contrato de batch na API (`meu-din-din`): suporte a `installment` / `recurrence` (e, se necessário, início da série em parcela N) no create em lote.

## Capabilities

### New Capabilities

<!-- Nenhuma — evolução da capability existente de importação. -->

### Modified Capabilities

- `invoice-import`: bulk de tags; detecção/confirmação de parcelas restantes a partir da descrição; marcar linha como recorrente no salvamento em lote.

## Impact

- Frontend: `invoice-import-drawer` e tipos/cliente de import (`transactions-import`, `api` types); reutilizar `TagSelect` e padrões de modo parcelado/recorrente do formulário de transação.
- API (repo `meu-din-din`, change separada ou coordenada): estender `InvoiceBatchItemRequest` / `toUpsertRequest` para aceitar `installment` e `recurrence`; eventualmente `startingInstallmentNumber` (ou equivalente) para criar só as parcelas restantes; parser pode opcionalmente devolver campos estruturados `installmentCurrent` / `installmentTotal`.
- Specs: delta em `invoice-import`; sem mudança de requirements em `tag-selector` (reuso do componente).
- Sem alteração do fluxo unitário de Meu mês, exceto o que for compartilhado via helpers de payload.
