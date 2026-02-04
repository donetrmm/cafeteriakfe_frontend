import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, UserPlus, Edit2, Trash2, Loader2, X, Check, XCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '@/infrastructure/api/client'
import type { User, Role, UpdateUserDto } from '@/core/domain'
import { createUserSchema, updateUserSchema, type CreateUserFormData, type UpdateUserFormData } from '@/lib/validations'
import { useCan } from '@/infrastructure/store/hooks'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function UsersPage() {
  const canCreate = useCan('users:create')
  const canUpdate = useCan('users:update')
  const canDelete = useCan('users:delete')
  const { showSuccess, showError } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [toggleConfirm, setToggleConfirm] = useState<User | null>(null)

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  })

  const updateForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  })


  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiClient.get<User[]>('/admin/users'),
        apiClient.get<Role[]>('/admin/roles'),
      ])
      setUsers(usersRes.data)
      setRoles(rolesRes.data)
    } catch (err) {
      console.error('Error al cargar datos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateModal = () => {
    setEditingUser(null)
    setServerError(null)
    const defaultRoleId = roles.find(r => r.name === 'CASHIER')?.id || roles[0]?.id || 1
    createForm.reset({ name: '', email: '', password: '', roleId: defaultRoleId })
    setShowModal(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setServerError(null)
    updateForm.reset({ name: user.name, email: user.email, roleId: user.role.id })
    setShowModal(true)
  }

  const onSubmitCreate = async (data: CreateUserFormData) => {
    setIsSubmitting(true)
    setServerError(null)
    try {
      await apiClient.post('/admin/users', data)
      showSuccess('Usuario creado correctamente')
      setShowModal(false)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Error al crear usuario')
      setServerError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitUpdate = async (data: UpdateUserFormData) => {
    if (!editingUser) return
    setIsSubmitting(true)
    setServerError(null)
    try {
      const updateData: UpdateUserDto = {
        name: data.name,
        email: data.email,
        roleId: data.roleId,
      }
      await apiClient.patch(`/admin/users/${editingUser.id}`, updateData)
      showSuccess('Usuario actualizado correctamente')
      setShowModal(false)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Error al actualizar usuario')
      setServerError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async () => {
    if (!toggleConfirm) return

    try {
      if (toggleConfirm.isActive) {
        await apiClient.delete(`/admin/users/${toggleConfirm.id}`)
        showSuccess(`Usuario "${toggleConfirm.name}" desactivado correctamente`)
      } else {
        await apiClient.patch(`/admin/users/${toggleConfirm.id}`, { isActive: true })
        showSuccess(`Usuario "${toggleConfirm.name}" activado correctamente`)
      }
      setToggleConfirm(null)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Error al cambiar estado del usuario')
    }
  }

  const getRoleBadgeClass = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-kfe-primary/15 text-kfe-primary'
      case 'CASHIER':
        return 'bg-kfe-info/15 text-kfe-info'
      default:
        return 'bg-kfe-accent/15 text-kfe-accent'
    }
  }

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'Administrador'
      case 'CASHIER':
        return 'Cajero'
      default:
        return roleName
    }
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
          <h1 className="text-xl sm:text-2xl font-semibold text-kfe-text">Gestión de Usuarios</h1>
          <p className="text-sm sm:text-base text-kfe-text-secondary">
            Administra usuarios, roles y permisos
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 px-3 sm:px-4 h-11 bg-kfe-surface border border-kfe-border rounded-lg">
            <Search size={18} className="text-kfe-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="bg-transparent outline-none text-sm flex-1 min-w-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {canCreate && (
            <button onClick={openCreateModal} className="btn-primary whitespace-nowrap">
              <UserPlus size={20} />
              <span className="hidden sm:inline">Nuevo Usuario</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className={`hidden md:grid gap-4 px-4 lg:px-6 py-4 bg-kfe-surface-warm border-b border-kfe-border ${(canUpdate || canDelete) ? 'grid-cols-[1fr_1fr_150px_120px_100px]' : 'grid-cols-[1fr_1fr_150px_120px]'}`}>
          <span className="text-sm font-semibold text-kfe-text-secondary">Nombre</span>
          <span className="text-sm font-semibold text-kfe-text-secondary">Email</span>
          <span className="text-sm font-semibold text-kfe-text-secondary">Rol</span>
          <span className="text-sm font-semibold text-kfe-text-secondary">Estado</span>
          {(canUpdate || canDelete) && (
            <span className="text-sm font-semibold text-kfe-text-secondary text-center">Acciones</span>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-kfe-text-muted text-sm sm:text-base px-4">
              No se encontraron usuarios
            </div>
          ) : (
            <>
              <div className="md:hidden space-y-3 p-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-kfe-surface-warm rounded-xl border border-kfe-border"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-kfe-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-kfe-text truncate">{user.name}</p>
                          <p className="text-xs text-kfe-text-secondary truncate">{user.email}</p>
                        </div>
                      </div>
                      {(canUpdate || canDelete) && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {canUpdate && (
                            <button
                              onClick={() => openEditModal(user)}
                              className="w-8 h-8 rounded-lg bg-kfe-info/10 text-kfe-info flex items-center justify-center hover:bg-kfe-info/20 transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setToggleConfirm(user)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                user.isActive
                                  ? 'bg-kfe-error/10 text-kfe-error hover:bg-kfe-error/20'
                                  : 'bg-kfe-success/10 text-kfe-success hover:bg-kfe-success/20'
                              }`}
                              title={user.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {user.isActive ? <Trash2 size={16} /> : <Check size={16} />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getRoleBadgeClass(user.role.name)}`}>
                        {getRoleLabel(user.role.name)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm ${user.isActive ? 'text-kfe-success' : 'text-kfe-error'}`}>
                        {user.isActive ? <Check size={12} /> : <XCircle size={12} />}
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`grid gap-4 px-4 lg:px-6 py-4 border-b border-kfe-border items-center hover:bg-kfe-surface-warm/50 transition-colors ${(canUpdate || canDelete) ? 'grid-cols-[1fr_1fr_150px_120px_100px]' : 'grid-cols-[1fr_1fr_150px_120px]'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-kfe-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-kfe-text truncate">{user.name}</span>
                    </div>

                    <span className="text-kfe-text-secondary truncate">{user.email}</span>

                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit ${getRoleBadgeClass(user.role.name)}`}>
                      {getRoleLabel(user.role.name)}
                    </span>

                    <span className={`inline-flex items-center gap-1.5 text-sm ${user.isActive ? 'text-kfe-success' : 'text-kfe-error'}`}>
                      {user.isActive ? <Check size={14} /> : <XCircle size={14} />}
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>

                    {(canUpdate || canDelete) && (
                      <div className="flex items-center justify-center gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => openEditModal(user)}
                            className="w-8 h-8 rounded-lg bg-kfe-info/10 text-kfe-info flex items-center justify-center hover:bg-kfe-info/20 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setToggleConfirm(user)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                              user.isActive
                                ? 'bg-kfe-error/10 text-kfe-error hover:bg-kfe-error/20'
                                : 'bg-kfe-success/10 text-kfe-success hover:bg-kfe-success/20'
                            }`}
                            title={user.isActive ? 'Desactivar' : 'Activar'}
                          >
                            {user.isActive ? <Trash2 size={16} /> : <Check size={16} />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-kfe-surface rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-kfe-border flex-shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-kfe-text">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-kfe-surface-warm flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X size={20} className="text-kfe-text-muted" />
              </button>
            </div>

            {editingUser ? (
              <form onSubmit={updateForm.handleSubmit(onSubmitUpdate)} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {serverError && (
                  <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-xs sm:text-sm">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Nombre completo</label>
                  <input
                    type="text"
                    className={`input-field ${updateForm.formState.errors.name ? 'border-kfe-error' : ''}`}
                    {...updateForm.register('name')}
                  />
                  {updateForm.formState.errors.name && (
                    <p className="text-kfe-error text-xs">{updateForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Correo electrónico</label>
                  <input
                    type="email"
                    className={`input-field ${updateForm.formState.errors.email ? 'border-kfe-error' : ''}`}
                    {...updateForm.register('email')}
                  />
                  {updateForm.formState.errors.email && (
                    <p className="text-kfe-error text-xs">{updateForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Rol</label>
                  <select
                    className="input-field"
                    {...updateForm.register('roleId', { valueAsNumber: true })}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {getRoleLabel(role.name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 flex-shrink-0">
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
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {serverError && (
                  <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-xs sm:text-sm">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Nombre completo</label>
                  <input
                    type="text"
                    className={`input-field ${createForm.formState.errors.name ? 'border-kfe-error' : ''}`}
                    {...createForm.register('name')}
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-kfe-error text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Correo electrónico</label>
                  <input
                    type="email"
                    className={`input-field ${createForm.formState.errors.email ? 'border-kfe-error' : ''}`}
                    {...createForm.register('email')}
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-kfe-error text-xs">{createForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Contraseña</label>
                  <input
                    type="password"
                    className={`input-field ${createForm.formState.errors.password ? 'border-kfe-error' : ''}`}
                    placeholder="Mínimo 8 caracteres"
                    {...createForm.register('password')}
                  />
                  {createForm.formState.errors.password && (
                    <p className="text-kfe-error text-xs">{createForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Rol</label>
                  <select
                    className="input-field"
                    {...createForm.register('roleId', { valueAsNumber: true })}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {getRoleLabel(role.name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 flex-shrink-0">
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
                    ) : (
                      'Crear Usuario'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={toggleConfirm !== null}
        title={toggleConfirm?.isActive ? 'Desactivar Usuario' : 'Activar Usuario'}
        message={toggleConfirm?.isActive 
          ? `¿Estás seguro de desactivar al usuario "${toggleConfirm.name}"? No podrá iniciar sesión hasta que sea reactivado.`
          : `¿Estás seguro de activar al usuario "${toggleConfirm?.name}"? Podrá iniciar sesión nuevamente.`
        }
        confirmText={toggleConfirm?.isActive ? 'Desactivar' : 'Activar'}
        cancelText="Cancelar"
        variant={toggleConfirm?.isActive ? 'danger' : 'info'}
        onConfirm={handleToggleActive}
        onCancel={() => setToggleConfirm(null)}
      />
    </div>
  )
}
