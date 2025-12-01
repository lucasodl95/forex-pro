# 📈 Forex Pro - Assistente de Trading com IA

> 🚀 **Sistema completo de trading com dados reais, tracking automático e análise de performance**

## 🎯 Visão Geral

**Forex Pro** é uma aplicação web avançada de trading de Forex que utiliza:
- **Dados de mercado REAIS** em tempo real (API Frankfurter - Banco Central Europeu)
- **Inteligência Artificial** (OpenAI GPT-4o-mini) para análise e geração de sinais
- **Tracking automático** de sinais com verificação de TP/SL
- **Cálculos de performance** em tempo real (win rate, pips líquidos, etc.)

## ✨ Características Principais

### 🤖 1. Geração de Sinais com Dados Reais
- ✅ **100% baseado em dados reais** do Banco Central Europeu (API Frankfurter)
- ✅ Análise de **12 pares de moedas principais**
- ✅ Geração automática de 5-8 sinais de alta qualidade
- ✅ Análise técnica com histórico de 7 dias
- ✅ Cálculos precisos de TP, SL, Risk:Reward e Pips

**Cada sinal inclui:**
- Tipo de operação (BUY/SELL)
- Preço de entrada atual
- Take Profit (TP) calculado
- Stop Loss (SL) calculado
- Nível de confiança (1-10)
- Timeframe (15M, 1H, 4H)
- Razão Risco:Recompensa (mínimo 1.5:1)
- Potencial de pips (mínimo 10 pips)
- Análise detalhada baseada em dados reais

### 🔍 2. Tracking Automático de Sinais (FASE 1 ✅)
- ✅ **Verificação automática a cada 5 minutos**
- ✅ Busca preços atuais de mercado
- ✅ Compara com TP e SL de cada sinal ativo
- ✅ Atualiza status automaticamente (ACTIVE → HIT_TP/HIT_SL)
- ✅ Registra timestamp e preço de fechamento
- ✅ Notificações em tempo real quando TP/SL é atingido
- ✅ **Controles manuais** nos cards (botões "TP Atingido" e "SL Atingido")

### 📊 3. Performance Real (FASE 2 ✅)
- ✅ **Win Rate** calculado em tempo real
- ✅ **Pips Líquidos** (ganhos - perdas)
- ✅ **Confiança Média** de todos os sinais
- ✅ **Performance por Par de Moedas** com breakdown detalhado
- ✅ Estatísticas por status (Ativos, TP, SL)
- ✅ Melhores e piores sinais
- ✅ Dashboard atualiza automaticamente

### 🎨 4. Interface Moderna
- Dashboard interativo com estatísticas em tempo real
- Cards animados (Framer Motion)
- Tema dark com Tailwind CSS
- Componentes reutilizáveis (shadcn/ui)
- Responsivo para mobile e desktop
- Sistema de notificações (Sonner)

### 📜 5. Histórico e Análise
- Histórico completo de todos os sinais
- Filtros por status (Ativo, TP atingido, SL atingido)
- Página de Performance com estatísticas detalhadas
- Análise de performance por período
- Exportação de dados (futuro)

## 🏗️ Arquitetura

### Dados de Mercado
```
API Frankfurter (Banco Central Europeu)
    ↓
Busca taxas de câmbio atuais + histórico 7 dias
    ↓
Análise de tendência (BULLISH/BEARISH/NEUTRAL)
    ↓
Cálculo de volatilidade
    ↓
IA analisa e gera sinais baseados em dados reais
```

### Tracking Automático
```
SignalMonitor (a cada 5 min)
    ↓
Busca todos os sinais ACTIVE
    ↓
Para cada sinal: busca preço atual
    ↓
Compara com TP e SL
    ↓
Se atingido: atualiza status + notifica
    ↓
Dashboard recarrega automaticamente
```

