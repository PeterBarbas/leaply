'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { ProfileUpdateSchema, type ProfileUpdateData } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, MapPin, Heart, FileText, AlertCircle, Check } from 'lucide-react'

interface UserProfileProps {
  onClose?: () => void
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, profile, updateProfile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: '',
    country: '',
    interests: [],
    bio: '',
  })

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        country: profile.country || '',
        interests: profile.interests || [],
        bio: profile.bio || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate form data
      const validatedData = ProfileUpdateSchema.parse(formData)
      
      const { error } = await updateProfile(validatedData)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
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

  const handleInputChange = (field: keyof ProfileUpdateData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const handleInterestAdd = (interest: string) => {
    if (interest.trim() && !formData.interests?.includes(interest.trim())) {
      handleInputChange('interests', [...(formData.interests || []), interest.trim()])
    }
  }

  const handleInterestRemove = (interestToRemove: string) => {
    handleInputChange('interests', formData.interests?.filter(i => i !== interestToRemove) || [])
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      if (onClose) onClose()
    } catch (error) {
      setError('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Profile</h2>
        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 flex items-center gap-2 text-sm text-green-700">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo and Basic Info */}
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-foreground">{profile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Sign in with a different provider to use a different email.
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </label>
          {isEditing ? (
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="Enter your country or city"
            />
          ) : (
            <p className="text-foreground">{profile.country || 'Not specified'}</p>
          )}
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Interests
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                placeholder="Add an interest (press Enter to add)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleInterestAdd(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                {formData.interests?.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleInterestRemove(interest)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No interests specified</p>
              )}
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Bio
          </label>
          {isEditing ? (
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself and your career goals..."
              rows={4}
              maxLength={500}
            />
          ) : (
            <p className="text-foreground whitespace-pre-wrap">
              {profile.bio || 'No bio provided'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setError(null)
                // Reset form data to original profile data
                setFormData({
                  name: profile.name || '',
                  country: profile.country || '',
                  interests: profile.interests || [],
                  bio: profile.bio || '',
                })
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </Card>
  )
}
