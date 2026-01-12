"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import Toast, { ToastProps } from "@/components/shared/toast/Toast";

type ToastData = Omit<ToastProps, "id" | "onDismiss">;

interface ToastContextType {
  addToast: (toast: ToastData) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Omit<ToastProps, "onDismiss">[]>([]);

  const addToast = useCallback((toast: ToastData) => {
    const id = new Date().toISOString();
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
