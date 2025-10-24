'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Shield, AlertCircle, Mail, CheckCircle } from 'lucide-react'

export default function AdminSignIn() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState('')
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store admin session
      sessionStorage.setItem('admin_authenticated', 'true')
      sessionStorage.setItem('admin_key', password)
      
      // Redirect to intended page
      router.push(redirectTo)
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setForgotPasswordError('')
    setForgotPasswordSuccess(false)

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setForgotPasswordSuccess(true)
      
      // For development, show the reset URL in console
      if (data.resetUrl) {
        console.log('Reset URL:', data.resetUrl)
      }
    } catch (err: any) {
      setForgotPasswordError(err.message || 'Failed to send reset email')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  return (
    <div className="bg-white py-10 flex items-center justify-center">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Sign In</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your admin password to access the admin panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Admin Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password.trim()}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="text-center">
              <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Reset Password
                    </DialogTitle>
                  </DialogHeader>
                  
                  {forgotPasswordSuccess ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Reset instructions sent to your email
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Check your email for password reset instructions. The link will expire in 15 minutes.
                      </p>
                      <Button 
                        onClick={() => setForgotPasswordOpen(false)} 
                        className="w-full"
                      >
                        Close
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="reset-email" className="text-sm font-medium">
                          Admin Email
                        </label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your admin email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          required
                          disabled={forgotPasswordLoading}
                        />
                      </div>
                      
                      {forgotPasswordError && (
                        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {forgotPasswordError}
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={forgotPasswordLoading || !forgotPasswordEmail.trim()}
                      >
                        {forgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
