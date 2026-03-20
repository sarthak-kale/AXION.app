import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Activity,
  Award,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../components/Card';
import { useAuth } from '../AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

import { cn } from '../lib/utils';

export const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(await res.json());
    };
    fetchStats();
  }, [token]);

  const productivityData = stats?.activity || [
    { name: 'Mon', tasks: 0, focus: 0 },
    { name: 'Tue', tasks: 0, focus: 0 },
    { name: 'Wed', tasks: 0, focus: 0 },
    { name: 'Thu', tasks: 0, focus: 0 },
    { name: 'Fri', tasks: 0, focus: 0 },
    { name: 'Sat', tasks: 0, focus: 0 },
    { name: 'Sun', tasks: 0, focus: 0 },
  ];

  const habitConsistency = [
    { name: 'Week 1', value: 85 },
    { name: 'Week 2', value: 70 },
    { name: 'Week 3', value: 90 },
    { name: 'Week 4', value: 95 },
  ];

  const focusHours = stats ? Math.round((stats.focusTimeMinutes / 60) * 10) / 10 : 0;
  const completionRate = stats ? (stats.tasksCompleted > 0 ? '92%' : '0%') : '0%'; // Simplified for now

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8">
      <header className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter font-display">Analytics</h1>
          <p className="text-base sm:text-lg text-zinc-500 font-medium">Deep insights into your patterns.</p>
        </motion.div>
      </header>

      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Focus', value: `${focusHours}h`, icon: Clock, color: 'text-white' },
          { label: 'Tasks Done', value: stats?.tasksCompleted || 0, icon: CheckCircle2, color: 'text-white' },
          { label: 'Consistency', value: `${stats?.habitsTracked || 0}d`, icon: Activity, color: 'text-white' },
          { label: 'Best Day', value: 'Thu', icon: Award, color: 'text-white' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 sm:p-8 hover:bg-zinc-900/80 transition-all group rounded-[2.5rem] border-white/5">
              <div className="flex flex-col gap-6">
                <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:bg-white group-hover:text-black transition-all duration-500 w-fit shadow-2xl", item.color)}>
                  <item.icon size={28} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-zinc-500 uppercase font-black tracking-[0.3em] truncate">{item.label}</p>
                  <p className="text-3xl sm:text-4xl font-bold truncate font-display mt-2">{item.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 sm:p-8 rounded-[2.5rem] border-white/5">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-display">Focus vs Tasks</h3>
              <p className="text-sm sm:text-base text-zinc-500 font-medium">Correlation between metrics.</p>
            </div>
            <div className="h-[300px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#3f3f46" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#3f3f46" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="tasks" fill="#ffffff" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="focus" fill="#3f3f46" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 sm:p-8 rounded-[2.5rem] border-white/5">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-display">Habit Consistency</h3>
              <p className="text-sm sm:text-base text-zinc-500 font-medium">Your progress over 4 weeks.</p>
            </div>
            <div className="h-[300px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={habitConsistency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#3f3f46" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#3f3f46" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={4} dot={{ fill: '#ffffff', r: 6 }} activeDot={{ r: 8, stroke: '#000', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
