import React, { useEffect, useState, useCallback, useRef } from 'react';
import { trackAllActiveSignals } from '@/integrations/signalTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Intervalo de verificação automática (em milissegundos)
const AUTO_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

export default function SignalMonitor({ onSignalsUpdated }) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [nextCheck, setNextCheck] = useState(null);
  const [stats, setStats] = useState({ checked: 0, updated: 0 });
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);

  // Refs para garantir que só uma instância rode (proteção contra React Strict Mode)
  const timersRef = useRef({ initial: null, interval: null });
  const mountedRef = useRef(false);

  /**
   * Função principal de verificação
   */
  const checkSignals = useCallback(async (isManual = false) => {
    if (isChecking) {
      toast.info('Verificação já em andamento...');
      return;
    }

    setIsChecking(true);

    try {
      if (isManual) {
        toast.info('Verificando sinais ativos...', { duration: 2000 });
      }

      const result = await trackAllActiveSignals();

      setStats({
        checked: result.checked,
        updated: result.updated
      });

      setLastCheck(new Date());

      // Notificações baseadas no resultado
      if (result.updated > 0) {
        const tpHits = result.results.filter(r => r.action === 'UPDATED' && r.type === 'TP').length;
        const slHits = result.results.filter(r => r.action === 'UPDATED' && r.type === 'SL').length;

        if (tpHits > 0) {
          toast.success(`🎯 ${tpHits} sinal(is) atingiu Take Profit!`, { duration: 5000 });
        }
        if (slHits > 0) {
          toast.error(`🛑 ${slHits} sinal(is) atingiu Stop Loss`, { duration: 5000 });
        }

        // Atualiza dashboard
        if (onSignalsUpdated) {
          onSignalsUpdated();
        }
      } else if (result.checked > 0) {
        if (isManual) {
          toast.success(`✓ ${result.checked} sinais verificados - Nenhuma mudança`, { duration: 3000 });
        }
      } else {
        if (isManual) {
          toast.info('Nenhum sinal ativo para verificar');
        }
      }

    } catch (error) {
      console.error('Erro ao verificar sinais:', error);
      toast.error(`Erro na verificação: ${error.message}`, { duration: 5000 });
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, onSignalsUpdated]);

  /**
   * Verificação automática periódica
   */
  useEffect(() => {
    // Proteção contra montagens múltiplas (React Strict Mode)
    if (mountedRef.current) {
      console.log('⚠️ SignalMonitor já está montado, ignorando nova montagem');
      return;
    }

    mountedRef.current = true;
    console.log('✓ SignalMonitor iniciado');

    if (!autoCheckEnabled) {
      mountedRef.current = false;
      return;
    }

    // Limpa timers anteriores se existirem
    if (timersRef.current.initial) clearTimeout(timersRef.current.initial);
    if (timersRef.current.interval) clearInterval(timersRef.current.interval);

    // Primeira verificação após 30 segundos (dá tempo do app carregar)
    timersRef.current.initial = setTimeout(() => {
      console.log('⏰ Primeira verificação automática (30s após iniciar)');
      checkSignals(false);
    }, 30000);

    // Verificações subsequentes a cada intervalo
    timersRef.current.interval = setInterval(() => {
      console.log('⏰ Verificação automática periódica (5 min)');
      checkSignals(false);
    }, AUTO_CHECK_INTERVAL);

    return () => {
      console.log('🛑 SignalMonitor desmontado, limpando timers');
      if (timersRef.current.initial) clearTimeout(timersRef.current.initial);
      if (timersRef.current.interval) clearInterval(timersRef.current.interval);
      mountedRef.current = false;
    };
  }, [autoCheckEnabled, checkSignals]);

  /**
   * Atualiza contador de próxima verificação
   */
  useEffect(() => {
    if (!lastCheck || !autoCheckEnabled) {
      setNextCheck(null);
      return;
    }

    const updateNextCheck = () => {
      const next = new Date(lastCheck.getTime() + AUTO_CHECK_INTERVAL);
      setNextCheck(next);
    };

    updateNextCheck();
    const interval = setInterval(updateNextCheck, 1000);

    return () => clearInterval(interval);
  }, [lastCheck, autoCheckEnabled]);

  /**
   * Formata tempo até próxima verificação
   */
  const getTimeUntilNextCheck = () => {
    if (!nextCheck) return null;

    const now = new Date();
    const diff = nextCheck - now;

    if (diff <= 0) return 'Em breve...';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Status e informações */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${autoCheckEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm font-semibold text-white">
                {autoCheckEnabled ? 'Monitoramento Ativo' : 'Monitoramento Pausado'}
              </span>
            </div>

            {lastCheck && (
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Última verificação: {lastCheck.toLocaleTimeString()}</span>
                </div>
                {stats.checked > 0 && (
                  <div className="flex items-center gap-3 ml-5">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      {stats.checked} verificados
                    </span>
                    {stats.updated > 0 && (
                      <span className="flex items-center gap-1 text-green-400 font-semibold">
                        <RefreshCw className="w-3 h-3" />
                        {stats.updated} atualizados
                      </span>
                    )}
                  </div>
                )}
                {autoCheckEnabled && nextCheck && (
                  <div className="text-gray-500">
                    Próxima em: {getTimeUntilNextCheck()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botões de controle */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => checkSignals(true)}
              disabled={isChecking}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verificar Agora
                </>
              )}
            </Button>

            <Button
              onClick={() => setAutoCheckEnabled(!autoCheckEnabled)}
              size="sm"
              variant="outline"
              className={autoCheckEnabled ? 'border-green-500 text-green-400' : 'border-gray-600 text-gray-400'}
            >
              {autoCheckEnabled ? 'Pausar' : 'Ativar'} Auto
            </Button>
          </div>
        </div>

        {/* Informações sobre intervalo */}
        {autoCheckEnabled && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-500">
              ℹ️ Verificação automática a cada {AUTO_CHECK_INTERVAL / 60000} minutos enquanto o app estiver aberto
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
