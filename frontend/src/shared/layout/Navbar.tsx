import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export function Navbar() {
  const { usuario, logout } = useAuthStore()
  const cantidad = useCartStore((s) => s.items.reduce((n, x) => n + x.cantidad, 0))
  const navigate = useNavigate()

  return (
    <header className="barra">
      <div className="contenedor flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="marca" aria-label="Food Store, ir al catálogo">
          <img src="/foodstore-icon.svg" alt="" className="marca-icono" />
          <span>Food Store</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3">
          <Link to="/">Catálogo</Link>
          <Link to="/carrito">Carrito ({cantidad})</Link>
          {usuario && <Link to="/mis-pedidos">Mis pedidos</Link>}
          {usuario?.role === 'admin' && <>
            <Link to="/admin/resumen">Resumen</Link>
            <Link to="/admin/categorias">Categorías</Link>
            <Link to="/admin/productos">Productos</Link>
            <Link to="/admin/pedidos">Pedidos</Link>
            <Link to="/admin/usuarios">Usuarios</Link>
          </>}
          {usuario ? <>
            <span>{usuario.full_name}</span>
            <button onClick={async () => { await logout(); navigate('/login') }}>Cerrar sesión</button>
          </> : <Link to="/login">Ingresar</Link>}
        </nav>
      </div>
    </header>
  )
}
