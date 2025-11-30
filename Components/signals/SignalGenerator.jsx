import React, { useState } from "react";
import { Signal } from "@/entities/Signal";
import { InvokeLLM } from "@/integrations/Core";
import { getMarketData, formatMarketDataForPrompt } from "@/integrations/marketData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Loader2, TrendingUp, AlertCircle, Globe, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SignalGenerator({ onSignalsGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [progress, setProgress] = useState('');

  const clearAllSignals = async () => {
    if (!confirm('Tem certeza que deseja apagar TODOS os sinais salvos? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await Signal.clear();
      toast.success('Todos os sinais foram apagados!');
      onSignalsGenerated(); // Atualiza o dashboard
    } catch (error) {
      toast.error('Erro ao apagar sinais');
      console.error(error);
    }
  };

  const generateSignals = async () => {
    setIsGenerating(true);
    setProgress('Conectando a fontes de dados reais...');

    try {
      // 1. Buscar dados REAIS de mercado (Frankfurter API - Banco Central Europeu)
      toast.info('Buscando dados de mercado forex em tempo real...', { duration: 3000 });

      setProgress('Buscando taxas de câmbio reais para 8 pares...');
      const marketData = await getMarketData(8);

      if (marketData.length === 0) {
        throw new Error('Nenhum dado de mercado foi obtido. Verifique sua conexão com a internet.');
      }

      toast.success(`Dados reais obtidos para ${marketData.length} pares de moedas!`);
      setProgress(`Dados reais obtidos para ${marketData.length} pares. Analisando com IA...`);

      // 2. Formatar dados para o prompt
      const marketDataText = formatMarketDataForPrompt(marketData);

      // 3. Criar prompt com dados reais
      const prompt = `Você é um analista profissional de forex. Analise os seguintes dados de mercado REAIS e em TEMPO REAL fornecidos pelo Banco Central Europeu (Frankfurter API) e gere sinais de trading de alta qualidade.

DADOS DE MERCADO REAIS - TEMPO REAL:
${marketDataText}

Com base nesses dados REAIS e ATUAIS, gere 5-8 sinais de trading forex (escolha os pares com melhor oportunidade). Para cada sinal:

REGRAS OBRIGATÓRIAS:
1. Use APENAS os PREÇOS REAIS fornecidos acima (NÃO invente preços)
2. Entry price deve ser o preço atual real ±0.0003 máximo
3. Analise a TENDÊNCIA REAL (baseada nos últimos 7 dias de histórico fornecido)
4. Calcule take_profit e stop_loss baseado na VOLATILIDADE REAL mostrada
5. Se tendência é BULLISH → prefira sinais BUY
6. Se tendência é BEARISH → prefira sinais SELL
7. Se tendência é NEUTRAL → use análise técnica adicional
8. Risk:Reward (risk_reward) mínimo de 1.5:1 - CALCULE CORRETAMENTE
9. Pips potenciais (pips_potential) mínimo de 10 - CALCULE baseado na diferença entre entry e TP
10. Período (time_frame) deve ser "15M", "1H" ou "4H" (escolha baseado na volatilidade)
11. Seja CONSERVADOR na confiança (máximo 8/10)
12. Forneça análise DETALHADA baseada nos dados históricos reais fornecidos

CÁLCULOS OBRIGATÓRIOS:
- risk_reward = (take_profit - entry_price) / (entry_price - stop_loss)
- pips_potential = (take_profit - entry_price) * 10000 para pares com USD
- time_frame = "1H" (padrão), "4H" para sinais de longo prazo, "15M" para day trading

IMPORTANTE: TODOS os campos são obrigatórios. Não deixe nenhum campo vazio ou undefined.

Retorne no formato JSON especificado.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            signals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  currency_pair: { type: "string" },
                  signal_type: { type: "string", enum: ["BUY", "SELL"] },
                  entry_price: { type: "number" },
                  take_profit: { type: "number" },
                  stop_loss: { type: "number" },
                  confidence: { type: "number", minimum: 1, maximum: 10 },
                  analysis: { type: "string" },
                  time_frame: { type: "string", enum: ["5M", "15M", "1H", "4H", "1D"] },
                  risk_reward: { type: "number", minimum: 1.5 },
                  pips_potential: { type: "number", minimum: 10 }
                },
                required: [
                  "currency_pair",
                  "signal_type",
                  "entry_price",
                  "take_profit",
                  "stop_loss",
                  "confidence",
                  "analysis",
                  "time_frame",
                  "risk_reward",
                  "pips_potential"
                ]
              }
            }
          },
          required: ["signals"]
        }
      });

      if (response.signals && response.signals.length > 0) {
        setProgress('Validando e salvando sinais...');

        // Valida e corrige campos ausentes
        const enrichedSignals = response.signals.map(signal => {
          // CRITICAL: Garante que currency_pair existe (a IA pode retornar 'pair' ao invés de 'currency_pair')
          const currencyPair = signal.currency_pair || signal.pair;

          // CRITICAL: Garante que signal_type existe (a IA pode retornar 'signal' ao invés de 'signal_type')
          const signalType = signal.signal_type || signal.signal;

          if (!currencyPair) {
            console.error('Sinal sem par de moedas:', signal);
            return null; // Será filtrado depois
          }

          if (!signalType) {
            console.error('Sinal sem tipo (BUY/SELL):', signal);
            return null;
          }

          // Calcula risk_reward se não fornecido
          let riskReward = signal.risk_reward;
          if (!riskReward || riskReward < 1.5) {
            const profit = Math.abs(signal.take_profit - signal.entry_price);
            const loss = Math.abs(signal.entry_price - signal.stop_loss);
            riskReward = loss > 0 ? parseFloat((profit / loss).toFixed(2)) : 2.0;
          }

          // Calcula pips_potential se não fornecido
          let pipsPotential = signal.pips_potential;
          if (!pipsPotential || pipsPotential < 10) {
            const diff = Math.abs(signal.take_profit - signal.entry_price);
            // Multiplica por 10000 para pares com USD, 100 para JPY
            const multiplier = currencyPair.includes('JPY') ? 100 : 10000;
            pipsPotential = Math.round(diff * multiplier);
          }

          // Define time_frame se não fornecido
          const timeFrame = signal.time_frame || '1H';

          return {
            ...signal,
            currency_pair: currencyPair, // Garante que sempre seja currency_pair
            signal_type: signalType, // Garante que sempre seja signal_type
            risk_reward: riskReward,
            pips_potential: pipsPotential,
            time_frame: timeFrame,
            source: 'REAL_TIME_DATA',
            data_provider: 'Frankfurter_API_BCE',
            generated_at: new Date().toISOString()
          };
        }).filter(signal => signal !== null); // Remove sinais inválidos

        await Signal.bulkCreate(enrichedSignals);
        setLastGenerated(new Date());

        toast.success(`${response.signals.length} sinais baseados em dados reais gerados com sucesso!`, { duration: 5000 });
        onSignalsGenerated();
      } else {
        toast.warning('Nenhum sinal foi gerado baseado nas condições atuais do mercado');
      }
    } catch (error) {
      console.error("Erro ao gerar sinais:", error);

      if (error.message.includes('internet') || error.message.includes('network')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.', { duration: 6000 });
      } else if (error.message.includes('Falha ao obter dados reais')) {
        toast.error('Não foi possível obter dados de mercado reais. Tente novamente em alguns minutos.', { duration: 6000 });
      } else if (error.message.includes('OpenAI')) {
        toast.error('Erro na análise da IA. Verifique sua chave da OpenAI.', { duration: 6000 });
      } else {
        toast.error(`Erro: ${error.message}`, { duration: 6000 });
      }
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          Gerador de Sinais com Dados Reais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400">
          <div className="flex items-start gap-2 mb-2">
            <Globe className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              Gera sinais usando <strong className="text-green-400">dados REAIS em tempo real</strong> do Banco Central Europeu (API Frankfurter).
              100% baseado em taxas de câmbio atuais e histórico real de 7 dias.
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-300">
          <div className="font-semibold mb-1">✓ Fontes de Dados Reais:</div>
          <ul className="space-y-1 ml-4">
            <li>• Taxas de câmbio: Banco Central Europeu</li>
            <li>• Histórico: 7 dias de dados reais</li>
            <li>• Análise: GPT-4o-mini com dados verificados</li>
          </ul>
        </div>

        {lastGenerated && (
          <div className="text-sm text-green-400 bg-green-400/10 p-2 rounded-lg">
            ✓ Última geração: {lastGenerated.toLocaleTimeString()} (dados reais)
          </div>
        )}

        {progress && (
          <div className="text-sm text-blue-400 bg-blue-400/10 p-2 rounded-lg animate-pulse">
            {progress}
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={generateSignals}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Buscando Dados Reais...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                Gerar Novos Sinais (8 pares)
              </>
            )}
          </Button>

          <Button
            onClick={clearAllSignals}
            disabled={isGenerating}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todos os Sinais
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          ⚙️ API gratuita e sem necessidade de chave. Dados fornecidos pelo BCE.
        </div>
      </CardContent>
    </Card>
  );
}
