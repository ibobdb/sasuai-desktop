import { create } from 'zustand'
import { API_ENDPOINTS } from '@/config/api'
import { AuthResponse, AuthUser, LoginMethod } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  signIn: (identifier: string, password: string, method?: LoginMethod) => Promise<void>
  signOut: () => void
  initialize: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signIn: async (
    identifier: string,
    password: string,
    method: LoginMethod = 'email'
  ): Promise<void> => {
    set({ isLoading: true, error: null })

    try {
      const data =
        method === 'email' ? { email: identifier, password } : { username: identifier, password }

      const endpoint =
        method === 'email' ? API_ENDPOINTS.AUTH.SIGN_IN_EMAIL : API_ENDPOINTS.AUTH.SIGN_IN_USERNAME

      const response = (await window.api.request(endpoint, {
        method: 'POST',
        data
      })) as AuthResponse & { cookies?: string[] }

      set({
        user: response.user,
        isLoading: false
      })
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message || 'Sign in failed' })
      throw error
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await window.api.cookies.clearAuth()
      set({ user: null, isLoading: false, error: null })

      window.api.request(API_ENDPOINTS.AUTH.SIGN_OUT, { method: 'POST', data: {} }).catch(() => {})
    } catch {
      await window.api.cookies.clearAuth()
      set({ user: null, isLoading: false, error: null })
    }
  },

  initialize: async (): Promise<boolean> => {
    set({ isLoading: true })

    try {
      const response = (await window.api.request(API_ENDPOINTS.AUTH.VALIDATE_SESSION, {
        method: 'GET'
      })) as { user: AuthUser }

      set({
        user: response.user,
        isLoading: false
      })

      return true
    } catch {
      set({ user: null, isLoading: false })
      return false
    }
  }
}))

export const useAuth = () => useAuthStore()
