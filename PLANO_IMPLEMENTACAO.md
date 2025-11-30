# 📋 Plano de Implementação - Forex Pro

## 🎯 Objetivo
Transformar a aplicação em um sistema **totalmente funcional** com tracking real de sinais, cálculo automático de performance e persistência em nuvem.

---

## 📊 Arquitetura Atual

### ✅ O que já temos:
- ✅ Geração de sinais com dados REAIS (Frankfurter API)
- ✅ Dashboard com cards de estatísticas
- ✅ Histórico de sinais
- ✅ Página de Performance (estrutura)
- ✅ Armazenamento local (localStorage)
- ✅ 12 pares de moedas principais

### ❌ O que falta:
- ❌ **Tracking em tempo real** dos sinais (verificar se TP ou SL foi atingido)
- ❌ **Atualização automática** de status (ACTIVE → HIT_TP/HIT_SL)
- ❌ **Cálculos reais** de performance (win rate, pips líquidos)
- ❌ **Persistência em nuvem** (Supabase)
- ❌ **Automação** para verificar sinais periodicamente (N8N)

---

## 🗺️ Plano Completo (3 Fases)

### **FASE 1: Sistema de Tracking Local** (Essencial)
**Objetivo:** Fazer o tracking funcionar localmente, sem Supabase/N8N

#### 1.1 - Criar Serviço de Tracking de Sinais
- Verificar preço atual vs TP/SL de cada sinal ACTIVE
- Atualizar status automaticamente quando TP ou SL é atingido
- Registrar timestamp de fechamento

**Arquivos a criar/modificar:**
- `integrations/signalTracker.js` (NOVO)
- `Entities/Signal.js` (adicionar método `checkAndUpdateStatus`)

#### 1.2 - Implementar Verificação Automática
- Componente que roda a cada X minutos
- Busca preços atuais da API
- Compara com sinais ACTIVE
- Atualiza status se necessário

**Arquivos a criar/modificar:**
- `Components/tracking/SignalMonitor.jsx` (NOVO)
- `Layout.jsx` (adicionar SignalMonitor)

#### 1.3 - Adicionar Controles Manuais
- Botão "Verificar Sinais Agora"
- Botão "Marcar como TP Atingido" (manual)
- Botão "Marcar como SL Atingido" (manual)

**Arquivos a modificar:**
- `Components/signals/SignalCard.jsx`

---

### **FASE 2: Performance e Estatísticas** (Essencial)

#### 2.1 - Implementar Cálculos Reais
- Win Rate = (Sinais com TP / Total de Sinais Fechados) × 100
- Pips Líquidos = Σ(Pips ganhos em TP) - Σ(Pips perdidos em SL)
- Confiança Média
- Performance por Par de Moedas

**Arquivos a criar:**
- `lib/performanceCalculator.js` (NOVO)

#### 2.2 - Atualizar Dashboard
- Mostrar estatísticas REAIS calculadas
- Gráficos de performance (opcional)

**Arquivos a modificar:**
- `Pages/Dashboard.jsx`
- `Components/signals/MarketOverview.jsx`

#### 2.3 - Página de Performance Completa
- Cards com estatísticas detalhadas
- Breakdown por status
- Performance por par de moedas
- Histórico de sinais recentes

**Arquivos a modificar:**
- `Pages/Performance.jsx`

---

### **FASE 3: Nuvem e Automação** (Opcional/Futuro)

#### 3.1 - Integração Supabase
- Criar tabela `signals` no Supabase
- Migrar de localStorage para Supabase
- Sincronização em tempo real

**Benefícios:**
- ✅ Dados persistem entre dispositivos
- ✅ Backup automático
- ✅ Acesso de qualquer lugar

**Arquivos a criar/modificar:**
- `integrations/supabase.js` (NOVO)
- `Entities/Signal.js` (adaptar para Supabase)

#### 3.2 - Automação N8N
- Workflow que roda a cada 15 minutos
- Busca sinais ACTIVE do Supabase
- Verifica preços atuais
- Atualiza status automaticamente

**Componentes do Workflow:**
1. Cron trigger (15 min)
2. Buscar sinais ACTIVE (Supabase)
3. Buscar preços atuais (Frankfurter API)
4. Comparar e atualizar status
5. Enviar notificação (opcional)

---

## 🚀 Ordem de Implementação Recomendada

### **AGORA (Essencial):**
1. ✅ Sistema de Tracking Local (Fase 1)
2. ✅ Cálculos de Performance (Fase 2)
3. ✅ Atualizar todas as páginas com dados reais

### **DEPOIS (Quando necessário):**
4. ⏳ Integração Supabase (quando precisar de persistência em nuvem)
5. ⏳ Automação N8N (quando quiser verificação automática sem abrir o app)

---

## 💭 Decisões a Tomar

### 1. **Frequência de Verificação de Sinais**
- Opção A: Manual (usuário clica "Verificar Sinais")
- Opção B: Automático a cada X minutos quando app está aberto
- Opção C: N8N verifica mesmo com app fechado

**Recomendação:** Começar com **A + B**, adicionar C depois se necessário.

### 2. **Persistência de Dados**
- Opção A: localStorage (atual) - Simples, mas só local
- Opção B: Supabase - Requer configuração, mas dados em nuvem

**Recomendação:** Começar com **A** (já funciona), migrar para **B** quando precisar.

### 3. **Notificações**
- Opção A: Toast no app (quando sinal atinge TP/SL)
- Opção B: Email via N8N
- Opção C: Telegram/Discord via N8N

**Recomendação:** Começar com **A**, adicionar B/C depois.

---

## 📝 Próximos Passos

### Vamos começar pela **FASE 1**?

1. Criar sistema de tracking de sinais
2. Implementar verificação automática
3. Adicionar controles manuais

**Quer que eu comece implementando a Fase 1 agora?**

Ou prefere discutir o plano primeiro e fazer ajustes?
