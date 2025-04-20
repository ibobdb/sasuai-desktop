import Cookies from 'js-cookie'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex flex-col h-svh">
          {/* Header with window controls */}
          <Header fixed showWindowControls>
            {/* Center section - Search with extreme width */}
            <div className="flex-1 max-w-full">
              <Search className="w-full max-w-[1000px] mx-auto" placeholder="Search..." />
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              <ThemeSwitch />
              <ProfileDropdown />
            </div>
          </Header>

          {/* Main content area with sidebar and content */}
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <div
              id="content"
              className={cn(
                'ml-auto w-full max-w-full',
                'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
                'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
                'transition-[width] duration-200 ease-linear',
                'flex flex-col',
                'overflow-y-auto',
                'mt-12'
              )}
            >
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
