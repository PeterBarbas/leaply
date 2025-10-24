'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import SignInForm from '@/components/auth/SignInForm'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Check for auth errors in URL params
  useEffect(() => {
    const authError = searchParams.get('error')
    if (authError === 'auth_callback_error') {
      setError('Authentication failed. Please try again.')
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      const redirectTo = searchParams.get('redirect') || '/profile'
      router.push(redirectTo)
    }
  }, [user, loading, router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-white">
      {/* Error Message - Fixed Position */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center shadow-lg">
            {error}
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <SignInForm onSwitchToSignUp={() => router.push('/auth/signup')} />
      </div>
    </div>
  )
}
