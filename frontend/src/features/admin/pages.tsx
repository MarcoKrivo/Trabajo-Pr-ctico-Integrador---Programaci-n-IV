
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { api } from '../../shared/api/axiosInstance'
import type { Categoria, Producto } from '../productos/types'
import type { Usuario } from '../auth/types'
import { useAuthStore } from '../../store/authStore'

type CategoriaForm = {
  nombre: string
  descripcion: string
}

type ProductoForm = {
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
}

const categoriaHelper = createColumnHelper<Categoria>()
const productoHelper = createColumnHelper<Producto>()
const usuarioHelper = createColumnHelper<Usuario>()

function mostrarError(error: unknown): string {
  const e = error as {
    response?: { data?: { detail?: string } }
  }

  return e.response?.data?.detail ?? 'Ocurrió un error. Intentá nuevamente.'
}

// =====================================================
// CATEGORÍAS
// =====================================================

export function AdminCategoriasPage() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<number | null>(null)

  const formulario = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
    } as CategoriaForm,
    onSubmit: async ({ value }) => {
      await guardar.mutateAsync(value)
    },
  })

  const q = useQuery({
    queryKey: ['admin-categorias'],
    queryFn: async () =>
      (await api.get<Categoria[]>('/categorias')).data,
  })

  const guardar = useMutation({
    mutationFn: (valores: CategoriaForm) => {
      const data = {
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim() || null,
      }

      return editando
        ? api.put(`/categorias/${editando}`, data)
        : api.post('/categorias', data)
    },
    onSuccess: () => {
      formulario.reset()
      setEditando(null)
      qc.invalidateQueries({ queryKey: ['admin-categorias'] })
      qc.invalidateQueries({ queryKey: ['categorias'] })
    },
  })

  const borrar = useMutation({
    mutationFn: (id: number) => api.delete(`/categorias/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categorias'] })
      qc.invalidateQueries({ queryKey: ['categorias'] })
      qc.invalidateQueries({ queryKey: ['admin-productos'] })
    },
  })

  const columnas = [
    categoriaHelper.accessor('nombre', {
      header: 'Nombre',
    }),
    categoriaHelper.accessor('descripcion', {
      header: 'Descripción',
      cell: info => info.getValue() || 'Sin descripción',
    }),
    categoriaHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: info => {
        const categoria = info.row.original

        return (
          <div className="flex gap-2">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => {
                formulario.reset()
                formulario.setFieldValue('nombre', categoria.nombre)
                formulario.setFieldValue(
                  'descripcion',
                  categoria.descripcion ?? '',
                )
                setEditando(categoria.id)
                guardar.reset()
              }}
            >
              Editar
            </button>

            <button
              type="button"
              className="text-red-700"
              onClick={() => {
                if (confirm(`¿Dar de baja la categoría ${categoria.nombre}?`)) {
                  borrar.mutate(categoria.id)
                }
              }}
              disabled={borrar.isPending}
            >
              Dar de baja
            </button>
          </div>
        )
      },
    }),
  ]

  const tabla = useReactTable({
    data: q.data ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <main className="contenedor">
      <h1 className="text-3xl font-bold mb-5">
        Administrar categorías
      </h1>

      <section className="tarjeta mb-5">
        <h2 className="font-semibold mb-3">
          {editando !== null ? 'Editar categoría' : 'Nueva categoría'}
        </h2>

        <form
          noValidate
          onSubmit={event => {
            event.preventDefault()
            event.stopPropagation()
            void formulario.handleSubmit()
          }}
          className="space-y-3"
        >
          <formulario.Field
            name="nombre"
            validators={{
              onSubmit: ({ value }) => {
                if (value.trim().length < 2) {
                  return 'El nombre debe tener al menos 2 caracteres.'
                }

                if (value.trim().length > 100) {
                  return 'El nombre no puede superar los 100 caracteres.'
                }

                return undefined
              },
            }}
          >
            {campo => (
              <div>
                <input
                  className="campo"
                  placeholder="Nombre"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(event.target.value)
                  }
                  onBlur={campo.handleBlur}
                  minLength={2}
                  maxLength={100}
                />

                {campo.state.meta.errors.length > 0 && (
                  <small className="text-red-600">
                    {campo.state.meta.errors.map(String).join('. ')}
                  </small>
                )}
              </div>
            )}
          </formulario.Field>

          <formulario.Field name="descripcion">
            {campo => (
              <input
                className="campo"
                placeholder="Descripción"
                value={campo.state.value}
                onChange={event =>
                  campo.handleChange(event.target.value)
                }
              />
            )}
          </formulario.Field>

          <div className="flex gap-2">
            <button
              className="boton"
              type="submit"
              disabled={guardar.isPending}
            >
              {guardar.isPending
                ? 'Guardando...'
                : editando !== null
                  ? 'Guardar cambios'
                  : 'Crear categoría'}
            </button>

            {editando !== null && (
              <button
                type="button"
                className="boton-secundario"
                onClick={() => {
                  setEditando(null)
                  formulario.reset()
                  guardar.reset()
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {guardar.isError && (
          <p className="text-red-600 mt-2">
            {mostrarError(guardar.error)}
          </p>
        )}

        {borrar.isError && (
          <p className="text-red-600 mt-2">
            {mostrarError(borrar.error)}
          </p>
        )}
      </section>

      <section className="tarjeta overflow-x-auto">
        {q.isLoading ? (
          <p>Cargando categorías...</p>
        ) : q.isError ? (
          <p className="text-red-600">
            {mostrarError(q.error)}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              {tabla.getHeaderGroups().map(group => (
                <tr key={group.id}>
                  {group.headers.map(header => (
                    <th key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {tabla.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {tabla.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={3}>No hay categorías registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

// =====================================================
// PRODUCTOS
// =====================================================

export function AdminProductosPage() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<number | null>(null)

  const formulario = useForm({
    defaultValues: {
      categoria_id: 0,
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
    } as ProductoForm,
    onSubmit: async ({ value }) => {
      await guardar.mutateAsync(value)
    },
  })

  const cats = useQuery({
    queryKey: ['categorias'],
    queryFn: async () =>
      (await api.get<Categoria[]>('/categorias')).data,
  })

  const q = useQuery({
    queryKey: ['admin-productos'],
    queryFn: async () =>
      (
        await api.get<{ total: number; items: Producto[] }>(
          '/productos',
          { params: { limit: 100 } },
        )
      ).data,
  })

  const guardar = useMutation({
    mutationFn: (valores: ProductoForm) => {
      const data = {
        ...valores,
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim() || null,
        imagen_url: valores.imagen_url.trim() || null,
      }

      return editando
        ? api.put(`/productos/${editando}`, data)
        : api.post('/productos', data)
    },
    onSuccess: () => {
      formulario.reset()
      setEditando(null)

      qc.invalidateQueries({ queryKey: ['admin-productos'] })
      qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  const stock = useMutation({
    mutationFn: (p: Producto) =>
      api.patch(`/productos/${p.id}/stock`, {
        stock: p.stock,
        disponible: p.disponible,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-productos'] })
      qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  const borrar = useMutation({
    mutationFn: (id: number) => api.delete(`/productos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-productos'] })
      qc.invalidateQueries({ queryKey: ['productos'] })
    },
  })

  const columnas = [
    productoHelper.accessor('nombre', {
      header: 'Producto',
    }),
    productoHelper.accessor('categoria.nombre', {
      header: 'Categoría',
      cell: info => info.getValue() || 'Sin categoría',
    }),
    productoHelper.accessor('precio_base', {
      header: 'Precio',
      cell: info => `$${info.getValue().toLocaleString('es-AR')}`,
    }),
    productoHelper.accessor('stock', {
      header: 'Stock',
      cell: info => {
        const p = info.row.original

        return (
          <input
            className="campo max-w-24"
            type="number"
            min="0"
            step="1"
            defaultValue={p.stock}
            onBlur={event => {
              const nuevoStock = Number(event.target.value)

              if (
                Number.isInteger(nuevoStock) &&
                nuevoStock >= 0 &&
                nuevoStock !== p.stock
              ) {
                stock.mutate({ ...p, stock: nuevoStock })
              } else {
                event.target.value = String(p.stock)
              }
            }}
          />
        )
      },
    }),
    productoHelper.accessor('disponible', {
      header: 'Disponibilidad',
      cell: info => {
        const p = info.row.original

        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={p.disponible}
              disabled={stock.isPending}
              onChange={event =>
                stock.mutate({
                  ...p,
                  disponible: event.target.checked,
                })
              }
            />
            {p.disponible ? 'Disponible' : 'No disponible'}
          </label>
        )
      },
    }),
    productoHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: info => {
        const p = info.row.original

        return (
          <div className="flex gap-2">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => {
                formulario.reset()
                formulario.setFieldValue('categoria_id', p.categoria_id)
                formulario.setFieldValue('nombre', p.nombre)
                formulario.setFieldValue(
                  'descripcion',
                  p.descripcion ?? '',
                )
                formulario.setFieldValue('precio_base', p.precio_base)
                formulario.setFieldValue(
                  'imagen_url',
                  p.imagen_url ?? '',
                )
                formulario.setFieldValue('stock', p.stock)
                formulario.setFieldValue('disponible', p.disponible)

                setEditando(p.id)
                guardar.reset()

                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }}
            >
              Editar
            </button>

            <button
              type="button"
              className="text-red-700"
              onClick={() => {
                if (confirm(`¿Dar de baja el producto ${p.nombre}?`)) {
                  borrar.mutate(p.id)
                }
              }}
              disabled={borrar.isPending}
            >
              Dar de baja
            </button>
          </div>
        )
      },
    }),
  ]

  const tabla = useReactTable({
    data: q.data?.items ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <main className="contenedor">
      <h1 className="text-3xl font-bold mb-5">
        Administrar productos
      </h1>

      <section className="tarjeta mb-5">
        <h2 className="font-semibold mb-3">
          {editando !== null ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <form
          noValidate
          onSubmit={event => {
            event.preventDefault()
            event.stopPropagation()
            void formulario.handleSubmit()
          }}
          className="grid gap-3"
        >
          <formulario.Field
            name="categoria_id"
            validators={{
              onSubmit: ({ value }) =>
                value <= 0 ? 'Seleccioná una categoría.' : undefined,
            }}
          >
            {campo => (
              <div>
                <select
                  className="campo"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(Number(event.target.value))
                  }
                >
                  <option value={0}>Seleccionar categoría</option>
                  {cats.data?.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>

                {campo.state.meta.errors.length > 0 && (
                  <small className="text-red-600">
                    {campo.state.meta.errors.map(String).join('. ')}
                  </small>
                )}
              </div>
            )}
          </formulario.Field>

          <formulario.Field
            name="nombre"
            validators={{
              onSubmit: ({ value }) =>
                value.trim().length < 2
                  ? 'El nombre debe tener al menos 2 caracteres.'
                  : undefined,
            }}
          >
            {campo => (
              <div>
                <input
                  className="campo"
                  placeholder="Nombre"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(event.target.value)
                  }
                  onBlur={campo.handleBlur}
                />

                {campo.state.meta.errors.length > 0 && (
                  <small className="text-red-600">
                    {campo.state.meta.errors.map(String).join('. ')}
                  </small>
                )}
              </div>
            )}
          </formulario.Field>

          <formulario.Field name="descripcion">
            {campo => (
              <textarea
                className="campo"
                placeholder="Descripción"
                value={campo.state.value}
                onChange={event =>
                  campo.handleChange(event.target.value)
                }
              />
            )}
          </formulario.Field>

          <formulario.Field
            name="precio_base"
            validators={{
              onSubmit: ({ value }) =>
                !Number.isFinite(value) || value < 0
                  ? 'El precio debe ser un número mayor o igual a cero.'
                  : undefined,
            }}
          >
            {campo => (
              <label>
                Precio
                <input
                  className="campo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(Number(event.target.value))
                  }
                />

                {campo.state.meta.errors.length > 0 && (
                  <small className="text-red-600">
                    {campo.state.meta.errors.map(String).join('. ')}
                  </small>
                )}
              </label>
            )}
          </formulario.Field>

          <formulario.Field name="imagen_url">
            {campo => (
              <label>
                URL de imagen
                <input
                  className="campo"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(event.target.value)
                  }
                />
              </label>
            )}
          </formulario.Field>

          <formulario.Field
            name="stock"
            validators={{
              onSubmit: ({ value }) =>
                !Number.isInteger(value) || value < 0
                  ? 'El stock debe ser un número entero mayor o igual a cero.'
                  : undefined,
            }}
          >
            {campo => (
              <label>
                Stock
                <input
                  className="campo"
                  type="number"
                  min="0"
                  step="1"
                  value={campo.state.value}
                  onChange={event =>
                    campo.handleChange(Number(event.target.value))
                  }
                />

                {campo.state.meta.errors.length > 0 && (
                  <small className="text-red-600">
                    {campo.state.meta.errors.map(String).join('. ')}
                  </small>
                )}
              </label>
            )}
          </formulario.Field>

          <formulario.Field name="disponible">
            {campo => (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={campo.state.value}
                  onChange={event =>
                    campo.handleChange(event.target.checked)
                  }
                />
                Disponible
              </label>
            )}
          </formulario.Field>

          <div className="flex gap-2">
            <button
              className="boton"
              type="submit"
              disabled={guardar.isPending || !cats.data?.length}
            >
              {guardar.isPending
                ? 'Guardando...'
                : editando !== null
                  ? 'Guardar cambios'
                  : 'Crear producto'}
            </button>

            {editando !== null && (
              <button
                type="button"
                className="boton-secundario"
                onClick={() => {
                  setEditando(null)
                  formulario.reset()
                  guardar.reset()
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {guardar.isError && (
          <p className="text-red-600 mt-2">
            {mostrarError(guardar.error)}
          </p>
        )}

        {stock.isError && (
          <p className="text-red-600 mt-2">
            {mostrarError(stock.error)}
          </p>
        )}

        {borrar.isError && (
          <p className="text-red-600 mt-2">
            {mostrarError(borrar.error)}
          </p>
        )}
      </section>

      <section className="tarjeta overflow-x-auto">
        {q.isLoading ? (
          <p>Cargando productos...</p>
        ) : q.isError ? (
          <p className="text-red-600">
            {mostrarError(q.error)}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              {tabla.getHeaderGroups().map(group => (
                <tr key={group.id}>
                  {group.headers.map(header => (
                    <th key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {tabla.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {tabla.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={6}>No hay productos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

// =====================================================
// USUARIOS
// =====================================================

export function AdminUsuariosPage() {
  const qc = useQueryClient()
  const yo = useAuthStore(s => s.usuario)

  const q = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () =>
      (await api.get<Usuario[]>('/admin/usuarios')).data,
  })

  const estado = useMutation({
    mutationFn: ({
      id,
      accion,
    }: {
      id: number
      accion: 'activar' | 'desactivar'
    }) => api.post(`/admin/usuarios/${id}/${accion}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })

  const columnas = [
    usuarioHelper.accessor('username', {
      header: 'Usuario',
    }),
    usuarioHelper.accessor('full_name', {
      header: 'Nombre',
    }),
    usuarioHelper.accessor('email', {
      header: 'Correo',
    }),
    usuarioHelper.accessor('role', {
      header: 'Rol',
    }),
    usuarioHelper.accessor('disabled', {
      header: 'Estado',
      cell: info =>
        info.getValue() ? 'Desactivado' : 'Activo',
    }),
    usuarioHelper.display({
      id: 'acciones',
      header: 'Acción',
      cell: info => {
        const u = info.row.original

        return u.id !== yo?.id ? (
          <button
            type="button"
            className="boton-secundario"
            onClick={() =>
              estado.mutate({
                id: u.id,
                accion: u.disabled ? 'activar' : 'desactivar',
              })
            }
            disabled={estado.isPending}
          >
            {u.disabled ? 'Activar' : 'Desactivar'}
          </button>
        ) : (
          <span>Tu usuario</span>
        )
      },
    }),
  ]

  const tabla = useReactTable({
    data: q.data ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <main className="contenedor">
      <h1 className="text-3xl font-bold mb-5">
        Administrar usuarios
      </h1>

      <section className="tarjeta overflow-x-auto">
        {q.isLoading ? (
          <p>Cargando usuarios...</p>
        ) : q.isError ? (
          <p className="text-red-600">
            {mostrarError(q.error)}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              {tabla.getHeaderGroups().map(group => (
                <tr key={group.id}>
                  {group.headers.map(header => (
                    <th key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {tabla.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {tabla.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={6}>No hay usuarios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {estado.isError && (
          <p className="text-red-600 mt-2">
            {mostrarError(estado.error)}
          </p>
        )}
      </section>
    </main>
  )
}
