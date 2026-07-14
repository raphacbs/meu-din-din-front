## MODIFIED Requirements

### Requirement: Transaction status tags use distinct semantic colors
O frontend SHALL renderizar tags de status de transação com cores distintas por status, usando `antd Tag` com cor semântica e texto legível independente da cor.

#### Scenario: Status tag colors in extract and lists
- **WHEN** uma transação é exibida no Meu mês ou na listagem com badge de status
- **THEN** o status `A_VENCER` usa cor azul/processing
- **AND** o status `VENCE_HOJE` usa cor de aviso (warning / laranja)
- **AND** o status `ATRASADA` usa cor de erro (error / vermelho)
- **AND** o status `PAGO` usa cor de sucesso (success / verde)
- **AND** o status `PAGO_COM_ATRASO` usa vermelho claro, distinto de `ATRASADA` e de `PAGO`
- **AND** o status `CANCELADA` usa cor neutra/default
- **AND** o texto do status permanece legível sem depender apenas da cor
