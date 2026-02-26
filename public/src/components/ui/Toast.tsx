"use client";

import { useState, useEffect } from "react";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  onCloseAction: (id: string) => void;
}

export default function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onCloseAction,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onCloseAction(id);
      setIsVisible(false);
    }, 300);
  };

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setIsVisible(true), 10);

    // Auto remove after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 border-green-200",
          icon: "text-green-600",
          title: "text-green-900",
          message: "text-green-700",
          iconPath: "M5 13l4 4L19 7",
        };
      case "error":
        return {
          bg: "bg-red-50 border-red-200",
          icon: "text-red-600",
          title: "text-red-900",
          message: "text-red-700",
          iconPath: "M6 18L18 6M6 6l12 12",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          icon: "text-yellow-600",
          title: "text-yellow-900",
          message: "text-yellow-700",
          iconPath:
            "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z",
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50 border-blue-200",
          icon: "text-blue-600",
          title: "text-blue-900",
          message: "text-blue-700",
          iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${
          isVisible && !isRemoving
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }
        max-w-sm w-full ${
          styles.bg
        } border rounded-lg shadow-lg pointer-events-auto
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className={`w-6 h-6 ${styles.icon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={styles.iconPath}
              />
            </svg>
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${styles.title}`}>{title}</p>
            <p className={`mt-1 text-sm ${styles.message}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`rounded-md inline-flex ${styles.icon} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div
          className={`h-full transition-all ease-linear ${
            type === "success"
              ? "bg-green-500"
              : type === "error"
              ? "bg-red-500"
              : type === "warning"
              ? "bg-yellow-500"
              : "bg-blue-500"
          }`}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
