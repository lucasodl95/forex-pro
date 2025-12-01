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
        pending: { icon: Clock, color: 'text-muted-foreground', text: 'Pendente' },
        running: { icon: Loader2, color: 'text-muted-foreground', text: 'Executando...', spin: true },
        in_progress: { icon: Loader2, color: 'text-muted-foreground', text: 'Executando...', spin: true },
        completed: isError ?
            { icon: AlertCircle, color: 'text-destructive', text: 'Falhou' } :
            { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', text: 'Sucesso' },
        success: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', text: 'Sucesso' },
        failed: { icon: AlertCircle, color: 'text-destructive', text: 'Falhou' },
        error: { icon: AlertCircle, color: 'text-destructive', text: 'Falhou' }
    }[status] || { icon: Zap, color: 'text-muted-foreground', text: '' };
    
    const Icon = statusConfig.icon;
    const formattedName = name.split('.').reverse().join(' ').toLowerCase();
    
    return (
        <div className="mt-2 text-xs">
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all w-full text-left",
                    "hover:bg-muted",
                    expanded ? "bg-muted border-muted-foreground/20" : "bg-transparent border-border"
                )}
            >
                <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
                <span className="text-foreground font-mono">{formattedName}</span>
                {statusConfig.text && (
                    <span className={cn("text-muted-foreground", isError && "text-destructive")}>
                        • {statusConfig.text}
                    </span>
                )}
                {!statusConfig.spin && (toolCall.arguments_string || results) && (
                    <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform ml-auto", 
                        expanded && "rotate-90")} />
                )}
            </button>
            
            {expanded && !statusConfig.spin && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-border space-y-2">
                    {toolCall.arguments_string && (
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Parâmetros:</div>
                            <pre className="bg-muted rounded-md p-2 text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto font-mono">
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
                            <div className="text-xs text-muted-foreground mb-1">Resultado:</div>
                            <pre className="bg-muted rounded-md p-2 text-xs text-muted-foreground whitespace-pre-wrap max-h-48 overflow-auto font-mono">
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
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5 border border-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                </div>
            )}
            <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
                {message.content && (
                    <div className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-sm",
                        isUser 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted/50 text-foreground border border-border"
                    )}>
                        <ReactMarkdown 
                            className={cn(
                                "text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                                isUser ? "prose-invert" : "dark:prose-invert"
                            )}
                            components={{
                                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                                code: ({ children }) => <code className="bg-black/10 dark:bg-white/10 rounded px-1">{children}</code>
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