import { useEffect, useState, useCallback } from 'react'
import { Calendar, TrendingUp, ShoppingBag, Tag, Trophy, Loader2, RefreshCw, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { apiClient } from '@/infrastructure/api/client'
import type { PeriodReport, TopProductsReport, PeriodSale } from '@/core/domain'
import { formatCurrency } from '@/lib/utils'

const CHART_COLORS = ['#8B5A2B', '#C67A52', '#E9A84D', '#5A9E6F', '#5B8FB9', '#9A9A9A']

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [periodReport, setPeriodReport] = useState<PeriodReport | null>(null)
  const [topProducts, setTopProducts] = useState<TopProductsReport | null>(null)
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSale, setSelectedSale] = useState<PeriodSale | null>(null)
  const itemsPerPage = 5

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const [periodRes, topRes] = await Promise.all([
        apiClient.get<PeriodReport>(`/reports/period?startDate=${startDate}&endDate=${endDate}`),
        apiClient.get<TopProductsReport>('/reports/top-3'),
      ])
      setPeriodReport(periodRes.data)
      setTopProducts(topRes.data)
    } catch (error) {
      console.error('Error al cargar reportes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchReports()
  }, [])

  const handleApplyFilter = () => {
    setCurrentPage(1)
    fetchReports()
  }

  const sales = periodReport?.sales || []
  const totalPages = Math.ceil(sales.length / itemsPerPage)
  const paginatedSales = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={48} className="text-kfe-primary animate-spin" />
      </div>
    )
  }

  const productSalesData = topProducts?.products?.map((product) => ({
    name: product.productName.length > 15 ? product.productName.substring(0, 15) + '...' : product.productName,
    fullName: product.productName,
    cantidad: product.totalQuantity,
    ingresos: product.totalRevenue,
  })) || []

  const averageTicket = periodReport && periodReport.totalSales > 0
    ? periodReport.totalAmount / periodReport.totalSales
    : 0

  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 overflow-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-kfe-text">Dashboard</h1>
          <p className="text-sm sm:text-base text-kfe-text-secondary">
            Resumen de ventas y métricas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 sm:px-4 h-11 bg-kfe-surface border border-kfe-border rounded-lg">
            <Calendar size={18} className="text-kfe-text-muted flex-shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent outline-none text-xs sm:text-sm flex-1 min-w-0"
            />
            <span className="text-kfe-text-muted flex-shrink-0">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent outline-none text-xs sm:text-sm flex-1 min-w-0"
            />
          </div>
          <button onClick={handleApplyFilter} className="btn-primary h-11">
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Aplicar</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6">
        <MetricCard
          label="Ventas del Período"
          value={formatCurrency(periodReport?.totalAmount || 0)}
          icon={TrendingUp}
          color="success"
        />
        <MetricCard
          label="Transacciones"
          value={String(periodReport?.totalSales || 0)}
          icon={ShoppingBag}
          color="info"
        />
        <MetricCard
          label="Ticket Promedio"
          value={formatCurrency(averageTicket)}
          icon={Tag}
          color="warning"
        />
        <MetricCard
          label="Productos Top"
          value={String(topProducts?.products?.length || 0)}
          icon={Trophy}
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="xl:col-span-2 card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-kfe-text">Ventas por Producto</h2>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-kfe-primary flex-shrink-0" />
                <span className="text-kfe-text-secondary">Cantidad vendida</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72">
            {productSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productSalesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DC" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#6B6B6B', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E2DC' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120}
                    tick={{ fill: '#6B6B6B', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E2DC' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E2DC',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'cantidad') {
                        return [`${value} unidades`, 'Cantidad']
                      }
                      return [value, name]
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullName
                      }
                      return label
                    }}
                  />
                  <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                    {productSalesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-kfe-text-muted">
                No hay datos de ventas
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-kfe-text">Top 3 Productos</h2>
            <Trophy size={20} className="text-kfe-warning flex-shrink-0" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {!topProducts?.products?.length ? (
              <p className="text-kfe-text-muted text-center py-8 text-sm">
                No hay ventas registradas
              </p>
            ) : (
              topProducts.products.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-kfe-surface-warm rounded-xl"
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-base flex-shrink-0 ${
                    index === 0 ? 'bg-kfe-warning' :
                    index === 1 ? 'bg-kfe-text-muted' :
                    'bg-kfe-accent'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-kfe-text truncate text-sm sm:text-base">
                      {product.productName}
                    </h4>
                    <p className="text-xs sm:text-sm text-kfe-text-secondary">
                      {product.totalQuantity} vendidos
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-kfe-primary text-sm sm:text-base">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-kfe-text">
            Productos Vendidos en el Período
          </h2>
          <span className="text-xs sm:text-sm text-kfe-text-secondary">
            {startDate.split('-').reverse().join('/')} - {endDate.split('-').reverse().join('/')}
          </span>
        </div>

        {!sales.length ? (
          <div className="text-center py-12 text-kfe-text-muted text-sm">
            No hay ventas en el período seleccionado
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="w-full">
                  <thead>
                  <tr className="border-b border-kfe-border">
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-kfe-text-secondary">ID</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-kfe-text-secondary hidden sm:table-cell">Fecha</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-kfe-text-secondary">Pago</th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-kfe-text-secondary hidden md:table-cell">Productos</th>
                    <th className="text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-kfe-text-secondary">Total</th>
                    <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-kfe-text-secondary">Detalles</th>
                  </tr>
                  </thead>
                  <tbody>
                    {paginatedSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-kfe-border hover:bg-kfe-surface-warm/50 transition-colors">
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-kfe-text">#{sale.id}</td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-kfe-text-secondary hidden sm:table-cell">
                          {new Date(sale.createdAt).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                            sale.paymentMethod === 'CASH' ? 'bg-kfe-success/15 text-kfe-success' :
                            sale.paymentMethod === 'CARD' ? 'bg-kfe-info/15 text-kfe-info' :
                            'bg-kfe-warning/15 text-kfe-warning'
                          }`}>
                            {sale.paymentMethod === 'CASH' ? 'Efectivo' :
                             sale.paymentMethod === 'CARD' ? 'Tarjeta' : 'Transf.'}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-kfe-text-secondary hidden md:table-cell">
                          {sale.products?.length || 0} producto(s)
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-right text-xs sm:text-sm font-semibold text-kfe-primary">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-center">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-kfe-info/10 text-kfe-info flex items-center justify-center hover:bg-kfe-info/20 transition-colors mx-auto"
                            title="Ver detalles"
                          >
                            <Eye size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-kfe-border mt-4">
                <span className="text-xs sm:text-sm text-kfe-text-secondary text-center sm:text-left">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sales.length)} de {sales.length} ventas
                </span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-kfe-border flex items-center justify-center hover:bg-kfe-surface-warm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-kfe-primary text-white'
                            : 'border border-kfe-border hover:bg-kfe-surface-warm'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-kfe-border flex items-center justify-center hover:bg-kfe-surface-warm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-kfe-surface rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-kfe-border flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-kfe-text">
                  Detalle de Venta #{selectedSale.id}
                </h2>
                <p className="text-xs sm:text-sm text-kfe-text-secondary">
                  {new Date(selectedSale.createdAt).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="w-8 h-8 rounded-lg hover:bg-kfe-surface-warm flex items-center justify-center transition-colors flex-shrink-0 ml-2"
              >
                <X size={20} className="text-kfe-text-muted" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  selectedSale.paymentMethod === 'CASH' ? 'bg-kfe-success/15 text-kfe-success' :
                  selectedSale.paymentMethod === 'CARD' ? 'bg-kfe-info/15 text-kfe-info' :
                  'bg-kfe-warning/15 text-kfe-warning'
                }`}>
                  {selectedSale.paymentMethod === 'CASH' ? 'Efectivo' :
                   selectedSale.paymentMethod === 'CARD' ? 'Tarjeta' : 'Transferencia'}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-kfe-text-secondary">Productos</h3>
                {selectedSale.products?.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-kfe-surface-warm rounded-xl gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-kfe-text text-sm sm:text-base truncate">{product.productName}</p>
                      <p className="text-xs sm:text-sm text-kfe-text-secondary">
                        {formatCurrency(product.priceAtSale)} x {product.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-kfe-primary text-sm sm:text-base flex-shrink-0">
                      {formatCurrency(product.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-kfe-border">
                <span className="text-base sm:text-lg font-medium text-kfe-text">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-kfe-primary">
                  {formatCurrency(selectedSale.total)}
                </span>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex-shrink-0">
              <button
                onClick={() => setSelectedSale(null)}
                className="btn-secondary w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: typeof TrendingUp
  color: 'success' | 'info' | 'warning' | 'accent'
}) {
  const colorClasses = {
    success: 'bg-kfe-success/15 text-kfe-success',
    info: 'bg-kfe-info/15 text-kfe-info',
    warning: 'bg-kfe-warning/15 text-kfe-warning',
    accent: 'bg-kfe-accent/15 text-kfe-accent',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm text-kfe-text-secondary">{label}</span>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
          <Icon size={18} className="sm:w-5 sm:h-5" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-kfe-text break-words">{value}</p>
    </div>
  )
}
