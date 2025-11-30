import { useState, useEffect } from 'react';
import { Signal } from "@/entities/Signal";
import MarketOverview from "@/components/signals/MarketOverview";
import SignalGenerator from "@/components/signals/SignalGenerator";
import SignalCard from "@/components/signals/SignaclCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard({ refreshKey }) {
  const [signals, setSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSignals = async () => {
    try {
      // Limpa sinais corrompidos automaticamente
      await Signal.cleanupCorruptedSignals();

      const allSignals = await Signal.list('-created_date', 100);
      setSignals(allSignals);
    } catch (error) {
      console.error("Erro ao carregar sinais:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, [refreshKey]);

  const activeSignals = signals.filter(s => s.status === 'ACTIVE');

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Visão geral do mercado e sinais ativos</p>
        </div>

        {/* Market Overview Cards */}
        <MarketOverview signals={signals} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Signal Generator */}
          <div className="lg:col-span-1">
            <SignalGenerator onSignalsGenerated={loadSignals} />
          </div>

          {/* Active Signals List */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  Sinais Ativos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center text-gray-400 py-8">
                    Carregando sinais...
                  </div>
                ) : activeSignals.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Nenhum sinal ativo. Gere novos sinais para começar!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSignals.slice(0, 5).map((signal, index) => (
                      <motion.div
                        key={signal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <SignalCard signal={signal} index={index} onSignalUpdated={loadSignals} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
