"use client";

import React, { useEffect, useState } from "react";

export type ToastProps = {
  id: string;
  message: string;
  type: "success" | "error";
  onDismiss: (id: string) => void;
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300); // Allow for fade out animation
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, onDismiss]);

  const baseClasses =
    "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
  const typeClasses = {
    success: "bg-green-50 border-green-400 text-green-700",
    error: "bg-red-50 border-red-400 text-red-700",
  };
  const animationClass = isVisible
    ? "animate-fadeIn"
    : "animate-fadeOut";

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${animationClass} mb-4`}
    >
      <div className="p-4">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Toast;
