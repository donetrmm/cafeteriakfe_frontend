import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './infrastructure/store/hooks'
import { checkSetupStatus } from './infrastructure/store/slices/authSlice'
import SetupPage from './pages/SetupPage'
import LoginPage from './pages/LoginPage'
import POSPage from './pages/POSPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import { Coffee } from 'lucide-react'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, needsSetup, isCheckingSetup } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkSetupStatus())
  }, [dispatch])

  if (isCheckingSetup) {
    return (
      <div className="min-h-screen bg-kfe-bg flex items-center justify-center">
        <div className="text-center">
          <Coffee size={64} className="text-kfe-primary mx-auto mb-4 animate-pulse" />
          <p className="text-kfe-text-secondary">Cargando...</p>
        </div>
      </div>
    )
  }

  if (needsSetup) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/pos" replace /> : <LoginPage />
      } />
      <Route path="/setup" element={<Navigate to="/login" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/pos" element={<POSPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredPermission="reports:read">
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute requiredPermission="users:read">
              <UsersPage />
            </ProtectedRoute>
          } />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? "/pos" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
