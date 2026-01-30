import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast, { ToastProps } from '../components/ui/Toast';

interface ToastOptions {
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'warning' | 'info' | 'notification', message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  notification: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastItem extends Omit<ToastProps, 'onClose'> {
  options?: ToastOptions;
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((
    type: 'success' | 'error' | 'warning' | 'info' | 'notification', 
    message: string, 
    options?: ToastOptions
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = {
      id,
      type,
      message,
      title: options?.title,
      duration: options?.duration || 5000,
      action: options?.action,
    };
    setToasts(prev => [...prev.slice(-4), newToast]); // Keep max 5 toasts
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => 
    showToast('success', message, options), [showToast]);
  
  const error = useCallback((message: string, options?: ToastOptions) => 
    showToast('error', message, options), [showToast]);
  
  const warning = useCallback((message: string, options?: ToastOptions) => 
    showToast('warning', message, options), [showToast]);
  
  const info = useCallback((message: string, options?: ToastOptions) => 
    showToast('info', message, options), [showToast]);
  
  const notification = useCallback((message: string, options?: ToastOptions) => 
    showToast('notification', message, options), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, notification }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map(toast => (
            <div key={toast.id} className="mb-3">
              <Toast
                id={toast.id}
                type={toast.type}
                message={toast.message}
                title={toast.title}
                duration={toast.duration}
                action={toast.action}
                onClose={removeToast}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};