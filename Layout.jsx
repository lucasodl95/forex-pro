import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { ThemeProvider } from '@/Components/ui/ThemeProvider';
import { NotificationProvider } from '@/Components/context/NotificationContext';
import { Sidebar } from '@/Components/ui/Sidebar';
import { Header } from '@/Components/ui/Header';
import { cn } from '@/lib/utils';
import Dashboard from '@/Pages/Dashboard';
import AgentPage from '@/Pages/Agent';
import HistoryPage from '@/Pages/History';
import PerformancePage from '@/Pages/Performance';
import SignalMonitor from '@/Components/tracking/SignalMonitor';

function MainContent({ collapsed }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSignalsUpdated = () => {
    // Força atualização de todas as páginas
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={cn(
      "transition-all duration-300 min-h-screen bg-background flex flex-col",
      collapsed ? "md:pl-20" : "md:pl-64"
    )}>
      <Header />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        <SignalMonitor onSignalsUpdated={handleSignalsUpdated} />

        <Routes key={refreshKey}>
          <Route path="/" element={<Dashboard refreshKey={refreshKey} />} />
          <Route path="/assistente" element={<AgentPage />} />
          <Route path="/historico" element={<HistoryPage refreshKey={refreshKey} />} />
          <Route path="/performance" element={<PerformancePage refreshKey={refreshKey} />} />
        </Routes>
      </div>
    </div>
  );
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <MainContent collapsed={collapsed} />
            <Toaster position="top-right" richColors />
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}