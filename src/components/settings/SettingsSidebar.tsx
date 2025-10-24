'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Palette,
  Database,
  HelpCircle,
  LogOut,
  Filter,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

const settingsTabs = [
  {
    id: 'profile',
    label: 'Profile Information',
    icon: User,
    href: '/dashboard/profile',
    description: 'Manage your personal details'
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: Settings,
    href: '/dashboard/preferences',
    description: 'Customize your experience'
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Shield,
    href: '/dashboard/privacy',
    description: 'Control your data and security'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/dashboard/notifications',
    description: 'Manage notification preferences'
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    href: '/dashboard/appearance',
    description: 'Customize theme and display'
  },
  {
    id: 'data',
    label: 'Data & Export',
    icon: Database,
    href: '/dashboard/data',
    description: 'Manage your data and exports'
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    href: '/dashboard/help',
    description: 'Get help and contact support'
  }
]

export default function SettingsSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      if (result?.error) {
        console.error('Error signing out:', result.error)
      }
      // Redirect is handled in the signOut function
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 min-h-full lg:min-h-full">
      <div className="px-6 py-6 sm:p-6 h-full flex flex-col">
        <div className="flex mt-4 mb-4 items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close settings menu' : 'Open settings menu'}
            aria-haspopup="menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-background/70 hover:bg-foreground/5 transition"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
          </button>
        </div>
        
        <nav className={`space-y-1 flex-1 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          {settingsTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname === tab.href
            const isDisabled = tab.id !== 'profile'
            
            return (
              <div
                key={tab.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors group ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  isDisabled
                    ? 'text-muted-foreground/50'
                    : isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground group-hover:text-foreground'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    isDisabled
                      ? 'text-muted-foreground/50'
                      : isActive 
                      ? 'text-primary' 
                      : 'text-foreground'
                  }`}>
                    {tab.label}
                    {isDisabled && (
                      <span className="ml-2 text-xs text-muted-foreground/50">(Coming Soon)</span>
                    )}
                  </div>
                  <div className={`text-xs mt-0.5 hidden sm:block ${
                    isDisabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
