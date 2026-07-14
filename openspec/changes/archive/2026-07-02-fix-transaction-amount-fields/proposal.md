## Why

Ao cadastrar transações parceladas ou recorrentes, o formulário não oferece uma forma consistente de informar o valor da transação. Isso faz com que o frontend envie `amount` inválido ou incompleto para a API, bloqueando o cadastro e criando ambiguidade entre o valor principal da transação e o valor de cada parcela.

## What Changes

- Ajustar o formulário de transações para exibir e validar o campo monetário necessário em todos os modos de cadastro.
- Garantir que transações recorrentes permitam informar o valor que será enviado como `amount`.
- Alinhar o cadastro parcelado para enviar um `amount` válido junto com o objeto `installment`, preservando o campo de valor da parcela.
- Garantir que o payload gerado para transações parceladas e recorrentes respeite as validações atuais do backend.
- Atualizar testes do formulário para cobrir os modos parcelado e recorrente com valores monetários válidos.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `transaction-management`: o formulário de criação de transações deve capturar e enviar corretamente valores monetários para transações avulsas, parceladas e recorrentes.

## Impact

- Componentes do formulário de transações em `components/transactions`.
- Lógica de estado, validação e payload em `lib/transactions/form.ts`.
- Tipos e contrato já existentes de `TransactionUpsertRequest`, sem mudança esperada na API.
- Testes de formulário de transações.
