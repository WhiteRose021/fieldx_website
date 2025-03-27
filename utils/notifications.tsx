"use client"

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, AlertCircle, Info, X, AlertTriangle,
  Loader2
} from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  progress?: number;
  autoClose?: boolean;
}

interface NotificationContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      autoClose: toast.type !== 'loading',
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    toasts.forEach(toast => {
      if (toast.autoClose && toast.duration) {
        const timer = setTimeout(() => {
          dismissToast(toast.id);
        }, toast.duration);
        timers.push(timer);
      }
    });
    
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  const contextValue = {
    toasts,
    showToast,
    updateToast,
    dismissToast,
    clearAllToasts
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export function useToasts() {
  const { showToast, updateToast, dismissToast } = useNotifications();
  
  const success = useCallback((title: string, message?: string, duration = 5000) => {
    return showToast({ type: 'success', title, message, duration });
  }, [showToast]);
  
  const error = useCallback((title: string, message?: string, duration = 5000) => {
    return showToast({ type: 'error', title, message, duration });
  }, [showToast]);
  
  const info = useCallback((title: string, message?: string, duration = 5000) => {
    return showToast({ type: 'info', title, message, duration });
  }, [showToast]);
  
  const warning = useCallback((title: string, message?: string, duration = 5000) => {
    return showToast({ type: 'warning', title, message, duration });
  }, [showToast]);
  
  const loading = useCallback((title: string, message?: string) => {
    return showToast({ type: 'loading', title, message, autoClose: false });
  }, [showToast]);
  
  const update = useCallback((id: string, updates: Partial<Toast>) => {
    updateToast(id, updates);
  }, [updateToast]);
  
  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, [dismissToast]);
  
  const promiseToast = useCallback(<T,>(
    promise: Promise<T>,
    { loading: loadingMessage, success: successMessage, error: errorMessage }: {
      loading: string;
      success: string;
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    const toastId = loading(loadingMessage);
    return promise
      .then((result) => {
        dismissToast(toastId);
        success(successMessage);
        return result;
      })
      .catch((err) => {
        dismissToast(toastId);
        const errorMsg = typeof errorMessage === 'function' ? errorMessage(err) : errorMessage;
        error(errorMsg);
        throw err;
      });
  }, [loading, success, error, dismissToast]);
  
  return { success, error, info, warning, loading, update, dismiss, promiseToast };
}

const ToastContainer = () => {
  const { toasts, dismissToast } = useNotifications();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-4 max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full"
          >
            <ToastNotification toast={toast} onDismiss={() => dismissToast(toast.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastNotification = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) => {
  const { type, title, message, duration, autoClose } = toast;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!autoClose || !duration) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, autoClose]);

  const IconComponent = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
    loading: Loader2
  }[type];
  
  const colorClasses = {
    success: 'bg-green-900/90 border-green-500 text-green-50',
    error: 'bg-red-900/90 border-red-500 text-red-50',
    info: 'bg-blue-900/90 border-blue-500 text-blue-50',
    warning: 'bg-yellow-900/90 border-yellow-500 text-yellow-50',
    loading: 'bg-purple-900/90 border-purple-500 text-purple-50'
  }[type];
  
  const progressColorClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    loading: 'bg-purple-500'
  }[type];
  
  return (
    <div className={`w-full rounded-lg shadow-lg border backdrop-blur-md p-4 relative overflow-hidden ${colorClasses}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <IconComponent className={`h-5 w-5 ${type === 'loading' ? 'animate-spin' : ''}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{title}</p>
          {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onDismiss}
            className="inline-flex rounded-md hover:bg-black/10 p-1 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {autoClose && duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div className={`h-full ${progressColorClasses}`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

export function withNotifications<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  return function WithNotifications(props: P) {
    return (
      <NotificationProvider>
        <Component {...props} />
      </NotificationProvider>
    );
  };
}

// Fix for TypeScript Omit utility
type omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;