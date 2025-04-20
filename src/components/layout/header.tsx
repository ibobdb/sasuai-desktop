import React from 'react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNav } from './top-nav'
import { WindowControls } from '@/components/window-controls'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
  showWindowControls?: boolean
  navLinks?: Array<{
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
  }>
}

export const Header = ({
  className,
  fixed,
  children,
  showWindowControls = true,
  navLinks,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up event listeners
    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'flex h-12 items-center bg-background border-b titlebar-drag-region',
        fixed && 'header-fixed peer/header fixed z-50 w-full top-0 left-0 right-0',
        offset > 10 && fixed ? 'shadow-sm' : '',
        className
      )}
      {...props}
    >
      <div className="flex w-full h-full px-2">
        {/* Left section - Navigation and sidebar controls */}
        <div className="flex items-center gap-2 titlebar-no-drag w-[200px]">
          <SidebarTrigger variant="ghost" size="sm" className="h-8 w-8" />
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-7 w-7"
              onClick={() => window.history.back()}
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-7 w-7"
              onClick={() => window.history.forward()}
            >
              <ChevronRight size={18} />
            </Button>
          </div>

          {/* Navigation links if provided */}
          {navLinks && <TopNav links={navLinks} className="ml-4" />}
        </div>

        {/* Center section - Improved centering */}
        <div className="flex-1 flex justify-center items-center titlebar-drag-region">
          {Array.isArray(children) ? (
            <div className="titlebar-no-drag">{children[0]}</div>
          ) : (
            <div className="titlebar-no-drag">{children}</div>
          )}
        </div>

        {/* Right section - User controls and window controls */}
        <div className="flex items-center gap-2 w-[200px] justify-end">
          {/* User controls - Show second child if Array */}
          {Array.isArray(children) && children[1] && (
            <div className="flex items-center titlebar-no-drag">{children[1]}</div>
          )}

          {/* Window controls */}
          {showWindowControls && (
            <div className="flex items-center titlebar-no-drag">
              <WindowControls className="relative" />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

Header.displayName = 'Header'
