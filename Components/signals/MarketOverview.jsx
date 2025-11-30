import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Activity, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { calculateWinRate, calculateNetPips, getSignalsByStatus, calculateAverageConfidence } from "@/lib/performanceCalculator";

export default function MarketOverview({ signals }) {
  // Cálculos REAIS de performance
  const winRate = calculateWinRate(signals);
  const netPips = calculateNetPips(signals);
  const statusCounts = getSignalsByStatus(signals);
  const avgConfidence = calculateAverageConfidence(signals);

  // Determina cor dos pips (verde se positivo, vermelho se negativo)
  const pipsColor = netPips >= 0 ? "text-green-400" : "text-red-400";
  const pipsBgColor = netPips >= 0 ? "bg-green-500/10" : "bg-red-500/10";

  // Determina cor do win rate
  const winRateColor = winRate >= 60 ? "text-green-400" : winRate >= 40 ? "text-yellow-400" : "text-red-400";
  const winRateBgColor = winRate >= 60 ? "bg-green-500/10" : winRate >= 40 ? "bg-yellow-500/10" : "bg-red-500/10";

  const stats = [
    {
      title: "Win Rate",
      value: statusCounts.HIT_TP + statusCounts.HIT_SL > 0 ? `${winRate}%` : "N/A",
      subtitle: `${statusCounts.HIT_TP}/${statusCounts.HIT_TP + statusCounts.HIT_SL} sinais`,
      icon: Award,
      color: winRateColor,
      bgColor: winRateBgColor
    },
    {
      title: "Pips Líquidos",
      value: netPips >= 0 ? `+${netPips}` : netPips,
      subtitle: statusCounts.HIT_TP + statusCounts.HIT_SL > 0 ? `${statusCounts.HIT_TP + statusCounts.HIT_SL} fechados` : "Nenhum fechado",
      icon: Target,
      color: pipsColor,
      bgColor: pipsBgColor
    },
    {
      title: "Sinais Ativos",
      value: statusCounts.ACTIVE,
      subtitle: `${statusCounts.total} total`,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Confiança Média",
      value: signals.length > 0 ? `${avgConfidence}/10` : "N/A",
      subtitle: `${signals.length} sinais`,
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}