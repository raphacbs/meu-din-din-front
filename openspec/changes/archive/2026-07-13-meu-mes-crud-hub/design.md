## Context

Meu mês já é o workspace operacional do mês (hero dual, Pendentes/Liquidados, Quitar/Receber). Cadastro e edição ainda vivem em rotas `/transactions/new` e `/transactions/[id]`, e a listagem `/transactions` compete com Meu mês. O shell ainda oferece “Nova transação” no header e item de menu Transações.

Esta change concentra o CRUD no Meu mês e introduz preferências locais com contrato futuro de API (change backend `user-prefs-and-recurrence-delete`).

## Goals / Non-Goals

**Goals:**

- Hub único de create/edit/delete/settle/unsettle em Meu mês via Drawer.
- Gate de meses passados com preferência nomeada e default seguro.
- Navegação simplificada (Dashboard, Meu mês, Configurações).
- Seletor de mês com hierarquia visual clara.
- Contratos de cliente prontos para sync de preferências e delete “esta e futuras”, com fallback local enquanto a API não existir.

**Non-Goals:**

- Implementar a API de preferências ou o endpoint de delete-from-here neste repositório (só consumo/stubs + localStorage).
- Reimplementar o formulário de transação (reutilizar `TransactionForm`).
- Redesign amplo do dashboard além de ajustar CTAs quebrados.
- Soft-delete ou lixeira.

## Decisions

### 1. Drawer em vez de Modal ou página

- **Decisão:** `antd Drawer` (largura generosa / full em mobile) hospeda `TransactionForm` para create e edit.
- **Por quê:** o formulário tem modos avulso/parcelado/recorrente e muitos campos; página dedicada sai do fluxo do mês; Modal fica apertado.
- **Alternativas:** Modal (rejeitado por densidade); manter rotas (rejeitado — usuário pediu tudo em Meu mês).

### 2. Estado do Drawer no MeuMesView

- **Decisão:** estado local `drawerMode: 'create' | 'edit' | null` + `editingTransaction`. CTA do hero, botão Editar e clique na descrição disparam o mesmo Drawer.
- **Deep link opcional:** `?new=1` em `/meu-mes` abre create (para CTAs do dashboard após redirect).

### 3. Desfazer quitação

- **Decisão:** `PUT /api/transactions/{id}` com payload preservando campos e `paymentDate` omitido/null (conforme contrato do cliente). Confirmação via Modal.
- **Por quê:** backend já recalcula status com `paymentDate` nullable; não precisa de endpoint novo.

### 4. Exclusão recorrente

- **Decisão:** se `group?.type === 'RECORRENCIA'`, o confirm oferece “Só esta” (`DELETE /{id}`) e “Esta e futuras”.
- **Enquanto a API de futuras não existir:** UI pode existir mas a opção “Esta e futuras” chama o cliente novo e trata erro graciosamente, **ou** fica desabilitada com nota — preferência: implementar o método de API no client e usar quando disponível; se 404/501, message claro. Tasks front assumem contrato do change backend; implementação pode ser feature-flagged por presença do método.
- Parcelamento: exclusão unitária; grupo inteiro permanece via fluxo existente se já houver UI — fora do escopo mínimo se não estiver nas listas.

### 5. Preferência e gate

- **Chave localStorage:** `meu-din-din:prefs:blockPastMonthMutations` (boolean, default `true`).
- **Semântica:** `true` = bloquear edição/exclusão de transações cujo mês de referência (dueDate ?? transactionDate) é **anterior** ao mês civil atual; mês atual e futuros sempre liberados.
- **UI bloqueada:** botões Editar/Excluir desabilitados + tooltip; clique na descrição não abre drawer de edição.
- **Sync futuro:** ao existir `GET/PUT /api/users/me/preferences`, hidratar/persistir a mesma chave sem mudar o label.

### 6. Remoção de Transações

- **Decisão:** remover de `NAV_ITEMS`; páginas `/transactions*` redirecionam para `/meu-mes` (preservar query útil se houver).
- Componentes de listagem podem permanecer no codebase temporariamente sem rota, ou serem deletados nas tasks se sem referências.

### 7. Hero / seletor de mês

- **Decisão:** o nome do mês (ex.: “julho 2026”) é o elemento tipográfico principal e aciona o MonthPicker; setas ◀ ▶ grandes; remover ou reduzir o DatePicker compacto separado para não competir visualmente.

## Risks / Trade-offs

- [Deep links antigos para `/transactions/[id]`] → Mitigation: redirect para `/meu-mes`; edição só pelo extract do mês (usuário pode precisar trocar o mês).
- [API “esta e futuras” atrasada] → Mitigation: exclusão unitária funciona; opção futuras depende do backend change.
- [localStorage por browser/dispositivo] → Mitigation: aceito até sync de preferências; documentado em `user-settings`.
- [Drawer + form longo em mobile] → Mitigation: Drawer full-height; testar com Segmented de modos.

## Migration Plan

1. Entregar Meu mês + settings + redirects.
2. Remover CTA do header e item Transações.
3. Quando backend de prefs/delete-from-here subir, trocar persistência e habilitar exclusão em cascata sem mudar copy.

## Open Questions

Nenhuma bloqueante — decisões fechadas na exploração.
