## 1. Ajustar Estado, Validação e Payload

- [x] 1.1 Atualizar a validação do formulário para exigir `amountInput` em transações avulsas e recorrentes.
- [x] 1.2 Atualizar a validação de recorrência para exigir `dueDate` quando o modo selecionado for recorrente.
- [x] 1.3 Atualizar `buildTransactionPayload` para enviar `amount` parseado em transações recorrentes.
- [x] 1.4 Atualizar `buildTransactionPayload` para enviar `amount` válido em transações parceladas usando o valor da parcela.
- [x] 1.5 Garantir que payloads de parcelamento e recorrência continuem enviando apenas o objeto aninhado correspondente ao modo selecionado.

## 2. Ajustar Interface do Formulário

- [x] 2.1 Renderizar o campo `Valor` também no modo recorrente.
- [x] 2.2 Renderizar e validar o campo `Vencimento` no modo recorrente.
- [x] 2.3 Preservar o campo `Valor da parcela` no modo parcelado e manter a semântica de valor por parcela.
- [x] 2.4 Revisar mensagens de erro para deixar claro qual valor monetário está faltando em cada modo.

## 3. Cobertura de Testes

- [x] 3.1 Atualizar testes existentes para validar o payload de transação avulsa após as mudanças.
- [x] 3.2 Adicionar teste para cadastro parcelado com `amount`, `installment.installmentAmount` e ausência de `recurrence`.
- [x] 3.3 Adicionar teste para cadastro recorrente com `amount`, `dueDate`, `recurrence` e ausência de `installment`.
- [x] 3.4 Adicionar teste de validação para recorrência sem valor ou sem vencimento.

## 4. Verificação

- [x] 4.1 Executar testes do formulário de transações.
- [x] 4.2 Executar lint ou verificação equivalente do frontend.
- [x] 4.3 Testar manualmente o cadastro avulso, parcelado e recorrente no fluxo de nova transação.
