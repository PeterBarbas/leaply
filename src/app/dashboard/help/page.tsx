'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import SettingsLayout from '@/components/settings/SettingsLayout'
import PlaceholderTab from '@/components/settings/PlaceholderTab'
import { HelpCircle } from 'lucide-react'

export default function HelpPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?redirect=/dashboard/help')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <SettingsLayout>
      <PlaceholderTab
        title="Help & Support"
        description="Get help and contact support."
        icon={HelpCircle}
      />
    </SettingsLayout>
  )
}
