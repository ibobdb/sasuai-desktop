import { WindowControls } from '@/components/window-controls'
import { useEffect } from 'react'
import logo from '../../../resources/public/logo.png?asset'

interface Props {
  children?: React.ReactNode
  illustration?: string
  title: string
  subtitle?: string
  tagline?: string
}

// Component that handles common layout structure for auth pages
export default function AuthLayout({
  children,
  illustration,
  title,
  subtitle,
  tagline = 'Modern solutions for modern business'
}: Props) {
  useEffect(() => {
    document.body.classList.add('auth-page-loaded')
    return () => {
      document.body.classList.remove('auth-page-loaded')
    }
  }, [])

  return (
    <div className="h-svh flex flex-col bg-background relative">
      <div className="h-10 w-full titlebar-drag-region absolute top-0 left-0 pointer-events-none">
        <div className="absolute top-2 right-2 z-50 pointer-events-auto">
          <WindowControls />
        </div>
      </div>

      <div className="flex-1 animate-fadeIn">
        <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
          {illustration && (
            <div className="hidden lg:flex relative bg-gradient-to-br from-primary/5 to-primary/20 w-1/2 overflow-hidden">
              <div className="relative w-full h-full flex flex-col justify-center items-center p-6">
                <div className="absolute w-[350px] h-[350px] bg-primary/15 rounded-full"></div>

                {/* Illustration */}
                <div className="flex-1 flex items-center justify-center w-full">
                  <img
                    src={illustration}
                    alt={`${title} Illustration`}
                    className="max-h-[calc(100vh-180px)] w-auto object-contain drop-shadow-xl"
                    style={{ maxWidth: '90%' }}
                  />
                </div>

                {/* Brand tagline */}
                <div className="mt-4 text-center z-10">
                  <h2 className="text-2xl font-medium text-primary">Sasuai Store</h2>
                  <p className="text-muted-foreground mt-1.5 text-base leading-relaxed">
                    {tagline}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-auto">
            <div className="w-full max-w-[480px] space-y-7">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex items-center justify-center bg-primary/5 p-3.5 rounded-full">
                  <img src={logo} alt="Sasuai Store" className="h-20 w-20 object-contain" />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-medium text-primary">{title}</h1>
                  {subtitle && (
                    <p className="text-muted-foreground text-lg leading-relaxed">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Main content - children */}
              {children}

              {/* Support link */}
              <div className="text-center text-base text-muted-foreground">
                Need help?{' '}
                <a
                  href="https://nestorzamili.works/#contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline transition-colors"
                >
                  Contact support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
