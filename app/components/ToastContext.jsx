"use client";

import React, { createContext, useState, useCallback, useContext } from "react";

const ToastContext = createContext({
  showToast: (message, type = "success") => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // {id, message, type}

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    // auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded shadow text-white animate-slide-in ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
