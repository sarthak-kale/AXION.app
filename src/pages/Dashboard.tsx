import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Stats, Task, Habit } from '../types';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const Dashboard: React.FC<{ onNewTask?: () => void }> = ({ onNewTask }) => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, tasksRes, habitsRes] = await Promise.all([
        fetch('/api/stats', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/habits', { headers }),
      ]);
      
      const statsData = await statsRes.json();
      setStats(statsData);
      setTasks((await tasksRes.json()).slice(0, 3));
      setHabits((await habitsRes.json()).slice(0, 3));
    };
    fetchData();
  }, [token]);

  const chartData = stats?.activity?.map((a: any) => ({
    name: a.name,
    value: a.tasks * 10 + (a.focus / 60) * 20 // Weighted value for "Productivity Flow"
  })) || [
    { name: 'Mon', value: 0 },
    { name: 'Tue', value: 0 },
    { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 },
    { name: 'Fri', value: 0 },
    { name: 'Sat', value: 0 },
    { name: 'Sun', value: 0 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-display"
          >
            Welcome back, <span className="text-accent-blue glow-text">{user?.name}</span>
          </motion.h1>
          <p className="text-base md:text-lg text-ink-muted max-w-2xl">
            Your productivity flow is looking strong today. You've completed <span className="text-white font-medium">{stats?.tasksCompleted || 0} tasks</span> so far.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" className="glass hover:bg-white/10 transition-all group">
            <Calendar size={18} className="mr-2 group-hover:scale-110 transition-transform" />
            Schedule
          </Button>
          <Button size="lg" onClick={onNewTask} className="shadow-lg shadow-blue-500/20 group">
            <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
            New Task
          </Button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {/* Main Productivity Chart */}
        <Card className="md:col-span-2 lg:col-span-3 lg:row-span-2 p-8 sm:p-10 glass glow-border overflow-hidden rounded-[2.5rem]">
          <div className="mb-10 flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-display tracking-tight">Productivity Flow</h3>
              <p className="text-sm text-zinc-500 font-medium">Activity overview for the current week</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 border border-emerald-500/20">
              <TrendingUp size={14} />
              +12.5%
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#4b5563" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  className="font-medium"
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}%`}
                  dx={-10}
                  className="font-medium"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0C0C12', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    padding: '16px'
                  }} 
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  labelStyle={{ color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stats Cards */}
        {[
          { label: 'Tasks Done', value: stats?.tasksCompleted || 0, icon: CheckCircle2, color: 'blue', delay: 0.1 },
          { label: 'Focus Time', value: `${Math.round((stats?.focusTimeMinutes || 0) / 60)}h ${(stats?.focusTimeMinutes || 0) % 60}m`, icon: Clock, color: 'purple', delay: 0.2 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: stat.delay }}
            className="h-full"
          >
            <Card className="p-8 glass hover:bg-zinc-900/80 transition-all group h-full flex flex-col justify-between border-white/5 rounded-[2.5rem]">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-[1.5rem] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg", `bg-${stat.color}-600/10 text-${stat.color}-500 group-hover:bg-${stat.color}-500 group-hover:text-white`)}>
                <stat.icon size={28} />
              </div>
              <div className="mt-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">{stat.label}</p>
                <h3 className="text-4xl font-bold font-display mt-2 tracking-tight">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Recent Tasks Widget */}
        <Card className="lg:col-span-1 lg:row-span-2 p-8 glass border-white/5 flex flex-col rounded-[2.5rem]">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-bold font-display tracking-tight">Recent Tasks</h3>
            <button className="text-[10px] font-black text-accent-blue hover:glow-text transition-all uppercase tracking-[0.2em]">View All</button>
          </div>
          <div className="space-y-4 flex-1">
            {tasks.length > 0 ? tasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="group flex items-center gap-4 rounded-2xl bg-white/5 p-5 transition-all hover:bg-white/10 cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className={cn(
                  "h-3 w-3 rounded-full shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                  task.priority === 'high' ? 'bg-red-500 shadow-red-500/30' : task.priority === 'medium' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-blue-500 shadow-blue-500/30'
                )} />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate group-hover:text-accent-blue transition-colors">{task.title}</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Due {new Date(task.due_date).toLocaleDateString()}</p>
                </div>
                <ChevronRight size={16} className="text-zinc-700 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-zinc-600 text-sm space-y-4 opacity-50">
                <CheckCircle2 size={48} strokeWidth={1} />
                <p className="font-bold uppercase tracking-widest">All caught up!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Habit Streak Card */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <Card className="p-8 glass bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/10 group hover:from-orange-500/20 transition-all rounded-[2.5rem]">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-orange-600/10 text-orange-500 group-hover:animate-bounce shadow-lg">
                  <Flame size={28} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Streak</p>
                  <h3 className="text-4xl font-bold font-display text-orange-500 mt-1 tracking-tight">{stats?.habitsTracked || 0} Days</h3>
                </div>
              </div>
              <div className="mt-8 flex gap-2">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-10 flex-1 rounded-xl transition-all duration-700",
                      i < 4 ? "bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]" : "bg-white/5"
                    )} 
                  />
                ))}
              </div>
            </Card>
          </motion.div>

      </div>
    </motion.div>
  );
};
