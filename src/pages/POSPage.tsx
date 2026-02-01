import { useEffect } from 'react'
import { Search, User } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks'
import { fetchProducts } from '@/infrastructure/store/slices/productsSlice'

export default function POSPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { items: products, isLoading } = useAppSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

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

      <div className="flex-1 flex gap-6">
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-kfe-text-muted">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-kfe-text-muted">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="card cursor-pointer hover:border-kfe-primary transition-colors"
                >
                  <div className="h-32 bg-kfe-surface-warm rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">☕</span>
                  </div>
                  <h3 className="font-semibold text-kfe-text">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-kfe-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-kfe-text-muted">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="w-96 card flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-kfe-border">
            <h2 className="text-lg font-semibold text-kfe-text">Carrito</h2>
            <span className="w-7 h-7 rounded-full bg-kfe-accent text-white text-sm font-semibold flex items-center justify-center">
              0
            </span>
          </div>

          <div className="flex-1 py-4">
            <p className="text-kfe-text-muted text-center py-8">
              El carrito está vacío
            </p>
          </div>

          <div className="pt-4 border-t border-kfe-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-kfe-text-secondary">Total</span>
              <span className="text-2xl font-bold text-kfe-primary">$0.00</span>
            </div>
            <button className="btn-success w-full" disabled>
              Procesar Venta
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
