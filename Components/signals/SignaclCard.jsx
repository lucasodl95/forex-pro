import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { TrendingUp, TrendingDown, Clock, Target, Shield, Zap, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { manuallyCloseSignal } from "@/integrations/signalTracker";
import { toast } from "sonner";

export default function SignalCard({ signal, index, onSignalUpdated }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isBuy = signal.signal_type === "BUY";
  const signalColor = isBuy ? "text-green-400" : "text-red-400";
  const borderColor = isBuy ? "border-green-500/30" : "border-red-500/30";
  const bgGradient = isBuy 
    ? "bg-gradient-to-br from-green-500/5 to-green-600/10" 
    : "bg-gradient-to-br from-red-500/5 to-red-600/10";

  const getConfidenceColor = (confidence) => {
    if (confidence >= 8) return "bg-green-500";
    if (confidence >= 6) return "bg-yellow-500";
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
      <Card className={`${bgGradient} border-gray-700 ${borderColor} hover:border-gray-600 transition-all duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isBuy ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{signal.currency_pair}</h3>
                <Badge 
                  className={`${isBuy ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border`}
                >
                  {signal.signal_type}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Confiança</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getConfidenceColor(signal.confidence)}`}></div>
                <span className="font-bold text-white">{signal.confidence}/10</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Entrada</span>
              </div>
              <p className="font-mono text-lg font-bold text-white">{signal.entry_price}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Take Profit</span>
              </div>
              <p className="font-mono text-lg font-bold text-green-400">{signal.take_profit}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-400">Stop Loss</span>
              </div>
              <p className="font-mono text-lg font-bold text-red-400">{signal.stop_loss}</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Período</span>
              </div>
              <p className="font-mono text-lg font-bold text-purple-400">{signal.time_frame}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-400">R:R </span>
                <span className="text-yellow-400 font-bold">1:{signal.risk_reward}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Pips </span>
                <span className="text-blue-400 font-bold">+{signal.pips_potential}</span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${signal.status === 'ACTIVE' ? 'text-green-400 border-green-500/30' : 'text-gray-400 border-gray-600'}`}
            >
              {signal.status}
            </Badge>
          </div>
          
          {signal.analysis && (
            <div className="pt-3 border-t border-gray-700">
              <p className="text-sm text-gray-300 leading-relaxed">{signal.analysis}</p>
            </div>
          )}

          {/* Controles manuais - apenas para sinais ACTIVE */}
          {signal.status === 'ACTIVE' && (
            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 mr-2">Fechar manualmente:</span>
                <Button
                  onClick={() => handleManualClose('TP')}
                  disabled={isUpdating}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  TP Atingido
                </Button>
                <Button
                  onClick={() => handleManualClose('SL')}
                  disabled={isUpdating}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  SL Atingido
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}