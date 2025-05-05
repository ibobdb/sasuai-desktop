import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { ForgotForm } from './components/forgot-password-form'
import { AlertCircle } from 'lucide-react'
import lightIllustration from '../../../../resources/public/auth-forgot-password-illustration-light.png?asset'
import darkIllustration from '../../../../resources/public/auth-forgot-password-illustration-dark.png?asset'
import { Link } from '@tanstack/react-router'
import { useTheme } from '@/context/theme-context'

export default function ForgotPassword() {
  const { theme } = useTheme()
  const isDarkTheme =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Select illustration based on theme
  const illustration = isDarkTheme ? darkIllustration : lightIllustration

  return (
    <AuthLayout
      illustration={illustration}
      title="Password Recovery"
      tagline="We'll help you recover your account"
    >
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
    </AuthLayout>
  )
}
