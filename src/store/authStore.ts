import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logout as apiLogout } from '../api/auth'
import { setStoredToken } from '../api/client'
import type { AuthResponse, Permission, User } from '../types/api'

interface AuthState {
  user: User | null
  token: string | null
  permissions: Permission[]
  isAuthenticated: boolean
  logout: () => void
  setUser: (user: User | null) => void
  setAuth: (response: AuthResponse) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,

      logout: () => {
        apiLogout()
        set({ user: null, token: null, permissions: [], isAuthenticated: false })
      },

      setUser: (user) => set({ user }),

      setAuth: ({ user, token, permissions }) =>
        set({ user, token, permissions: permissions ?? [], isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        permissions: s.permissions,
        isAuthenticated: !!s.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setStoredToken(state.token)
        }
      },
    }
  )
)
