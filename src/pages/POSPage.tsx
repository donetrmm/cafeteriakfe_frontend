import { useEffect, useState } from 'react'
import { Search, User, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, ArrowRightLeft, Coffee, Loader2, AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks'
import { fetchProducts } from '@/infrastructure/store/slices/productsSlice'
import { addToCart, removeFromCart, updateQuantity, setPaymentMethod, clearCart, selectCartTotal, selectCartItemsCount } from '@/infrastructure/store/slices/cartSlice'
import { apiClient } from '@/infrastructure/api/client'
import type { PaymentMethod, CreateSaleDto } from '@/core/domain'
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

  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [saleSuccess, setSaleSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

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
      setSaleSuccess(true)
      setTimeout(() => setSaleSuccess(false), 3000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Error al procesar la venta')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="h-full flex flex-col p-8 gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-kfe-text">Punto de Venta</h1>
          <p className="text-kfe-text-secondary">
            Selecciona productos para agregar al carrito
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 h-11 bg-kfe-surface border border-kfe-border rounded-lg">
            <Search size={18} className="text-kfe-text-muted" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="bg-transparent outline-none text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 px-4 h-11 bg-kfe-surface-warm rounded-full">
            <User size={18} className="text-kfe-primary" />
            <span className="text-sm font-medium text-kfe-text">
              {user?.name}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const cartItem = cartItems.find((item) => item.product.id === product.id)
                const inCart = cartItem ? cartItem.quantity : 0
                const availableStock = product.stock - inCart

                return (
                  <button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    disabled={availableStock <= 0}
                    className="card text-left cursor-pointer hover:border-kfe-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="h-28 bg-gradient-to-br from-kfe-surface-warm to-kfe-border rounded-lg mb-4 flex items-center justify-center">
                      <Coffee size={40} className="text-kfe-primary opacity-60" />
                    </div>
                    <h3 className="font-semibold text-kfe-text truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-kfe-primary">
                        {formatCurrency(product.price)}
                      </span>
                      <span className={`text-xs ${availableStock <= 0 ? 'text-kfe-error' : 'text-kfe-text-muted'}`}>
                        Stock: {availableStock}
                      </span>
                    </div>
                    {inCart > 0 && (
                      <div className="mt-2 px-2 py-1 bg-kfe-accent/10 rounded text-center">
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

        <aside className="w-96 card flex flex-col">
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
    </div>
  )
}
