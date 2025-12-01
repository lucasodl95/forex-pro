import { useState, useEffect } from 'react';
import { Signal } from "@/Entities/Signal";
import MarketOverview from "@/Components/signals/MarketOverview";
import SignalGenerator from "@/Components/signals/SignalGenerator";
import SignalCard from "@/Components/signals/SignaclCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do mercado e sinais ativos</p>
      </div>

      {/* Market Overview Cards */}
      <MarketOverview signals={signals} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Signal Generator */}
        <div className="lg:col-span-4">
          <SignalGenerator onSignalsGenerated={loadSignals} />
        </div>

        {/* Active Signals List */}
        <div className="lg:col-span-8">
          <Card className="border-border bg-card shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Activity className="w-4 h-4" />
                </div>
                Sinais Ativos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8 flex items-center justify-center gap-2">
                  <span className="animate-pulse">Carregando sinais...</span>
                </div>
              ) : activeSignals.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 bg-muted/30 rounded-lg border border-dashed border-border">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhum sinal ativo no momento.</p>
                  <p className="text-sm mt-1">Use o gerador ao lado para criar novos sinais.</p>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  {activeSignals.slice(0, 6).map((signal, index) => (
                    <SignalCard key={signal.id} signal={signal} index={index} onSignalUpdated={loadSignals} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
