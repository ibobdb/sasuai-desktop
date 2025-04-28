import { useEffect, useState } from 'react'
import { useNavigate, useMatches } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, user, isLoading } = useAuth()
  const [isAuthReady, setIsAuthReady] = useState(false)
  const navigate = useNavigate()
  const matches = useMatches()

  // Check if current route requires authentication
  const isAuthenticatedRoute = matches.some((match) => match.routeId.includes('_authenticated'))

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize()
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        setIsAuthReady(true)
      }
    }

    initAuth()
  }, [initialize])

  // Handle redirects based on auth state
  useEffect(() => {
    if (isAuthReady && !isLoading) {
      if (isAuthenticatedRoute && !user) {
        navigate({ to: '/sign-in', replace: true })
      }
    }
  }, [isAuthReady, isLoading, user, isAuthenticatedRoute, navigate])

  // Show loading state while initializing auth
  if (!isAuthReady || (isLoading && isAuthenticatedRoute)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  // If we're on an auth route without a user, return nothing (will be redirected)
  if (isAuthenticatedRoute && !user) {
    return null
  }

  // Return children directly without context provider
  return children
}
