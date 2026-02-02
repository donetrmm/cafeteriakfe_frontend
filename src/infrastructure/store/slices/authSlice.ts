import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'
import type { User, LoginDto, SetupAdminDto, AuthResponse } from '@/core/domain'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  needsSetup: boolean
  isCheckingSetup: boolean
}

const storedUser = localStorage.getItem('user')
const storedToken = localStorage.getItem('accessToken')

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  needsSetup: false,
  isCheckingSetup: true,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginDto, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Error al iniciar sesión')
    }
  }
)

export const setupAdmin = createAsyncThunk(
  'auth/setupAdmin',
  async (data: SetupAdminDto, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/setup-admin', data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Error al configurar administrador')
    }
  }
)

export const checkSetupStatus = createAsyncThunk(
  'auth/checkSetup',
  async () => {
    const response = await apiClient.get<{ isConfigured: boolean }>('/auth/setup-status')
    return { needsSetup: !response.data.isConfigured }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
    setNeedsSetup: (state, action: PayloadAction<boolean>) => {
      state.needsSetup = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.accessToken
        state.user = {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          isActive: true,
          role: action.payload.role,
          permissions: action.payload.permissions,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        state.isAuthenticated = true
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('user', JSON.stringify(state.user))
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(setupAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(setupAdmin.fulfilled, (state) => {
        state.isLoading = false
        state.needsSetup = false
      })
      .addCase(setupAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(checkSetupStatus.pending, (state) => {
        state.isCheckingSetup = true
      })
      .addCase(checkSetupStatus.fulfilled, (state, action) => {
        state.isCheckingSetup = false
        state.needsSetup = action.payload.needsSetup
      })
      .addCase(checkSetupStatus.rejected, (state) => {
        state.isCheckingSetup = false
        state.needsSetup = true
      })
  },
})

export const { logout, clearError, setNeedsSetup } = authSlice.actions
export default authSlice.reducer
