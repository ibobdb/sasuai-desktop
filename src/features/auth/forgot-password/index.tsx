import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { ForgotForm } from './components/forgot-password-form'
import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import lightIllustration from '../../../../resources/public/auth-forgot-password-illustration-light.png?asset'
import darkIllustration from '../../../../resources/public/auth-forgot-password-illustration-dark.png?asset'
import logo from '../../../../resources/public/logo.png?asset'
import { Link } from '@tanstack/react-router'

export default function ForgotPassword() {
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  // Check for dark mode preference
  useEffect(() => {
    // Initial check
    const isDark =
      window.matchMedia('(prefers-color-scheme: dark)').matches ||
      document.documentElement.classList.contains('dark')
    setIsDarkTheme(isDark)

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => setIsDarkTheme(e.matches)

    mediaQuery.addEventListener('change', handleChange)

    // Also check for class changes on html element for theme toggles
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setIsDarkTheme(isDark)
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      observer.disconnect()
    }
  }, [])

  // Select illustration based on theme
  const illustration = isDarkTheme ? darkIllustration : lightIllustration

  return (
    <AuthLayout>
      <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
        {/* Illustration Section */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-primary/5 to-primary/20 w-1/2 overflow-hidden">
          <div className="relative w-full h-full flex flex-col justify-center items-center p-6">
            {/* Background circle */}
            <div className="absolute w-[350px] h-[350px] bg-primary/15 rounded-full"></div>

            {/* Illustration */}
            <div className="flex-1 flex items-center justify-center w-full">
              <img
                src={illustration}
                alt="Forgot Password Illustration"
                className="max-h-[calc(100vh-180px)] w-auto object-contain drop-shadow-xl"
                style={{ maxWidth: '90%' }}
              />
            </div>

            {/* Brand tagline */}
            <div className="mt-4 text-center z-10">
              <h2 className="text-2xl font-medium text-primary">Sasuai Store</h2>
              <p className="text-muted-foreground mt-1.5 text-base leading-relaxed">
                Modern solutions for modern business
              </p>
            </div>
          </div>
        </div>

        {/* Forgot Password Form Section - Improved UI */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-auto">
          <div className="w-full max-w-[480px] space-y-7">
            {/* Logo and welcome text */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center bg-primary/5 p-3.5 rounded-full">
                <img src={logo} alt="Sasuai Store" className="h-20 w-20 object-contain" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-medium text-primary">Password Recovery</h2>
              </div>
            </div>

            <Card className="p-7 shadow-lg border-primary/10">
              <div className="flex items-center mb-2">
                <AlertCircle className="mr-3 h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Forgot Password</h2>
              </div>

              <div className="mb-5">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Enter your registered email address and we&apos;ll send you a link to reset your
                  password.
                </p>
              </div>

              <ForgotForm />

              <div className="mt-6 text-center">
                <Link
                  to="/sign-in"
                  className="inline-flex items-center text-primary font-medium hover:underline transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </Card>

            {/* Support link */}
            <div className="text-center text-base text-muted-foreground">
              Need help?{' '}
              <a
                href="/support"
                className="text-primary font-medium hover:underline transition-colors"
              >
                Contact support
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
