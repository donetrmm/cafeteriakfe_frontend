export interface PeriodReport {
  sales: {
    id: number
    total: number
    paymentMethod: string
    createdAt: string
  }[]
  totalSales: number
  totalRevenue: number
  startDate: string
  endDate: string
}

export interface TopProduct {
  id: number
  name: string
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
