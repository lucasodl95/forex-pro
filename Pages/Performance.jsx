import React, { useState, useEffect } from "react";
import { Signal } from "@/Entities/Signal";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { BarChart3, TrendingUp, Target, Shield, Activity, Award, Zap } from "lucide-react";
import {
  calculateOverallStats,
  calculatePerformanceByPair,
  getTopSignals,
  getWorstSignals
} from "@/lib/performanceCalculator";
import { cn } from "@/lib/utils";

export default function Performance({ refreshKey }) {
  const [signals, setSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSignals();
  }, [refreshKey]);

  const loadSignals = async () => {
    const data = await Signal.list("-created_date", 200);
    setSignals(data);
    setIsLoading(false);
  };

  // Usa cálculos REAIS da performanceCalculator
  const stats = calculateOverallStats(signals);
  const performanceByPair = calculatePerformanceByPair(signals);
  const topSignals = getTopSignals(signals, 5);
  const worstSignals = getWorstSignals(signals, 5);

  const performanceCards = [
    {
      title: "Total de Sinais",
      value: stats.total,
      subtitle: `${stats.closed} fechados`,
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Win Rate",
      value: stats.closed > 0 ? `${stats.winRate}%` : "N/A",
      subtitle: `${stats.wins}/${stats.closed} ganhos`,
      icon: Award,
      color: stats.winRate >= 60 ? "text-emerald-600 dark:text-emerald-400" : stats.winRate >= 40 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400",
      bgColor: stats.winRate >= 60 ? "bg-emerald-100 dark:bg-emerald-900/20" : stats.winRate >= 40 ? "bg-amber-100 dark:bg-amber-900/20" : "bg-rose-100 dark:bg-rose-900/20"
    },
    {
      title: "Pips Líquidos",
      value: `${stats.netPips >= 0 ? '+' : ''}${stats.netPips}`,
      subtitle: `${stats.active} ativos`,
      icon: TrendingUp,
      color: stats.netPips >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      bgColor: stats.netPips >= 0 ? "bg-emerald-100 dark:bg-emerald-900/20" : "bg-rose-100 dark:bg-rose-900/20"
    },
    {
      title: "Confiança Média",
      value: stats.total > 0 ? `${stats.avgConfidence}/10` : "N/A",
      subtitle: `${stats.total} sinais`,
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/20"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <p className="text-muted-foreground">Acompanhe as métricas de desempenho dos seus sinais</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceCards.map((card, index) => (
          <Card key={card.title} className="bg-card border-border hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                  <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", card.bgColor)}>
                  <card.icon className={cn("w-6 h-6", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Signal Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Detalhamento por Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-500/10"></div>
                <span className="text-sm font-medium">TP Atingido (Ganhos)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{stats.wins}</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900">
                  {stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-500 rounded-full ring-4 ring-rose-500/10"></div>
                <span className="text-sm font-medium">SL Atingido (Perdas)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{stats.losses}</span>
                <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900">
                  {stats.total > 0 ? ((stats.losses / stats.total) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-500/10"></div>
                <span className="text-sm font-medium">Ativos (Em andamento)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{stats.active}</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900">
                  {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">Total de Sinais Fechados</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{stats.closed}</span>
                <span className="text-xs text-muted-foreground">de {stats.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border flex flex-col">
          <CardHeader>
            <CardTitle>Performance por Par de Moedas</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            {performanceByPair.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
                <BarChart3 className="w-8 h-8 opacity-20 mb-2" />
                <p>Nenhum dado disponível ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {performanceByPair.slice(0, 10).map(pairData => (
                  <div key={pairData.pair} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">{pairData.pair}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{pairData.total} sinais</span>
                        <span className="text-muted-foreground opacity-50">|</span>
                        <span className="text-blue-500 dark:text-blue-400">{pairData.active} ativos</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          <span className="text-emerald-600 dark:text-emerald-400">{pairData.wins}W</span>
                          <span className="text-muted-foreground/50 mx-1">/</span>
                          <span className="text-rose-600 dark:text-rose-400">{pairData.losses}L</span>
                        </div>
                        <div className={cn("text-xs font-mono", pairData.netPips >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {pairData.netPips >= 0 ? '+' : ''}{pairData.netPips} pips
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "min-w-[60px] justify-center",
                          pairData.winRate >= 60 ? 'text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-900' :
                          pairData.winRate >= 40 ? 'text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-900' :
                          'text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-900'
                        )}
                      >
                        {pairData.closed > 0 ? `${pairData.winRate}%` : '-'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {signals.slice(0, 10).map(signal => (
              <div key={signal.id} className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "w-16 justify-center",
                      signal.signal_type === 'BUY' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                    )}
                  >
                    {signal.signal_type}
                  </Badge>
                  <span className="font-mono font-bold">{signal.currency_pair}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    {signal.confidence}/10
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      signal.status === 'HIT_TP' ? 'text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800' : 
                      signal.status === 'HIT_SL' ? 'text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-800' :
                      signal.status === 'ACTIVE' ? 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800' :
                      'text-muted-foreground border-border'
                    )}
                  >
                    {signal.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
