import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Filter,
  Search,
  X
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Task } from '../types';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { useToasts } from '../components/Toast';

export const Tasks: React.FC<{ initialIsAdding?: boolean }> = ({ initialIsAdding = false }) => {
  const { token } = useAuth();
  const { addToast } = useToasts();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(initialIsAdding);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as const, due_date: '' });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(await res.json());
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  useEffect(() => {
    if (initialIsAdding) setIsAdding(true);
  }, [initialIsAdding]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        ...newTask,
        due_date: newTask.due_date || new Date().toISOString().split('T')[0]
      })
    });

    if (res.ok) {
      addToast('Task created successfully');
      setIsAdding(false);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      fetchTasks();
    }
  };

  const triggerConfetti = (x: number, y: number) => {
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { x: x / window.innerWidth, y: y / window.innerHeight },
      colors: ['#3B82F6', '#8B5CF6', '#10B981'],
      scalar: 0.7,
      gravity: 1.2,
      ticks: 100
    });
  };

  const toggleStatus = async (task: Task, event?: React.MouseEvent) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    if (newStatus === 'completed' && event) {
      triggerConfetti(event.clientX, event.clientY);
    }

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      // Rollback
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: task.status } : t));
      addToast('Failed to update task', 'error');
    } else if (newStatus === 'completed') {
      addToast('Task completed! +10 focus points');
    }
  };

  const deleteTask = async (id: number) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      addToast('Task deleted');
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter font-display">Tasks</h1>
          <p className="text-base sm:text-lg text-zinc-500 font-medium">Master your daily objectives.</p>
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
            New Task
          </Button>
        </motion.div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 mb-10"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-zinc-900/50 border border-white/5 pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-zinc-600 font-medium"
          />
        </div>
        <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 no-scrollbar">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap uppercase tracking-widest",
                filter === f 
                  ? "bg-white text-black shadow-xl" 
                  : "bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800 border border-white/5"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300 
                } 
              }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="glass w-full max-w-xl rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold tracking-tight font-display">New Task</h2>
                  <p className="text-sm text-zinc-500 font-medium">Add a new objective to your flow.</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-3 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Input
                    label="Title"
                    placeholder="What needs to be done?"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    autoFocus
                    className="text-lg py-6"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Input
                    label="Description"
                    placeholder="Add some details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="py-6"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full rounded-2xl bg-zinc-900/50 border border-white/5 px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <Input
                    label="Due Date"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="py-4"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex gap-4 pt-6"
                >
                  <Button type="button" variant="secondary" className="flex-1 py-6 rounded-2xl text-lg" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 py-6 rounded-2xl text-lg shadow-xl shadow-blue-500/20">
                    Create Task
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Task List */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="space-y-4"
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <motion.div
              layout
              key={task.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              animate={{ 
                backgroundColor: task.status === 'completed' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.01 }}
              className={cn(
                "group relative flex items-center gap-4 sm:gap-6 rounded-[2rem] border border-white/5 p-5 sm:p-6 transition-all hover:bg-zinc-900/80 overflow-hidden pl-8 sm:pl-10",
                task.status === 'completed' && "opacity-40 grayscale-[0.5]"
              )}
            >
              {/* Priority Indicator Bar */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-2 transition-colors",
                task.priority === 'high' ? "bg-red-500" :
                task.priority === 'medium' ? "bg-amber-500" :
                "bg-emerald-500",
                task.status === 'completed' && "opacity-20"
              )} />

              {/* Shimmer effect on completion */}
              {task.status === 'completed' && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                />
              )}

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => toggleStatus(task, e)}
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                  task.status === 'completed' 
                    ? "bg-white border-white text-black" 
                    : "border-white/10 hover:border-white/40 bg-white/5"
                )}
              >
                <AnimatePresence mode="wait">
                  {task.status === 'completed' ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 size={18} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="circle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Circle size={18} className="text-zinc-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              
              <div className="flex-1 relative z-10 min-w-0">
                <div className="relative inline-block max-w-full">
                  <motion.h3 
                    animate={{ 
                      color: task.status === 'completed' ? '#71717a' : '#ffffff',
                    }}
                    className="text-lg sm:text-xl font-bold tracking-tight truncate font-display"
                  >
                    {task.title}
                  </motion.h3>
                  {/* Animated Strikethrough */}
                  <AnimatePresence>
                    {task.status === 'completed' && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-1/2 left-0 h-[2px] bg-zinc-500 -translate-y-1/2"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {task.description && (
                  <p className="text-sm sm:text-base text-zinc-500 font-medium truncate mt-1">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 sm:gap-6">
                <div className={cn(
                  "hidden xs:flex items-center gap-2 rounded-xl px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest border",
                  task.priority === 'high' ? "bg-red-500/5 text-red-500 border-red-500/20" :
                  task.priority === 'medium' ? "bg-amber-500/5 text-amber-500 border-amber-500/20" :
                  "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                )}>
                  <AlertCircle size={12} />
                  <span className="hidden sm:inline">{task.priority}</span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all p-2 hover:bg-red-500/10 rounded-xl"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-600 mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-400">No tasks found</h3>
            <p className="text-sm text-gray-600">Time to relax or add something new to your list.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
