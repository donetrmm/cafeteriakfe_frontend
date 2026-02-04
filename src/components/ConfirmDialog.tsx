import { X, AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      button: 'bg-kfe-error text-white hover:bg-kfe-error/90',
      icon: 'text-kfe-error',
      iconBg: 'bg-kfe-error/10',
    },
    warning: {
      button: 'bg-kfe-warning text-white hover:bg-kfe-warning/90',
      icon: 'text-kfe-warning',
      iconBg: 'bg-kfe-warning/10',
    },
    info: {
      button: 'bg-kfe-info text-white hover:bg-kfe-info/90',
      icon: 'text-kfe-info',
      iconBg: 'bg-kfe-info/10',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-kfe-surface rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center gap-4 p-6 border-b border-kfe-border">
          <div className={`w-12 h-12 rounded-full ${styles.iconBg} ${styles.icon} flex items-center justify-center flex-shrink-0`}>
            <AlertTriangle size={24} className={styles.icon} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-kfe-text">{title}</h2>
            <p className="text-sm text-kfe-text-secondary mt-1">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg hover:bg-kfe-surface-warm flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X size={20} className="text-kfe-text-muted" />
          </button>
        </div>

        <div className="flex gap-3 p-6">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.button} btn-primary flex-1`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
