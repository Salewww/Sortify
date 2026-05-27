'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 4000;
const EXIT_DURATION = 200;

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  // Trigger entry on mount (next frame so CSS transition fires)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const colorMap = {
    success: {
      wrapper: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      text: 'text-green-800',
      btn: 'text-green-500 hover:text-green-700 hover:bg-green-100',
    },
    error: {
      wrapper: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      text: 'text-red-800',
      btn: 'text-red-500 hover:text-red-700 hover:bg-red-100',
    },
    info: {
      wrapper: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-800',
      btn: 'text-blue-500 hover:text-blue-700 hover:bg-blue-100',
    },
  };

  const c = colorMap[toast.type];

  // Compute entry/exit transform + opacity
  // entry: visible && !exiting → identity
  // pre-entry: !visible → translateY(8px) opacity-0
  // exit: exiting → translateY(-4px) opacity-0
  const style: React.CSSProperties = {
    transform: toast.exiting
      ? 'translateY(-4px)'
      : visible
      ? 'translateY(0)'
      : 'translateY(8px)',
    opacity: toast.exiting ? 0 : visible ? 1 : 0,
    transition:
      'transform 250ms cubic-bezier(0.23, 1, 0.32, 1), opacity 250ms cubic-bezier(0.23, 1, 0.32, 1)',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={style}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        min-w-[300px] max-w-[500px] will-change-transform
        ${c.wrapper}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${c.icon}`}>
        {toast.type === 'success' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {toast.type === 'info' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Message */}
      <p className={`flex-1 text-sm font-medium ${c.text}`}>{toast.message}</p>

      {/* Dismiss button with scale feedback */}
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className={`
          flex-shrink-0 rounded-md p-1 transition-all
          active:scale-90
          ${c.btn}
        `}
        style={{
          /* scale feedback on press — works even if Tailwind active: is disabled */
          transition: 'transform 100ms ease, color 150ms ease, background-color 150ms ease',
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    // Trigger exit animation, then remove from DOM after transition completes
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_DURATION + 50); // slight buffer past transition
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

      setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Portal-like fixed container; top-right, stacks downward */}
      <div
        aria-label="Notifications"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>

      {/* prefers-reduced-motion: kill transitions globally for this component */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [role="alert"] {
            transition: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
