'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { SignUpSchema, type SignUpData } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GamifiedSignUpWizardProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

type WizardStep = 'personal' | 'account' | 'preferences' | 'avatar' | 'complete'

const stepConfig = {
  personal: { title: "Tell us about yourself", progress: 20 },
  account: { title: "Create your account", progress: 40 },
  avatar: { title: "Choose your avatar", progress: 60 },
  preferences: { title: "Set your preferences", progress: 80 },
  complete: { title: "You're all set! 🎉", progress: 100 }
}

export default function GamifiedSignUpWizard({ onSuccess, onSwitchToSignIn }: GamifiedSignUpWizardProps) {
  const router = useRouter()
  const { signUp } = useAuth()
  const [currentStep, setCurrentStep] = useState<WizardStep>('personal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<SignUpData & { 
    interests: string[]
    careerGoal: string
    experience: string
    avatar: 'avatar1' | 'avatar2' | 'avatar3' | 'avatar4' | 'avatar5'
  }>({
    name: '',
    email: '',
    password: '',
    terms: false,
    interests: [],
    careerGoal: '',
    experience: '',
    avatar: 'avatar1'
  })

  const steps: WizardStep[] = ['personal', 'account', 'avatar', 'preferences', 'complete']
  const actualSteps: WizardStep[] = ['personal', 'account', 'avatar', 'preferences'] // Exclude 'complete'
  const currentStepIndex = steps.indexOf(currentStep)

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1])
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
      // Scroll to top when moving to previous step
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Validate form data
      const validatedData = SignUpSchema.parse({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        terms: formData.terms
      })
      
      const { error } = await signUp(validatedData.email, validatedData.password, validatedData.name)
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(error.message)
        }
      } else {
        // Success - save additional profile data
        try {
          // Wait a moment for the user profile to be created
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Update the user profile with additional signup data
          const profileUpdateData = {
            interests: formData.interests,
            bio: formData.careerGoal ? `Career Goal: ${formData.careerGoal}` : undefined,
            location: formData.experience ? `Experience Level: ${formData.experience}` : undefined,
            avatar: formData.avatar
          }
          
          // Call the profile update API
          const response = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileUpdateData),
          })
          
          if (!response.ok) {
            console.warn('Failed to save additional profile data:', await response.text())
            // Don't fail the signup process if profile update fails
          }
        } catch (profileError) {
          console.warn('Error saving additional profile data:', profileError)
          // Don't fail the signup process if profile update fails
        }
        
        // Move to complete step
        setCurrentStep('complete')
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else {
            router.push('/profile')
          }
        }, 2000)
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'personal':
        return formData.name.trim().length > 0
      case 'account':
        return formData.email.trim().length > 0 && formData.password.length >= 8
      case 'preferences':
        return formData.terms
      case 'avatar':
        return true // Avatar is always valid (has default)
      case 'complete':
        return false
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pt-10 pb-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
              <p className="text-muted-foreground">Help us personalize your experience</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  What should we call you? 👋
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
                <label className="text-sm font-medium text-foreground">
                  What's your career goal? 🎯
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {[
                    'Find my first job',
                    'Change careers',
                    'Advance in my current field',
                    'Start my own business',
                    'Explore different options'
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleInputChange('careerGoal', goal)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.careerGoal === goal
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  What's your experience level? 📚
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {[
                    'Student/Recent Graduate',
                    'Entry Level (0-2 years)',
                    'Mid Level (3-5 years)',
                    'Senior Level (6+ years)',
                    'Executive/Leadership'
                  ].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleInputChange('experience', level)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.experience === level
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'account':
        return (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pt-10 pb-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
              <p className="text-muted-foreground">Secure your progress and unlock achievements</p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address 📧
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
                  Password 🔒
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password (min 8 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Password strength: {formData.password.length >= 8 ? '✅ Strong' : '⚠️ Needs 8+ characters'}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'preferences':
        return (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pt-10 pb-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Set your preferences</h2>
              <p className="text-muted-foreground">Help us recommend the best content for you</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 max-w-3xl mx-auto">
                <label className="text-sm font-medium text-foreground">
                  What interests you? (Select all that apply) 🌟
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {[
                    'Technology', 'Design', 'Marketing', 'Sales',
                    'Finance', 'Healthcare', 'Education', 'Engineering',
                    'Writing', 'Data Science', 'Product Management', 'Consulting'
                  ].map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`p-2 sm:p-3 rounded-lg border-2 text-sm transition-all ${
                        formData.interests.includes(interest)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )

      case 'avatar':
        return (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pt-10 pb-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Choose your avatar</h2>
              <p className="text-muted-foreground">Pick an avatar that represents you</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 max-w-3xl mx-auto">
                <label className="text-sm font-medium text-foreground">
                  Select your avatar 🎭
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { id: 'avatar1', emoji: '👨‍💻', name: 'Developer' },
                    { id: 'avatar2', emoji: '👩‍🎨', name: 'Designer' },
                    { id: 'avatar3', emoji: '👨‍💼', name: 'Business' },
                    { id: 'avatar4', emoji: '👩‍🔬', name: 'Scientist' },
                    { id: 'avatar5', emoji: '👨‍🎓', name: 'Student' }
                  ].map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleInputChange('avatar', avatar.id)}
                      className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        formData.avatar === avatar.id
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{avatar.emoji}</div>
                      <div className="text-sm font-medium text-foreground">{avatar.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'complete':
        return (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6 pt-10 pb-10"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-foreground">Welcome aboard! 🎉</h2>
                <p className="text-lg text-muted-foreground mt-2">
                  Your account has been created successfully. Let's start your career journey!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <Zap className="h-4 w-4" />
                <span>Redirecting to your profile...</span>
              </motion.div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Progress */}
      <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end mb-3">
            <span className="text-sm font-medium text-foreground">
              Step {currentStepIndex + 1} of {actualSteps.length}
            </span>
          </div>
          <Progress value={(currentStepIndex / (actualSteps.length - 1)) * 100} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Terms Section - Outside Navigation Container */}
      {currentStep === 'preferences' && (
        <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky bottom-20 z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Switch
                id="terms"
                checked={formData.terms}
                onCheckedChange={(checked) => handleInputChange('terms', checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-foreground leading-relaxed">
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
          </div>
        </div>
      )}

      {/* Combined Sticky Footer */}
      <div className="sticky bottom-0 z-10">
        {/* Navigation Footer */}
        {currentStep !== 'complete' && (
          <div className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="flex items-center gap-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index <= currentStepIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {currentStep === 'preferences' ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canProceed() || loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sign In Link - Below navigation, touching bottom */}
        {onSwitchToSignIn && currentStep === 'personal' && (
          <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
