
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/axiosInstance'
import { useCartStore } from '../../store/cartStore'
import type { Pedido, ResumenPedidos } from './types'
import { Vacio } from '../../shared/components/Estados'
import { useState } from 'react'

// =====================================================
// UTILIDADES
// =====================================================

function formatearEstado(estado: string): string {
  return estado.replaceAll('_', ' ')
}

// =====================================================
// CARRITO
// =====================================================

export function CarritoPage() {
  const { items, quitar, cambiarCantidad, total } = useCartStore()

  return (
    <main className="contenedor">
      <h1 className="text-3xl font-bold mb-5">Carrito</h1>

      {items.length === 0 ? (
        <Vacio texto="El carrito está vacío." />
      ) : (
        <section className="tarjeta">
          {items.map(x => (
            <div
              className="flex flex-wrap items-center justify-between gap-4 py-4 border-b"
              key={x.producto_id}
            >
              <div className="flex items-center gap-4">
                <img
                  src={x.imagen_url || '/placeholder.png'}
                  alt={x.nombre}
                  className="h-20 w-20 rounded-lg object-cover"
                />

                <strong>{x.nombre}</strong>
              </div>

              <div
                className="control-cantidad"
                aria-label={`Cantidad de ${x.nombre}`}
              >
                <button
                  type="button"
                  className="cantidad-boton"
                  aria-label={`Restar una unidad de ${x.nombre}`}
                  disabled={x.cantidad <= 1}
                  onClick={() =>
                    cambiarCantidad(x.producto_id, x.cantidad - 1)
                  }
                >
                  −
                </button>

                <span className="cantidad-valor" aria-live="polite">
                  {x.cantidad}
                </span>

                <button
                  type="button"
                  className="cantidad-boton"
                  aria-label={`Agregar una unidad de ${x.nombre}`}
                  onClick={() =>
                    cambiarCantidad(x.producto_id, x.cantidad + 1)
                  }
                >
                  +
                </button>
              </div>

              <span>
                ${(x.precio_unitario * x.cantidad).toLocaleString('es-AR')}
              </span>

              <button
                type="button"
                className="text-red-700"
                onClick={() => quitar(x.producto_id)}
              >
                Quitar
              </button>
            </div>
          ))}

          <h2 className="text-xl font-bold text-right mt-4">
            Total: ${total().toLocaleString('es-AR')}
          </h2>

          <a className="boton inline-block mt-4" href="/checkout">
            Confirmar pedido
          </a>
        </section>
      )}
    </main>
  )
}

// =====================================================
// CHECKOUT
// =====================================================

export function CheckoutPage() {
  const { items, total, vaciar } = useCartStore()
  const nav = useNavigate()

  const formulario = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as 'EFECTIVO' | 'TRANSFERENCIA',
      notas: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await api.post<Pedido>('/pedidos', {
          items: items.map(x => ({
            producto_id: x.producto_id,
            cantidad: x.cantidad,
          })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        })

        vaciar()
        nav('/mis-pedidos')
      } catch {
        setError(
          'No se pudo crear el pedido. Verificá stock, dirección y sesión.',
        )
      }
    },
  })

  const [error, setError] = useState('')

  return (
    <main className="contenedor max-w-2xl">
      <section className="tarjeta">
        <h1 className="text-2xl font-bold mb-4">Confirmar pedido</h1>

        <form
          noValidate
          onSubmit={event => {
            event.preventDefault()
            event.stopPropagation()
            setError('')
            void formulario.handleSubmit()
          }}
          className="space-y-3"
        >
          <formulario.Field
            name="direccion_entrega"
            validators={{
              onSubmit: ({ value }) => {
                const direccion = value.trim()

                if (direccion.length < 5) {
                  return 'La dirección debe tener al menos 5 caracteres.'
                }

                if (direccion.length > 200) {
                  return 'La dirección no puede superar los 200 caracteres.'
                }

                return undefined
              },
            }}
          >
            {campo => (
              <label>
                Dirección de entrega
                <input
                  className="campo"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(event.target.value)
                  }
                  onBlur={campo.handleBlur}
                  minLength={5}
                  maxLength={200}
                />

                {campo.state.meta.errors.length > 0 && (
                  <small className="text-red-600">
                    {campo.state.meta.errors.map(String).join('. ')}
                  </small>
                )}
              </label>
            )}
          </formulario.Field>

          <formulario.Field name="forma_pago">
            {campo => (
              <label>
                Forma de pago
                <select
                  className="campo"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(
                      event.target.value as 'EFECTIVO' | 'TRANSFERENCIA',
                    )
                  }
                >
                  <option value="EFECTIVO">EFECTIVO</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                </select>
              </label>
            )}
          </formulario.Field>

          <formulario.Field name="notas">
            {campo => (
              <label>
                Notas
                <textarea
                  className="campo"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(event.target.value)
                  }
                />
              </label>
            )}
          </formulario.Field>

          <p>Total: ${total().toLocaleString('es-AR')}</p>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="boton mt-3"
            disabled={!items.length || formulario.state.isSubmitting}
          >
            {formulario.state.isSubmitting
              ? 'Procesando pedido...'
              : 'Realizar pedido'}
          </button>
        </form>
      </section>
    </main>
  )
}

