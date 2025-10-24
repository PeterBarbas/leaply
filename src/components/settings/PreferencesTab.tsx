'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Save } from 'lucide-react'
import { useState } from 'react'

export default function PreferencesTab() {
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
    autoSave: true,
    showHints: true,
    compactMode: false
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      // TODO: Implement preferences saving
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Customize your experience and how you interact with the platform.
        </p>
      </div>

      {/* General Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important updates via email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyDigest">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">Get a weekly summary of your progress</p>
            </div>
            <Switch
              id="weeklyDigest"
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, weeklyDigest: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketingEmails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Receive updates about new features and tips</p>
            </div>
            <Switch
              id="marketingEmails"
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketingEmails: checked }))}
            />
          </div>
        </div>
      </Card>

      {/* Application Preferences */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Application Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoSave">Auto-save Progress</Label>
              <p className="text-sm text-muted-foreground">Automatically save your work as you go</p>
            </div>
            <Switch
              id="autoSave"
              checked={preferences.autoSave}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSave: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showHints">Show Hints</Label>
              <p className="text-sm text-muted-foreground">Display helpful hints and tips</p>
            </div>
            <Switch
              id="showHints"
              checked={preferences.showHints}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showHints: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Use a more compact interface layout</p>
            </div>
            <Switch
              id="compactMode"
              checked={preferences.compactMode}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, compactMode: checked }))}
            />
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
