import React, { useState, useEffect } from "react";
import { Signal } from "@/Entities/Signal";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { CalendarDays, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function History({ refreshKey }) {
  const [signals, setSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSignals();
  }, [refreshKey]);

  const loadSignals = async () => {
    const data = await Signal.list("-created_date", 100);
    setSignals(data);
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'HIT_TP': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'HIT_SL': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'ACTIVE': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'EXPIRED': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const filterByStatus = (status) => {
    if (status === 'all') return signals;
    return signals.filter(signal => signal.status === status);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">
          Registro completo de todos os sinais gerados
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="w-full justify-start bg-muted/50 p-1 overflow-x-auto custom-scrollbar">
          <TabsTrigger value="all">Todos os Sinais</TabsTrigger>
          <TabsTrigger value="ACTIVE">Ativos</TabsTrigger>
          <TabsTrigger value="HIT_TP" className="text-emerald-600 dark:text-emerald-400 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300">TP Atingido</TabsTrigger>
          <TabsTrigger value="HIT_SL" className="text-rose-600 dark:text-rose-400 data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-300">SL Atingido</TabsTrigger>
          <TabsTrigger value="EXPIRED">Expirados</TabsTrigger>
        </TabsList>

        {['all', 'ACTIVE', 'HIT_TP', 'HIT_SL', 'EXPIRED'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse border border-border/50"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filterByStatus(status).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhum sinal encontrado para este filtro.</p>
                  </div>
                ) : (
                  filterByStatus(status).map((signal) => (
                    <Card key={signal.id} className="bg-card border-border hover:shadow-md transition-all duration-200 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-2 rounded-full border",
                              signal.signal_type === 'BUY' 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400" 
                                : "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400"
                            )}>
                              {signal.signal_type === 'BUY' ? (
                                <TrendingUp className="w-5 h-5" />
                              ) : (
                                <TrendingDown className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{signal.currency_pair}</CardTitle>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge 
                                  variant="outline"
                                  className={cn(
                                    signal.signal_type === 'BUY' 
                                      ? "text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800" 
                                      : "text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-800"
                                  )}
                                >
                                  {signal.signal_type}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(signal.status)}>
                                  {signal.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-3 md:pt-0 mt-2 md:mt-0 border-border">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{format(new Date(signal.created_date), 'dd/MM HH:mm')}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Confiança: <span className="text-foreground font-bold">{signal.confidence}/10</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">Entrada</span>
                            <p className="font-mono font-semibold">{signal.entry_price}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">TP</span>
                            <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{signal.take_profit}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">SL</span>
                            <p className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{signal.stop_loss}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">R:R</span>
                            <p className="font-mono text-amber-600 dark:text-amber-400 font-semibold">1:{signal.risk_reward}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">Pips</span>
                            <p className="font-mono text-blue-600 dark:text-blue-400 font-semibold">+{signal.pips_potential}</p>
                          </div>
                        </div>
                        
                        {signal.analysis && (
                          <div className="pt-3 border-t border-border">
                            <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                              {signal.analysis}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}