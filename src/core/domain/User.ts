export interface Role {
  id: number
  name: string
  permissions?: Permission[]
  createdAt?: string
  updatedAt?: string
}

export interface Permission {
  id: number
  slug: string
}

export interface User {
  id: number
  name: string
  email: string
  isActive: boolean
  role: Role
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  roleId: number
}

export interface UpdateUserDto {
  name?: string
  email?: string
  roleId?: number
  isActive?: boolean
}

export interface SetupAdminDto {
  name: string
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  id: number
  name: string
  email: string
  role: Role
}
