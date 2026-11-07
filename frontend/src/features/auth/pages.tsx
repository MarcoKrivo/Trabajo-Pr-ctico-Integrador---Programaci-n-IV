
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../shared/api/axiosInstance'

function mensajeError(error: unknown, alternativo: string) {
  if (axios.isAxiosError(error)) {
    const detalle = error.response?.data?.detail

    if (typeof detalle === 'string') return detalle

    if (Array.isArray(detalle)) {
      return detalle.map((item) => item.msg).filter(Boolean).join('. ')
    }
  }

  return alternativo
}

export function LoginPage() {
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const login = useAuthStore((state) => state.login)
  const nav = useNavigate()

  const formulario = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError('')
      setEnviando(true)

      try {
        await login(value.username.trim(), value.password)
        nav('/')
      } catch (err) {
        setError(
          mensajeError(
            err,
            'No se pudo iniciar sesión. Revisá tus credenciales y que el servidor esté activo.',
          ),
        )
      } finally {
        setEnviando(false)
      }
    },
  })

  return (
    <main className="contenedor max-w-lg">
      <section className="tarjeta">
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void formulario.handleSubmit()
          }}
        >
          <formulario.Field name="username">
            {(campo) => (
              <label>
                Nombre de usuario o correo electrónico
                <input
                  className="campo"
                  autoComplete="username"
                  required
                  value={campo.state.value}
                  onChange={(event) => campo.handleChange(event.target.value)}
                />
              </label>
            )}
          </formulario.Field>

          <formulario.Field name="password">
            {(campo) => (
              <label>
                Contraseña
                <input
                  className="campo"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={campo.state.value}
                  onChange={(event) => campo.handleChange(event.target.value)}
                />
              </label>
            )}
          </formulario.Field>

          {error && <p className="error" role="alert">{error}</p>}

          <button className="boton" type="submit" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-4">
          ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </section>
    </main>
  )
}

export function RegistroPage() {
  const [error, setError] = useState('')
  const nav = useNavigate()

  const formulario = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError('')

      try {
        await api.post('/auth/register', {
          ...value,
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
        })

        nav('/login', { state: { registroExitoso: true } })
      } catch (err) {
        setError(
          mensajeError(
            err,
            'No se pudo completar el registro. Revisá los datos e intentá nuevamente.',
          ),
        )
      }
    },
  })

  return (
    <main className="contenedor max-w-lg">
      <section className="tarjeta">
        <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void formulario.handleSubmit()
          }}
        >
          <formulario.Field
            name="username"
            validators={{
              onBlur: ({ value }) =>
                value.trim().length < 3
                  ? 'El usuario debe tener al menos 3 caracteres.'
                  : undefined,
            }}
          >
            {(campo) => (
              <label>
                Nombre de usuario
                <input
                  className="campo"
                  autoComplete="username"
                  required
                  minLength={3}
                  value={campo.state.value}
                  onChange={(event) => campo.handleChange(event.target.value)}
                  onBlur={campo.handleBlur}
                />
                {campo.state.meta.errors.length > 0 && (
                  <small className="error">
                    {campo.state.meta.errors.join('. ')}
                  </small>
                )}
              </label>
            )}
          </formulario.Field>

          <formulario.Field
            name="full_name"
            validators={{
              onBlur: ({ value }) =>
                !value.trim()
                  ? 'El nombre completo es obligatorio.'
                  : undefined,
            }}
          >
            {(campo) => (
              <label>
                Nombre completo
                <input
                  className="campo"
                  autoComplete="name"
                  required
                  value={campo.state.value}
                  onChange={(event) => campo.handleChange(event.target.value)}
                  onBlur={campo.handleBlur}
                />
                {campo.state.meta.errors.length > 0 && (
                  <small className="error">
                    {campo.state.meta.errors.join('. ')}
                  </small>
                )}
              </label>
            )}
          </formulario.Field>

          <formulario.Field
            name="email"
            validators={{
              onBlur: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                  ? 'Ingresá un correo electrónico válido.'
                  : undefined,
            }}
          >
            {(campo) => (
              <label>
                Correo electrónico
                <input
                  className="campo"
                  type="email"
                  autoComplete="email"
                  required
                  value={campo.state.value}
                  onChange={(event) => campo.handleChange(event.target.value)}
                  onBlur={campo.handleBlur}
                />
                {campo.state.meta.errors.length > 0 && (
                  <small className="error">
                    {campo.state.meta.errors.join('. ')}
                  </small>
                )}
              </label>
            )}
          </formulario.Field>

          <formulario.Field
            name="password"
            validators={{
              onBlur: ({ value }) =>
                value.length < 8
                  ? 'La contraseña debe tener al menos 8 caracteres.'
                  : undefined,
            }}
          >
            {(campo) => (
              <label>
                Contraseña
                <input
                  className="campo"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={campo.state.value}
                  onChange={(event) => campo.handleChange(event.target.value)}
                  onBlur={campo.handleBlur}
                />
                <small className="muted">
                  Debe tener al menos 8 caracteres.
                </small>
                {campo.state.meta.errors.length > 0 && (
                  <small className="error">
                    {campo.state.meta.errors.join('. ')}
                  </small>
                )}
              </label>
            )}
          </formulario.Field>

          {error && <p className="error" role="alert">{error}</p>}

          <button
            className="boton mt-3"
            type="submit"
            disabled={formulario.state.isSubmitting}
          >
            {formulario.state.isSubmitting
              ? 'Creando cuenta…'
              : 'Registrarme'}
          </button>
        </form>

        <p className="mt-4">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </section>
    </main>
  )
}

export function SinPermisoPage() {
  return (
    <main className="contenedor">
      <h1 className="text-2xl">
        No tenés permisos para acceder a esta pantalla.
      </h1>
      <Link to="/">Volver al inicio</Link>
    </main>
  )
}
