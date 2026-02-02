import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-kfe-bg flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-kfe-error/10 flex items-center justify-center">
              <AlertTriangle size={40} className="text-kfe-error" />
            </div>
            
            <h1 className="text-2xl font-semibold text-kfe-text mb-2">
              ¡Algo salió mal!
            </h1>
            
            <p className="text-kfe-text-secondary mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-kfe-surface rounded-xl border border-kfe-border text-left">
                <p className="text-xs font-mono text-kfe-text-muted break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleGoHome}
                className="btn-secondary flex-1"
              >
                Ir al inicio
              </button>
              <button
                onClick={this.handleReload}
                className="btn-primary flex-1"
              >
                <RefreshCw size={18} />
                Recargar
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
