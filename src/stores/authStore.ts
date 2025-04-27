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
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
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
      // Don't set expiration, use the one provided by the server
      try {
        await window.api.cookies.set(SESSION_TOKEN, response.token)
        await window.api.cookies.set(SESSION_DATA, JSON.stringify(response.user))
      } catch (error) {
        console.error('Error storing session data locally:', error)
      }
    } catch (error) {
      console.error('Sign in API error:', error)
      throw error
    }
  },

  signOut: async (): Promise<void> => {
    try {
      // Send request to sign out endpoint
      await window.api.request(API_ENDPOINTS.AUTH.SIGN_OUT, {
        method: 'POST',
        data: {}
      })
    } catch (error) {
      console.error('Sign out API error:', error)
    } finally {
      // Even if API fails, clear local state and cookies
      await window.api.cookies.clearAuth()
      set({
        user: null,
        token: null,
        isLoading: false,
        error: null
      })
    }
  },

  initialize: async (): Promise<void> => {
    set({ isLoading: true })

    try {
      console.log('Initializing auth store, checking for existing session...')
      const token = await window.api.cookies.get(SESSION_TOKEN)
      const userDataStr = await window.api.cookies.get(SESSION_DATA)

      console.log('Session token found:', token ? 'yes' : 'no')
      console.log('User data found:', userDataStr ? 'yes' : 'no')

      if (token && userDataStr) {
        try {
          // First set the user state to prevent flashing login screen
          const userData = JSON.parse(userDataStr)
          set({
            token,
            user: userData,
            isLoading: false
          })

          console.log('Auth state set from cookies, validating with server...')

          // Then validate in background
          window.api
            .request(API_ENDPOINTS.AUTH.VALIDATE_SESSION, {
              method: 'GET'
            })
            .then(() => {
              console.log('Session validated successfully')
            })
            .catch(async (error) => {
              console.error('Session validation failed:', error)
              // Clear cookies and state on validation failure
              await window.api.cookies.clearAuth()
              set({
                user: null,
                token: null,
                isLoading: false
              })
            })

          return
        } catch (error) {
          console.error('Error processing session data:', error)
          // Clear cookies on error
          await window.api.cookies.clearAuth()
        }
      }

      // Set loading false if no valid session was found
      set({ isLoading: false })
    } catch (error) {
      console.error('Failed to initialize auth store:', error)
      set({ isLoading: false })
    }
  }
}))

// Helper hook
export const useAuth = () => useAuthStore()
