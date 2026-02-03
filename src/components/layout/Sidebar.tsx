import { NavLink } from 'react-router-dom'
import { Coffee, ShoppingCart, LayoutDashboard, Users, LogOut, Package, Shield } from 'lucide-react'
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

  const visibleNavItems = navItems.filter(item => hasPermission(item.permission))

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-20 bg-kfe-primary-dark flex-col items-center py-6 gap-4">
        <div className="text-white mb-2">
          <Coffee size={40} />
        </div>
        
        <div className="w-10 h-px bg-white/20" />
        
        <nav className="flex-1 flex flex-col gap-2">
          {visibleNavItems.map((item) => (
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
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-white/10 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={22} />
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-kfe-primary-dark border-t border-white/10 z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-20 px-1 sm:px-2 pt-2 pb-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center px-1.5 sm:px-3 py-2 transition-all duration-300 min-w-[50px] sm:min-w-[60px]',
                  isActive
                    ? 'text-white -translate-y-3'
                    : 'text-white/60'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300',
                    isActive 
                      ? 'bg-kfe-accent scale-110' 
                      : 'bg-transparent scale-100'
                  )}>
                    <item.icon size={18} />
                  </div>
                  <span className={cn(
                    'text-[9px] sm:text-[10px] font-medium transition-all duration-300 absolute -bottom-3 whitespace-nowrap',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="relative flex flex-col items-center justify-center px-1.5 sm:px-3 py-2 text-white/60 hover:text-red-400 transition-all duration-300 min-w-[50px] sm:min-w-[60px]"
          >
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full">
              <LogOut size={18} />
            </div>
          </button>
        </div>
      </nav>
    </>
  )
}
