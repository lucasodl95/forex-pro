import React, { useEffect, useState, useCallback, useRef } from 'react';
import { trackAllActiveSignals } from '@/integrations/signalTracker';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { RefreshCw, CheckCircle2, Loader2, Clock, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/Components/context/NotificationContext';

// Intervalo de verificação automática (em milissegundos)
const AUTO_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

export default function SignalMonitor({ onSignalsUpdated }) {
  const { addNotification } = useNotifications();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);
  const [nextCheck, setNextCheck] = useState(null);
  const [stats, setStats] = useState({ checked: 0, updated: 0 });
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false); // Default hidden for cleaner look
  const [lastResults, setLastResults] = useState([]);

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

      console.log('🚀 [SignalMonitor] Iniciando verificação manual/automática...');
      const result = await trackAllActiveSignals();

      setStats({
        checked: result.checked,
        updated: result.updated
      });

      setLastCheck(new Date());
      setLastResults(result.results || []); // Salva resultados para debug

      console.log('📊 [SignalMonitor] Resultado:', {
        checked: result.checked,
        updated: result.updated,
        results: result.results
      });

      // Notificações baseadas no resultado
      if (result.updated > 0) {
        // Processar cada resultado atualizado para gerar notificação
        result.results.forEach(r => {
            if (r.action === 'UPDATED') {
                if (r.type === 'TP') {
                    addNotification(
                        'Take Profit Atingido!', 
                        `O sinal ${r.signal.currency_pair} atingiu o alvo de lucro em ${r.currentPrice}.`,
                        'success'
                    );
                } else if (r.type === 'SL') {
                    addNotification(
                        'Stop Loss Atingido', 
                        `O sinal ${r.signal.currency_pair} atingiu o limite de perda em ${r.currentPrice}.`,
                        'error'
                    );
                }
            }
        });

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
  }, [isChecking, onSignalsUpdated, addNotification]);

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
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status e informações */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoCheckEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-sm font-medium">
                {autoCheckEnabled ? 'Monitoramento Ativo' : 'Monitoramento Pausado'}
              </span>
              {autoCheckEnabled && nextCheck && (
                <span className="text-xs text-muted-foreground ml-2 border-l pl-2 border-border">
                  Próxima: {getTimeUntilNextCheck()}
                </span>
              )}
            </div>

            {lastCheck && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lastCheck.toLocaleTimeString()}
                </span>
                {stats.checked > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                    {stats.checked}
                  </span>
                )}
                {stats.updated > 0 && (
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <RefreshCw className="w-3 h-3" />
                    {stats.updated}
                  </span>
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
              variant="secondary"
              className="h-8"
            >
              {isChecking ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-2" />}
              Verificar
            </Button>

            <Button
              onClick={() => setAutoCheckEnabled(!autoCheckEnabled)}
              size="sm"
              variant="outline"
              className={cn("h-8", autoCheckEnabled && "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20 dark:text-emerald-500")}
            >
              {autoCheckEnabled ? 'Pausar' : 'Ativar Auto'}
            </Button>

            <Button
              onClick={() => setDebugMode(!debugMode)}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground"
              title="Debug Info"
            >
               <Bug className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Painel de Debug */}
        <AnimatePresence>
          {debugMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span>Log da última verificação</span>
                    <span>{lastResults.length} eventos</span>
                </div>
                
                {lastResults.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {lastResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-2 rounded border",
                          result.action === 'UPDATED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                          result.action === 'ERROR' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                          'bg-muted/50 border-border text-muted-foreground'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-semibold">
                            {result.signal?.currency_pair || 'N/A'}
                          </span>
                          <span className="font-semibold opacity-80">
                            {result.action}
                          </span>
                        </div>

                        {result.action === 'UPDATED' && (
                          <div>
                            {result.type} atingido @ {result.currentPrice?.toFixed(5)}
                          </div>
                        )}

                        {result.action === 'NO_CHANGE' && result.currentPrice && (
                          <div>
                            Preço: {result.currentPrice.toFixed(5)}
                            <span className="opacity-60 ml-2">
                              TP: {result.signal?.take_profit} | SL: {result.signal?.stop_loss}
                            </span>
                          </div>
                        )}

                        {result.action === 'ERROR' && (
                          <div>Erro: {result.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center py-4">
                    Nenhuma verificação realizada ainda.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
