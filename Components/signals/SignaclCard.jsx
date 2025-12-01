import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { TrendingUp, TrendingDown, Clock, Target, Shield, Zap, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { manuallyCloseSignal } from "@/integrations/signalTracker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SignalCard({ signal, index, onSignalUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isBuy = signal.signal_type === "BUY";
  
  // Semantic colors for Buy/Sell
  const accentColor = isBuy ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const cardClass = isBuy 
    ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-800" 
    : "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-800";
  
  const badgeClass = isBuy
    ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
    : "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";

  const getConfidenceColor = (confidence) => {
    if (confidence >= 8) return "bg-emerald-500";
    if (confidence >= 6) return "bg-amber-500";
    return "bg-orange-500";
  };

  const handleManualClose = async (type) => {
    if (!confirm(`Tem certeza que deseja marcar este sinal como ${type === 'TP' ? 'Take Profit' : 'Stop Loss'} atingido?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await manuallyCloseSignal(signal.id, type);
      toast.success(`Sinal marcado como ${type} atingido!`);
      if (onSignalUpdated) {
        onSignalUpdated();
      }
    } catch (error) {
      toast.error(`Erro ao atualizar sinal: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn("border transition-all duration-300 shadow-sm", cardClass)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border", accentColor)}>
                 {isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">{signal.currency_pair}</h3>
                <Badge variant="outline" className={cn("font-semibold", badgeClass)}>
                  {signal.signal_type}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Confiança</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <div className={cn("w-2 h-2 rounded-full shadow-sm", getConfidenceColor(signal.confidence))}></div>
                <span className="font-bold text-foreground">{signal.confidence}/10</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-background/40 rounded-lg border border-border/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">Entrada</span>
              </div>
              <p className="font-mono text-base font-bold">{signal.entry_price}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-muted-foreground">Take Profit</span>
              </div>
              <p className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">{signal.take_profit}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-xs font-medium text-muted-foreground">Stop Loss</span>
              </div>
              <p className="font-mono text-base font-bold text-rose-600 dark:text-rose-400">{signal.stop_loss}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-medium text-muted-foreground">Período</span>
              </div>
              <p className="font-mono text-base font-bold text-purple-600 dark:text-purple-400">{signal.time_frame}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded border border-border/50">
                <span className="text-muted-foreground text-xs">R:R</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">1:{signal.risk_reward}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded border border-border/50">
                <span className="text-muted-foreground text-xs">Pips</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">+{signal.pips_potential}</span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                signal.status === 'ACTIVE' 
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                  : 'bg-muted text-muted-foreground border-border'
              )}
            >
              {signal.status}
            </Badge>
          </div>
          
          {signal.analysis && (
            <div className="pt-3 border-t border-black/5 dark:border-white/5">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 hover:line-clamp-none transition-all cursor-default">
                {signal.analysis}
              </p>
            </div>
          )}

          {/* Controles manuais - apenas para sinais ACTIVE */}
          {signal.status === 'ACTIVE' && (
            <div className="pt-3 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-muted-foreground mr-auto">Fechar manualmente:</span>
                <Button
                  onClick={() => handleManualClose('TP')}
                  disabled={isUpdating}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  TP
                </Button>
                <Button
                  onClick={() => handleManualClose('SL')}
                  disabled={isUpdating}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  SL
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}