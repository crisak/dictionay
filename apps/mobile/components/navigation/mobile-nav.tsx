'use client'

import { Home, PieChart, User, Receipt } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@repo/mobile-ui/lib/utils'

const navItems = [
  {
    name: 'Home',
    href: '/home',
    icon: Home,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: Receipt,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: PieChart,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full grid-cols-4 mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 group',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
