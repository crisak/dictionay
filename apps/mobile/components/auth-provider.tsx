'use client'
import { redirect } from 'next/navigation'

export const AuthProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  let isAuthenticated = false
  if (typeof window !== 'undefined') {
    isAuthenticated = Boolean(localStorage.getItem('token'))
  } else {
    console.warn('window is not defined')
  }

  if (!isAuthenticated) {
    redirect('/login')
  }

  return children
}
