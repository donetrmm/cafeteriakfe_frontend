import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, UserPlus, Edit2, Trash2, Loader2, X, Check, XCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '@/infrastructure/api/client'
import type { User, Role, UpdateUserDto } from '@/core/domain'
import { createUserSchema, updateUserSchema, type CreateUserFormData, type UpdateUserFormData } from '@/lib/validations'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

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
      setShowModal(false)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      if (Array.isArray(message)) {
        setServerError(message.join(', '))
      } else {
        setServerError(message || 'Error al crear usuario')
      }
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
      setShowModal(false)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      if (Array.isArray(message)) {
        setServerError(message.join(', '))
      } else {
        setServerError(message || 'Error al actualizar usuario')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await apiClient.delete(`/admin/users/${user.id}`)
      } else {
        await apiClient.patch(`/admin/users/${user.id}`, { isActive: true })
      }
      fetchData()
    } catch (err) {
      console.error('Error al cambiar estado:', err)
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
    <div className="h-full p-8 flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-kfe-text">Gestión de Usuarios</h1>
          <p className="text-kfe-text-secondary">
            Administra usuarios, roles y permisos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 h-11 bg-kfe-surface border border-kfe-border rounded-lg">
            <Search size={18} className="text-kfe-text-muted" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="bg-transparent outline-none text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button onClick={openCreateModal} className="btn-primary">
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </header>

      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className="grid grid-cols-[1fr_1fr_150px_120px_100px] gap-4 px-6 py-4 bg-kfe-surface-warm border-b border-kfe-border">
          <span className="text-sm font-semibold text-kfe-text-secondary">Nombre</span>
          <span className="text-sm font-semibold text-kfe-text-secondary">Email</span>
          <span className="text-sm font-semibold text-kfe-text-secondary">Rol</span>
          <span className="text-sm font-semibold text-kfe-text-secondary">Estado</span>
          <span className="text-sm font-semibold text-kfe-text-secondary text-center">Acciones</span>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-kfe-text-muted">
              No se encontraron usuarios
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_1fr_150px_120px_100px] gap-4 px-6 py-4 border-b border-kfe-border items-center hover:bg-kfe-surface-warm/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-kfe-primary flex items-center justify-center text-white font-semibold">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-kfe-text">{user.name}</span>
                </div>

                <span className="text-kfe-text-secondary">{user.email}</span>

                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit ${getRoleBadgeClass(user.role.name)}`}>
                  {getRoleLabel(user.role.name)}
                </span>

                <span className={`inline-flex items-center gap-1.5 text-sm ${user.isActive ? 'text-kfe-success' : 'text-kfe-error'}`}>
                  {user.isActive ? <Check size={14} /> : <XCircle size={14} />}
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="w-8 h-8 rounded-lg bg-kfe-info/10 text-kfe-info flex items-center justify-center hover:bg-kfe-info/20 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      user.isActive
                        ? 'bg-kfe-error/10 text-kfe-error hover:bg-kfe-error/20'
                        : 'bg-kfe-success/10 text-kfe-success hover:bg-kfe-success/20'
                    }`}
                    title={user.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {user.isActive ? <Trash2 size={16} /> : <Check size={16} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-kfe-surface rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-kfe-border">
              <h2 className="text-lg font-semibold text-kfe-text">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-kfe-surface-warm flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-kfe-text-muted" />
              </button>
            </div>

            {editingUser ? (
              <form onSubmit={updateForm.handleSubmit(onSubmitUpdate)} className="p-6 space-y-4">
                {serverError && (
                  <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-sm">
                    <AlertCircle size={18} />
                    {serverError}
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1"
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
              <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="p-6 space-y-4">
                {serverError && (
                  <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-sm">
                    <AlertCircle size={18} />
                    {serverError}
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1"
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
    </div>
  )
}
