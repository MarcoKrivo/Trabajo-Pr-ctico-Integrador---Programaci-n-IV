import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '../shared/api/axiosInstance'
import type { Usuario } from '../features/auth/types'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  checkSession: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUsuario: (usuario: Usuario | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      setUsuario: (usuario) => set({ usuario }),
      checkSession: async () => {
        set({ cargando: true })
        try {
          const respuesta = await api.get<Usuario>('/auth/me')
          set({ usuario: respuesta.data })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },
      login: async (username, password) => {
        const body = new URLSearchParams({ username, password })
        await api.post('/auth/token', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        const respuesta = await api.get<Usuario>('/auth/me')
        set({ usuario: respuesta.data, cargando: false })
      },
      logout: async () => {
        try {
          await api.post('/auth/logout')
        } finally {
          set({ usuario: null, cargando: false })
        }
      },
    }),
    {
      name: 'foodstore-sesion',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
