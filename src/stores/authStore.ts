import { create } from 'zustand'
import { API_ENDPOINTS } from '@/config/api'
import { AuthResponse, AuthUser, LoginMethod } from '@/types/auth'

// Cookie names - should match the ones from Better Auth backend
const SESSION_TOKEN = 'better-auth.session_token'
const SESSION_DATA = 'better-auth.session_data'

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

      // Choose correct endpoint based on method
      const endpoint =
        method === 'email' ? API_ENDPOINTS.AUTH.SIGN_IN_EMAIL : API_ENDPOINTS.AUTH.SIGN_IN_USERNAME

      const response = (await window.api.request(endpoint, {
        method: 'POST',
        data
      })) as AuthResponse

      // Set state from response
      set({
        user: response.user,
        token: response.token,
        isLoading: false
      })

      // Store session data in persistent cookies
      try {
        await window.api.cookies.set(SESSION_TOKEN, response.token)
        await window.api.cookies.set(SESSION_DATA, JSON.stringify(response.user))
      } catch (error) {
        console.error('Error storing session data locally:', error)
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
      console.error('Error during sign out:', error)
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
      // Only clear auth if it's an explicit auth error
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
      // Get token and user data in one batch to reduce redundant lookups
      const [token, userDataStr] = await Promise.all([
        window.api.cookies.get(SESSION_TOKEN),
        window.api.cookies.get(SESSION_DATA)
      ])

      if (token && userDataStr) {
        try {
          // Set user state to prevent flashing login screen
          const userData = JSON.parse(userDataStr)
          set({
            token,
            user: userData,
            isLoading: false
          })

          // Validate session with server and return result
          return await get().validateSession()
        } catch (error) {
          console.error('Error parsing user data:', error)
          await window.api.cookies.clearAuth()
        }
      }

      // No valid session found
      set({ isLoading: false })
      return false
    } catch (error) {
      console.error('Error during initialization:', error)
      set({ isLoading: false })
      return false
    }
  }
}))

// Helper hook
export const useAuth = () => useAuthStore()
