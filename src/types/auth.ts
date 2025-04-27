export interface AuthUser {
  id: string
  email: string
  name: string
  image?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  role?: UserRole
}

export type UserRole = 'user' | 'admin'

export interface AuthResponse {
  token: string
  user: AuthUser
  redirect?: boolean
  redirectUrl?: string
}

export type LoginMethod = 'email' | 'username'

export interface PasswordResetRequest {
  email: string
}
