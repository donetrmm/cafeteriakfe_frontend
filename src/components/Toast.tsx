import { useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const styles = {
  success: 'bg-kfe-surface border-kfe-success text-kfe-success',
  error: 'bg-kfe-surface border-kfe-error text-kfe-error',
  warning: 'bg-kfe-surface border-kfe-warning text-kfe-warning',
  info: 'bg-kfe-surface border-kfe-info text-kfe-info',
}

export function ToastItem({ toast, onClose }: ToastProps) {
  const Icon = icons[toast.type]
  const duration = toast.duration || 5000

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, duration, onClose])

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md toast-enter',
        styles[toast.type]
      )}
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}
