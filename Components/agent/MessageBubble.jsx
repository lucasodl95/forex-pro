import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/Components/ui/button";
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, Bot } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FunctionDisplay = ({ toolCall }) => {
    const [expanded, setExpanded] = useState(false);
    const name = toolCall?.name || 'Function';
    const status = toolCall?.status || 'pending';
    const results = toolCall?.results;
    
    const parsedResults = (() => {
        if (!results) return null;
        try {
            return typeof results === 'string' ? JSON.parse(results) : results;
        } catch {
            return results;
        }
    })();
    
    const isError = results && (
        (typeof results === 'string' && /error|failed/i.test(results)) ||
        (parsedResults?.success === false)
    );
    
    const statusConfig = {
        pending: { icon: Clock, color: 'text-slate-400', text: 'Pendente' },
        running: { icon: Loader2, color: 'text-slate-500', text: 'Executando...', spin: true },
        in_progress: { icon: Loader2, color: 'text-slate-500', text: 'Executando...', spin: true },
        completed: isError ?
            { icon: AlertCircle, color: 'text-red-500', text: 'Falhou' } :
            { icon: CheckCircle2, color: 'text-green-600', text: 'Sucesso' },
        success: { icon: CheckCircle2, color: 'text-green-600', text: 'Sucesso' },
        failed: { icon: AlertCircle, color: 'text-red-500', text: 'Falhou' },
        error: { icon: AlertCircle, color: 'text-red-500', text: 'Falhou' }
    }[status] || { icon: Zap, color: 'text-slate-500', text: '' };
    
    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all w-full text-left",
                    "hover:bg-gray-800",
                    expanded ? "bg-gray-800 border-gray-600" : "bg-transparent border-gray-700"
                )}
            >
                <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span className="text-gray-300">{formattedName}</span>
                {statusConfig.text && (
                    <span className={cn("text-gray-500", isError && "text-red-500")}>
                        • {statusConfig.text}
                    </span>
                )}
                {!statusConfig.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-gray-400 transition-transform ml-auto", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-gray-700 space-y-2">
                    {toolCall.arguments_string && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Parâmetros:</div>
                            <pre className="bg-gray-800 rounded-md p-2 text-xs text-gray-300 whitespace-pre-wrap">
                                {(() => {
                                    try {
                                        return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2);
                                    } catch {
                                        return toolCall.arguments_string;
                                    }
                                })()}
                            </pre>
                        </div>
                    )}
                    {parsedResults && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Resultado:</div>
                            <pre className="bg-gray-800 rounded-md p-2 text-xs text-gray-300 whitespace-pre-wrap max-h-48 overflow-auto">
                                {typeof parsedResults === 'object' ? 
                                    JSON.stringify(parsedResults, null, 2) : parsedResults}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';
    
    return (
        <div className={cn("flex gap-3 my-4", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="h-8 w-8 rounded-lg bg-gray-700 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Bot className="h-5 w-5 text-green-400" />
                </div>
            )}
            <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-2.5",
                        isUser ? "bg-green-600 text-white" : "bg-gray-800 text-gray-200"
                    )}>
                        <ReactMarkdown 
                            className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            components={{
                                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
                
                {message.tool_calls?.length > 0 && (
                    <div className="space-y-1 w-full mt-2">
                        {message.tool_calls.map((toolCall, idx) => (
                            <FunctionDisplay key={idx} toolCall={toolCall} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}