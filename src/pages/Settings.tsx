import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Smartphone, 
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', desc: 'Update your name, email and avatar' },
        { icon: Shield, label: 'Security', desc: 'Manage your password and 2FA' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', desc: 'Configure how you receive alerts' },
        { icon: Moon, label: 'Appearance', desc: 'Customize your theme and layout' },
        { icon: Smartphone, label: 'Devices', desc: 'Manage your connected devices' },
      ]
    },
    {
      title: 'Billing',
      items: [
        { icon: CreditCard, label: 'Subscription', desc: 'Manage your plan and payment methods' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8">
      <header className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter font-display">Settings</h1>
          <p className="text-base sm:text-lg text-zinc-500 font-medium">Manage your digital workspace.</p>
        </motion.div>
      </header>

      <div className="space-y-12">
        {sections.map((section, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-6"
          >
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 px-6">{section.title}</h2>
            <div className="grid gap-4">
              {section.items.map((item, j) => (
                <Card key={j} className="p-6 sm:p-8 group cursor-pointer hover:bg-zinc-900/80 transition-all rounded-[2.5rem] border-white/5">
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/5 text-zinc-500 group-hover:text-white group-hover:bg-white/10 transition-all duration-500 shadow-2xl">
                      <item.icon size={26} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xl sm:text-2xl font-bold tracking-tight font-display">{item.label}</p>
                      <p className="text-sm sm:text-base text-zinc-500 font-medium truncate mt-1">{item.desc}</p>
                    </div>
                    <ChevronRight size={24} className="text-zinc-800 group-hover:text-white group-hover:translate-x-3 transition-all duration-500" />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6"
      >
        <div className="text-sm font-bold uppercase tracking-widest text-zinc-600">
          Axion <span className="text-zinc-800">v1.0.4</span>
        </div>
        <Button variant="danger" className="w-full sm:w-auto px-10 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px]">Delete Account</Button>
      </motion.div>
    </div>
  );
};
