# currency-keyboard

## Purpose

Entrada monetária via teclado virtual tipo calculadora, compatível com `antd Form`.

## Requirements

### Requirement: Campos de valor monetário exibem teclado virtual tipo calculadora

O frontend SHALL fornecer um componente `CurrencyInput` que ao ser focado ou clicado exibe um teclado monetário virtual em popup posicionado abaixo do campo, permitindo entrada de valores em reais sem depender do teclado físico do dispositivo.

#### Scenario: Teclado virtual abre ao focar o campo de valor

- **WHEN** o usuário clica ou foca o campo de valor monetário
- **THEN** o teclado virtual é exibido em popup abaixo do campo
- **AND** o display do teclado mostra "R$ 0,00" para um campo vazio

#### Scenario: Dígitos pressionados acumulam o valor em centavos

- **WHEN** o usuário pressiona os dígitos no teclado virtual
- **THEN** o valor é acumulado da direita para a esquerda em centavos
- **AND** o display atualiza em tempo real no formato "R$ X.XXX,XX"

#### Scenario: Tecla de apagar remove o último dígito

- **WHEN** o usuário pressiona a tecla de apagar no teclado virtual
- **THEN** o último dígito é removido do valor acumulado
- **AND** o display atualiza para refletir o novo valor

#### Scenario: Confirmar fecha o popup e atualiza o campo

- **WHEN** o usuário pressiona o botão "Confirmar" no teclado virtual
- **THEN** o popup fecha
- **AND** o campo de valor exibe o valor confirmado formatado em BRL
- **AND** o valor numérico é propagado para o formulário pai

#### Scenario: Fechar o popup sem confirmar descarta a entrada

- **WHEN** o usuário fecha o popup sem pressionar "Confirmar"
- **THEN** o valor do campo retorna ao estado anterior à abertura do teclado

### Requirement: CurrencyInput é compatível com antd Form

O componente `CurrencyInput` SHALL expor interface `value: number | undefined` e `onChange: (value: number | undefined) => void`, compatível com o protocolo de controle de campo do `antd Form.Item`.

#### Scenario: CurrencyInput é usado dentro de Form.Item

- **WHEN** o componente `CurrencyInput` é utilizado como filho direto de um `antd Form.Item`
- **THEN** o Form.Item controla o valor do campo via `value` e recebe atualizações via `onChange`
- **AND** erros de validação do Form são exibidos abaixo do campo
