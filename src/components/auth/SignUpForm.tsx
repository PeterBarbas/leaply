'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { SignUpSchema, type SignUpData } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

export default function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const router = useRouter()
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignUpData>({
    name: '',
    email: '',
    password: '',
    terms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate form data
      const validatedData = SignUpSchema.parse(formData)
      
      const { error } = await signUp(validatedData.email, validatedData.password, validatedData.name)
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(error.message)
        }
      } else {
        // Success - redirect to dashboard or call onSuccess
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/profile')
        }
      }
    } catch (validationError: any) {
      if (validationError.name === 'ZodError') {
        setError(validationError.errors[0]?.message || 'Please check your input')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }


  const handleInputChange = (field: keyof SignUpData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Join Leaply to explore your career potential
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Create a password (min 8 characters)"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="terms"
            checked={formData.terms}
            onCheckedChange={(checked) => handleInputChange('terms', checked)}
          />
          <label htmlFor="terms" className="text-sm text-foreground">
            I agree to the{' '}
            <a href="/legal/terms" className="text-primary hover:underline" target="_blank">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-primary hover:underline" target="_blank">
              Privacy Policy
            </a>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !formData.terms}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>


      {onSwitchToSignIn && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      )}
    </Card>
  )
}
