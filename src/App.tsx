import { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './infrastructure/store/hooks'
import { checkSetupStatus } from './infrastructure/store/slices/authSlice'
import ProtectedRoute from './components/ProtectedRoute'
import DefaultRoute from './components/DefaultRoute'
import AppLayout from './components/layout/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'
import PageLoader from './components/PageLoader'
import { Coffee } from 'lucide-react'

const SetupPage = lazy(() => import('./pages/SetupPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const POSPage = lazy(() => import('./pages/POSPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const RolesPage = lazy(() => import('./pages/RolesPage'))

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
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? (
            <DefaultRoute />
          ) : (
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          )
        } />
        <Route path="/setup" element={<Navigate to="/login" replace />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/pos" element={
              <ProtectedRoute requiredPermission="sales:create">
                <Suspense fallback={<PageLoader />}>
                  <POSPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute requiredPermission="reports:read">
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredPermission="users:read">
                <Suspense fallback={<PageLoader />}>
                  <UsersPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute requiredPermission="products:manage">
                <Suspense fallback={<PageLoader />}>
                  <ProductsPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/roles" element={
              <ProtectedRoute requiredPermission="users:create">
                <Suspense fallback={<PageLoader />}>
                  <RolesPage />
                </Suspense>
              </ProtectedRoute>
            } />
          </Route>
        </Route>

        <Route path="/" element={isAuthenticated ? <DefaultRoute /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
