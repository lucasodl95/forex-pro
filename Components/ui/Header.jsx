import React from "react";
import { ThemeToggle } from "@/Components/ui/ThemeToggle";
import { Button } from "@/Components/ui/button";
import { Bell, Search, Check, X, Trash2, BellOff } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { useNotifications } from "@/Components/context/NotificationContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Header() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-sm transition-all">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm hidden md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full bg-muted/40 pl-9 h-9 rounded-lg border-none focus-visible:bg-muted/60 ring-offset-0 focus-visible:ring-0"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h4 className="font-semibold">Notificações</h4>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={markAllAsRead}
                    title="Marcar todas como lidas"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive" 
                    onClick={clearNotifications}
                    title="Limpar tudo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <BellOff className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                        !notification.read && "bg-muted/20"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className={cn(
                            "text-sm font-medium mb-1", 
                            notification.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 
                            notification.type === 'error' ? 'text-rose-600 dark:text-rose-400' : 
                            'text-foreground'
                          )}>
                            {notification.title}
                          </h5>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground mt-2 block">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="h-8 w-px bg-border mx-2 hidden md:block" />
        
        <Button variant="ghost" size="sm" className="gap-2 hidden md:flex pl-1 pr-3 rounded-full border border-transparent hover:border-border hover:bg-muted/50">
           <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              U
           </div>
           <div className="flex flex-col items-start text-xs">
              <span className="font-semibold">User Pro</span>
              <span className="text-muted-foreground text-[10px]">Premium</span>
           </div>
        </Button>
      </div>
    </header>
  );
}
