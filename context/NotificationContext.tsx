import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              layout
              className="pointer-events-auto"
            >
              <div className={`min-w-[300px] max-w-md px-4 py-3 rounded-xl shadow-2xl border flex items-start space-x-3 backdrop-blur-md ${
                n.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' :
                n.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' :
                'bg-blue-50/90 border-blue-200 text-blue-800'
              }`}>
                <div className="mt-0.5 shrink-0">
                  {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {n.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-semibold leading-tight">{n.message}</p>
                </div>
                <button
                  onClick={() => removeNotification(n.id)}
                  className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
