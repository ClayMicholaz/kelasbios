"use client";

import React, { createContext, useState, useCallback, ReactNode } from "react";
import Toast from "./Toast";

interface ToastData {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (
    message: string,
    type: "success" | "error" | "warning" | "info",
    title?: string
  ) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export default function ToastContainer({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info",
      title?: string
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toastTitle =
        title ||
        (type === "success"
          ? "Berhasil"
          : type === "error"
          ? "Error"
          : type === "warning"
          ? "Peringatan"
          : "Informasi");

      setToasts((prev) => [...prev, { id, type, title: toastTitle, message }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-[70]"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onCloseAction={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
