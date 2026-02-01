import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, PaymentMethod } from '@/core/domain'

interface CartState {
  items: CartItem[]
  paymentMethod: PaymentMethod
}

const initialState: CartState = {
  items: [],
  paymentMethod: 'CASH',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem['product']>) => {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      )
      if (existingItem) {
        if (existingItem.quantity < action.payload.stock) {
          existingItem.quantity += 1
        }
      } else {
        state.items.push({ product: action.payload, quantity: 1 })
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      )
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.product.id === action.payload.productId
      )
      if (item && action.payload.quantity > 0 && action.payload.quantity <= item.product.stock) {
        item.quantity = action.payload.quantity
      }
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload
    },
    clearCart: (state) => {
      state.items = []
      state.paymentMethod = 'CASH'
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setPaymentMethod,
  clearCart,
} = cartSlice.actions

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )

export const selectCartItemsCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0)

export default cartSlice.reducer
