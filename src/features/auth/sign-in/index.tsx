import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'
import { LogIn } from 'lucide-react'
import lightIllustration from '../../../../resources/public/auth-login-illustration-light.png?asset'
import darkIllustration from '../../../../resources/public/auth-login-illustration-dark.png?asset'
import { useTheme } from '@/context/theme-context'

export default function SignIn() {
  const { theme } = useTheme()
  const isDarkTheme =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Select illustration based on theme
  const illustration = isDarkTheme ? darkIllustration : lightIllustration

  return (
    <AuthLayout
      illustration={illustration}
      title="Welcome back"
      subtitle="Sign in to continue to Sasuai Store"
    >
      <Card className="p-7 shadow-lg border-primary/10">
        <div className="flex items-center mb-5">
          <LogIn className="mr-3 h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Sign In</h2>
        </div>

        <UserAuthForm />

        <div className="mt-6">
          <div className="pt-2 text-center text-sm text-muted-foreground">
            <p className="leading-relaxed">
              By signing in, you agree to our{' '}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </Card>
    </AuthLayout>
  )
}
