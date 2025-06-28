import type { ReactNode } from 'react'
import { MobileNav } from './mobile-nav'
import { DesktopNav } from './desktop-nav'

interface LayoutProps {
  children: ReactNode
}

export function LayoutNav({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <DesktopNav />
      <div className="flex-1 md:ml-64">
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  )
}
