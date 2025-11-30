import OpenAI from 'openai';

// Inicializa o cliente OpenAI com a chave da API do ambiente
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Permite uso no navegador
});

/**
 * Invoca o modelo da OpenAI com um prompt e retorna a resposta estruturada
 * @param {Object} options - Opções para a chamada
 * @param {string} options.prompt - O prompt para enviar ao modelo
 * @param {Object} options.response_json_schema - Schema JSON para estruturar a resposta
 * @param {boolean} options.add_context_from_internet - (Não usado com OpenAI, mantido por compatibilidade)
 * @param {string} options.model - Modelo a ser usado (padrão: gpt-4-turbo-preview)
 * @returns {Promise<Object>} - Resposta estruturada do modelo
 */
export async function InvokeLLM({
  prompt,
  response_json_schema,
  add_context_from_internet = false,
  model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview'
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em análise de trading forex. Sempre responda em formato JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE) || 0.7,
    });

    const responseText = completion.choices[0].message.content;
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Erro ao invocar OpenAI:', error);
    throw error;
  }
}

/**
 * SDK simplificado para conversações com OpenAI (compatível com agentSDK)
 */
export const openaiSDK = {
  conversations: new Map(),

  /**
   * Lista conversações existentes
   */
  async listConversations({ agent_name }) {
    const conversations = Array.from(this.conversations.values())
      .filter(conv => conv.agent_name === agent_name);
    return conversations;
  },

  /**
   * Obtém uma conversação específica
   */
  async getConversation(conversationId) {
    return this.conversations.get(conversationId);
  },

  /**
   * Cria uma nova conversação
   */
  async createConversation({ agent_name, metadata }) {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const conversation = {
      id: conversationId,
      agent_name,
      metadata,
      messages: [],
      created_at: new Date().toISOString()
    };
    this.conversations.set(conversationId, conversation);
    return conversation;
  },

  /**
   * Adiciona uma mensagem à conversação e obtém resposta
   */
  async addMessage(conversation, message) {
    const conv = this.conversations.get(conversation.id);
    if (!conv) throw new Error('Conversação não encontrada');

    // Adiciona mensagem do usuário
    const userMessage = {
      role: 'user',
      content: message.content,
      timestamp: new Date().toISOString()
    };
    conv.messages.push(userMessage);

    // Gera resposta do assistente
    try {
      const response = await openai.chat.completions.create({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de trading forex chamado "Assistente de Trading".
Ajude o usuário a gerenciar sinais de forex, forneça análises e responda perguntas sobre trading.
Use um tom profissional mas amigável. Responda sempre em português brasileiro.`
          },
          ...conv.messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        ],
        temperature: 0.7,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0].message.content,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      conv.messages.push(assistantMessage);

      // Notifica subscribers
      this._notifySubscribers(conversation.id, conv);

      return assistantMessage;
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date().toISOString(),
        status: 'error'
      };
      conv.messages.push(errorMessage);
      return errorMessage;
    }
  },

  /**
   * Subscribers para mudanças em conversações
   */
  _subscribers: new Map(),

  /**
   * Inscreve-se para receber atualizações de uma conversação
   */
  subscribeToConversation(conversationId, callback) {
    if (!this._subscribers.has(conversationId)) {
      this._subscribers.set(conversationId, []);
    }
    this._subscribers.get(conversationId).push(callback);

    // Retorna função de unsubscribe
    return () => {
      const subscribers = this._subscribers.get(conversationId);
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  },

  /**
   * Notifica subscribers de mudanças
   */
  _notifySubscribers(conversationId, conversation) {
    const subscribers = this._subscribers.get(conversationId) || [];
    subscribers.forEach(callback => {
      try {
        callback(conversation);
      } catch (error) {
        console.error('Erro ao notificar subscriber:', error);
      }
    });
  }
};

export default openai;
