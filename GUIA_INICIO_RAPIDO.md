# 🚀 Guia de Início Rápido - Forex Pro

## Instalação Rápida

### 1. Pré-requisitos
- Node.js 18+ instalado
- Conta na OpenAI com créditos disponíveis

### 2. Configuração em 3 Passos

```bash
# 1. Clone e entre no diretório
git clone <url-do-repositorio>
cd forex-pro

# 2. Instale as dependências
npm install

# 3. Configure sua chave da OpenAI
cp .env.example .env
# Edite o arquivo .env e adicione sua chave da OpenAI
```

### 3. Configure o arquivo .env

Abra o arquivo `.env` e adicione sua chave da OpenAI:

```env
OPENAI_API_KEY=sk-proj-sua_chave_aqui
```

**Como obter sua chave:**
1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Copie a chave gerada
4. Cole no arquivo `.env`

### 4. Inicie a aplicação

```bash
npm run dev
```

Pronto! Acesse: **http://localhost:3000**

## 📝 Configurações Opcionais

### Alterar o Modelo de IA

No arquivo `.env`, você pode configurar:

```env
# Use gpt-3.5-turbo para reduzir custos (mais barato)
OPENAI_MODEL=gpt-3.5-turbo

# Use gpt-4-turbo-preview para melhor qualidade (padrão)
OPENAI_MODEL=gpt-4-turbo-preview

# Use gpt-4 para máxima qualidade (mais caro)
OPENAI_MODEL=gpt-4
```

### Ajustar a Criatividade

```env
# Valores entre 0 e 1
# 0 = Mais determinístico e focado
# 1 = Mais criativo e variado
# Padrão: 0.7
OPENAI_TEMPERATURE=0.7
```

## 🎯 Primeiros Passos na Aplicação

### 1. Gerar Sinais de Trading

1. Acesse a página **Dashboard**
2. Clique em **"Gerar Novos Sinais"**
3. Aguarde a IA gerar 5-8 sinais de trading
4. Os sinais aparecerão na tela com todas as informações

### 2. Usar o Assistente de IA

1. Vá para a página **Assistente**
2. Digite comandos como:
   - "Crie um sinal de compra para EUR/USD"
   - "Analise o par GBP/JPY"
   - "Quais são os melhores sinais ativos agora?"
3. O assistente responderá em português brasileiro

### 3. Acompanhar Performance

1. Acesse a página **Performance**
2. Veja suas estatísticas:
   - Taxa de acerto
   - Pips líquidos
   - Performance por par de moedas
   - Sinais mais recentes

### 4. Consultar Histórico

1. Vá para **Histórico**
2. Filtre por status:
   - Todos os sinais
   - Ativos
   - TP Atingido
   - SL Atingido
   - Expirados

## ⚙️ Estrutura de Custos da OpenAI

### Estimativa de Custos (Preços de referência)

**GPT-4 Turbo Preview:**
- Input: $10 por 1M tokens
- Output: $30 por 1M tokens
- Geração de 8 sinais: ~$0.05-0.10
- 100 mensagens no chat: ~$0.50-1.00

**GPT-3.5 Turbo (Economia):**
- Input: $0.50 por 1M tokens
- Output: $1.50 por 1M tokens
- Geração de 8 sinais: ~$0.002-0.005
- 100 mensagens no chat: ~$0.02-0.05

💡 **Dica:** Comece com GPT-3.5 Turbo para testar e depois migre para GPT-4 se necessário.

## 🐛 Problemas Comuns

### Erro: "OPENAI_API_KEY not found"
- Verifique se o arquivo `.env` está na raiz do projeto
- Confirme que a variável está nomeada corretamente: `OPENAI_API_KEY`
- Reinicie o servidor após modificar o `.env`

### Erro: "Insufficient quota"
- Sua conta OpenAI não tem créditos
- Adicione créditos em: https://platform.openai.com/account/billing

### Erro: "Module not found"
- Execute: `npm install` novamente
- Limpe o cache: `rm -rf node_modules && npm install`

### A aplicação não inicia
- Verifique se a porta 3000 está livre
- Altere a porta em `vite.config.js` se necessário

## 📚 Próximos Passos

1. **Explore o Dashboard** - Gere seus primeiros sinais
2. **Teste o Assistente** - Converse com a IA
3. **Monitore Performance** - Acompanhe suas estatísticas
4. **Leia o README completo** - Entenda toda a arquitetura

## 🆘 Precisa de Ajuda?

- Consulte o [README.md](README.md) completo
- Abra uma issue no repositório
- Verifique a documentação da OpenAI: https://platform.openai.com/docs

---

**Bom trading! 📈**
