import {Navigate,Outlet} from 'react-router-dom'
import {useAuthStore} from '../store/authStore'
export function ProtectedRoute({roles}:{roles?:string[]}){const {usuario,cargando}=useAuthStore();if(cargando)return <p className="contenedor">Verificando sesión…</p>;if(!usuario)return <Navigate to="/login" replace/>;if(roles&&!roles.includes(usuario.role))return <Navigate to="/unauthorized" replace/>;return <Outlet/>}
