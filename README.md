# Forex Pro - Assistente de Trading com IA

> 🚀 **Início Rápido:** Veja o [Guia de Início Rápido](GUIA_INICIO_RAPIDO.md) para começar em minutos!

## Visão Geral

**Forex Pro** é uma aplicação web avançada de trading de Forex que utiliza inteligência artificial da OpenAI (GPT-4) para gerar sinais de trading automatizados e fornecer assistência em tempo real aos traders. A aplicação combina análise técnica, análise fundamental e dados de mercado em tempo real para gerar sinais de trading de alta qualidade.

## Características Principais

### 1. Gerador de Sinais de IA
- Geração automática de 5-8 sinais de trading de alta qualidade
- Análise de múltiplos pares de moedas (EUR/USD, GBP/USD, USD/JPY, AUD/USD, etc.)
- Sinais incluem:
  - Tipo de operação (BUY/SELL)
  - Preço de entrada
  - Take Profit (TP)
  - Stop Loss (SL)
  - Nível de confiança (1-10)
  - Timeframe (5M, 15M, 1H, 4H, 1D)
  - Razão Risco:Recompensa
  - Potencial de pips
  - Análise detalhada

### 2. Assistente de Trading com Chat
- Interface de chat conversacional com IA
- Gerenciamento de sinais via comandos de texto
- Histórico de conversação persistente
- Respostas em Markdown formatadas
- Visualização de chamadas de ferramentas em tempo real

### 3. Dashboard Interativo
- Visão geral do mercado em tempo real
- Estatísticas de sinais ativos
- Cards de sinais com animações suaves
- Interface responsiva e moderna

### 4. Histórico Completo de Sinais
- Registro completo de todos os sinais gerados
- Filtros por status (Ativo, TP atingido, SL atingido, Expirado)
- Detalhes completos de cada sinal
- Interface organizada em abas

### 5. Análise de Performance
- Taxa de acerto (Win Rate)
- Pips líquidos totais
- Confiança média dos sinais
- Performance por par de moedas
- Breakdown de status dos sinais
- Histórico de performance recente

## Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca JavaScript para interfaces de usuário
- **Framer Motion** - Biblioteca de animações para React
- **Lucide React** - Biblioteca de ícones moderna
- **shadcn/ui** - Componentes UI reutilizáveis e acessíveis
- **React Markdown** - Renderização de Markdown
- **date-fns** - Manipulação de datas
- **Sonner** - Sistema de notificações toast

### Backend/IA
- **OpenAI API** - API da OpenAI para modelos de linguagem
- **GPT-4 Turbo** - Modelo de IA para geração de sinais e assistência
- **InvokeLLM** - Integração customizada com OpenAI
- **openaiSDK** - SDK customizado para conversações

### Banco de Dados
- **Signal.db** - Banco de dados local para armazenamento de sinais

## Modelo de IA Utilizado

A aplicação utiliza a **API da OpenAI** com o modelo **GPT-4 Turbo**. O modelo é usado para:

1. **Geração de Sinais** (`InvokeLLM`)
   - Análise de mercado em tempo real
   - Geração de sinais estruturados via JSON Schema
   - Resposta em formato JSON estruturado
   - Análise técnica e fundamental

2. **Assistente de Conversação** (`openaiSDK`)
   - Chat interativo para gerenciar sinais
   - Subscriptions em tempo real para atualizações
   - Histórico de conversação persistente
   - Respostas contextualizadas em português brasileiro

## Estrutura do Projeto

```
forex-pro/
├── agents/
│   └── index.js                  # Re-export do SDK da OpenAI
├── integrations/
│   ├── openai.js                 # Integração principal com OpenAI
│   └── Core.js                   # Exports centralizados
├── Components/
│   ├── agent/
│   │   └── MessageBubble.html    # Componente de mensagem do chat (React/JSX)
│   └── signals/
│       ├── SignalCard.html       # Card de exibição de sinal (React/JSX)
│       ├── MarketOverview.html   # Visão geral do mercado (React/JSX)
│       └── SignalGenerator.html  # Gerador de sinais (React/JSX)
├── Pages/
│   ├── Dashboard.html            # Página principal (React/JSX)
│   ├── Agent.html                # Página do assistente (React/JSX)
│   ├── History.html              # Histórico de sinais (React/JSX)
│   └── Performance.html          # Análise de performance (React/JSX)
├── Entities/
│   └── Signal.db                 # Banco de dados de sinais
├── Layout.js                     # Layout principal da aplicação
├── .env                          # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore                    # Arquivos ignorados pelo Git
└── README.md                     # Este arquivo

```