### Cálculos de Performance
```
PerformanceCalculator
    ├─ Win Rate = (TP / Total Fechados) × 100
    ├─ Pips Líquidos = Σ(Pips ganhos) - Σ(Pips perdidos)
    ├─ Performance por Par
    └─ Estatísticas por período
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** + **Vite** - Build tool moderno e rápido
- **React Router DOM** - Navegação entre páginas
- **Framer Motion** - Animações suaves
- **Tailwind CSS** - Estilização utility-first
- **shadcn/ui** - Componentes UI de alta qualidade
- **Sonner** - Sistema de notificações toast
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

### Backend/APIs
- **OpenAI API** (GPT-4o-mini) - Análise e geração de sinais
- **Frankfurter API** - Dados de câmbio do Banco Central Europeu (gratuita, sem chave)
- **localStorage** - Persistência local de sinais

### Integrações
- `integrations/marketData.js` - Busca dados reais de mercado
- `integrations/signalTracker.js` - Tracking automático de sinais
- `integrations/openai.js` - Integração com OpenAI
- `lib/performanceCalculator.js` - Cálculos de performance

## 📁 Estrutura do Projeto

```
forex-pro/
├── Components/
│   ├── agent/
│   │   └── MessageBubble.jsx      # Componente de mensagem do chat
│   ├── signals/
│   │   ├── SignalCard.jsx         # Card de exibição de sinal
│   │   ├── MarketOverview.jsx     # Visão geral do mercado
│   │   └── SignalGenerator.jsx    # Gerador de sinais
│   ├── tracking/
│   │   └── SignalMonitor.jsx      # Monitor de tracking automático
│   └── ui/                        # Componentes shadcn/ui
├── Pages/
│   ├── Dashboard.jsx              # Dashboard principal
│   ├── Agent.jsx                  # Assistente com chat
│   ├── History.jsx                # Histórico de sinais
│   └── Performance.jsx            # Análise de performance
├── Entities/
│   └── Signal.js                  # Entidade de sinal (CRUD)
├── integrations/
│   ├── Core.js                    # Exports centralizados
│   ├── openai.js                  # Cliente OpenAI
│   ├── marketData.js              # API Frankfurter
│   └── signalTracker.js           # Tracking de sinais
├── lib/
│   ├── performanceCalculator.js   # Cálculos de performance
│   └── utils.js                   # Utilitários
├── agents/
│   └── index.js                   # Re-export do SDK
├── src/
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Estilos globais
├── Layout.jsx                     # Layout principal com rotas
├── index.html                     # HTML principal
├── vite.config.js                 # Configuração do Vite
├── tailwind.config.js             # Configuração do Tailwind
├── package.json                   # Dependências
├── .env                           # Variáveis de ambiente (não commitar!)
├── .env.example                   # Exemplo de variáveis
└── README.md                      # Este arquivo
```

## 🚀 Como Rodar Localmente

### Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **npm** ou **yarn**
3. **Chave de API da OpenAI** - [Obtenha aqui](https://platform.openai.com/api-keys)

### Configuração Inicial

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd forex-pro
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Copie o `.env.example` para `.env`:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da OpenAI:
```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=sk-sua_chave_api_openai_aqui

