'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabaseAnon } from './supabase'
import { UserProfile } from './schemas'
import { trackLogin } from './activityTracker'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from our custom users table
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabaseAnon
        .from('users')
        .select('*')
        .eq('id', userId)

      if (error) {
        console.error('Error fetching profile:', error)
        console.error('Profile fetch error details:', JSON.stringify(error, null, 2))
        return null
      }

      // Check if profile exists
      if (!data || data.length === 0) {
        console.log('No profile found for user:', userId)
        return null
      }

      console.log('Profile fetched successfully:', data[0])
      return data[0]
    } catch (error) {
      console.error('Exception fetching profile:', error)
      return null
    }
  }

  // Create or update user profile
  const createOrUpdateProfile = async (user: User, additionalData?: Partial<UserProfile>) => {
    try {
      // Determine provider from user metadata
      let provider: 'email' | 'google' | 'apple' = 'email'
      if (user.app_metadata?.provider) {
        provider = user.app_metadata.provider as 'email' | 'google' | 'apple'
      } else if (user.user_metadata?.provider) {
        provider = user.user_metadata.provider as 'email' | 'google' | 'apple'
      } else if (user.user_metadata?.avatar_url || user.user_metadata?.picture) {
        // If user has avatar from OAuth, likely Google
        provider = 'google'
      }

      const profileData = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.user_metadata?.full_name || 'User',
        provider,
        photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        ...additionalData,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabaseAnon
        .from('users')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        console.error('Error creating/updating profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating/updating profile:', error)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        // Get initial session
        const { data: { session }, error } = await supabaseAnon.auth.getSession()
        
        console.log('Session result:', { session: !!session, error: error?.message })
        
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('User found, fetching profile for:', session.user.id)
            // Fetch or create profile
            let userProfile = await fetchProfile(session.user.id)
            if (!userProfile) {
              console.log('No profile found, creating new profile')
              userProfile = await createOrUpdateProfile(session.user)
              if (userProfile) {
                console.log('Profile created successfully')
              } else {
                console.log('Failed to create profile, but continuing without it')
              }
            }
            setProfile(userProfile)
          } else {
            console.log('No user in session')
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabaseAnon.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Track login activity
          if (event === 'SIGNED_IN') {
            trackLogin().catch(error => {
              console.error('Failed to track login activity:', error)
            })
          }
          
          // Fetch or create profile
          let userProfile = await fetchProfile(session.user.id)
          if (!userProfile) {
            userProfile = await createOrUpdateProfile(session.user)
          }
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabaseAnon.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          }
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email)
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('Sign in error:', error)
        return { error }
      }
      
      if (data.session) {
        console.log('Sign in successful, session created:', data.session.user.id)
      } else {
        console.log('Sign in successful but no session returned')
      }
      
      return { error }
    } catch (error) {
      console.error('Sign in exception:', error)
      return { error: error as AuthError }
    }
  }


  const signOut = async () => {
    try {
      const { error } = await supabaseAnon.auth.signOut()
      if (!error) {
        // Redirect to home page after successful sign out
        window.location.href = '/'
      }
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') as AuthError }
      }

      const { error } = await supabaseAnon
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        return { error: error as unknown as AuthError }
      }

      // Refresh profile state
      await refreshProfile()
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
