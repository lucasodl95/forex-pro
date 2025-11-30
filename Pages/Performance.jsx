
import React, { useState, useEffect } from "react";
import { Signal } from "@/entities/Signal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Shield, Activity, Award, Zap } from "lucide-react";
import {
  calculateOverallStats,
  calculatePerformanceByPair,
  getTopSignals,
  getWorstSignals
} from "@/lib/performanceCalculator";

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
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Win Rate",
      value: stats.closed > 0 ? `${stats.winRate}%` : "N/A",
      subtitle: `${stats.wins}/${stats.closed} ganhos`,
      icon: Award,
      color: stats.winRate >= 60 ? "text-green-400" : stats.winRate >= 40 ? "text-yellow-400" : "text-red-400",
      bgColor: stats.winRate >= 60 ? "bg-green-500/10" : stats.winRate >= 40 ? "bg-yellow-500/10" : "bg-red-500/10"
    },
    {
      title: "Pips Líquidos",
      value: `${stats.netPips >= 0 ? '+' : ''}${stats.netPips}`,
      subtitle: `${stats.active} ativos`,
      icon: TrendingUp,
      color: stats.netPips >= 0 ? "text-green-400" : "text-red-400",
      bgColor: stats.netPips >= 0 ? "bg-green-500/10" : "bg-red-500/10"
    },
    {
      title: "Confiança Média",
      value: stats.total > 0 ? `${stats.avgConfidence}/10` : "N/A",
      subtitle: `${stats.total} sinais`,
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    }
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Análise de Performance</h1>
            <p className="text-gray-400">Acompanhe as métricas de desempenho dos seus sinais</p>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceCards.map((card, index) => (
            <Card key={card.title} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    {card.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Signal Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Detalhamento por Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">TP Atingido (Ganhos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{stats.wins}</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">SL Atingido (Perdas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{stats.losses}</span>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {stats.total > 0 ? ((stats.losses / stats.total) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300">Ativos (Em andamento)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{stats.active}</span>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <span className="text-gray-300 font-semibold">Total de Sinais Fechados</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">{stats.closed}</span>
                  <span className="text-xs text-gray-400">de {stats.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Performance por Par de Moedas</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceByPair.length === 0 ? (
                <p className="text-center text-gray-400 py-4">Nenhum par de moedas com sinais ainda</p>
              ) : (
                <div className="space-y-3">
                  {performanceByPair.slice(0, 10).map(pairData => (
                    <div key={pairData.pair} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-mono font-semibold">{pairData.pair}</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400">{pairData.total} sinais</span>
                          <span className="text-gray-600">|</span>
                          <span className="text-blue-400">{pairData.active} ativos</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="text-green-400">{pairData.wins}W</span>
                            <span className="text-gray-500"> / </span>
                            <span className="text-red-400">{pairData.losses}L</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {pairData.netPips >= 0 ? '+' : ''}{pairData.netPips} pips
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`min-w-[70px] justify-center ${
                            pairData.winRate >= 60 ? 'text-green-400 border-green-500/30' :
                            pairData.winRate >= 40 ? 'text-yellow-400 border-yellow-500/30' :
                            'text-red-400 border-red-500/30'
                          }`}
                        >
                          {pairData.closed > 0 ? `${pairData.winRate}%` : 'N/A'}
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
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Performance Recente de Sinais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signals.slice(0, 10).map(signal => (
                <div key={signal.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`${signal.signal_type === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border`}>
                      {signal.signal_type}
                    </Badge>
                    <span className="font-mono text-white">{signal.currency_pair}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{signal.confidence}/10</span>
                    <Badge 
                      variant="outline" 
                      className={`${signal.status === 'HIT_TP' ? 'text-green-400 border-green-500/30' : 
                                  signal.status === 'HIT_SL' ? 'text-red-400 border-red-500/30' :
                                  signal.status === 'ACTIVE' ? 'text-blue-400 border-blue-500/30' :
                                  'text-gray-400 border-gray-500/30'}`}
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
    </div>
  );
}
