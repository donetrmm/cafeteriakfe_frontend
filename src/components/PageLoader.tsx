import { Coffee } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Coffee size={48} className="text-kfe-primary mx-auto mb-4 animate-pulse" />
        <p className="text-kfe-text-secondary">Cargando...</p>
      </div>
    </div>
  )
}
