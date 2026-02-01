import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './infrastructure/store/hooks'
import SetupPage from './pages/SetupPage'
import LoginPage from './pages/LoginPage'
import POSPage from './pages/POSPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const needsSetup = useAppSelector((state) => state.auth.needsSetup)

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
      <Route path="/setup" element={<SetupPage />} />
      
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
