import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/infrastructure/store/hooks'

const ROUTES_BY_PERMISSION = [
  { path: '/pos', permission: 'sales:create' },
  { path: '/dashboard', permission: 'reports:read' },
  { path: '/products', permission: 'products:manage' },
  { path: '/users', permission: 'users:read' },
  { path: '/roles', permission: 'users:create' },
]

export default function DefaultRoute() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const permissions = user?.permissions || []
  
  for (const route of ROUTES_BY_PERMISSION) {
    if (permissions.includes(route.permission)) {
      return <Navigate to={route.path} replace />
    }
  }

  return <Navigate to="/login" replace />
}
