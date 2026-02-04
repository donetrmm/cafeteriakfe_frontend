import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, Plus, Edit2, Trash2, Loader2, X, AlertCircle, Check } from 'lucide-react'
import { apiClient } from '@/infrastructure/api/client'
import type { Role, Permission } from '@/core/domain'
import { roleSchema, type RoleFormData } from '@/lib/validations'
import { useCan } from '@/infrastructure/store/hooks'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function RolesPage() {
  const canCreate = useCan('users:create')
  const canUpdate = useCan('users:update')
  const canDelete = useCan('users:delete')
  const { showSuccess, showError } = useToast()

  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Role | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      permissionIds: [],
    },
  })

  const selectedPermissions = watch('permissionIds')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        apiClient.get<Role[]>('/admin/roles'),
        apiClient.get<Permission[]>('/admin/permissions'),
      ])
      setRoles(rolesRes.data)
      setPermissions(permissionsRes.data)
    } catch (err) {
      console.error('Error al cargar datos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingRole(null)
    setServerError(null)
    reset({ name: '', permissionIds: [] })
    setShowModal(true)
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    setServerError(null)
    reset({
      name: role.name,
      permissionIds: role.permissions?.map(p => p.id) || [],
    })
    setShowModal(true)
  }

  const onSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      if (editingRole) {
        await apiClient.patch(`/admin/roles/${editingRole.id}`, data)
        showSuccess('Rol actualizado correctamente')
      } else {
        await apiClient.post('/admin/roles', data)
        showSuccess('Rol creado correctamente')
      }
      setShowModal(false)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Error al guardar rol')
      setServerError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await apiClient.delete(`/admin/roles/${deleteConfirm.id}`)
      showSuccess(`Rol "${deleteConfirm.name}" eliminado correctamente`)
      setDeleteConfirm(null)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Error al eliminar rol')
    }
  }

  const togglePermission = (permissionId: number) => {
    const current = selectedPermissions || []
    if (current.includes(permissionId)) {
      setValue('permissionIds', current.filter(id => id !== permissionId))
    } else {
      setValue('permissionIds', [...current, permissionId])
    }
  }

  const getPermissionLabel = (slug: string) => {
    const labels: Record<string, string> = {
      'users:create': 'Crear usuarios',
      'users:read': 'Ver usuarios',
      'users:update': 'Editar usuarios',
      'users:delete': 'Eliminar usuarios',
      'products:manage': 'Gestionar productos',
      'sales:create': 'Crear ventas',
      'sales:read': 'Ver ventas',
      'reports:read': 'Ver reportes',
    }
    return labels[slug] || slug
  }

  const getPermissionCategory = (slug: string) => {
    if (slug.startsWith('users:')) return 'Usuarios'
    if (slug.startsWith('products:')) return 'Productos'
    if (slug.startsWith('sales:')) return 'Ventas'
    if (slug.startsWith('reports:')) return 'Reportes'
    return 'Otros'
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = getPermissionCategory(perm.slug)
    if (!acc[category]) acc[category] = []
    acc[category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  const isProtectedRole = (roleName: string) => {
    return roleName === 'ADMIN' || roleName === 'CASHIER'
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={48} className="text-kfe-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-kfe-text">Gestión de Roles</h1>
          <p className="text-sm sm:text-base text-kfe-text-secondary">
            Administra roles y sus permisos
          </p>
        </div>

        {canCreate && (
          <button onClick={openCreateModal} className="btn-primary whitespace-nowrap">
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo Rol</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="card hover:border-kfe-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-kfe-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield size={18} className="sm:w-5 sm:h-5 text-kfe-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-kfe-text text-sm sm:text-base truncate">{role.name}</h3>
                  <p className="text-xs text-kfe-text-muted">
                    {role.permissions?.length || 0} permisos
                  </p>
                </div>
              </div>

              {!isProtectedRole(role.name) && (canUpdate || canDelete) && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {canUpdate && (
                    <button
                      onClick={() => openEditModal(role)}
                      className="w-8 h-8 rounded-lg bg-kfe-info/10 text-kfe-info flex items-center justify-center hover:bg-kfe-info/20 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeleteConfirm(role)}
                      className="w-8 h-8 rounded-lg bg-kfe-error/10 text-kfe-error flex items-center justify-center hover:bg-kfe-error/20 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {role.permissions?.slice(0, 4).map((perm) => (
                <span
                  key={perm.id}
                  className="px-2 py-0.5 bg-kfe-surface-warm rounded text-[10px] sm:text-xs text-kfe-text-secondary truncate max-w-full"
                >
                  {getPermissionLabel(perm.slug)}
                </span>
              ))}
              {(role.permissions?.length || 0) > 4 && (
                <span className="px-2 py-0.5 bg-kfe-primary/10 rounded text-[10px] sm:text-xs text-kfe-primary font-medium">
                  +{(role.permissions?.length || 0) - 4} más
                </span>
              )}
            </div>

            {isProtectedRole(role.name) && (
              <p className="mt-3 text-xs text-kfe-text-muted italic">
                Rol del sistema (no editable)
              </p>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-kfe-surface rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-kfe-border flex-shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-kfe-text">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-kfe-surface-warm flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X size={20} className="text-kfe-text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-auto">
              <div className="p-4 sm:p-6 space-y-4">
                {serverError && (
                  <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-xs sm:text-sm">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">
                    Nombre del rol
                  </label>
                  <input
                    type="text"
                    className={`input-field uppercase ${errors.name ? 'border-kfe-error' : ''}`}
                    placeholder="Ej: MANAGER"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-kfe-error text-xs">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-kfe-text">
                    Permisos
                  </label>
                  {errors.permissionIds && (
                    <p className="text-kfe-error text-xs">{errors.permissionIds.message}</p>
                  )}

                  <Controller
                    name="permissionIds"
                    control={control}
                    render={() => (
                      <div className="space-y-4">
                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="text-xs font-semibold text-kfe-text-muted uppercase tracking-wide">
                              {category}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {perms.map((perm) => {
                                const isSelected = selectedPermissions?.includes(perm.id)
                                return (
                                  <button
                                    key={perm.id}
                                    type="button"
                                    onClick={() => togglePermission(perm.id)}
                                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs sm:text-sm transition-colors ${
                                      isSelected
                                        ? 'border-kfe-primary bg-kfe-primary/5 text-kfe-primary'
                                        : 'border-kfe-border bg-kfe-surface text-kfe-text-secondary hover:border-kfe-primary/50'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                      isSelected
                                        ? 'bg-kfe-primary border-kfe-primary'
                                        : 'border-kfe-border'
                                    }`}>
                                      {isSelected && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="truncate">{getPermissionLabel(perm.slug)}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 pt-0 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : editingRole ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Rol'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Eliminar Rol"
        message={`¿Estás seguro de eliminar el rol "${deleteConfirm?.name}"? Esta acción no se puede deshacer y los usuarios con este rol perderán sus permisos.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
