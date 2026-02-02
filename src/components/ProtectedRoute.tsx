import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/infrastructure/store/hooks'

interface ProtectedRouteProps {
  children?: React.ReactNode
  requiredPermission?: string
}

const ROUTES_BY_PERMISSION = [
  { path: '/pos', permission: 'sales:create' },
  { path: '/dashboard', permission: 'reports:read' },
  { path: '/products', permission: 'products:manage' },
  { path: '/users', permission: 'users:read' },
  { path: '/roles', permission: 'users:create' },
]

function getFirstAvailableRoute(permissions: string[] = []): string {
  for (const route of ROUTES_BY_PERMISSION) {
    if (permissions.includes(route.permission)) {
      return route.path
    }
  }
  return '/login'
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && user) {
    const hasPermission = user.permissions?.includes(requiredPermission)
    if (!hasPermission) {
      return <Navigate to={getFirstAvailableRoute(user.permissions)} replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}
