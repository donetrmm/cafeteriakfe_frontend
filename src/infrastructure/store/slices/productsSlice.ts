import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'
import type { Product } from '@/core/domain'

interface ProductsState {
  items: Product[]
  isLoading: boolean
  error: string | null
}

const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Product[]>('/products')
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Error al cargar productos')
    }
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export default productsSlice.reducer
