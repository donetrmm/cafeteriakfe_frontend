export interface SaleProduct {
  productId: number
  productName: string
  quantity: number
  priceAtSale: number
  subtotal: number
}

export interface PeriodSale {
  id: number
  total: number
  paymentMethod: string
  createdAt: string
  products: SaleProduct[]
}

export interface PeriodReport {
  sales: PeriodSale[]
  totalSales: number
  totalAmount: number
}

export interface TopProduct {
  productId: number
  productName: string
  totalQuantity: number
  totalRevenue: number
}

export interface TopProductsReport {
  products: TopProduct[]
}

export interface ChartDataPoint {
  date: string
  totalSales: number
  count: number
}

export interface ChartReport {
  data: ChartDataPoint[]
  startDate: string
  endDate: string
}
