import Cookies from 'js-cookie'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProtectedRoute } from '@/components/protected-route'
import { WindowControls } from '@/components/window-controls'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'

  return (
    <ProtectedRoute>
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar className="app-sidebar-wrapper" />
          <div
            id="content"
            className={cn(
              'ml-auto w-full max-w-full',
              'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
              'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
              'sm:transition-[width] sm:duration-200 sm:ease-linear',
              'flex h-svh flex-col',
              'group-data-[scroll-locked=1]/body:h-full',
              'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
            )}
          >
            <Header className="bg-background z-20 header-container" fixed={true}>
              <div className="flex w-full items-center justify-between header-content">
                {/* Tambahkan titlebar-drag-region yang tidak menutupi elemen interaktif */}
                <div className="absolute left-0 top-0 h-4 w-full titlebar-drag-region" />

                <div className="flex-shrink-0 pl-4">{/* Optional: Left-side components */}</div>
                <div className="mx-auto flex-grow flex items-center justify-center z-10">
                  <Search />
                </div>

                <div className="flex items-center justify-end z-10">
                  <div className="flex items-center space-x-4 header-right-section">
                    <ThemeSwitch />
                    <ProfileDropdown />
                  </div>
                  <WindowControls className="window-controls" />
                </div>
              </div>
            </Header>
            <Main className="pt-0 mt-14">
              <Outlet />
            </Main>
          </div>
        </SidebarProvider>
      </SearchProvider>
    </ProtectedRoute>
  )
}
