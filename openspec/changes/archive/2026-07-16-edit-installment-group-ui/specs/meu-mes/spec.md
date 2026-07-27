## MODIFIED Requirements

### Requirement: Usuário edita transação a partir de Meu mês
O frontend SHALL permitir editar uma transação nas listas Pendentes e Liquidados via botão explícito com ícone e via clique na descrição, ambos abrindo o mesmo Drawer em modo edição (quando o gate de mês passado permitir). Para transações de grupo `PARCELAMENTO`, o Drawer SHALL carregar e exibir a lista das parcelas do grupo e persistir alterações estruturais via endpoints de grupo. Para demais transações, o Drawer SHALL persistir via `PUT /api/transactions/{id}`.

#### Scenario: Editar pelo botão
- **WHEN** o usuário aciona o botão Editar em uma linha liberada que não é parcelamento
- **THEN** o frontend abre o Drawer com o formulário preenchido
- **AND** ao salvar envia `PUT /api/transactions/{id}` e atualiza a visão

#### Scenario: Editar parcela pelo botão
- **WHEN** o usuário aciona o botão Editar em uma linha liberada de grupo `PARCELAMENTO`
- **THEN** o frontend abre o Drawer de edição do parcelamento com a lista das parcelas do grupo
- **AND** ao salvar (após confirmação de impacto quando cabível) envia `PUT /api/transactions/groups/{groupId}/installments` e atualiza a visão

#### Scenario: Editar pelo clique na descrição
- **WHEN** o usuário clica na descrição de uma transação liberada
- **THEN** o frontend abre o mesmo Drawer de edição apropriado ao tipo (ocorrência ou grupo parcelado)

#### Scenario: Edição bloqueada em mês passado
- **WHEN** a preferência “Bloquear edição e exclusão de meses passados” está `true` e a transação é de mês passado
- **THEN** o botão Editar fica indisponível
- **AND** o clique na descrição NÃO abre o Drawer de edição
