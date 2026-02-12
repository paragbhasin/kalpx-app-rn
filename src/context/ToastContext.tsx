import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
    id: string;
    message: string;
    timeout?: number;
    type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
    showToast: (message: string, timeout?: number, type?: Toast['type']) => void;
    toasts: Toast[];
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, timeout = 3000, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, timeout, type };

        setToasts((prev) => [...prev, newToast]);

        if (timeout > 0) {
            setTimeout(() => {
                removeToast(id);
            }, timeout);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
