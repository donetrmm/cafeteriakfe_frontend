import { useEffect, useState } from 'react'
import { Search, Plus, Edit2, Trash2, Loader2, X, AlertCircle, Package } from 'lucide-react'
import { apiClient } from '@/infrastructure/api/client'
import type { Product, CreateProductDto, UpdateProductDto } from '@/core/domain'
import { formatCurrency } from '@/lib/utils'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    price: 0,
    stock: 0,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<Product[]>('/products')
      setProducts(response.data)
    } catch (err) {
      console.error('Error al cargar productos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openCreateModal = () => {
    setEditingProduct(null)
    setError(null)
    setFormData({ name: '', price: 0, stock: 0 })
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setError(null)
    setFormData({ name: product.name, price: product.price, stock: product.stock })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (editingProduct) {
        const updateData: UpdateProductDto = {
          name: formData.name,
          price: formData.price,
          stock: formData.stock,
        }
        await apiClient.patch(`/products/${editingProduct.id}`, updateData)
      } else {
        await apiClient.post('/products', formData)
      }
      setShowModal(false)
      fetchProducts()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      if (Array.isArray(message)) {
        setError(message.join(', '))
      } else {
        setError(message || 'Error al guardar producto')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de eliminar "${product.name}"?`)) return

    try {
      await apiClient.delete(`/products/${product.id}`)
      fetchProducts()
    } catch (err) {
      console.error('Error al eliminar producto:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={48} className="text-kfe-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full p-8 flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-kfe-text">Gestión de Productos</h1>
          <p className="text-kfe-text-secondary">
            Administra el catálogo de productos
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

          <button onClick={openCreateModal} className="btn-primary">
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </header>

      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className="grid grid-cols-[1fr_120px_120px_150px] gap-4 px-6 py-4 bg-kfe-surface-warm border-b border-kfe-border">
          <span className="text-sm font-semibold text-kfe-text-secondary">Producto</span>
          <span className="text-sm font-semibold text-kfe-text-secondary text-right">Precio</span>
          <span className="text-sm font-semibold text-kfe-text-secondary text-right">Stock</span>
          <span className="text-sm font-semibold text-kfe-text-secondary text-center">Acciones</span>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-kfe-text-muted">
              <Package size={48} className="mb-4 opacity-50" />
              <p>{searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[1fr_120px_120px_150px] gap-4 px-6 py-4 border-b border-kfe-border items-center hover:bg-kfe-surface-warm/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-kfe-primary/10 flex items-center justify-center">
                    <Package size={20} className="text-kfe-primary" />
                  </div>
                  <span className="font-medium text-kfe-text">{product.name}</span>
                </div>

                <span className="text-right font-semibold text-kfe-primary">
                  {formatCurrency(product.price)}
                </span>

                <span className={`text-right font-medium ${product.stock <= 5 ? 'text-kfe-error' : 'text-kfe-text'}`}>
                  {product.stock} {product.stock <= 5 && '⚠️'}
                </span>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="w-8 h-8 rounded-lg bg-kfe-info/10 text-kfe-info flex items-center justify-center hover:bg-kfe-info/20 transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="w-8 h-8 rounded-lg bg-kfe-error/10 text-kfe-error flex items-center justify-center hover:bg-kfe-error/20 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-kfe-surface rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-kfe-border">
              <h2 className="text-lg font-semibold text-kfe-text">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-kfe-surface-warm flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-kfe-text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-kfe-text">Nombre del producto</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Cappuccino"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : editingProduct ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Producto'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
