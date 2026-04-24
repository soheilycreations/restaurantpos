"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className="pointer-events-auto"
            >
              <div className={`
                min-w-[260px] max-w-[320px] p-3 rounded-xl shadow-xl backdrop-blur-xl border flex items-center gap-3
                ${n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : ''}
                ${n.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : ''}
                ${n.type === 'info' ? 'bg-[#6c5ce7]/10 border-[#6c5ce7]/20 text-[#6c5ce7]' : ''}
              `}>
                <div className={`
                   w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                   ${n.type === 'success' ? 'bg-emerald-500/20' : ''}
                   ${n.type === 'error' ? 'bg-rose-500/20' : ''}
                   ${n.type === 'info' ? 'bg-[#6c5ce7]/20' : ''}
                `}>
                  {n.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {n.type === 'error' && <AlertCircle className="w-4 h-4" />}
                  {n.type === 'info' && <Info className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-bold leading-tight truncate ${
                    n.type === 'success' ? 'text-emerald-500 dark:text-emerald-400' : 
                    n.type === 'error' ? 'text-rose-500 dark:text-rose-400' :
                    'text-[#6c5ce7] dark:text-[#a29bfe]'
                  }`}>
                    {n.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeNotification(n.id)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotify must be used within a NotificationProvider');
  return context;
};
