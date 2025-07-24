import { create } from 'zustand'
import { API_ENDPOINTS } from '@/config/api'
import { AuthResponse, AuthUser, LoginMethod } from '@/types/auth'

const AUTH_COOKIE_NAME = 'better-auth.session_token'
const USER_DATA_COOKIE_NAME = 'better-auth.session_data'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  signIn: (identifier: string, password: string, method?: LoginMethod) => Promise<void>
  signOut: () => void
  initialize: () => Promise<boolean>
  validateSession: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
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
      })) as AuthResponse

      set({
        user: response.user,
        token: response.token,
        isLoading: false
      })

      try {
        await Promise.all([
          window.api.cookies.set({ name: AUTH_COOKIE_NAME, value: response.token }),
          window.api.cookies.set({
            name: USER_DATA_COOKIE_NAME,
            value: JSON.stringify(response.user)
          })
        ])
      } catch (error) {
        if (import.meta.env.DEV)
          if (import.meta.env.DEV) console.error('Error storing session data locally:', error)
      }
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message || 'Sign in failed' })
      throw error
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await window.api.request(API_ENDPOINTS.AUTH.SIGN_OUT, {
        method: 'POST',
        data: {}
      })
    } catch (error) {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error during sign out:', error)
    } finally {
      await window.api.cookies.clearAuth()
      set({
        user: null,
        token: null,
        isLoading: false,
        error: null
      })
    }
  },

  validateSession: async (): Promise<boolean> => {
    const { token } = get()
    if (!token) return false

    try {
      await window.api.request(API_ENDPOINTS.AUTH.VALIDATE_SESSION, {
        method: 'GET'
      })
      return true
    } catch (error: any) {
      if (error?.status === 401 || error?.status === 403) {
        await window.api.cookies.clearAuth()
        set({
          user: null,
          token: null,
          isLoading: false
        })
      }
      return false
    }
  },

  initialize: async (): Promise<boolean> => {
    set({ isLoading: true })

    try {
      const [token, userDataStr] = await Promise.all([
        window.api.cookies.get(AUTH_COOKIE_NAME),
        window.api.cookies.get(USER_DATA_COOKIE_NAME)
      ])

      if (token && userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)
          set({
            token,
            user: userData,
            isLoading: false
          })

          return await get().validateSession()
        } catch (error) {
          if (import.meta.env.DEV)
            if (import.meta.env.DEV) console.error('Error parsing user data:', error)
          await window.api.cookies.clearAuth()
        }
      }

      set({ isLoading: false })
      return false
    } catch (error) {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Error during initialization:', error)
      set({ isLoading: false })
      return false
    }
  }
}))

export const useAuth = () => useAuthStore()
