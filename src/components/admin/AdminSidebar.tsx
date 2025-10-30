'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { 
  Settings, 
  Users, 
  Activity,
  Shield, 
  Filter,
  X,
  LogOut,
  BarChart3
} from 'lucide-react'
import { useAdminAuth } from '@/lib/adminAuthClient'

const adminTabs = [
  {
    id: 'simulations',
    label: 'Simulation Management',
    icon: Settings,
    href: '/admin?tab=simulations',
    description: 'Manage simulations and their status'
  },
  {
    id: 'manual',
    label: 'Manual Simulations',
    icon: Settings,
    href: '/admin?tab=manual',
    description: 'Create simulations manually with custom steps'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    href: '/admin?tab=users',
    description: 'View and manage users'
  },
  {
    id: 'activity',
    label: 'Activity Monitor',
    icon: Activity,
    href: '/admin?tab=activity',
    description: 'Monitor user activity and system health'
  },
  {
    id: 'experiment',
    label: 'Experiment Analytics',
    icon: BarChart3,
    href: '/admin?tab=experiment',
    description: 'Track fake door experiment performance'
  },
  {
    id: 'settings',
    label: 'Admin Settings',
    icon: Shield,
    href: '/admin?tab=settings',
    description: 'Configure admin panel settings'
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { signOut } = useAdminAuth()

  return (
      <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 lg:min-h-full">
        <div className="px-6 py-6 sm:p-6 lg:h-full flex flex-col">
        <div className="flex mt-4 mb-4 items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close admin menu' : 'Open admin menu'}
            aria-haspopup="menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-background/70 hover:bg-foreground/5 transition"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
          </button>
        </div>
        
        <nav className={`space-y-1 flex-1 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          {adminTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.href.split('?')[0] && useSearchParams().get('tab') === tab.id
            
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground group-hover:text-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-foreground'
                  }`}>
                    {tab.label}
                  </div>
                  <div className={`text-xs mt-0.5 hidden sm:block ${
                    isActive ? 'text-primary/80' : 'text-muted-foreground'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>
        
        {/* Sign Out Button */}
        <div className="mt-auto pt-4">
          <button
            onClick={signOut}
            className="flex items-center gap-3 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-gray-50 w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
