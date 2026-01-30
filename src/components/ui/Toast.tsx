import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, X, AlertTriangle, Info, AlertCircle, Bell } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'notification';
  message: string;
  title?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({ id, type, message, title, duration = 5000, onClose, action }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  }, [onClose, id]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, handleClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    notification: Bell,
  };

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      border: 'border-green-400',
      progress: 'bg-green-300',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-red-600',
      border: 'border-red-400',
      progress: 'bg-red-300',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      border: 'border-amber-400',
      progress: 'bg-amber-300',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      border: 'border-blue-400',
      progress: 'bg-blue-300',
    },
    notification: {
      bg: 'bg-gradient-to-r from-primary to-primary-dark',
      border: 'border-primary',
      progress: 'bg-primary/50',
    },
  };

  const Icon = icons[type];
  const style = styles[type];

  return (
    <div 
      className={`
        ${style.bg} text-white rounded-2xl shadow-2xl overflow-hidden
        min-w-[320px] max-w-[420px] border ${style.border}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{
        animation: isExiting ? undefined : 'slideInFromRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-bold text-sm mb-0.5">{title}</h4>
            )}
            <p className="text-sm font-medium opacity-95">{message}</p>
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  handleClose();
                }}
                className="mt-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>
          <button 
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div 
          className={`h-full ${style.progress} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{ 
    id: string; 
    type: 'success' | 'error' | 'warning' | 'info' | 'notification'; 
    message: string;
    title?: string;
    action?: { label: string; onClick: () => void };
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-auto">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          title={toast.title}
          action={toast.action}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Toast Hook
interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'notification';
  message: string;
  title?: string;
  action?: { label: string; onClick: () => void };
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: ToastItem['type'], message: string, options?: { title?: string; action?: { label: string; onClick: () => void } }) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message, ...options }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    toasts,
    success: (message: string, options?: { title?: string; action?: { label: string; onClick: () => void } }) => 
      addToast('success', message, options),
    error: (message: string, options?: { title?: string; action?: { label: string; onClick: () => void } }) => 
      addToast('error', message, options),
    warning: (message: string, options?: { title?: string; action?: { label: string; onClick: () => void } }) => 
      addToast('warning', message, options),
    info: (message: string, options?: { title?: string; action?: { label: string; onClick: () => void } }) => 
      addToast('info', message, options),
    notification: (message: string, options?: { title?: string; action?: { label: string; onClick: () => void } }) => 
      addToast('notification', message, options),
    removeToast,
  };
};

export default Toast;
