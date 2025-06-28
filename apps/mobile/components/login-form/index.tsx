'use client'
import { cn } from '@repo/mobile-ui/lib/utils'
import { Button } from '@repo/mobile-ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/mobile-ui/components/card'
import { Input } from '@repo/mobile-ui/components/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/mobile-ui/components/form'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { redirect } from 'next/navigation'
import { useTranslations } from 'next-intl'

const VALID_PASSWORD = '$2b$10$qVszOd0RJE6vVRD2N0NJTO7xjUTnL4lK8EbdjlNIm7c2oM0Xfmg/G'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

async function checkPassword(password: string, hashed: string) {
  const match = await bcrypt.compare(password, hashed)
  return match
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations('login')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const email = values.email
    const password = values.password

    const mergePassword = email + password

    checkPassword(mergePassword, VALID_PASSWORD).then((match) => {
      if (!match) {
        console.error('Password does not match')

        toast.error('Invalid email or password', {
          id: 'login-error',
          closeButton: true,
        })
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'token',
          JSON.stringify({
            email: email,
            username: 'John Doe',
          }),
        )
      }

      setTimeout(() => {
        redirect('/profile')
      }, 100)
    })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('welcome')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} role="form">
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button disabled variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                        fill="currentColor"
                      />
                    </svg>
                    {t('loginWithApple')}
                  </Button>
                  <Button disabled variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    {t('loginWithGoogle')}
                  </Button>
                </div>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    {t('orContinueWith')}
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('email')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('email')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-2" data-testid="email-field">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('password')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('password')}
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>{t('passwordDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <a
                      href="#"
                      className="mt-2 ml-auto text-sm underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground text-muted-foreground"
                    >
                      {t('forgotPassword')}
                    </a>
                  </div>
                  <Button type="submit" className="w-full">
                    {t('loginButton')}
                  </Button>
                </div>
                <div className="text-center text-sm disabled:cursor-not-allowed disabled:text-muted-foreground text-muted-foreground">
                  {t('noAccount')}{' '}
                  <a href="#" className="underline underline-offset-4">
                    {t('signUp')}
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        {/* {t.rich('termsAndPrivacy', {
          termsLink: (chunks) => <a href="/terms">{chunks}</a>,
          privacyLink: (chunks) => <a href="/privacy">{chunks}</a>,
        })} */}
      </div>
    </div>
  )
}