# Configuração opcional
VITE_OPENAI_MODEL=gpt-4o-mini
VITE_OPENAI_TEMPERATURE=0.7
```

**IMPORTANTE:**
- ✅ Use o prefixo `VITE_` para todas as variáveis (Vite requirement)
- ✅ Nunca faça commit do arquivo `.env` (já está no `.gitignore`)
- ✅ O modelo `gpt-4o-mini` é recomendado (barato e eficiente)

### Executando a Aplicação

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3001**

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção

## 📊 Estrutura de Dados

### Signal Entity

```javascript
{
  id: string,                       // ID único gerado
  currency_pair: string,            // Ex: "EUR/USD", "GBP/JPY"
  signal_type: "BUY" | "SELL",     // Tipo de operação
  entry_price: number,              // Preço de entrada
  take_profit: number,              // Take Profit
  stop_loss: number,                // Stop Loss
  confidence: number,               // Confiança (1-10)
  analysis: string,                 // Análise detalhada
  time_frame: "15M" | "1H" | "4H", // Timeframe
  risk_reward: number,              // Risk:Reward ratio (ex: 2.5)
  pips_potential: number,           // Pips potenciais
  status: "ACTIVE" | "HIT_TP" | "HIT_SL", // Status do sinal
  created_date: string,             // Data de criação (ISO)
  closed_date?: string,             // Data de fechamento (ISO)
  close_price?: number,             // Preço de fechamento
  source: "REAL_TIME_DATA",         // Fonte dos dados
  data_provider: "Frankfurter_API_BCE", // Provedor
  generated_at: string              // Timestamp de geração
}
```

## 🎯 Funcionalidades por Página

### 1. Dashboard (`/`)
- 📊 4 cards de estatísticas (Win Rate, Pips, Sinais Ativos, Confiança)
- 🔍 Monitor de tracking automático
- ⚡ Gerador de sinais com dados reais
- 📋 Lista de sinais ativos mais recentes
- 🎨 Atualização automática em tempo real

### 2. Assistente (`/agent`)
- 💬 Chat interativo com IA
- 🔧 Gerenciamento de sinais via texto
- 📝 Histórico de conversação
- 🎯 Comandos de voz (futuro)

### 3. Histórico (`/history`)
- 📜 Todos os sinais gerados
- 🔍 Filtros por status
- 📊 Detalhes completos de cada sinal
- 📅 Ordenação por data

### 4. Performance (`/performance`)
- 📈 Estatísticas gerais (Win Rate, Pips, Total)
- 🏆 Performance por par de moedas
- 📊 Breakdown por status
- 🎯 Top sinais (melhores e piores)
- 📅 Performance recente

## 🔄 Roadmap

### ✅ FASE 1: Tracking Local (CONCLUÍDO)
- [x] Serviço de tracking de sinais (`signalTracker.js`)
- [x] Verificação automática a cada 5 minutos
- [x] Controles manuais nos cards
- [x] Notificações em tempo real

### ✅ FASE 2: Performance e Estatísticas (CONCLUÍDO)
- [x] Calculadora de performance (`performanceCalculator.js`)
- [x] Dashboard com estatísticas reais
- [x] Página Performance completa
- [x] Win Rate, Pips, Performance por par

### ⏳ FASE 3: Nuvem e Automação (FUTURO)
- [ ] Integração com Supabase (banco de dados em nuvem)
- [ ] Automação N8N (verificação mesmo com app fechado)
- [ ] Notificações por email/telegram
- [ ] Sincronização entre dispositivos
- [ ] Backup automático

### 🚀 Melhorias Futuras
- [ ] Autenticação de usuários
- [ ] Gráficos de performance (Chart.js)
- [ ] Exportação de relatórios (PDF/CSV)
- [ ] Backtesting de estratégias
- [ ] Integração com corretoras (API MT4/MT5)
- [ ] App mobile (React Native)

## ⚙️ Configurações de Deploy

### Vercel

O projeto está configurado para deploy no Vercel. Certifique-se de:

1. ✅ Adicionar a variável `VITE_OPENAI_API_KEY` nas Settings do projeto
2. ✅ Usar Node.js 18+
3. ✅ Build command: `npm run build`
4. ✅ Output directory: `dist`

O arquivo `vercel.json` já está configurado corretamente.

## ⚠️ Segurança e Disclaimer

**AVISO IMPORTANTE:**
- 🎓 Esta aplicação é para fins **educacionais** e de **demonstração**
- ⚠️ **NÃO constitui aconselhamento financeiro**
- 💰 Trading de Forex envolve **risco significativo de perda**
- 📚 Sempre faça sua **própria pesquisa** antes de tomar decisões de trading
- 🧪 Use **contas demo** antes de operar com dinheiro real
- 🔒 Nunca compartilhe sua chave da API OpenAI

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- Abra uma [Issue](../../issues)
- Consulte o [Guia de Início Rápido](GUIA_INICIO_RAPIDO.md)
- Veja o [Plano de Implementação](PLANO_IMPLEMENTACAO.md)

---

**🤖 Desenvolvido com Claude Code + OpenAI GPT-4**
✨ Sistema totalmente funcional com dados reais e tracking automático
