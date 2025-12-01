import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import {
  LayoutDashboard,
  Bot,
  History,
  TrendingUp,
  Menu,
  ChevronLeft,
  Settings,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/assistente', icon: Bot, label: 'Assistente' },
  { path: '/historico', icon: History, label: 'Histórico' },
  { path: '/performance', icon: TrendingUp, label: 'Performance' },
];

export function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          // Mobile behavior
          "md:translate-x-0",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center h-16 px-4 border-b border-border", collapsed ? "justify-center" : "justify-start")}>
          <div className="flex items-center gap-2 overflow-hidden">
             {!collapsed && (
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <TrendingUp className="w-5 h-5 text-primary-foreground" />
                   </div>
                   <span className="font-bold text-lg whitespace-nowrap tracking-tight">Forex Pro</span>
                </div>
             )}
             {collapsed && (
                 <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                   <TrendingUp className="w-6 h-6 text-primary-foreground" />
                 </div>
             )}
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 mb-1 transition-all",
                    collapsed ? "px-2 justify-center" : "px-4",
                    isActive && "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                  )}
                  title={collapsed ? item.label : ""}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex flex-col gap-2">
           {/* Settings */}
            <Button 
              variant="ghost" 
              className={cn(
                "justify-start gap-3 text-muted-foreground hover:text-foreground", 
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? "Configurações" : ""}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Configurações</span>}
            </Button>

            {/* Collapse Button (Moved here) */}
            <Button
              variant="outline"
              className={cn(
                "justify-start gap-3 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-colors mt-2",
                collapsed && "justify-center px-0 border-transparent bg-transparent hover:bg-transparent"
              )}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expandir" : "Recolher"}
            >
              {collapsed ? (
                 <PanelLeftOpen className="h-5 w-5 shrink-0" />
              ) : (
                 <>
                   <PanelLeftClose className="h-5 w-5 shrink-0" />
                   <span>Recolher Menu</span>
                 </>
              )}
            </Button>
        </div>
      </motion.div>
    </>
  );
}
