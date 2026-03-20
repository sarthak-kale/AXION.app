import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { LandingPage } from './LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Habits } from './pages/Habits';
import { FocusMode } from './pages/FocusMode';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { ToastContainer, useToasts } from './components/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { Menu } from 'lucide-react';
import { Logo } from './components/Logo';
import { cn } from './lib/utils';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toasts, removeToast } = useToasts();
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasksInitialIsAdding, setTasksInitialIsAdding] = useState(false);

  const navigateToTasks = (add: boolean = false) => {
    setActiveTab('tasks');
    setTasksInitialIsAdding(add);
    // Reset after a short delay so it doesn't stay true
    if (add) {
      setTimeout(() => setTasksInitialIsAdding(false), 100);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="noise opacity-20" />
        <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-purple/5 blur-[120px]" />
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: [0, 1, 0.5, 1], scale: [0.9, 1, 0.95, 1], filter: ['blur(10px)', 'blur(0px)', 'blur(2px)', 'blur(0px)'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl md:text-8xl font-black tracking-tighter font-display purple-gradient-text glow-text-purple select-none"
        >
          AXION
        </motion.h1>
      </div>
    );
  }

  // If logged in, show the main app
  if (user) {
    return (
      <div className="flex h-screen bg-background text-white overflow-hidden relative">
        <div className="noise" />
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        <div className="flex flex-1 flex-col overflow-hidden relative z-10">
          {/* Mobile Header */}
          <header className="flex h-16 items-center justify-between border-b border-white/5 bg-card/50 px-6 backdrop-blur-xl md:hidden shrink-0">
            <div className="flex items-center gap-2">
              <Logo size={24} showText={false} />
              <span className="text-lg font-bold tracking-tight font-display">AXION</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold ring-1 ring-white/20">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-0 scroll-smooth">
            <div className={cn(
              "mx-auto w-full h-full",
              activeTab === 'focus' ? "p-0" : "p-6 sm:p-8 md:p-12 max-w-[1600px]"
            )}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  {activeTab === 'dashboard' && <Dashboard onNewTask={() => navigateToTasks(true)} />}
                  {activeTab === 'tasks' && <Tasks initialIsAdding={tasksInitialIsAdding} />}
                  {activeTab === 'habits' && <Habits />}
                  {activeTab === 'focus' && <FocusMode />}
                  {activeTab === 'analytics' && <Analytics />}
                  {activeTab === 'settings' && <Settings />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  // Otherwise show landing or auth pages
  return (
    <div className="bg-background text-white">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onStart={() => setView('register')} onLogin={() => setView('login')} />
          </motion.div>
        )}
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <AuthPage type="login" onToggle={() => setView('register')} onBack={() => setView('landing')} />
          </motion.div>
        )}
        {view === 'register' && (
          <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <AuthPage type="register" onToggle={() => setView('login')} onBack={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
