
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
}

interface CartState {
  items: ItemCarrito[]
  agregar: (item: ItemCarrito) => void
  quitar: (id: number) => void
  cambiarCantidad: (id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item) =>
        set((state) => ({
          items: state.items.some(
            (producto) => producto.producto_id === item.producto_id
          )
            ? state.items.map((producto) =>
                producto.producto_id === item.producto_id
                  ? {
                      ...producto,
                      cantidad: producto.cantidad + item.cantidad,
                    }
                  : producto
              )
            : [...state.items, item],
        })),

      quitar: (id) =>
        set((state) => ({
          items: state.items.filter(
            (producto) => producto.producto_id !== id
          ),
        })),

      cambiarCantidad: (id, cantidad) =>
        set((state) => ({
          items: state.items.map((producto) =>
            producto.producto_id === id
              ? { ...producto, cantidad: Math.max(1, cantidad) }
              : producto
          ),
        })),

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (suma, producto) =>
            suma + producto.precio_unitario * producto.cantidad,
          0
        ),
    }),
    { name: 'foodstore-carrito' }
  )
)
