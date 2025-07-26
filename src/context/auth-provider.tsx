import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useMatches } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, user, isLoading } = useAuth()
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const navigate = useNavigate()
  const matches = useMatches()

  const isAuthenticatedRoute = useMemo(
    () => matches.some((match) => match.routeId.includes('_authenticated')),
    [matches]
  )

  // Initialize auth only once
  useEffect(() => {
    if (hasInitialized) return

    const initAuth = async () => {
      try {
        await initialize()
        setIsAuthReady(true)
        setHasInitialized(true)
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setIsAuthReady(true)
        setHasInitialized(true)
      }
    }

    initAuth()
  }, [initialize, hasInitialized])

  // Handle route-based redirects after auth is ready
  useEffect(() => {
    if (!isAuthReady || !hasInitialized) return

    if (isAuthenticatedRoute && !user && !isLoading) {
      navigate({ to: '/sign-in', replace: true })
    }
  }, [isAuthReady, hasInitialized, user, isLoading, isAuthenticatedRoute, navigate])

  // Show loading spinner only for authenticated routes
  if (!isAuthReady || (isLoading && isAuthenticatedRoute)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (isAuthenticatedRoute && !user) {
    return null
  }

  return children
}
