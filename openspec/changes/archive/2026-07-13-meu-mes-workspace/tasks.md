## 1. Rota, nav e redirect

- [x] 1.1 Criar rota `app/(app)/meu-mes` com a página Meu mês e remover/desativar a página antiga em `extract`
- [x] 1.2 Configurar redirect `/extract` → `/meu-mes` preservando query `from`/`to` quando possível
- [x] 1.3 Atualizar `app-nav` (label Extrato → Meu mês, href `/meu-mes`) e links do dashboard que apontem para Extrato
- [x] 1.4 Atualizar testes de navegação/rota

## 2. Domínio: totais dual e ordenação

- [x] 2.1 Estender helpers de totais com Previsto, Realizado, contagem liquidados/ativos e somas ainda a pagar/receber
- [x] 2.2 Implementar split Pendentes vs Liquidados (excluir `CANCELADA`) e ordenação acordada
- [x] 2.3 Cobrir helpers com testes unitários

## 3. UI Meu mês — shell e hero

- [x] 3.1 Renomear/reescrever view (`ExtractView` → `MeuMesView`) com título Meu mês e visual moderno
- [x] 3.2 Controles só-mês (MonthPicker e/ou ◀ ▶) com apply imediato + sync URL; sem Switch custom nem Filtrar
- [x] 3.3 Implementar hero dual (Previsto principal, Realizado secundário) + progresso de liquidação
- [x] 3.4 Estados loading / erro / mês vazio

## 4. Listas Pendentes e Liquidados

- [x] 4.1 Renderizar duas seções/listas reutilizando row compartilhado (desktop/mobile conforme padrão atual)
- [x] 4.2 Atualizar ações de linha: Quitar (DESPESA) / Receber (RECEITA), modal e toasts com copy correto
- [x] 4.3 Manter anexar comprovante nas linhas das duas listas
- [x] 4.4 Empty states por seção

## 5. Animação de liquidação

- [x] 5.1 Implementar sequência CSS pós-sucesso (saída Pendentes → ênfase hero → entrada Liquidados), ~300–450ms
- [x] 5.2 Respeitar `prefers-reduced-motion: reduce` (atualizar sem motion)
- [x] 5.3 Evitar flicker com estado local/otimista antes do refetch completo

## 6. Testes e acabamento

- [x] 6.1 Migrar/atualizar testes de `extract-view` para Meu mês (default mês, troca imediata, sem custom, redirect)
- [x] 6.2 Atualizar testes de ações de linha (Quitar/Receber) e listagens/totais dual
- [x] 6.3 Revisar copy residual “Extrato”/“Pagar” na superfície Meu mês e rodar suite de testes
