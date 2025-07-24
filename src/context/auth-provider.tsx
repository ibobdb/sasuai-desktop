import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useMatches } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, user, isLoading } = useAuth()
  const [isAuthReady, setIsAuthReady] = useState(false)
  const navigate = useNavigate()
  const matches = useMatches()

  const isAuthenticatedRoute = useMemo(
    () => matches.some((match) => match.routeId.includes('_authenticated')),
    [matches]
  )

  const initAuth = useCallback(async () => {
    try {
      const hasValidSession = await initialize()
      if (!hasValidSession && isAuthenticatedRoute) {
        navigate({ to: '/sign-in', replace: true })
      }
    } catch (error) {
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Failed to initialize auth:', error)
      if (isAuthenticatedRoute) {
        navigate({ to: '/sign-in', replace: true })
      }
    } finally {
      setIsAuthReady(true)
    }
  }, [initialize, isAuthenticatedRoute, navigate])

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (isAuthReady && !isLoading && isAuthenticatedRoute && !user) {
      navigate({ to: '/sign-in', replace: true })
    }
  }, [isAuthReady, isLoading, user, isAuthenticatedRoute, navigate])

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
