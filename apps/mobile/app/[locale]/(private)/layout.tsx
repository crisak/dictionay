import { AuthProvider } from '@/components/auth-provider'
import { LayoutNav } from '@/components/navigation/layout-nav'

export default function AuthenticationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <LayoutNav>{children}</LayoutNav>
    </AuthProvider>
  )
}
