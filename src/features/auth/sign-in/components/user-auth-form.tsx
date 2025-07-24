import { HTMLAttributes, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
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

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { t } = useTranslation(['auth'])
  const { signIn, user, isLoading } = useAuth()
  const navigate = useNavigate()

  // A combined schema that accepts either email or username
  const formSchema = z.object({
    identifier: z
      .string()
      .min(1, { message: t('auth.signIn.validation.identifierRequired') })
      .refine(
        (value) => {
          // Either valid email or username with minimum length
          const isEmail = value.includes('@') && value.includes('.')
          const isUsername = !value.includes('@') && value.length >= 3
          return isEmail || isUsername
        },
        {
          message: t('auth.signIn.validation.identifierInvalid')
        }
      ),
    password: z
      .string()
      .min(1, { message: t('auth.signIn.validation.passwordRequired') })
      .min(7, { message: t('auth.signIn.validation.passwordMinLength') })
  })

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
        loading: t('auth.signIn.toast.loading'),
        success: () => {
          navigate({ to: '/' })
          return t('auth.signIn.toast.success')
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

          return t('auth.signIn.toast.error')
        }
      })
    } catch (error) {
      // This should rarely be reached as toast.promise handles the error
      if (import.meta.env.DEV)
        if (import.meta.env.DEV) console.error('Unhandled login error:', error)
      toast.error(t('auth.signIn.toast.unexpectedError'))
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-base">
                    {t('auth.signIn.form.identifier.label')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('auth.signIn.form.identifier.placeholder')}
                      className="h-10 text-base"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base">
                      {t('auth.signIn.form.password.label')}
                    </FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
                      onClick={(e) => isLoading && e.preventDefault()}
                    >
                      {t('auth.signIn.form.forgotPassword')}
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('auth.signIn.form.password.placeholder')}
                      className="h-10 text-base"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
            <Button className="mt-2 h-11 text-base font-medium" type="submit" disabled={isLoading}>
              {isLoading ? t('auth.signIn.form.submitting') : t('auth.signIn.form.submitButton')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
