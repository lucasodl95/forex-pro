import React, { useState, useEffect, useRef } from 'react';
import { agentSDK } from '@/agents';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Send, Bot, Loader2 } from 'lucide-react';
import MessageBubble from '@/Components/agent/MessageBubble.jsx';
import { motion } from 'framer-motion';

const AGENT_NAME = "trading_assistant";

export default function AgentPage() {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        const initializeConversation = async () => {
            try {
                const existingConversations = await agentSDK.listConversations({ agent_name: AGENT_NAME });
                let conv;
                if (existingConversations.length > 0) {
                    conv = await agentSDK.getConversation(existingConversations[0].id);
                } else {
                    conv = await agentSDK.createConversation({
                        agent_name: AGENT_NAME,
                        metadata: { name: "Chat do Assistente de Trading" }
                    });
                }
                setConversation(conv);
                setMessages(conv.messages || []);
            } catch (error) {
                console.error("Error initializing conversation:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeConversation();
    }, []);

    useEffect(() => {
        if (conversation?.id) {
            const unsubscribe = agentSDK.subscribeToConversation(conversation.id, (data) => {
                setMessages(data.messages);
                const lastMessage = data.messages[data.messages.length - 1];
                if (lastMessage?.role === 'user' || lastMessage?.status === 'completed') {
                    setIsSending(false);
                }
            });
            return () => unsubscribe();
        }
    }, [conversation?.id]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || isSending) return;

        setIsSending(true);
        try {
            await agentSDK.addMessage(conversation, {
                role: 'user',
                content: newMessage
            });
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            setIsSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-5rem)] flex flex-col animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
                    <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assistente de Trading</h1>
                    <p className="text-muted-foreground">Converse com o assistente para gerenciar seus sinais</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl flex flex-col flex-grow shadow-sm overflow-hidden">
                <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p>Conectando ao assistente...</p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center">
                                    <Bot className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Olá! Como posso ajudar hoje?</p>
                                    <p className="text-sm opacity-70">Pergunte sobre análises de mercado, sinais ou tendências.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <MessageBubble key={index} message={msg} />
                                ))
                            )}
                        </motion.div>
                    )}
                </ScrollArea>
                <div className="p-4 border-t border-border bg-muted/20">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <Input
                            type="text"
                            placeholder="Ex: Crie um sinal de venda para GBP/JPY..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-grow bg-background"
                            disabled={isSending}
                        />
                        <Button 
                            type="submit" 
                            size="icon"
                            disabled={isSending || !newMessage.trim()}
                            className="shrink-0"
                        >
                            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}