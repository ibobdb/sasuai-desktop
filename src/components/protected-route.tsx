import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialize } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    initialize() // Pastikan auth state terinisialisasi
  }, [initialize])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/sign-in', replace: true })
    }
  }, [user, isLoading, navigate])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return children
}
