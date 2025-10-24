'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('admin_authenticated')
      const adminKey = sessionStorage.getItem('admin_key')
      
      if (adminAuth === 'true' && adminKey) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // Redirect to admin sign in
        router.push('/admin/signin?redirect=' + encodeURIComponent(window.location.pathname + window.location.search))
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const signOut = () => {
    sessionStorage.removeItem('admin_authenticated')
    sessionStorage.removeItem('admin_key')
    setIsAuthenticated(false)
    router.push('/admin/signin')
  }

  return {
    isAuthenticated,
    loading,
    signOut
  }
}
