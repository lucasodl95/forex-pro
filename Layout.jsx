import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bot, History, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';
import Dashboard from '@/Pages/Dashboard';
import AgentPage from '@/Pages/Agent';
import HistoryPage from '@/Pages/History';
import PerformancePage from '@/Pages/Performance';
import SignalMonitor from '@/Components/tracking/SignalMonitor';
import { useState } from 'react';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/assistente', icon: Bot, label: 'Assistente' },
    { path: '/historico', icon: History, label: 'Histórico' },
    { path: '/performance', icon: TrendingUp, label: 'Performance' },
  ];

  return (
    <nav className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white hidden md:block">Forex Pro</h1>
          </div>

          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function MainContent() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSignalsUpdated = () => {
    // Força atualização de todas as páginas
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <SignalMonitor onSignalsUpdated={handleSignalsUpdated} />
      </div>

      <Routes key={refreshKey}>
        <Route path="/" element={<Dashboard refreshKey={refreshKey} />} />
        <Route path="/assistente" element={<AgentPage />} />
        <Route path="/historico" element={<HistoryPage refreshKey={refreshKey} />} />
        <Route path="/performance" element={<PerformancePage refreshKey={refreshKey} />} />
      </Routes>
    </>
  );
}

export default function Layout() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <MainContent />
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    </Router>
  );
}