// =====================================================
// MIS PEDIDOS - CLIENTE
// =====================================================

export function MisPedidosPage() {
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['mis-pedidos'],
    queryFn: async () =>
      (
        await api.get<{ total: number; items: Pedido[] }>('/pedidos', {
          params: { limit: 100 },
        })
      ).data,
  })

  const cancelar = useMutation({
    mutationFn: (id: number) => api.patch(`/pedidos/${id}/cancelar`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['mis-pedidos'] }),
  })

  return (
    <main className="contenedor">
      <h1 className="text-3xl font-bold mb-5">Mis pedidos</h1>

      {q.data?.items.length ? (
        q.data.items.map(p => (
          <article className="tarjeta mb-3" key={p.id}>
            <div className="flex justify-between">
              <strong>Pedido #{p.id}</strong>
              <span>{formatearEstado(p.estado)}</span>
            </div>

            <p className="text-sm text-gray-600 mt-1">
              Realizado por: <strong>{p.nombre_cliente}</strong>
            </p>

            <p>
              {p.direccion_entrega} · {p.forma_pago}
            </p>

            <p>Total: ${p.total.toLocaleString('es-AR')}</p>

            <ul>
              {p.items.map((x, i) => (
                <li key={i}>
                  {x.cantidad} × {x.nombre_producto}
                </li>
              ))}
            </ul>

            {p.estado === 'PENDIENTE' && (
              <button
                type="button"
                className="boton-secundario mt-2"
                onClick={() => cancelar.mutate(p.id)}
                disabled={cancelar.isPending}
              >
                Cancelar pedido
              </button>
            )}
          </article>
        ))
      ) : (
        <Vacio texto="Todavía no tenés pedidos." />
      )}
    </main>
  )
}

// =====================================================
// RESUMEN - ADMINISTRADOR
// =====================================================

export function AdminResumenPage() {
  const q = useQuery({
    queryKey: ['resumen'],
    queryFn: async () =>
      (await api.get<ResumenPedidos>('/pedidos/resumen')).data,
  })

  const etiquetas: [keyof ResumenPedidos, string][] = [
    ['pendientes', 'Pendientes'],
    ['en_preparacion', 'En preparación'],
    ['entregados', 'Entregados'],
    ['cancelados', 'Cancelados'],
    ['pedidos_hoy', 'Pedidos de hoy'],
    ['ingresos_entregados', 'Ingresos entregados'],
  ]

  return (
    <main className="contenedor">
      <h1 className="text-3xl font-bold mb-5">Resumen del negocio</h1>

      <div className="rejilla">
        {etiquetas.map(([k, t]) => (
          <article className="tarjeta" key={k}>
            <p className="muted">{t}</p>

            <strong className="text-2xl">
              {q.data
                ? k === 'ingresos_entregados'
                  ? `$${q.data[k].toLocaleString('es-AR')}`
                  : q.data[k]
                : '…'}
            </strong>
          </article>
        ))}
      </div>
    </main>
  )
}

// =====================================================
// GESTIÓN DE PEDIDOS - ADMINISTRADOR
// =====================================================

export function AdminPedidosPage() {
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['admin-pedidos'],
    queryFn: async () =>
      (
        await api.get<{ total: number; items: Pedido[] }>('/pedidos', {
          params: { limit: 100 },
        })
      ).data,
  })

  const cambiar = useMutation({
    mutationFn: ({
      id,
      estado,
    }: {
      id: number
      estado: string
    }) => api.patch(`/pedidos/${id}/estado`, { estado }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pedidos'] })
      qc.invalidateQueries({ queryKey: ['resumen'] })
      qc.invalidateQueries({ queryKey: ['mis-pedidos'] })
    },
  })

  return (
    <main className="contenedor">
      <h1 className="text-3xl font-bold mb-5">Gestión de pedidos</h1>

      <div className="tarjeta overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>N.º</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {q.data?.items.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre_cliente}</td>
                <td>{formatearEstado(p.estado)}</td>
                <td>${p.total.toLocaleString('es-AR')}</td>

                <td>
                  {p.estado === 'PENDIENTE' && (
                    <button
                      type="button"
                      className="boton-secundario mr-2"
                      onClick={() =>
                        cambiar.mutate({
                          id: p.id,
                          estado: 'EN_PREPARACION',
                        })
                      }
                      disabled={cambiar.isPending}
                    >
                      Preparar
                    </button>
                  )}

                  {p.estado === 'EN_PREPARACION' && (
                    <button
                      type="button"
                      className="boton-secundario mr-2"
                      onClick={() =>
                        cambiar.mutate({
                          id: p.id,
                          estado: 'ENTREGADO',
                        })
                      }
                      disabled={cambiar.isPending}
                    >
                      Entregar
                    </button>
                  )}

                  {!['ENTREGADO', 'CANCELADO'].includes(p.estado) && (
                    <button
                      type="button"
                      className="text-red-700"
                      onClick={() =>
                        cambiar.mutate({
                          id: p.id,
                          estado: 'CANCELADO',
                        })
                      }
                      disabled={cambiar.isPending}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
