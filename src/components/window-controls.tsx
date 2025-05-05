import { useState, useEffect } from 'react'
import { X, Minus, Square, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

// Define ElectronWindowAPI interface
interface ElectronWindowAPI {
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<void>
  isWindowMaximized: () => Promise<boolean>
  onWindowStateChange: (callback: (isMaximized: boolean) => void) => () => void
}

// Add global declaration for electronAPI
declare global {
  interface Window {
    electronAPI?: ElectronWindowAPI
  }
}

interface WindowControlsProps {
  className?: string
}

export function WindowControls({ className }: WindowControlsProps) {
  const [isMaximized, setIsMaximized] = useState<boolean>(false)
  const { t } = useTranslation(['common'])

  useEffect(() => {
    // Check initial window state
    const checkMaximized = async (): Promise<void> => {
      if (window.electronAPI?.isWindowMaximized) {
        try {
          const maximized = await window.electronAPI.isWindowMaximized()
          setIsMaximized(maximized)
        } catch (error) {
          console.error('Failed to check window state:', error)
        }
      }
    }

    checkMaximized()

    // Subscribe to window state changes
    let unsubscribe: (() => void) | undefined
    if (window.electronAPI?.onWindowStateChange) {
      unsubscribe = window.electronAPI.onWindowStateChange((maximized: boolean) =>
        setIsMaximized(maximized)
      )
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleMinimizeClick = async (): Promise<void> => {
    if (window.electronAPI?.minimizeWindow) {
      try {
        await window.electronAPI.minimizeWindow()
      } catch (error) {
        console.error('Failed to minimize window:', error)
      }
    }
  }

  const handleMaximizeClick = async (): Promise<void> => {
    if (window.electronAPI?.maximizeWindow) {
      try {
        const newMaximized = await window.electronAPI.maximizeWindow()
        setIsMaximized(newMaximized)
      } catch (error) {
        console.error('Failed to toggle maximize state:', error)
      }
    }
  }

  const handleCloseClick = async (): Promise<void> => {
    if (window.electronAPI?.closeWindow) {
      try {
        await window.electronAPI.closeWindow()
      } catch (error) {
        console.error('Failed to close window:', error)
      }
    }
  }

  return (
    <div className={cn('flex items-center titlebar-no-drag', className)}>
      <div className="flex">
        {/* Minimize Button */}
        <div className="group relative">
          <button
            onClick={handleMinimizeClick}
            className="h-8 w-10 inline-flex items-center justify-center hover:bg-muted/60 transition-colors duration-150 focus:outline-none"
            aria-label="Minimize"
            type="button"
            title={t('actions.minimize')}
          >
            <Minus size={12} className="text-foreground/70" />
          </button>
        </div>

        {/* Maximize Button */}
        <div className="group relative">
          <button
            onClick={handleMaximizeClick}
            className="h-8 w-10 inline-flex items-center justify-center hover:bg-muted/60 transition-colors duration-150 focus:outline-none"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            type="button"
            title={isMaximized ? t('actions.restore') : t('actions.maximize')}
          >
            {isMaximized ? (
              <Square size={10} className="text-foreground/70" />
            ) : (
              <Maximize2 size={10} className="text-foreground/70" />
            )}
          </button>
        </div>

        {/* Close Button */}
        <div className="group relative">
          <button
            onClick={handleCloseClick}
            className="h-8 w-10 inline-flex items-center justify-center hover:bg-destructive/80 hover:text-destructive-foreground transition-colors duration-150 focus:outline-none"
            aria-label="Close"
            type="button"
            title={t('actions.close')}
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
