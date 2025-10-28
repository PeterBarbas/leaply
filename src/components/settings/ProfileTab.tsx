'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Check, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useState, useEffect } from 'react'
import { avatarOptions, getAvatarEmoji } from '@/lib/avatarUtils'

export default function ProfileTab() {
  const { user, profile, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    avatar: 'avatar1' as 'avatar1' | 'avatar2' | 'avatar3' | 'avatar4' | 'avatar5'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarSuccess, setAvatarSuccess] = useState(false)

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        avatar: profile.avatar || 'avatar1'
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Basic validation
      if (!formData.name.trim()) {
        setError('Name is required')
        return
      }

      // Validate website URL if provided
      if (formData.website && formData.website.trim()) {
        try {
          new URL(formData.website)
        } catch {
          setError('Please enter a valid website URL (e.g., https://example.com)')
          return
        }
      }

      const result = await updateProfile(formData)
      
      if (result.error) {
        setError(result.error.message || 'Failed to update profile')
      } else {
        setSuccess(true)
        setIsEditing(false)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      avatar: profile?.avatar || 'avatar1'
    })
    setIsEditing(false)
    setError(null)
    setSuccess(false)
    setAvatarSuccess(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
  }


  const handleAvatarChange = async (avatarId: 'avatar1' | 'avatar2' | 'avatar3' | 'avatar4' | 'avatar5') => {
    try {
      setLoading(true)
      setError(null)
      setAvatarSuccess(false)
      
      const result = await updateProfile({ avatar: avatarId })
      
      if (!result.error) {
        setFormData(prev => ({ ...prev, avatar: avatarId }))
        setAvatarSuccess(true)
        setTimeout(() => setAvatarSuccess(false), 2000)
      } else {
        setError(result.error.message || 'Failed to update avatar')
      }
    } catch (error) {
      console.error('Error updating avatar:', error)
      setError('Failed to update avatar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="relative">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
            {getAvatarEmoji(formData.avatar || profile?.avatar || 'avatar1')}
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {profile?.name || 'User'}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">{user?.email}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Member since {new Date(user?.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Choose Your Avatar</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {avatarOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleAvatarChange(option.id)}
              disabled={loading}
              className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                (formData.avatar || profile?.avatar || 'avatar1') === option.id
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-1">{option.emoji}</div>
              <div className="text-xs text-center text-muted-foreground">{option.name}</div>
              {(formData.avatar || profile?.avatar || 'avatar1') === option.id && (
                <div className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-primary rounded-full flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 text-white animate-spin" />
                  ) : (
                    <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">Profile updated successfully!</p>
        </div>
      )}

      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={isEditing ? handleSave : () => setIsEditing(true)} 
              variant={isEditing ? "default" : "outline"}
              disabled={loading}
              className="w-auto sm:min-w-[120px]"
              size="lg"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
            {isEditing && (
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                disabled={loading}
                className="w-auto sm:min-w-[100px]"
                size="lg"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <p className="text-sm text-muted-foreground mb-4">
            Click on any field below to start editing, or use the "Edit Profile" button.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Enter your full name"
                required
              />
            ) : (
              <p 
                className="text-foreground py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {profile?.name || 'Not set'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <p className="text-muted-foreground py-2">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            {isEditing ? (
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="City, Country"
              />
            ) : (
              <p 
                className="text-foreground py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {profile?.location || 'Not set'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            {isEditing ? (
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="https://yourwebsite.com"
                type="url"
              />
            ) : (
              <p 
                className="text-foreground py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {profile?.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {profile.website}
                  </a>
                ) : 'Not set'}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 mt-6">
          <Label htmlFor="bio">Bio</Label>
          {isEditing ? (
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              onKeyDown={handleKeyDown}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          ) : (
            <p 
              className="text-foreground py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 -mx-2 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {profile?.bio || 'No bio provided'}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="mt-6">
            {/* Help Text */}
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter (or Cmd+Enter on Mac) to save quickly
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
