import { NavLink } from 'react-router-dom'
import { Coffee, ShoppingCart, LayoutDashboard, Users, Settings, LogOut, Package, Shield } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks'
import { logout } from '@/infrastructure/store/slices/authSlice'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/pos', icon: ShoppingCart, label: 'POS', permission: 'sales:create' },
  { to: '/products', icon: Package, label: 'Productos', permission: 'products:manage' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'reports:read' },
  { to: '/users', icon: Users, label: 'Usuarios', permission: 'users:read' },
  { to: '/roles', icon: Shield, label: 'Roles', permission: 'users:create' },
]

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    window.location.href = '/login'
  }

  const hasPermission = (permission: string) => {
    if (!user) return false
    return user.permissions?.includes(permission) ?? false
  }

  return (
    <aside className="w-20 bg-kfe-primary-dark flex flex-col items-center py-6 gap-4">
      <div className="text-white mb-2">
        <Coffee size={40} />
      </div>
      
      <div className="w-10 h-px bg-white/20" />
      
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          if (!hasPermission(item.permission)) return null
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                  isActive
                    ? 'bg-kfe-accent text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )
              }
              title={item.label}
            >
              <item.icon size={22} />
            </NavLink>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2">
        <button
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Configuración"
        >
          <Settings size={22} />
        </button>
        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  )
}
