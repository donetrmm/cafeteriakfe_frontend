import { useEffect, useState } from 'react'
import { Search, User, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, ArrowRightLeft, Coffee, Loader2, AlertCircle, Receipt, X, Eye } from 'lucide-react'
import { useAppDispatch, useAppSelector, useCan } from '@/infrastructure/store/hooks'
import { fetchProducts } from '@/infrastructure/store/slices/productsSlice'
import { addToCart, removeFromCart, updateQuantity, setPaymentMethod, clearCart, selectCartTotal, selectCartItemsCount } from '@/infrastructure/store/slices/cartSlice'
import { apiClient } from '@/infrastructure/api/client'
import type { PaymentMethod, CreateSaleDto, PeriodSale, SaleProduct } from '@/core/domain'
import { formatCurrency } from '@/lib/utils'

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'CASH', label: 'Efectivo', icon: Banknote },
  { value: 'CARD', label: 'Tarjeta', icon: CreditCard },
  { value: 'TRANSFER', label: 'Transferencia', icon: ArrowRightLeft },
]

export default function POSPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { items: products, isLoading } = useAppSelector((state) => state.products)
  const { items: cartItems, paymentMethod } = useAppSelector((state) => state.cart)
  const cartTotal = useAppSelector(selectCartTotal)
  const cartItemsCount = useAppSelector(selectCartItemsCount)
  const canReadSales = useCan('sales:read')

  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [saleSuccess, setSaleSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Panel de ventas del día
  const [showSalesPanel, setShowSalesPanel] = useState(false)
  const [todaySales, setTodaySales] = useState<PeriodSale[]>([])
  const [isLoadingSales, setIsLoadingSales] = useState(false)
  const [selectedSale, setSelectedSale] = useState<PeriodSale | null>(null)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const fetchTodaySales = async () => {
    setIsLoadingSales(true)
    try {
      const now = new Date()
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const response = await apiClient.get(`/reports/period?startDate=${today}&endDate=${today}`)
      setTodaySales(response.data.sales || [])
    } catch (err) {
      console.error('Error fetching today sales:', err)
    } finally {
      setIsLoadingSales(false)
    }
  }

  const handleOpenSalesPanel = () => {
    setShowSalesPanel(true)
    fetchTodaySales()
  }

  const todayTotal = todaySales.reduce((acc, sale) => acc + sale.total, 0)

  useEffect(() => {
    setError(null)
  }, [paymentMethod])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddToCart = (product: typeof products[0]) => {
    if (product.stock > 0) {
      dispatch(addToCart(product))
    }
  }

  const handleProcessSale = async () => {
    if (cartItems.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const saleData: CreateSaleDto = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
      }

      await apiClient.post('/sales', saleData)
      dispatch(clearCart())
      dispatch(fetchProducts())
      if (showSalesPanel) {
        fetchTodaySales()
      }
      setSaleSuccess(true)
      setTimeout(() => setSaleSuccess(false), 3000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Error al procesar la venta')
    } finally {
      setIsProcessing(false)
    }
  }

  const [showCart, setShowCart] = useState(false)

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6">
      <header className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-kfe-text">Punto de Venta</h1>
            <p className="text-kfe-text-secondary text-sm hidden sm:block">
              Selecciona productos para agregar al carrito
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canReadSales && (
              <button
                onClick={handleOpenSalesPanel}
                className="sm:hidden w-11 h-11 bg-kfe-accent text-white rounded-lg flex items-center justify-center"
              >
                <Receipt size={20} />
              </button>
            )}
            <button 
              onClick={() => setShowCart(true)}
              className="sm:hidden relative w-11 h-11 bg-kfe-primary text-white rounded-lg flex items-center justify-center"
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-kfe-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-3 px-4 h-11 bg-kfe-surface-warm rounded-full">
              <User size={18} className="text-kfe-primary" />
              <span className="text-sm font-medium text-kfe-text truncate max-w-[120px]">
                {user?.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 h-14 sm:h-11 bg-kfe-surface border border-kfe-border rounded-lg flex-1">
            <Search size={20} className="text-kfe-text-muted sm:w-[18px] sm:h-[18px]" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="bg-transparent outline-none text-base sm:text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {canReadSales && (
            <button
              onClick={handleOpenSalesPanel}
              className="hidden sm:flex items-center gap-2 px-4 h-11 bg-kfe-accent text-white rounded-lg hover:bg-kfe-accent/90 transition-colors"
            >
              <Receipt size={18} />
              <span className="text-sm font-medium">Ventas del Día</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex gap-4 lg:gap-6 min-h-0">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={32} className="text-kfe-primary animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-kfe-text-muted">
              <Coffee size={48} className="mb-4 opacity-50" />
              <p>{searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => {
                const cartItem = cartItems.find((item) => item.product.id === product.id)
                const inCart = cartItem ? cartItem.quantity : 0
                const availableStock = product.stock - inCart

                return (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    disabled={availableStock <= 0}
                    className="card text-left cursor-pointer hover:border-kfe-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-3 sm:p-4 lg:p-5"
                  >
                    <div className="h-20 sm:h-28 bg-gradient-to-br from-kfe-surface-warm to-kfe-border rounded-lg mb-2 sm:mb-4 flex items-center justify-center">
                      <Coffee size={28} className="sm:w-10 sm:h-10 text-kfe-primary opacity-60" />
                    </div>
                    <h3 className="font-semibold text-kfe-text truncate text-sm sm:text-base">{product.name}</h3>
                    <div className="flex items-center justify-between gap-2 mt-1 sm:mt-2">
                      <span className="text-xs sm:text-base lg:text-lg font-bold text-kfe-primary min-w-0 flex-1">
                        {formatCurrency(product.price)}
                      </span>
                      <span className={`text-[9px] sm:text-xs flex-shrink-0 whitespace-nowrap ${availableStock <= 0 ? 'text-kfe-error' : 'text-kfe-text-muted'}`}>
                        Stock: {availableStock}
                      </span>
                    </div>
                    {inCart > 0 && (
                      <div className="mt-1 sm:mt-2 px-2 py-1 bg-kfe-accent/10 rounded text-center">
                        <span className="text-xs font-medium text-kfe-accent">
                          {inCart} en carrito
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Carrito Desktop */}
        <aside className="hidden lg:flex w-80 xl:w-96 card flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-kfe-border">
            <div className="flex items-center gap-3">
              <ShoppingCart size={22} className="text-kfe-primary" />
              <h2 className="text-lg font-semibold text-kfe-text">Carrito</h2>
            </div>
            <span className="w-7 h-7 rounded-full bg-kfe-accent text-white text-sm font-semibold flex items-center justify-center">
              {cartItemsCount}
            </span>
          </div>

          <div className="flex-1 py-4 overflow-auto space-y-3">
            {cartItems.length === 0 ? (
              <p className="text-kfe-text-muted text-center py-8">
                El carrito está vacío
              </p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 bg-kfe-surface-warm rounded-xl"
                >
                  <div className="w-12 h-12 bg-kfe-border rounded-lg flex items-center justify-center flex-shrink-0">
                    <Coffee size={20} className="text-kfe-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-kfe-text truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-kfe-text-secondary">
                      {formatCurrency(item.product.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.product.id,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-lg bg-kfe-surface border border-kfe-border flex items-center justify-center hover:bg-kfe-border transition-colors disabled:opacity-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.product.id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="w-7 h-7 rounded-lg bg-kfe-surface border border-kfe-border flex items-center justify-center hover:bg-kfe-border transition-colors disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => dispatch(removeFromCart(item.product.id))}
                      className="w-7 h-7 rounded-lg bg-kfe-error/10 text-kfe-error flex items-center justify-center hover:bg-kfe-error/20 transition-colors ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="pt-4 border-t border-kfe-border space-y-4">
              <div>
                <p className="text-xs text-kfe-text-secondary mb-2">Método de pago</p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => dispatch(setPaymentMethod(method.value))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                        paymentMethod === method.value
                          ? 'border-kfe-primary bg-kfe-primary/5 text-kfe-primary'
                          : 'border-kfe-border bg-kfe-surface text-kfe-text-secondary hover:border-kfe-primary/50'
                      }`}
                    >
                      <method.icon size={20} />
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-kfe-text-secondary">Total</span>
                <span className="text-2xl font-bold text-kfe-primary">
                  {formatCurrency(cartTotal)}
                </span>
              </div>

              <button
                onClick={handleProcessSale}
                disabled={isProcessing || cartItems.length === 0}
                className="btn-success w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Procesar Venta
                  </>
                )}
              </button>
            </div>
          )}

          {saleSuccess && (
            <div className="mt-4 p-3 bg-kfe-success/10 border border-kfe-success/30 rounded-xl text-center">
              <p className="text-kfe-success font-medium">¡Venta procesada exitosamente!</p>
            </div>
          )}
        </aside>
      </div>

      {/* Carrito Móvil (Modal) */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative mt-auto bg-kfe-surface rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-in-bottom">
            <div className="flex items-center justify-between p-4 border-b border-kfe-border">
              <div className="flex items-center gap-3">
                <ShoppingCart size={22} className="text-kfe-primary" />
                <h2 className="text-lg font-semibold text-kfe-text">Carrito</h2>
                <span className="w-7 h-7 rounded-full bg-kfe-accent text-white text-sm font-semibold flex items-center justify-center">
                  {cartItemsCount}
                </span>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="w-10 h-10 rounded-lg bg-kfe-bg flex items-center justify-center"
              >
                <X size={20} className="text-kfe-text-secondary" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto space-y-3 min-h-0">
              {cartItems.length === 0 ? (
                <p className="text-kfe-text-muted text-center py-8">
                  El carrito está vacío
                </p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-kfe-surface-warm rounded-xl"
                  >
                    <div className="w-12 h-12 bg-kfe-border rounded-lg flex items-center justify-center flex-shrink-0">
                      <Coffee size={20} className="text-kfe-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-kfe-text truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-kfe-text-secondary">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.product.id,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-kfe-surface border border-kfe-border flex items-center justify-center disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              productId: item.product.id,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 rounded-lg bg-kfe-surface border border-kfe-border flex items-center justify-center disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => dispatch(removeFromCart(item.product.id))}
                        className="w-8 h-8 rounded-lg bg-kfe-error/10 text-kfe-error flex items-center justify-center ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-kfe-border space-y-4">
                <div>
                  <p className="text-xs text-kfe-text-secondary mb-2">Método de pago</p>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.value}
                        onClick={() => dispatch(setPaymentMethod(method.value))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                          paymentMethod === method.value
                            ? 'border-kfe-primary bg-kfe-primary/5 text-kfe-primary'
                            : 'border-kfe-border bg-kfe-surface text-kfe-text-secondary'
                        }`}
                      >
                        <method.icon size={20} />
                        <span className="text-xs font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-kfe-text-secondary">Total</span>
                  <span className="text-2xl font-bold text-kfe-primary">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    handleProcessSale()
                    if (!error) setShowCart(false)
                  }}
                  disabled={isProcessing || cartItems.length === 0}
                  className="btn-success w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Procesar Venta
                    </>
                  )}
                </button>
              </div>
            )}

            {saleSuccess && (
              <div className="mx-4 mb-4 p-3 bg-kfe-success/10 border border-kfe-success/30 rounded-xl text-center">
                <p className="text-kfe-success font-medium">¡Venta procesada!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panel lateral de ventas del día */}
      {showSalesPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => {
              setShowSalesPanel(false)
              setSelectedSale(null)
            }} 
          />
          <div className="relative w-full sm:w-[400px] md:w-[480px] bg-kfe-surface h-full shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header del panel */}
            <div className="flex items-center justify-between p-6 border-b border-kfe-border">
              <div className="flex items-center gap-3">
                <Receipt size={24} className="text-kfe-accent" />
                <div>
                  <h2 className="text-xl font-semibold text-kfe-text">Ventas del Día</h2>
                  <p className="text-sm text-kfe-text-secondary">
                    {new Date().toLocaleDateString('es-MX', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSalesPanel(false)
                  setSelectedSale(null)
                }}
                className="w-10 h-10 rounded-lg bg-kfe-bg flex items-center justify-center hover:bg-kfe-border transition-colors"
              >
                <X size={20} className="text-kfe-text-secondary" />
              </button>
            </div>

            {/* Resumen */}
            <div className="p-6 bg-kfe-surface-warm border-b border-kfe-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-kfe-text-secondary">Total de ventas</p>
                  <p className="text-3xl font-bold text-kfe-primary">{formatCurrency(todayTotal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-kfe-text-secondary">Transacciones</p>
                  <p className="text-3xl font-bold text-kfe-text">{todaySales.length}</p>
                </div>
              </div>
            </div>

            {/* Lista de ventas */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {isLoadingSales ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={32} className="text-kfe-primary animate-spin" />
                </div>
              ) : todaySales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-kfe-text-muted">
                  <Receipt size={48} className="mb-4 opacity-50" />
                  <p>No hay ventas registradas hoy</p>
                </div>
              ) : (
                todaySales.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-kfe-bg rounded-xl p-4 border border-kfe-border hover:border-kfe-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-kfe-text">
                        Venta #{sale.id}
                      </span>
                      <span className="text-lg font-bold text-kfe-primary">
                        {formatCurrency(sale.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-kfe-text-secondary">
                      <span className="flex items-center gap-2">
                        {sale.paymentMethod === 'CASH' && <Banknote size={14} />}
                        {sale.paymentMethod === 'CARD' && <CreditCard size={14} />}
                        {sale.paymentMethod === 'TRANSFER' && <ArrowRightLeft size={14} />}
                        {sale.paymentMethod === 'CASH' ? 'Efectivo' : 
                         sale.paymentMethod === 'CARD' ? 'Tarjeta' : 'Transferencia'}
                      </span>
                      <span>
                        {new Date(sale.createdAt).toLocaleTimeString('es-MX', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    {sale.products && sale.products.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-kfe-border">
                        <button
                          onClick={() => setSelectedSale(selectedSale?.id === sale.id ? null : sale)}
                          className="flex items-center gap-2 text-sm text-kfe-accent hover:text-kfe-accent/80 transition-colors"
                        >
                          <Eye size={14} />
                          {selectedSale?.id === sale.id ? 'Ocultar' : 'Ver'} {sale.products.length} producto{sale.products.length !== 1 ? 's' : ''}
                        </button>
                        
                        {selectedSale?.id === sale.id && (
                          <div className="mt-3 space-y-2">
                            {sale.products.map((product: SaleProduct, idx: number) => (
                              <div 
                                key={idx}
                                className="flex items-center justify-between py-2 px-3 bg-kfe-surface rounded-lg text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <Coffee size={14} className="text-kfe-primary" />
                                  <span className="text-kfe-text">{product.productName}</span>
                                  <span className="text-kfe-text-muted">x{product.quantity}</span>
                                </div>
                                <span className="font-medium text-kfe-text">
                                  {formatCurrency(product.subtotal)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
