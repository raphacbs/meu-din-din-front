## Context

O formulário atual separa os modos de transação em avulsa, parcelada e recorrente. O campo `Valor` só aparece para transações avulsas; transações parceladas exibem `Valor da parcela`; transações recorrentes não exibem nenhum campo monetário.

A API exige `amount` maior que zero para todo `TransactionUpsertRequest`. Para parcelamentos, o backend também usa `installment.installmentAmount` para criar cada parcela. Para recorrências, o backend materializa ocorrências a partir da transação base, portanto o valor da transação base precisa ser capturado e enviado como `amount`.

## Goals / Non-Goals

**Goals:**

- Tornar visível e obrigatório o campo de valor necessário para transações recorrentes.
- Garantir que transações parceladas enviem `amount` válido sem remover o campo específico de valor da parcela.
- Manter o contrato atual da API, sem alterar tipos públicos ou endpoints.
- Cobrir os três modos de cadastro em testes de validação e payload.

**Non-Goals:**

- Alterar o backend ou o contrato de `/api/transactions`.
- Redesenhar todo o formulário de transações.
- Introduzir cálculo automático de valor total do parcelamento como requisito obrigatório.
- Alterar a edição de parcelamentos, que já é bloqueada pelo backend para payloads com `installment`.

## Decisions

1. **Recorrência usará o campo `amountInput` como valor da transação base.**

   Alternativas consideradas:
   - Criar um campo novo exclusivo para recorrência: aumentaria estado e validação sem necessidade, já que o contrato da API usa `amount`.
   - Reutilizar `installmentAmountInput`: misturaria conceitos de parcela e recorrência.

   Decisão: renderizar o campo `Valor` também no modo recorrente, validando `amountInput` e enviando o valor parseado em `amount`.

2. **Parcelamento manterá `installmentAmountInput` como fonte do valor por parcela e usará o mesmo valor para `amount`.**

   Alternativas consideradas:
   - Exibir um novo campo `Valor total`: mudaria a semântica atual e poderia confundir o usuário sobre se o backend espera total ou parcela.
   - Enviar `amount` como total calculado (`installmentAmount * installmentCount`): o backend cria parcelas usando `installmentAmount`, então o total não é a informação operacional principal.

   Decisão: manter a UI atual para parcelamento e preencher `amount` com o valor da parcela, garantindo que o payload passe pela validação comum do backend.

3. **Recorrência deve tratar vencimento como obrigatório no frontend.**

   Alternativas consideradas:
   - Deixar o backend rejeitar quando `dueDate` faltar: preserva o erro, mas mantém uma experiência ruim e inconsistente.
   - Usar automaticamente `nextOccurrenceDate` como `dueDate`: pode esconder uma decisão financeira importante.

   Decisão: exibir e validar o campo `Vencimento` para recorrências, porque o backend exige `dueDate` nesse modo.

## Risks / Trade-offs

- [Ambiguidade de `amount` em parcelamento] -> Mitigar com teste de payload e, se necessário no futuro, ajustar texto auxiliar para explicar que `Valor da parcela` é o valor usado para cada lançamento.
- [Mudança visual no formulário recorrente] -> Mitigar mantendo o layout existente e adicionando apenas os campos necessários.
- [Persistência de input ao alternar modo] -> Mitigar preservando o estado atual e validando apenas os campos relevantes ao modo selecionado.
