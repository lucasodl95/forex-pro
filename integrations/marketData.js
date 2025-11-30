/**
 * Serviço de Dados de Mercado Forex REAIS
 * Usa ExchangeRate-API.com (gratuita, sem necessidade de chave)
 */

const EXCHANGERATE_API_BASE = 'https://api.exchangerate-api.com/v4/latest';
const FIXER_API_BASE = 'https://api.frankfurter.app';

// Pares de moedas suportados (principais pares do forex)
export const CURRENCY_PAIRS = [
  { from: 'EUR', to: 'USD', pair: 'EUR/USD' },
  { from: 'GBP', to: 'USD', pair: 'GBP/USD' },
  { from: 'USD', to: 'JPY', pair: 'USD/JPY' },
  { from: 'AUD', to: 'USD', pair: 'AUD/USD' },
  { from: 'USD', to: 'CAD', pair: 'USD/CAD' },
  { from: 'NZD', to: 'USD', pair: 'NZD/USD' },
  { from: 'EUR', to: 'GBP', pair: 'EUR/GBP' },
  { from: 'EUR', to: 'JPY', pair: 'EUR/JPY' },
  { from: 'GBP', to: 'JPY', pair: 'GBP/JPY' },
  { from: 'AUD', to: 'JPY', pair: 'AUD/JPY' },
  { from: 'EUR', to: 'CHF', pair: 'EUR/CHF' },
  { from: 'GBP', to: 'CHF', pair: 'GBP/CHF' },
];

/**
 * Busca taxa de câmbio REAL atual
 */
async function getExchangeRate(from, to) {
  try {
    // Usa a API Frankfurter (gratuita, sem chave, dados do Banco Central Europeu)
    const url = `${FIXER_API_BASE}/latest?from=${from}&to=${to}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.rates || !data.rates[to]) {
      throw new Error(`Taxa de câmbio não disponível para ${from}/${to}`);
    }

    const rate = data.rates[to];
    const spread = rate * 0.0001; // Spread estimado de 1 pip

    return {
      pair: `${from}/${to}`,
      price: rate,
      bidPrice: rate - spread,
      askPrice: rate + spread,
      timestamp: data.date,
      base: data.base
    };
  } catch (error) {
    console.error(`Erro ao buscar ${from}/${to}:`, error);
    throw new Error(`Falha ao obter dados reais para ${from}/${to}: ${error.message}`);
  }
}

/**
 * Busca histórico recente para análise de tendência
 */
async function getHistoricalRates(from, to, days = 7) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const url = `${FIXER_API_BASE}/${formatDate(startDate)}..${formatDate(endDate)}?from=${from}&to=${to}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Não foi possível obter histórico para ${from}/${to}`);
      return null;
    }

    const data = await response.json();

    if (!data.rates) {
      return null;
    }

    // Converte para array de taxas diárias
    return Object.entries(data.rates).map(([date, rates]) => ({
      date,
      rate: rates[to]
    }));
  } catch (error) {
    console.warn(`Erro ao buscar histórico para ${from}/${to}:`, error);
    return null;
  }
}

/**
 * Analisa tendência baseado em dados históricos REAIS
 */
function analyzeTrend(historicalData) {
  if (!historicalData || historicalData.length < 3) {
    return 'NEUTRAL';
  }

  const rates = historicalData.map(d => d.rate);
  const recent = rates.slice(-3); // Últimos 3 dias
  const older = rates.slice(0, 3); // Primeiros 3 dias

  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;

  const change = ((avgRecent - avgOlder) / avgOlder) * 100;

  if (change > 0.5) return 'BULLISH';
  if (change < -0.5) return 'BEARISH';
  return 'NEUTRAL';
}

/**
 * Calcula volatilidade baseada em dados históricos REAIS
 */
function calculateVolatility(historicalData) {
  if (!historicalData || historicalData.length < 2) {
    return 0.001;
  }

  const rates = historicalData.map(d => d.rate);
  const changes = [];

  for (let i = 1; i < rates.length; i++) {
    const change = Math.abs((rates[i] - rates[i-1]) / rates[i-1]);
    changes.push(change);
  }

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

  return avgChange;
}

/**
 * Busca dados de mercado REAIS para múltiplos pares
 * @param {number} limit - Número máximo de pares para buscar (padrão: 8)
 */
export async function getMarketData(limit = 8) {
  console.log('📊 Buscando dados de mercado REAIS (Frankfurter API - BCE)...');

  const marketData = [];
  const selectedPairs = CURRENCY_PAIRS.slice(0, limit);

  for (const { from, to, pair } of selectedPairs) {
    try {
      // Busca taxa atual
      const rateData = await getExchangeRate(from, to);

      // Busca histórico (assíncrono, não bloqueia)
      const historicalData = await getHistoricalRates(from, to, 7);

      const trend = historicalData ? analyzeTrend(historicalData) : 'NEUTRAL';
      const volatility = historicalData ? calculateVolatility(historicalData) : 0.001;

      marketData.push({
        ...rateData,
        trend,
        volatility,
        historicalData: historicalData?.slice(-5) // Últimos 5 dias
      });

      console.log(`✓ ${pair}: ${rateData.price.toFixed(5)} (${trend})`);

    } catch (error) {
      console.error(`✗ Erro ao buscar ${pair}:`, error.message);
      throw new Error(`Falha ao obter dados reais de mercado para ${pair}`);
    }
  }

  if (marketData.length === 0) {
    throw new Error('Nenhum dado de mercado foi obtido. Verifique sua conexão com a internet.');
  }

  console.log(`✓ ${marketData.length} pares obtidos com sucesso!`);

  return marketData;
}

/**
 * Formata dados de mercado REAIS para o prompt da IA
 */
export function formatMarketDataForPrompt(marketData) {
  return marketData.map(data => {
    const historicalText = data.historicalData
      ? data.historicalData.map(h => `  ${h.date}: ${h.rate.toFixed(5)}`).join('\n')
      : '  Histórico não disponível';

    return `
${data.pair}:
- Preço Atual REAL: ${data.price.toFixed(5)}
- Bid/Ask: ${data.bidPrice.toFixed(5)}/${data.askPrice.toFixed(5)}
- Tendência (7 dias): ${data.trend}
- Volatilidade: ${(data.volatility * 100).toFixed(3)}%
- Última Atualização: ${data.timestamp}
- Histórico (últimos 5 dias):
${historicalText}
`;
  }).join('\n');
}
