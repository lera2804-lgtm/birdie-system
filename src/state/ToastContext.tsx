import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (kind: ToastKind, text: string) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastState | null>(null);

let seq = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((kind: ToastKind, text: string) => {
    const id = ++seq;
    setToasts((prev) => [...prev, { id, kind, text }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  return <ToastContext.Provider value={{ toasts, addToast, removeToast }}>{children}</ToastContext.Provider>;
};

export const useToasts = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within ToastProvider');
  return ctx;
};
