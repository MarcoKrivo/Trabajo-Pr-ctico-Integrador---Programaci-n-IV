import {useEffect} from 'react'
import {AppRouter} from './routes/AppRouter'
import {useAuthStore} from './store/authStore'
export default function App(){const checkSession=useAuthStore(s=>s.checkSession);const setUsuario=useAuthStore(s=>s.setUsuario);useEffect(()=>{void checkSession();const salir=()=>setUsuario(null);window.addEventListener('sesion-finalizada',salir);return()=>window.removeEventListener('sesion-finalizada',salir)},[checkSession,setUsuario]);return <AppRouter/>}
