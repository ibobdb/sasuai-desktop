import { HTMLAttributes, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { useAuth } from '@/stores/authStore'
import { toast } from 'sonner'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

// A combined schema that accepts either email or username
const formSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: 'Please enter your email or username' })
    .refine(
      (value) => {
        // Either valid email or username with minimum length
        const isEmail = value.includes('@') && value.includes('.')
        const isUsername = !value.includes('@') && value.length >= 3
        return isEmail || isUsername
      },
      {
        message: 'Please enter a valid email or username (min 3 characters)'
      }
    ),
  password: z
    .string()
    .min(1, { message: 'Please enter your password' })
    .min(7, { message: 'Password must be at least 7 characters long' })
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { signIn, user, isLoading } = useAuth()
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: '', password: '' }
  })

  // Auto-redirect jika sudah login
  useEffect(() => {
    if (user) {
      navigate({ to: '/' })
    }
  }, [user, navigate])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // Determine login method based on identifier format
      const loginMethod = data.identifier.includes('@') ? 'email' : 'username'

      toast.promise(signIn(data.identifier, data.password, loginMethod), {
        loading: 'Logging in...',
        success: () => {
          navigate({ to: '/' })
          return 'Logged in successfully'
        },
        error: (error) => {
          // Reset form but preserve username/email
          form.reset({
            identifier: data.identifier,
            password: ''
          })

          // Display the proper error message to user
          if (error && typeof error === 'object') {
            if (typeof error.message === 'string') {
              return error.message
            }
          }

          return 'Login failed. Please check your credentials.'
        }
      })
    } catch (error) {
      // This should rarely be reached as toast.promise handles the error
      console.error('Unhandled login error:', error)
      toast.error('An unexpected error occurred during login')
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com or username"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-muted-foreground hover:opacity-75"
                      onClick={(e) => isLoading && e.preventDefault()}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-2" type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
