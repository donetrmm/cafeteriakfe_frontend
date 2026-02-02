import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Coffee, UserPlus, Mail, Lock, User } from 'lucide-react'
import { apiClient } from '@/infrastructure/api/client'
import { setupAdminSchema, type SetupAdminFormData } from '@/lib/validations'
import { useState } from 'react'
import { useAppDispatch } from '@/infrastructure/store/hooks'
import { checkSetupStatus } from '@/infrastructure/store/slices/authSlice'

export default function SetupPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupAdminFormData>({
    resolver: zodResolver(setupAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SetupAdminFormData) => {
    setIsLoading(true)
    setServerError('')
    try {
      await apiClient.post('/auth/setup-admin', data)
      await dispatch(checkSetupStatus())
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setServerError(error.response?.data?.message || 'Error al crear el administrador')
    } finally {
      setIsLoading(false)
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
        <p className="text-white/80 text-lg text-center">
          Configuración inicial del sistema
        </p>
      </div>

      <div className="flex-1 bg-kfe-surface flex items-center justify-center p-20">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-kfe-text">
              Crear Administrador
            </h2>
            <p className="text-kfe-text-secondary mt-2">
              Configura la cuenta maestra del sistema
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-kfe-text">
                Nombre completo
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-kfe-text-muted" />
                <input
                  type="text"
                  className={`input-field pl-12 ${errors.name ? 'border-kfe-error' : ''}`}
                  placeholder="Tu nombre"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-kfe-error text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-kfe-text">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-kfe-text-muted" />
                <input
                  type="email"
                  className={`input-field pl-12 ${errors.email ? 'border-kfe-error' : ''}`}
                  placeholder="admin@kfe.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-kfe-error text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-kfe-text">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-kfe-text-muted" />
                <input
                  type="password"
                  className={`input-field pl-12 ${errors.password ? 'border-kfe-error' : ''}`}
                  placeholder="••••••••"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-kfe-error text-xs">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-kfe-error text-sm">{serverError}</p>
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
        </div>
      </div>
    </div>
  )
}
