import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Plus, Edit2, Trash2, Loader2, X, AlertCircle, Package } from 'lucide-react'
import { apiClient } from '@/infrastructure/api/client'
import type { Product } from '@/core/domain'
import { formatCurrency } from '@/lib/utils'
import { productSchema, type ProductFormData } from '@/lib/validations'
import { useCan } from '@/infrastructure/store/hooks'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function ProductsPage() {
  const canManage = useCan('products:manage')
  const { showSuccess, showError } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      stock: 0,
    },
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
    setServerError(null)
    reset({ name: '', price: 0, stock: 0 })
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setServerError(null)
    reset({ name: product.name, price: product.price, stock: product.stock })
    setShowModal(true)
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      if (editingProduct) {
        await apiClient.patch(`/products/${editingProduct.id}`, data)
        showSuccess('Producto actualizado correctamente')
      } else {
        await apiClient.post('/products', data)
        showSuccess('Producto creado correctamente')
      }
      setShowModal(false)
      fetchProducts()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } }
      const message = error.response?.data?.message
      const errorMessage = Array.isArray(message) ? message.join(', ') : (message || 'Error al guardar producto')
      setServerError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await apiClient.delete(`/products/${deleteConfirm.id}`)
      showSuccess(`Producto "${deleteConfirm.name}" eliminado correctamente`)
      setDeleteConfirm(null)
      fetchProducts()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      showError(error.response?.data?.message || 'Error al eliminar producto')
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
    <div className="h-full p-4 sm:p-6 lg:p-8 flex flex-col">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-kfe-text">Gestión de Productos</h1>
          <p className="text-sm sm:text-base text-kfe-text-secondary">
            Administra el catálogo de productos
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 px-3 sm:px-4 h-11 bg-kfe-surface border border-kfe-border rounded-lg">
            <Search size={18} className="text-kfe-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="bg-transparent outline-none text-sm flex-1 min-w-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {canManage && (
            <button onClick={openCreateModal} className="btn-primary whitespace-nowrap">
              <Plus size={20} />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className={`hidden md:grid gap-4 px-4 lg:px-6 py-4 bg-kfe-surface-warm border-b border-kfe-border ${canManage ? 'grid-cols-[1fr_120px_120px_150px]' : 'grid-cols-[1fr_120px_120px]'}`}>
          <span className="text-sm font-semibold text-kfe-text-secondary">Producto</span>
          <span className="text-sm font-semibold text-kfe-text-secondary text-right">Precio</span>
          <span className="text-sm font-semibold text-kfe-text-secondary text-right">Stock</span>
          {canManage && (
            <span className="text-sm font-semibold text-kfe-text-secondary text-center">Acciones</span>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-kfe-text-muted">
              <Package size={48} className="mb-4 opacity-50" />
              <p className="text-sm sm:text-base text-center px-4">{searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}</p>
            </div>
          ) : (
            <>
              <div className="md:hidden space-y-3 p-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 bg-kfe-surface-warm rounded-xl border border-kfe-border"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-kfe-primary/10 flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-kfe-primary" />
                        </div>
                        <span className="font-medium text-kfe-text truncate">{product.name}</span>
                      </div>
                      {canManage && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => openEditModal(product)}
                            className="w-8 h-8 rounded-lg bg-kfe-info/10 text-kfe-info flex items-center justify-center hover:bg-kfe-info/20 transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product)}
                            className="w-8 h-8 rounded-lg bg-kfe-error/10 text-kfe-error flex items-center justify-center hover:bg-kfe-error/20 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <span className="text-xs text-kfe-text-secondary">Precio</span>
                        <p className="text-base font-semibold text-kfe-primary">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-xs text-kfe-text-secondary">Stock</span>
                        <p className={`text-base font-medium ${product.stock <= 5 ? 'text-kfe-error' : 'text-kfe-text'}`}>
                          {product.stock}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`grid gap-4 px-4 lg:px-6 py-4 border-b border-kfe-border items-center hover:bg-kfe-surface-warm/50 transition-colors ${canManage ? 'grid-cols-[1fr_120px_120px_150px]' : 'grid-cols-[1fr_120px_120px]'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-kfe-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-kfe-primary" />
                      </div>
                      <span className="font-medium text-kfe-text truncate">{product.name}</span>
                    </div>

                    <span className="text-right font-semibold text-kfe-primary">
                      {formatCurrency(product.price)}
                    </span>

                    <span className={`text-right font-medium ${product.stock <= 5 ? 'text-kfe-error' : 'text-kfe-text'}`}>
                      {product.stock}
                    </span>

                    {canManage && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="w-8 h-8 rounded-lg bg-kfe-info/10 text-kfe-info flex items-center justify-center hover:bg-kfe-info/20 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="w-8 h-8 rounded-lg bg-kfe-error/10 text-kfe-error flex items-center justify-center hover:bg-kfe-error/20 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-kfe-surface rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-kfe-border flex-shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-kfe-text">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-kfe-surface-warm flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X size={20} className="text-kfe-text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {serverError && (
                <div className="flex items-center gap-2 p-3 bg-kfe-error/10 border border-kfe-error/30 rounded-lg text-kfe-error text-xs sm:text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-kfe-text">Nombre del producto</label>
                <input
                  type="text"
                  className={`input-field ${errors.name ? 'border-kfe-error' : ''}`}
                  placeholder="Ej: Cappuccino"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-kfe-error text-xs">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`input-field ${errors.price ? 'border-kfe-error' : ''}`}
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-kfe-error text-xs">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-kfe-text">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className={`input-field ${errors.stock ? 'border-kfe-error' : ''}`}
                    {...register('stock', { valueAsNumber: true })}
                  />
                  {errors.stock && (
                    <p className="text-kfe-error text-xs">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 order-1 sm:order-2"
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

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar el producto "${deleteConfirm?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
