/**
 * Signal Tracker - Serviço de Tracking de Sinais em Tempo Real
 * Verifica se TP ou SL foi atingido e atualiza status automaticamente
 */

import { Signal } from '@/Entities/Signal';

const FRANKFURTER_API_BASE = 'https://api.frankfurter.app';

/**
 * Busca preço atual de um par de moedas
 * @param {string} from - Moeda base (ex: 'EUR')
 * @param {string} to - Moeda cotada (ex: 'USD')
 * @returns {Promise<number>} Preço atual
 */
async function getCurrentPrice(from, to) {
  try {
    const url = `${FRANKFURTER_API_BASE}/latest?from=${from}&to=${to}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.rates || !data.rates[to]) {
      throw new Error(`Taxa não disponível para ${from}/${to}`);
    }

    return data.rates[to];
  } catch (error) {
    console.error(`Erro ao buscar preço atual de ${from}/${to}:`, error);
    throw error;
  }
}

/**
 * Extrai moedas base e cotada de um par (ex: "EUR/USD" -> ["EUR", "USD"])
 * @param {string} pair - Par de moedas (ex: 'EUR/USD')
 * @returns {[string, string]} [moeda_base, moeda_cotada]
 */
function parseCurrencyPair(pair) {
  if (!pair || typeof pair !== 'string') {
    throw new Error(`Par de moedas inválido: ${pair}`);
  }
  const cleaned = pair.replace(/\s/g, '');
  const [from, to] = cleaned.split('/');

  if (!from || !to) {
    throw new Error(`Formato de par inválido: ${pair}`);
  }

  return [from, to];
}

/**
 * Verifica se um sinal atingiu TP ou SL
 * @param {Object} signal - Sinal a ser verificado
 * @returns {Promise<{hit: boolean, type: 'TP'|'SL'|null, currentPrice: number}>}
 */
export async function checkSignalStatus(signal) {
  // Valida se o sinal tem os campos necessários
  if (!signal || !signal.currency_pair) {
    throw new Error('Sinal inválido: currency_pair ausente');
  }

  if (!signal.take_profit || !signal.stop_loss || !signal.entry_price) {
    throw new Error(`Sinal ${signal.id} está com campos ausentes (TP, SL ou Entry Price)`);
  }

  if (signal.status !== 'ACTIVE') {
    return { hit: false, type: null, currentPrice: null };
  }

  try {
    const [from, to] = parseCurrencyPair(signal.currency_pair);
    const currentPrice = await getCurrentPrice(from, to);

    // Para sinais BUY:
    // - TP é atingido quando preço SOBE até take_profit
    // - SL é atingido quando preço CAI até stop_loss
    if (signal.signal_type === 'BUY') {
      if (currentPrice >= signal.take_profit) {
        return { hit: true, type: 'TP', currentPrice };
      }
      if (currentPrice <= signal.stop_loss) {
        return { hit: true, type: 'SL', currentPrice };
      }
    }

    // Para sinais SELL:
    // - TP é atingido quando preço CAI até take_profit
    // - SL é atingido quando preço SOBE até stop_loss
    if (signal.signal_type === 'SELL') {
      if (currentPrice <= signal.take_profit) {
        return { hit: true, type: 'TP', currentPrice };
      }
      if (currentPrice >= signal.stop_loss) {
        return { hit: true, type: 'SL', currentPrice };
      }
    }

    return { hit: false, type: null, currentPrice };
  } catch (error) {
    console.error(`Erro ao verificar sinal ${signal.id}:`, error);
    throw error;
  }
}

/**
 * Atualiza status de um sinal quando TP ou SL é atingido
 * @param {string} signalId - ID do sinal
 * @param {string} type - 'TP' ou 'SL'
 * @param {number} closePrice - Preço de fechamento
 * @returns {Promise<Object>} Sinal atualizado
 */
export async function updateSignalStatus(signalId, type, closePrice) {
  const newStatus = type === 'TP' ? 'HIT_TP' : 'HIT_SL';

  const updates = {
    status: newStatus,
    closed_date: new Date().toISOString(),
    close_price: closePrice,
  };

  const updatedSignal = await Signal.update(signalId, updates);

  console.log(`✓ Sinal ${signalId} atualizado: ${newStatus} @ ${closePrice}`);

  return updatedSignal;
}

/**
 * Verifica TODOS os sinais ACTIVE e atualiza status se necessário
 * @returns {Promise<{checked: number, updated: number, results: Array}>}
 */
export async function trackAllActiveSignals() {
  console.log('🔍 Iniciando verificação de sinais ativos...');

  const allSignals = await Signal.list('-created_date', 1000);
  const activeSignals = allSignals.filter(s => s.status === 'ACTIVE');

  if (activeSignals.length === 0) {
    console.log('ℹ️ Nenhum sinal ativo para verificar');
    return { checked: 0, updated: 0, results: [] };
  }

  console.log(`📊 ${activeSignals.length} sinais ativos encontrados`);

  const results = [];
  let updatedCount = 0;

  for (const signal of activeSignals) {
    try {
      // Valida campos básicos antes de processar
      if (!signal.currency_pair) {
        console.warn(`⚠️ Sinal ${signal.id} ignorado: campo currency_pair ausente`);
        results.push({
          signal,
          action: 'SKIPPED',
          error: 'Campo currency_pair ausente'
        });
        continue;
      }

      const check = await checkSignalStatus(signal);

      if (check.hit) {
        const updated = await updateSignalStatus(signal.id, check.type, check.currentPrice);
        updatedCount++;

        results.push({
          signal,
          action: 'UPDATED',
          type: check.type,
          currentPrice: check.currentPrice,
          updated
        });

        console.log(`✅ ${signal.currency_pair} ${check.type} atingido @ ${check.currentPrice}`);
      } else {
        results.push({
          signal,
          action: 'NO_CHANGE',
          currentPrice: check.currentPrice
        });
      }

      // Pequeno delay entre requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`❌ Erro ao verificar ${signal.currency_pair || signal.id}:`, error.message);
      results.push({
        signal,
        action: 'ERROR',
        error: error.message
      });
    }
  }

  console.log(`✓ Verificação completa: ${updatedCount} sinais atualizados de ${activeSignals.length} verificados`);

  return {
    checked: activeSignals.length,
    updated: updatedCount,
    results
  };
}

/**
 * Marca manualmente um sinal como TP ou SL atingido
 * @param {string} signalId - ID do sinal
 * @param {string} type - 'TP' ou 'SL'
 * @returns {Promise<Object>} Sinal atualizado
 */
export async function manuallyCloseSignal(signalId, type) {
  const signal = await Signal.findById(signalId);

  if (!signal) {
    throw new Error('Sinal não encontrado');
  }

  const closePrice = type === 'TP' ? signal.take_profit : signal.stop_loss;

  return await updateSignalStatus(signalId, type, closePrice);
}
