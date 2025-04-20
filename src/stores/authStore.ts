import Cookies from 'js-cookie'
import { create } from 'zustand'

// Nama cookies dari response
const SESSION_TOKEN = 'better-auth.session_token'
const SESSION_DATA = 'better-auth.session_data'

interface AuthUser {
  id: string
  email: string
  name: string
  image: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface AuthResponse {
  redirect: boolean
  token: string
  user: AuthUser
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null })

    try {
      const response = (await window.api.fetchApi('http://localhost:3000/api/auth/sign-in/email', {
        method: 'POST',
        data: { email, password },
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })) as AuthResponse

      set({
        user: response.user,
        token: response.token,
        isLoading: false
      })

      Cookies.set(SESSION_TOKEN, response.token)
      Cookies.set(SESSION_DATA, JSON.stringify(response.user))
    } catch (error) {
      console.error('Sign in failed:', error)
      set({
        error: 'Login failed. Please check your credentials.',
        isLoading: false
      })
      throw error
    }
  },

  signOut: (): void => {
    Cookies.remove(SESSION_TOKEN)
    Cookies.remove(SESSION_DATA)
    set({
      user: null,
      token: null,
      isLoading: false,
      error: null
    })
  },

  initialize: (): void => {
    const token = Cookies.get(SESSION_TOKEN)
    const userData = Cookies.get(SESSION_DATA)

    if (token && userData) {
      try {
        set({
          token,
          user: JSON.parse(userData)
        })
      } catch (e) {
        console.error('Failed to parse user data:', e)
        get().signOut()
      }
    }
  }
}))

// Helper hook
export const useAuth = () => useAuthStore()
