// Signal Entity - Gerenciamento de sinais de trading

class SignalEntity {
  constructor() {
    this.signals = [];
    this.dbKey = 'forex_signals';
    this.loadFromStorage();
  }

  // Carrega sinais do localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.dbKey);
      if (stored) {
        this.signals = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar sinais:', error);
      this.signals = [];
    }
  }

  // Salva sinais no localStorage
  saveToStorage() {
    try {
      localStorage.setItem(this.dbKey, JSON.stringify(this.signals));
    } catch (error) {
      console.error('Erro ao salvar sinais:', error);
    }
  }

  // Gera ID único
  generateId() {
    return `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cria um novo sinal
  async create(signalData) {
    const signal = {
      id: this.generateId(),
      ...signalData,
      status: signalData.status || 'ACTIVE',
      created_date: new Date().toISOString(),
    };
    this.signals.push(signal);
    this.saveToStorage();
    return signal;
  }

  // Cria múltiplos sinais
  async bulkCreate(signalsData) {
    const newSignals = signalsData.map(data => ({
      id: this.generateId(),
      ...data,
      status: data.status || 'ACTIVE',
      created_date: new Date().toISOString(),
    }));
    this.signals.push(...newSignals);
    this.saveToStorage();
    return newSignals;
  }

  // Lista sinais com ordenação e limite
  async list(sortField = '-created_date', limit = 100) {
    let sorted = [...this.signals];

    // Ordenação
    const isDescending = sortField.startsWith('-');
    const field = isDescending ? sortField.substring(1) : sortField;

    sorted.sort((a, b) => {
      if (a[field] < b[field]) return isDescending ? 1 : -1;
      if (a[field] > b[field]) return isDescending ? -1 : 1;
      return 0;
    });

    // Limita resultados
    return sorted.slice(0, limit);
  }

  // Busca sinal por ID
  async findById(id) {
    return this.signals.find(signal => signal.id === id);
  }

  // Atualiza sinal
  async update(id, updates) {
    const index = this.signals.findIndex(signal => signal.id === id);
    if (index !== -1) {
      this.signals[index] = { ...this.signals[index], ...updates };
      this.saveToStorage();
      return this.signals[index];
    }
    return null;
  }

  // Deleta sinal
  async delete(id) {
    const index = this.signals.findIndex(signal => signal.id === id);
    if (index !== -1) {
      this.signals.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Limpa todos os sinais
  async clear() {
    this.signals = [];
    this.saveToStorage();
  }

  // Valida e limpa sinais corrompidos
  async cleanupCorruptedSignals() {
    const initialCount = this.signals.length;

    this.signals = this.signals.filter(signal => {
      // Verifica se tem os campos obrigatórios
      // Aceita tanto os nomes novos (currency_pair, signal_type) quanto os antigos (pair, signal)
      const hasCurrencyPair = signal.currency_pair || signal.pair;
      const hasSignalType = signal.signal_type || signal.signal;

      if (!hasCurrencyPair || !hasSignalType || !signal.entry_price ||
          !signal.take_profit || !signal.stop_loss || !signal.confidence) {
        console.warn(`🗑️ Removendo sinal corrompido: ${signal.id}`, signal);
        return false;
      }
      return true;
    });

    const removedCount = initialCount - this.signals.length;

    if (removedCount > 0) {
      this.saveToStorage();
      console.log(`✓ ${removedCount} sinais corrompidos foram removidos`);
    }

    return removedCount;
  }
}

// Exporta instância singleton
export const Signal = new SignalEntity();
