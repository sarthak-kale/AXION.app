import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Repeat, 
  Timer, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
    { id: 'habits', icon: Repeat, label: 'Habits' },
    { id: 'focus', icon: Timer, label: 'Focus Mode' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-white/5 bg-card/80 px-4 backdrop-blur-2xl md:hidden pb-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-2xl px-4 py-2 transition-all active:scale-90 relative",
              activeTab === item.id ? "text-accent-blue" : "text-ink-muted"
            )}
          >
            <item.icon size={22} className={cn("transition-transform", activeTab === item.id ? "scale-110" : "scale-100")} />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] font-display">{item.label.split(' ')[0]}</span>
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTabIndicatorMobile"
                className="absolute -bottom-1 h-1 w-4 rounded-full bg-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isCollapsed ? 84 : 280,
        }}
        transition={{ type: "spring", damping: 28, stiffness: 180 }}
        className={cn(
          "hidden md:flex flex-col border-r border-white/5 bg-card/40 backdrop-blur-2xl relative z-20",
          isCollapsed ? "w-[84px]" : "w-[280px]"
        )}
      >
        {/* Logo & Toggle Section */}
        <div 
          className={cn(
            "p-8 flex items-center transition-all duration-300 relative", 
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <Logo size={32} showText={false} />
                <span className="text-xl font-bold tracking-tighter font-display glow-text">AXION</span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Logo showText={false} size={36} />
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "absolute -right-3 top-10 h-6 w-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all shadow-xl z-30",
              isCollapsed && "right-1/2 translate-x-1/2 top-[110px]"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all relative overflow-hidden',
                activeTab === item.id
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-ink-muted hover:bg-white/5 hover:text-white',
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} className={cn("shrink-0 transition-transform group-hover:scale-110", activeTab === item.id ? 'text-accent-blue' : 'text-ink-muted group-hover:text-white')} />
              
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="whitespace-nowrap font-display tracking-tight"
                >
                  {item.label}
                </motion.span>
              )}

              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={cn(
                    "absolute left-0 w-1 h-6 rounded-r-full bg-accent-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]",
                    isCollapsed && "hidden"
                  )}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-6 space-y-4">
          <div className={cn(
            "rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 transition-all overflow-hidden",
            isCollapsed ? "p-2 justify-center" : "p-4"
          )}>
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-bold truncate font-display">{user?.name}</p>
                <p className="text-[10px] text-ink-muted truncate uppercase tracking-widest">{user?.email}</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-all font-display uppercase tracking-widest",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.div>
    </>
  );
};
