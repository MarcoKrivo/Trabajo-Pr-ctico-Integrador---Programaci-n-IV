import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../shared/api/axiosInstance'
import { useCartStore } from '../../store/cartStore'
import { Cargando, Vacio } from '../../shared/components/Estados'
import type { Categoria, ProductosPaginados } from './types'

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(0)

  const agregar = useCartStore((s) => s.agregar)

  const cats = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => (
      await api.get<Categoria[]>('/categorias')
    ).data,
  })

  const productos = useQuery({
    queryKey: ['productos', busqueda, categoria, pagina],
    queryFn: async () => (
      await api.get<ProductosPaginados>('/productos', {
        params: {
          search: busqueda || undefined,
          categoria_id: categoria || undefined,
          skip: pagina * 12,
          limit: 12,
        },
      })
    ).data,
  })

  return (
    <main className="contenedor">
      <h1 className="text-3xl font-bold mb-5">
        Nuestro catálogo
      </h1>

      <div className="tarjeta mb-5 grid md:grid-cols-3 gap-3">
        <input
          className="campo"
          placeholder="Buscar producto…"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
        />

        <select
          className="campo"
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value)
            setPagina(0)
          }}
        >
          <option value="">Todas las categorías</option>
          {cats.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <span className="muted self-center">
          {productos.data?.total ?? 0} productos
        </span>
      </div>

      {productos.isLoading ? (
        <div className="rejilla">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              className="tarjeta h-48 animate-pulse"
              key={i}
            />
          ))}
        </div>
      ) : productos.data?.items.length ? (
        <div className="rejilla">
          {productos.data.items.map((p) => (
            <article className="tarjeta" key={p.id}>
              {p.imagen_url && (
                <img
                  src={p.imagen_url}
                  alt={p.nombre}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}

              <p className="muted text-sm">
                {p.categoria.nombre}
              </p>

              <h2 className="font-semibold text-lg">
                {p.nombre}
              </h2>

              <p className="my-2">
                {p.descripcion}
              </p>

              <strong>
                ${p.precio_base.toLocaleString('es-AR')}
              </strong>

              <p className="text-sm muted">
                Stock: {p.stock}
              </p>

              <button
                className="boton mt-3 w-full"
                disabled={!p.disponible || p.stock < 1}
                onClick={() => agregar({
                producto_id: p.id,
                nombre: p.nombre,
                precio_unitario: p.precio_base,
                cantidad: 1,
                imagen_url: p.imagen_url ?? null,
                })}
              >
                Agregar al carrito
              </button>
            </article>
          ))}
        </div>
      ) : (
        <Vacio texto="No se encontraron productos." />
      )}

      <div className="flex gap-3 justify-center mt-6">
        <button
          className="boton-secundario"
          disabled={pagina === 0}
          onClick={() => setPagina((p) => p - 1)}
        >
          Anterior
        </button>

        <span className="self-center">
          Página {pagina + 1}
        </span>

        <button
          className="boton-secundario"
          disabled={
            !productos.data ||
            (pagina + 1) * 12 >= productos.data.total
          }
          onClick={() => setPagina((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </main>
  )
}