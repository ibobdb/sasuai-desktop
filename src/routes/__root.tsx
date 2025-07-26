import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import { AuthProvider } from '@/context/auth-provider'
import { UpdaterProvider } from '@/context/updater-provider'

// Lazy load AutoUpdateCheck component for better startup performance
const AutoUpdateCheck = lazy(() =>
  import('@/components/auto-update-check').then((module) => ({
    default: module.AutoUpdateCheck
  }))
)

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <>
        <AuthProvider>
          <UpdaterProvider>
            <NavigationProgress />
            <Outlet />
            <Toaster duration={3000} richColors position="bottom-right" />
            <Suspense fallback={null}>
              <AutoUpdateCheck />
            </Suspense>
          </UpdaterProvider>
        </AuthProvider>
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError
})
