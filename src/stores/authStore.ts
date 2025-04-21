import { create } from 'zustand'
import { API_ENDPOINTS } from '@/config/api'

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null })

    try {
      const response = (await window.api.fetchApi(API_ENDPOINTS.AUTH.SIGN_IN, {
        method: 'POST',
        data: { email, password },
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      })) as AuthResponse

      set({
        user: response.user,
        token: response.token,
        isLoading: false
      })

      // Simpan di electron-store, tidak menggunakan cookies
      await window.api.store.set(SESSION_TOKEN, response.token)
      await window.api.store.set(SESSION_DATA, response.user)
    } catch (error) {
      console.error('Sign in failed:', error)
      set({
        error: 'Login failed. Please check your credentials.',
        isLoading: false
      })
      throw error
    }
  },

  signOut: async (): Promise<void> => {
    await window.api.store.delete(SESSION_TOKEN)
    await window.api.store.delete(SESSION_DATA)
    set({
      user: null,
      token: null,
      isLoading: false,
      error: null
    })
  },

  initialize: async (): Promise<void> => {
    const token = await window.api.store.get(SESSION_TOKEN)
    const userData = await window.api.store.get(SESSION_DATA)

    if (token && userData) {
      set({
        token,
        user: userData
      })
    }
  }
}))

// Helper hook
export const useAuth = () => useAuthStore()
