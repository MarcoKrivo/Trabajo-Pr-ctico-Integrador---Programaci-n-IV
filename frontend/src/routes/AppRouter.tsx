import {BrowserRouter,Routes,Route,Navigate,Outlet} from 'react-router-dom'
import {ProtectedRoute} from './ProtectedRoute'
import {Navbar} from '../shared/layout/Navbar'
import {LoginPage,RegistroPage,SinPermisoPage} from '../features/auth/pages'
import {CatalogoPage} from '../features/productos/pages'
import {AdminCategoriasPage,AdminProductosPage,AdminUsuariosPage} from '../features/admin/pages'
import {CarritoPage,CheckoutPage,MisPedidosPage,AdminPedidosPage,AdminResumenPage} from '../features/pedidos/pages'
function Layout(){return <><Navbar/><Outlet/></>}
export function AppRouter(){return <BrowserRouter><Routes><Route element={<Layout/>}><Route path="/" element={<CatalogoPage/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/registro" element={<RegistroPage/>}/><Route path="/carrito" element={<CarritoPage/>}/><Route path="/unauthorized" element={<SinPermisoPage/>}/><Route element={<ProtectedRoute/>}><Route path="/checkout" element={<CheckoutPage/>}/><Route path="/mis-pedidos" element={<MisPedidosPage/>}/></Route><Route element={<ProtectedRoute roles={['admin']}/>}><Route path="/admin/resumen" element={<AdminResumenPage/>}/><Route path="/admin/categorias" element={<AdminCategoriasPage/>}/><Route path="/admin/productos" element={<AdminProductosPage/>}/><Route path="/admin/pedidos" element={<AdminPedidosPage/>}/><Route path="/admin/usuarios" element={<AdminUsuariosPage/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></BrowserRouter>}
