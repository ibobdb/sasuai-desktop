import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import { AuthProvider } from '@/context/auth-provider'
import { UpdaterProvider } from '@/context/updater-provider'
import { AutoUpdateCheck } from '@/components/auto-update-check'

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
            <AutoUpdateCheck />
          </UpdaterProvider>
        </AuthProvider>
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError
})
