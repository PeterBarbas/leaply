'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect to profile settings by default
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?redirect=/dashboard/profile')
    } else if (!loading && user) {
      router.push('/dashboard/profile')
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

  return null // Will redirect
}
