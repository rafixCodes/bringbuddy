import { createContext, useContext, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle2 size={18} className="text-success shrink-0" />,
  error: <XCircle size={18} className="text-danger shrink-0" />,
  warning: <AlertTriangle size={18} className="text-warning shrink-0" />,
  info: <Info size={18} className="text-info shrink-0" />,
}

function ToastEl({ toast, onDismiss }) {
  return (
    <div className="bb-toast flex w-80 items-start gap-3 rounded-[12px] bg-white p-4 shadow-[var(--shadow-e3)] ring-1 ring-border pointer-events-auto animate-[bb-toast-in_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
      {icons[toast.tone]}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-ink leading-snug">{toast.title}</p>
        {toast.message && <p className="text-[13px] text-ink-muted mt-0.5 leading-snug">{toast.message}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="rounded-md p-0.5 text-ink-muted hover:text-ink transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = (t) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4500)
  }

  const dismiss = (id) => setToasts(prev => prev.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map(t => (
          <ToastEl key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}