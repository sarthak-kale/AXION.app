import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Flame, 
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Habit } from '../types';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { useToasts } from '../components/Toast';

export const Habits: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToasts();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', frequency: 'daily' });

  const fetchHabits = async () => {
    const res = await fetch('/api/habits', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setHabits(await res.json());
  };

  useEffect(() => {
    fetchHabits();
  }, [token]);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.name) return;

    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newHabit)
    });

    if (res.ok) {
      addToast('Habit added');
      setIsAdding(false);
      setNewHabit({ name: '', frequency: 'daily' });
      fetchHabits();
    }
  };

  const toggleHabit = async (habitId: number, date: string) => {
    const res = await fetch(`/api/habits/${habitId}/complete`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ date })
    });

    if (res.ok) {
      fetchHabits();
    }
  };

  const getDaysInWeek = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const days = getDaysInWeek();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter font-display">Habits</h1>
          <p className="text-base sm:text-lg text-zinc-500 font-medium">Consistency is the key to mastery.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto"
        >
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto px-8 py-6 rounded-2xl text-lg font-semibold shadow-xl shadow-blue-500/20">
            <Plus size={22} className="mr-2" />
            New Habit
          </Button>
        </motion.div>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 sm:p-8 rounded-[2.5rem]">
              <form onSubmit={handleAddHabit} className="flex flex-col lg:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                  <Input
                    label="Habit Name"
                    placeholder="e.g. Morning Meditation"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  />
                </div>
                <div className="w-full lg:w-48 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Frequency</label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                    className="w-full rounded-2xl bg-zinc-900/50 border border-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                  <Button type="submit" className="flex-1 lg:flex-none">Create</Button>
                  <Button type="button" variant="secondary" onClick={() => setIsAdding(false)} className="px-4">
                    <X size={20} />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="space-y-4 sm:space-y-6"
      >
        {habits.length > 0 ? (
          habits.map((habit) => {
            const streak = habit.completions.length; // Simple streak logic for demo
            return (
              <motion.div
                key={habit.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="p-6 sm:p-8 hover:bg-zinc-900/80 transition-all group rounded-[2.5rem] border-white/5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/5 text-white group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl">
                        <Flame size={28} className={streak > 0 ? "fill-current" : ""} />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-display">{habit.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-sm sm:text-base text-zinc-500 font-bold uppercase tracking-widest">{streak} day streak</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                      {days.map((date) => {
                        const isCompleted = habit.completions.includes(date);
                        const isToday = date === new Date().toISOString().split('T')[0];
                        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                        
                        return (
                          <div key={date} className="flex flex-col items-center gap-3 min-w-[50px] sm:min-w-[60px]">
                            <span className={cn(
                              "text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]", 
                              isToday ? "text-white" : "text-zinc-600"
                            )}>
                              {dayName}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => toggleHabit(habit.id, date)}
                              className={cn(
                                "h-10 w-10 sm:h-12 sm:w-12 rounded-2xl border-2 transition-all flex items-center justify-center",
                                isCompleted 
                                  ? "bg-white border-white text-black shadow-xl shadow-white/10" 
                                  : "border-white/5 bg-white/5 hover:border-white/20"
                              )}
                            >
                              {isCompleted && <Check size={20} className="stroke-[3]" />}
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-600 mb-4">
              <CalendarIcon size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-400">No habits tracked yet</h3>
            <p className="text-sm text-gray-600">Start small. Build consistency. Defy gravity.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
