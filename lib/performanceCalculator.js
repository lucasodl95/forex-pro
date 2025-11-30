/**
 * Performance Calculator - Cálculos de Performance REAIS
 * Calcula estatísticas baseadas em sinais fechados (HIT_TP, HIT_SL)
 */

/**
 * Calcula Win Rate (taxa de acerto)
 * Win Rate = (Sinais com TP / Total de Sinais Fechados) × 100
 * @param {Array} signals - Lista de todos os sinais
 * @returns {number} Win rate em porcentagem (0-100)
 */
export function calculateWinRate(signals) {
  const closedSignals = signals.filter(s => s.status === 'HIT_TP' || s.status === 'HIT_SL');

  if (closedSignals.length === 0) {
    return 0;
  }

  const winningSignals = closedSignals.filter(s => s.status === 'HIT_TP');

  return parseFloat(((winningSignals.length / closedSignals.length) * 100).toFixed(2));
}

/**
 * Calcula Pips Líquidos (ganhos - perdas)
 * @param {Array} signals - Lista de todos os sinais
 * @returns {number} Total de pips líquidos
 */
export function calculateNetPips(signals) {
  const closedSignals = signals.filter(s => s.status === 'HIT_TP' || s.status === 'HIT_SL');

  if (closedSignals.length === 0) {
    return 0;
  }

  let totalPips = 0;

  for (const signal of closedSignals) {
    if (signal.status === 'HIT_TP') {
      // Ganhou os pips potenciais
      totalPips += signal.pips_potential || 0;
    } else if (signal.status === 'HIT_SL') {
      // Perdeu os pips (calculados baseado no SL)
      const pipLoss = calculatePipsLost(signal);
      totalPips -= pipLoss;
    }
  }

  return Math.round(totalPips);
}

/**
 * Calcula pips perdidos em um sinal que atingiu SL
 * @param {Object} signal - Sinal que atingiu SL
 * @returns {number} Pips perdidos
 */
function calculatePipsLost(signal) {
  const diff = Math.abs(signal.entry_price - signal.stop_loss);
  const multiplier = signal.currency_pair.includes('JPY') ? 100 : 10000;
  return Math.round(diff * multiplier);
}

/**
 * Calcula confiança média de todos os sinais
 * @param {Array} signals - Lista de todos os sinais
 * @returns {number} Confiança média (0-10)
 */
export function calculateAverageConfidence(signals) {
  if (signals.length === 0) {
    return 0;
  }

  const totalConfidence = signals.reduce((sum, signal) => sum + (signal.confidence || 0), 0);

  return parseFloat((totalConfidence / signals.length).toFixed(1));
}

/**
 * Agrupa sinais por status e conta totais
 * @param {Array} signals - Lista de todos os sinais
 * @returns {Object} Contadores por status
 */
export function getSignalsByStatus(signals) {
  const statusCounts = {
    ACTIVE: 0,
    HIT_TP: 0,
    HIT_SL: 0,
    total: signals.length
  };

  for (const signal of signals) {
    if (statusCounts.hasOwnProperty(signal.status)) {
      statusCounts[signal.status]++;
    }
  }

  return statusCounts;
}

/**
 * Calcula performance por par de moedas
 * @param {Array} signals - Lista de todos os sinais
 * @returns {Array} Array de objetos com performance de cada par
 */
export function calculatePerformanceByPair(signals) {
  const pairStats = {};

  // Agrupa sinais por par
  for (const signal of signals) {
    const pair = signal.currency_pair;

    if (!pairStats[pair]) {
      pairStats[pair] = {
        pair,
        total: 0,
        active: 0,
        closed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        netPips: 0,
        avgConfidence: 0,
        confidenceSum: 0
      };
    }

    const stats = pairStats[pair];
    stats.total++;
    stats.confidenceSum += signal.confidence || 0;

    if (signal.status === 'ACTIVE') {
      stats.active++;
    } else if (signal.status === 'HIT_TP') {
      stats.closed++;
      stats.wins++;
      stats.netPips += signal.pips_potential || 0;
    } else if (signal.status === 'HIT_SL') {
      stats.closed++;
      stats.losses++;
      stats.netPips -= calculatePipsLost(signal);
    }
  }

  // Calcula métricas finais
  const results = Object.values(pairStats).map(stats => {
    stats.winRate = stats.closed > 0
      ? parseFloat(((stats.wins / stats.closed) * 100).toFixed(2))
      : 0;

    stats.avgConfidence = stats.total > 0
      ? parseFloat((stats.confidenceSum / stats.total).toFixed(1))
      : 0;

    // Remove campo auxiliar
    delete stats.confidenceSum;

    return stats;
  });

  // Ordena por win rate decrescente
  return results.sort((a, b) => b.winRate - a.winRate);
}

/**
 * Calcula estatísticas gerais de performance
 * @param {Array} signals - Lista de todos os sinais
 * @returns {Object} Estatísticas completas
 */
export function calculateOverallStats(signals) {
  const statusCounts = getSignalsByStatus(signals);
  const winRate = calculateWinRate(signals);
  const netPips = calculateNetPips(signals);
  const avgConfidence = calculateAverageConfidence(signals);
  const performanceByPair = calculatePerformanceByPair(signals);

  return {
    total: signals.length,
    active: statusCounts.ACTIVE,
    closed: statusCounts.HIT_TP + statusCounts.HIT_SL,
    wins: statusCounts.HIT_TP,
    losses: statusCounts.HIT_SL,
    winRate,
    netPips,
    avgConfidence,
    performanceByPair
  };
}

/**
 * Calcula Risk:Reward médio realizado
 * @param {Array} signals - Lista de sinais fechados
 * @returns {number} R:R médio realizado
 */
export function calculateRealizedRiskReward(signals) {
  const closedSignals = signals.filter(s => s.status === 'HIT_TP' || s.status === 'HIT_SL');

  if (closedSignals.length === 0) {
    return 0;
  }

  const totalRR = closedSignals.reduce((sum, signal) => sum + (signal.risk_reward || 0), 0);

  return parseFloat((totalRR / closedSignals.length).toFixed(2));
}

/**
 * Obtém os melhores sinais (maiores ganhos)
 * @param {Array} signals - Lista de todos os sinais
 * @param {number} limit - Número de sinais para retornar
 * @returns {Array} Melhores sinais ordenados por pips ganhos
 */
export function getTopSignals(signals, limit = 5) {
  const winningSignals = signals.filter(s => s.status === 'HIT_TP');

  return winningSignals
    .sort((a, b) => (b.pips_potential || 0) - (a.pips_potential || 0))
    .slice(0, limit);
}

/**
 * Obtém os piores sinais (maiores perdas)
 * @param {Array} signals - Lista de todos os sinais
 * @param {number} limit - Número de sinais para retornar
 * @returns {Array} Piores sinais ordenados por pips perdidos
 */
export function getWorstSignals(signals, limit = 5) {
  const losingSignals = signals.filter(s => s.status === 'HIT_SL');

  return losingSignals
    .map(signal => ({
      ...signal,
      pipsLost: calculatePipsLost(signal)
    }))
    .sort((a, b) => b.pipsLost - a.pipsLost)
    .slice(0, limit);
}

/**
 * Calcula performance dos últimos N dias
 * @param {Array} signals - Lista de todos os sinais
 * @param {number} days - Número de dias
 * @returns {Object} Estatísticas do período
 */
export function getPerformanceByPeriod(signals, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSignals = signals.filter(signal => {
    const signalDate = new Date(signal.created_date);
    return signalDate >= cutoffDate;
  });

  return calculateOverallStats(recentSignals);
}
