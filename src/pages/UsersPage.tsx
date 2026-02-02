import { useEffect, useState } from 'react'
import { Search, UserPlus, Edit2, Trash2, Loader2, X, Check, XCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '@/infrastructure/api/client'
import type { User, Role, CreateUserDto, UpdateUserDto } from '@/core/domain'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    password: '',
    roleId: 1,
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
    setError(null)
    const defaultRoleId = roles.find(r => r.name === 'CASHIER')?.id || roles[0]?.id || 1
    setFormData({ name: '', email: '', password: '', roleId: defaultRoleId })
    setShowModal(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setError(null)
    setFormData({ name: user.name, email: user.email, password: '', roleId: user.role.id })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingUser) {
        const updateData: UpdateUserDto = {
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId,
        }
        await apiClient.patch(`/admin/users/${editingUser.id}`, updateData)
      } else {
        const createData: CreateUserDto = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roleId: formData.roleId,
        }
        await apiClient.post('/admin/users', createData)
      }
      setShowModal(false)
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      if (Array.isArray(message)) {
        setError(message.join(', '))
      } else {
        setError(message || 'Error al guardar usuario')
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-kfe-text">Nombre completo</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-kfe-text">Correo electrónico</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Contraseña</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-kfe-text">Rol</label>
                <select
                  className="input-field"
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
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
                  ) : editingUser ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
