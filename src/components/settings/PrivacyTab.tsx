'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Shield, Lock, Eye, Download, Trash2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function PrivacyTab() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    showActivity: false,
    allowAnalytics: true,
    dataSharing: false,
    twoFactorAuth: false,
    loginNotifications: true
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      // TODO: Implement privacy settings saving
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    } catch (error) {
      console.error('Error saving privacy settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // TODO: Implement data export
      console.log('Exporting user data...')
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // TODO: Implement account deletion
        console.log('Deleting account...')
      } catch (error) {
        console.error('Error deleting account:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Privacy & Security</h1>
        <p className="text-muted-foreground mt-1">
          Control your privacy settings and manage your account security.
        </p>
      </div>

      {/* Privacy Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Privacy Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={privacySettings.profileVisibility === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPrivacySettings(prev => ({ ...prev, profileVisibility: 'public' }))}
              >
                Public
              </Button>
              <Button
                variant={privacySettings.profileVisibility === 'private' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPrivacySettings(prev => ({ ...prev, profileVisibility: 'private' }))}
              >
                Private
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showActivity">Show Activity Status</Label>
              <p className="text-sm text-muted-foreground">Let others see when you're active</p>
            </div>
            <Switch
              id="showActivity"
              checked={privacySettings.showActivity}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showActivity: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowAnalytics">Allow Analytics</Label>
              <p className="text-sm text-muted-foreground">Help us improve by sharing anonymous usage data</p>
            </div>
            <Switch
              id="allowAnalytics"
              checked={privacySettings.allowAnalytics}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowAnalytics: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dataSharing">Data Sharing</Label>
              <p className="text-sm text-muted-foreground">Allow sharing of anonymized data for research</p>
            </div>
            <Switch
              id="dataSharing"
              checked={privacySettings.dataSharing}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, dataSharing: checked }))}
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Security Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="twoFactorAuth"
                checked={privacySettings.twoFactorAuth}
                onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
              />
              {privacySettings.twoFactorAuth && (
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="loginNotifications">Login Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
            </div>
            <Switch
              id="loginNotifications"
              checked={privacySettings.loginNotifications}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, loginNotifications: checked }))}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Security Tips</h3>
              <ul className="text-sm text-blue-800 mt-1 space-y-1">
                <li>• Use a strong, unique password</li>
                <li>• Enable two-factor authentication</li>
                <li>• Regularly review your login activity</li>
                <li>• Keep your email address up to date</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Export Your Data</h3>
              <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
            </div>
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button onClick={handleDeleteAccount} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Important Notice</h3>
              <p className="text-sm text-red-800 mt-1">
                Deleting your account will permanently remove all your data, including simulations, 
                progress, and achievements. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </div>
    </div>
  )
}
