import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, UserPlus, Info } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks'
import { setupAdmin, setNeedsSetup } from '@/infrastructure/store/slices/authSlice'

export default function SetupPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(setupAdmin(formData))
    if (setupAdmin.fulfilled.match(result)) {
      dispatch(setNeedsSetup(false))
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-[600px] bg-kfe-primary-dark flex flex-col items-center justify-center p-16 gap-8">
        <div className="text-center">
          <Coffee size={80} className="text-white mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-white">KFE</h1>
          <p className="text-white/60 text-xl mt-2">Sistema de Cafetería</p>
        </div>
        <p className="text-white/80 text-lg text-center max-w-md">
          Bienvenido al sistema de gestión de tu cafetería
        </p>
      </div>

      <div className="flex-1 bg-kfe-surface flex items-center justify-center p-20">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-kfe-text">
              Configuración Inicial
            </h2>
            <p className="text-kfe-text-secondary mt-2">
              Crea la cuenta de administrador para comenzar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-kfe-text">
                Nombre completo
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-kfe-text">
                Correo electrónico
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@kfe.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-kfe-text">
                Contraseña
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            {error && (
              <p className="text-kfe-error text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              <UserPlus size={20} />
              {isLoading ? 'Creando...' : 'Crear Administrador'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-kfe-text-muted text-sm">
            <Info size={16} />
            <span>Esta cuenta tendrá todos los permisos del sistema</span>
          </div>
        </div>
      </div>
    </div>
  )
}
