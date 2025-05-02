import { WindowControls } from '@/components/window-controls'
import { useEffect } from 'react'

interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  // Add page transition effect
  useEffect(() => {
    document.body.classList.add('auth-page-loaded')
    return () => {
      document.body.classList.remove('auth-page-loaded')
    }
  }, [])

  return (
    <div className="h-svh flex flex-col bg-background relative">
      {/* Drag area only covers non-content areas */}
      <div className="h-10 w-full titlebar-drag-region absolute top-0 left-0 pointer-events-none">
        {/* Re-enable pointer events only for window controls */}
        <div className="absolute top-2 right-2 z-50 pointer-events-auto">
          <WindowControls />
        </div>
      </div>

      {/* Content area - full height, no padding */}
      <div className="flex-1 animate-fadeIn">{children}</div>
    </div>
  )
}
