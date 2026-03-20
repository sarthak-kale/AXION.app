import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight, Github, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../AuthContext';
import { useToasts } from '../components/Toast';

export const AuthPage: React.FC<{ type: 'login' | 'register'; onToggle: () => void; onBack: () => void }> = ({ type, onToggle, onBack }) => {
  const { login } = useAuth();
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

if (type === 'register' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\\S+@\\S+\\.\\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit triggered. Data:', formData);

    if (!validate()) {
      console.log('Validation failed');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setShake(false);

    try {
      const endpoint = type === 'login' ? '/api/login' : '/api/register';
      console.log('Posting to', endpoint);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('API response:', data);

      if (res.ok) {
        login(data.token, data.user);
        addToast(type === 'login' ? 'Welcome back!' : 'Account created successfully!');
      } else {
        console.error('API error:', data.error);
        // Handle specific errors
        if (data.error?.includes('Email already exists') || data.error?.includes('UNIQUE')) {
          setErrors({ email: 'Email already exists' });
        } else if (data.error) {
          setErrors({ email: data.error }); // Generic to email for simplicity
        } else {
          addToast(data.error || 'Authentication failed', 'error');
        }
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      addToast('Network error. Please try again.', 'error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute -top-20 -right-20 -z-10 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px]" />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all group z-20"
      >
        <ArrowRight className="rotate-180 transition-transform group-hover:-translate-x-1" size={18} />
        Back to Home
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass w-full max-w-md rounded-[2.5rem] p-12 shadow-2xl border-white/5 relative z-10"
      >
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
          title="Back to Home"
        >
          <ArrowRight className="rotate-180" size={20} />
        </button>

        <div className="flex flex-col items-center mb-12">
          <Logo size={56} showText={false} className="mb-6" />
          <h1 className="text-4xl font-bold tracking-tighter mb-3 font-display">
            {type === 'login' ? 'Welcome Back' : 'Join Axion'}
          </h1>
          <p className="text-zinc-500 text-center text-lg font-medium leading-tight">
            {type === 'login' 
              ? 'Access your high-performance productivity suite.' 
              : 'Start your journey towards mastery today.'}
          </p>
        </div>

        <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            animate={shake ? { x: [0, -5, 5, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
{type === 'register' && (
            <motion.div
              animate={shake ? { x: [0, -5, 5, -5, 0] } : {}}
              transition={{ duration: 0.5 }}
              className={shake ? 'shake' : ''}
            >
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                  console.log('Name changed:', e.target.value);
                }}
                error={errors.name}
                required
                className="rounded-2xl border-white/5 bg-white/5 focus:bg-white/10 focus:ring-white/20 transition-all pr-0"
              />
            </motion.div>
          )}
<motion.div
            animate={shake ? { x: [0, -5, 5, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={shake ? 'shake' : ''}
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
                console.log('Email changed:', e.target.value);
              }}
              error={errors.email}
              required
              className="rounded-2xl border-white/5 bg-white/5 focus:bg-white/10 focus:ring-white/20 transition-all"
            />
          </motion.div>
          <motion.div
            animate={shake ? { x: [0, -5, 5, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={shake ? 'shake' : ''}
          >
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: '' });
                  console.log('Password length:', e.target.value.length);
                }}
                error={errors.password}
                required
                className="rounded-2xl border-white/5 bg-white/5 focus:bg-white/10 focus:ring-white/20 pr-12 transition-all"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/5 transition-all"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </motion.div>

          {type === 'login' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-pointer font-medium">
                <input type="checkbox" className="rounded-lg border-white/10 bg-white/5 text-white focus:ring-0" />
                Remember me
              </label>
              <button type="button" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">Forgot password?</button>
            </div>
          )}

            <motion.div
              animate={shake ? { x: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              <Button type="submit" className="w-full py-8 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/10" size="lg" isLoading={isLoading}>
                {type === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-3" size={20} />
              </Button>
            </motion.div>
          </motion.form>

        <div className="mt-10">
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="bg-[#050505] px-4 text-zinc-600">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" className="w-full py-6 rounded-2xl border-white/5 hover:bg-white/5 font-bold">
              <Github className="mr-2" size={20} />
              Github
            </Button>
            <Button variant="secondary" className="w-full py-6 rounded-2xl border-white/5 hover:bg-white/5 font-bold">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
          </div>
        </div>

        <p className="mt-12 text-center text-sm text-zinc-500 font-medium">
          {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={onToggle} className="text-white font-bold hover:underline transition-all">
            {type === 'login' ? 'Sign up for free' : 'Sign in here'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
