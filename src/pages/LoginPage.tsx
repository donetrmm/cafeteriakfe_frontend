import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Coffee, LogIn, Mail, Lock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks'
import { login } from '@/infrastructure/store/slices/authSlice'
import { loginSchema, type LoginFormData } from '@/lib/validations'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const getDefaultRoute = (permissions: string[]) => {
    const routes = [
      { path: '/pos', permission: 'sales:create' },
      { path: '/dashboard', permission: 'reports:read' },
      { path: '/products', permission: 'products:manage' },
      { path: '/users', permission: 'users:read' },
      { path: '/roles', permission: 'users:create' },
    ]
    
    for (const route of routes) {
      if (permissions.includes(route.permission)) {
        return route.path
      }
    }
    return '/pos'
  }

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login(data))
    if (login.fulfilled.match(result)) {
      const permissions = result.payload.permissions || []
      navigate(getDefaultRoute(permissions))
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
          Tu café, tu negocio, tu éxito
        </p>
      </div>

      <div className="flex-1 bg-kfe-surface flex items-center justify-center p-20">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-kfe-text">
              Iniciar Sesión
            </h2>
            <p className="text-kfe-text-secondary mt-2">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-kfe-text">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-kfe-text-muted" />
                <input
                  type="email"
                  className={`input-field pl-12 ${errors.email ? 'border-kfe-error' : ''}`}
                  placeholder="tu@email.com"
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

            {error && (
              <p className="text-kfe-error text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              <LogIn size={20} />
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
