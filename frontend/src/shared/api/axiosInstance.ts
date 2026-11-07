import axios from 'axios'
export const api = axios.create({baseURL: import.meta.env.VITE_API_URL, withCredentials: true})
api.interceptors.response.use(response => response, error => {
  const detalle = error.response?.data?.detail
  if (error.response?.status === 401 || (error.response?.status === 400 && detalle === 'Cuenta de usuario desactivada')) {
    if (!String(error.config?.url ?? '').includes('/auth/token') && !String(error.config?.url ?? '').includes('/auth/me')) {
      window.dispatchEvent(new Event('sesion-finalizada'))
    }
  }
  return Promise.reject(error)
})
