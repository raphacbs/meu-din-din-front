## 1. Rota, nav e redirect

- [ ] 1.1 Criar rota `app/(app)/meu-mes` com a página Meu mês e remover/desativar a página antiga em `extract`
- [ ] 1.2 Configurar redirect `/extract` → `/meu-mes` preservando query `from`/`to` quando possível
- [ ] 1.3 Atualizar `app-nav` (label Extrato → Meu mês, href `/meu-mes`) e links do dashboard que apontem para Extrato
- [ ] 1.4 Atualizar testes de navegação/rota

## 2. Domínio: totais dual e ordenação

- [ ] 2.1 Estender helpers de totais com Previsto, Realizado, contagem liquidados/ativos e somas ainda a pagar/receber
- [ ] 2.2 Implementar split Pendentes vs Liquidados (excluir `CANCELADA`) e ordenação acordada
- [ ] 2.3 Cobrir helpers com testes unitários

## 3. UI Meu mês — shell e hero

- [ ] 3.1 Renomear/reescrever view (`ExtractView` → `MeuMesView`) com título Meu mês e visual moderno
- [ ] 3.2 Controles só-mês (MonthPicker e/ou ◀ ▶) com apply imediato + sync URL; sem Switch custom nem Filtrar
- [ ] 3.3 Implementar hero dual (Previsto principal, Realizado secundário) + progresso de liquidação
- [ ] 3.4 Estados loading / erro / mês vazio

## 4. Listas Pendentes e Liquidados

- [ ] 4.1 Renderizar duas seções/listas reutilizando row compartilhado (desktop/mobile conforme padrão atual)
- [ ] 4.2 Atualizar ações de linha: Quitar (DESPESA) / Receber (RECEITA), modal e toasts com copy correto
- [ ] 4.3 Manter anexar comprovante nas linhas das duas listas
- [ ] 4.4 Empty states por seção

## 5. Animação de liquidação

- [ ] 5.1 Implementar sequência CSS pós-sucesso (saída Pendentes → ênfase hero → entrada Liquidados), ~300–450ms
- [ ] 5.2 Respeitar `prefers-reduced-motion: reduce` (atualizar sem motion)
- [ ] 5.3 Evitar flicker com estado local/otimista antes do refetch completo

## 6. Testes e acabamento

- [ ] 6.1 Migrar/atualizar testes de `extract-view` para Meu mês (default mês, troca imediata, sem custom, redirect)
- [ ] 6.2 Atualizar testes de ações de linha (Quitar/Receber) e listagens/totais dual
- [ ] 6.3 Revisar copy residual “Extrato”/“Pagar” na superfície Meu mês e rodar suite de testes