## ⚠️ IMPORTANTE: Inconsistência de Extensões de Arquivo

**ATENÇÃO**: Os arquivos na pasta `Pages/` e `Components/` possuem extensão `.html`, mas na verdade contêm **código React/JSX** (JavaScript). Esta é uma inconsistência que deve ser corrigida para melhor organização do projeto.

### Arquivos afetados:
- `Pages/Dashboard.html` → deveria ser `.jsx` ou `.tsx`
- `Pages/Agent.html` → deveria ser `.jsx` ou `.tsx`
- `Pages/History.html` → deveria ser `.jsx` ou `.tsx`
- `Pages/Performance.html` → deveria ser `.jsx` ou `.tsx`
- `Components/agent/MessageBubble.html` → deveria ser `.jsx` ou `.tsx`
- `Components/signals/SignalCard.html` → deveria ser `.jsx` ou `.tsx`
- `Components/signals/MarketOverview.html` → deveria ser `.jsx` ou `.tsx`
- `Components/signals/SignalGenerator.html` → deveria ser `.jsx` ou `.tsx`

Todos estes arquivos contêm:
- Imports React
- JSX válido
- Hooks do React (useState, useEffect, useRef)
- Componentes React modernos

## Como Rodar Localmente

### Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **npm** ou **yarn**
3. **Chave de API da OpenAI** - [Obtenha aqui](https://platform.openai.com/api-keys)

### Configuração Inicial

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd forex-pro
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

O projeto já inclui um arquivo `.env.example`. Copie-o para `.env`:

```bash
cp .env.example .env
```

Depois edite o arquivo `.env` e adicione sua chave da OpenAI:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-sua_chave_api_openai_aqui

# Configuração opcional
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.7
```

**IMPORTANTE**:
- Nunca compartilhe ou faça commit do arquivo `.env` (ele já está no `.gitignore`)
- Obtenha sua chave em: https://platform.openai.com/api-keys
- O modelo padrão é `gpt-4-turbo-preview`, mas você pode usar `gpt-3.5-turbo` para reduzir custos

### Executando a Aplicação

O projeto já está configurado com **Vite** como bundler. Para iniciar:

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## Estrutura de Dados

### Signal Entity

```javascript
{
  id: string,
  currency_pair: string,        // Ex: "EUR/USD", "GBP/JPY"
  signal_type: "BUY" | "SELL",
  entry_price: number,
  take_profit: number,
  stop_loss: number,
  confidence: number,            // 1-10
  analysis: string,
  time_frame: "5M" | "15M" | "1H" | "4H" | "1D",
  risk_reward: number,
  pips_potential: number,
  status: "ACTIVE" | "HIT_TP" | "HIT_SL" | "EXPIRED",
  created_date: Date
}
```

## Funcionalidades por Página

### 1. Dashboard (`/`)
- Visão geral do mercado
- Estatísticas de sinais ativos
- Lista de sinais ativos mais recentes
- Gerador de novos sinais

### 2. Assistente (`/agent`)
- Chat interativo com Claude
- Gerenciamento de sinais via texto
- Histórico de conversação
- Visualização de tool calls

### 3. Histórico (`/history`)
- Todos os sinais gerados
- Filtros por status
- Detalhes completos de cada sinal
- Ordenação por data

### 4. Performance (`/performance`)
- Estatísticas gerais
- Taxa de acerto
- Pips líquidos
- Performance por par de moedas
- Sinais mais recentes

## Segurança e Disclaimer

⚠️ **AVISO IMPORTANTE**:
- Esta aplicação é apenas para fins educacionais e de demonstração
- Não constitui aconselhamento financeiro
- Trading de Forex envolve risco significativo de perda
- Sempre faça sua própria pesquisa antes de tomar decisões de trading
- Use contas de demonstração antes de operar com dinheiro real

## Próximos Passos Recomendados

1. **Corrigir extensões de arquivo**: Renomear todos os `.html` para `.jsx` ou `.tsx`
2. **Adicionar package.json**: Configurar dependências e scripts
3. **Configurar bundler**: Vite ou Next.js
4. **Adicionar TypeScript**: Para melhor type safety
5. **Implementar testes**: Jest + React Testing Library
6. **Adicionar CI/CD**: GitHub Actions
7. **Documentar API**: Documentar integrações com OpenAI
8. **Adicionar autenticação**: Sistema de usuários
9. **Deploy**: Vercel, Netlify ou AWS

## Contribuindo

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com OpenAI GPT-4**
