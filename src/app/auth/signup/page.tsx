'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import GamifiedSignUpWizard from '@/components/auth/GamifiedSignUpWizard'

function SignUpContent() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {error && (
        <div className="fixed top-20 md:top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-md mx-auto p-4 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center backdrop-blur-sm">
          {error}
        </div>
      )}
      
      <GamifiedSignUpWizard onSwitchToSignIn={() => router.push('/auth/signin')} />
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
