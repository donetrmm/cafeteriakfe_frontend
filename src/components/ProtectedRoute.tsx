import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/infrastructure/store/hooks'

interface ProtectedRouteProps {
  children?: React.ReactNode
  requiredPermission?: string
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && user) {
    const hasPermission = user.role.permissions?.some(
      (p) => p.slug === requiredPermission
    )
    if (!hasPermission && user.role.name !== 'ADMIN') {
      return <Navigate to="/pos" replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}
