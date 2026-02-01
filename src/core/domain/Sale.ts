export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'

export interface SaleItem {
  id: number
  productId: number
  productName: string
  quantity: number
  priceAtSale: number
}

export interface Sale {
  id: number
  total: number
  paymentMethod: PaymentMethod
  userId: number
  items: SaleItem[]
  createdAt: string
}

export interface CreateSaleItemDto {
  productId: number
  quantity: number
}

export interface CreateSaleDto {
  items: CreateSaleItemDto[]
  paymentMethod: PaymentMethod
}

export interface CartItem {
  product: {
    id: number
    name: string
    price: number
    stock: number
  }
  quantity: number
}
