import React, { useState, useEffect, useRef } from 'react';
import { agentSDK } from '@/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Loader2 } from 'lucide-react';
import MessageBubble from '../components/agent/MessageBubble';
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
                        metadata: { name: "Trading Assistant Chat" }
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
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-8">
                    <Bot className="w-8 h-8 text-green-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Trading Assistant</h1>
                        <p className="text-gray-400">Chat with the assistant to manage your signals</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-xl flex flex-col flex-grow">
                    <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {messages.map((msg, index) => (
                                    <MessageBubble key={index} message={msg} />
                                ))}
                            </motion.div>
                        )}
                    </ScrollArea>
                    <div className="p-4 border-t border-gray-700">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                            <Input
                                type="text"
                                placeholder="e.g., Create a sell signal for GBP/JPY..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                disabled={isSending}
                            />
                            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSending || !newMessage.trim()}>
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}