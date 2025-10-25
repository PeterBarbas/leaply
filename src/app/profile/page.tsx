'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { getUserStreaks } from '@/lib/activityTracker'
import UserSimulations from '@/components/UserSimulations'
import SimulationStats from '@/components/SimulationStats'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Target, 
  BarChart3, 
  User, 
  Play,
  Trophy,
  Crown,
  Star,
  Flame,
  CheckCircle,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAvatarEmoji } from '@/lib/avatarUtils'

type Achievement = {
  id: number
  name: string
  description: string
  icon: string
  unlocked: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [userStats, setUserStats] = useState({
    totalSimulations: 0,
    completedSimulations: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    totalXp: 0,
    level: 1,
    xpToNextLevel: 100,
    achievements: [] as Achievement[]
  })

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Fetch simulations, streaks, and XP data in parallel
        const [simulationsResponse, streaksResponse, xpResponse] = await Promise.all([
          fetch('/api/user/simulations'),
          getUserStreaks(),
          fetch(`/api/user/xp?userId=${user?.id}`)
        ])

        let simulations: any[] = []
        let streaks = { current: 0, longest: 0, totalActiveDays: 0 }
        let xpData = { totalXp: 0, level: 1, xpToNextLevel: 100 }

        if (simulationsResponse.ok) {
          const data = await simulationsResponse.json()
          simulations = data.simulations || []
        }

        if (streaksResponse.success && streaksResponse.data) {
          streaks = streaksResponse.data.streaks
        }

        if (xpResponse.ok) {
          const data = await xpResponse.json()
          xpData = data
        }
        
        const completed = simulations.filter((s: any) => s.status === 'completed')
        const averageScore = completed.length > 0 ? 
          Math.round(completed.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / completed.length * 10) / 10 : 0
        
        setUserStats({
          totalSimulations: simulations.length,
          completedSimulations: completed.length,
          averageScore,
          currentStreak: streaks.current,
          longestStreak: streaks.longest,
          totalActiveDays: streaks.totalActiveDays,
          totalXp: xpData.totalXp,
          level: xpData.level,
          xpToNextLevel: xpData.xpToNextLevel,
          achievements: [
            { id: 1, name: 'First Steps', description: 'Complete your first simulation', icon: '🎯', unlocked: completed.length > 0 },
            { id: 2, name: 'Streak Master', description: 'Complete 3 simulations in a row', icon: '🔥', unlocked: streaks.current >= 3 },
            { id: 3, name: 'High Achiever', description: 'Get an average score of 8+', icon: '⭐', unlocked: averageScore >= 8 },
            { id: 4, name: 'Explorer', description: 'Try 5 different career paths', icon: '🗺️', unlocked: simulations.length >= 5 },
            { id: 5, name: 'Perfectionist', description: 'Get a perfect 10/10 score', icon: '💎', unlocked: completed.some((s: any) => s.score === 10) }
          ]
        })
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
      }
    }

    if (user) {
      fetchUserStats()
    }
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?redirect=/profile')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  // Calculate level progress based on XP to next level
  // The xpToNextLevel field from the database represents how much XP is needed to reach the next level
  // For level 1: need 100 XP total, for level 2: need 200 XP total, etc.
  const xpNeededForCurrentLevel = userStats.level === 1 ? 0 : 
    userStats.level === 2 ? 100 : 
    userStats.level === 3 ? 200 : 
    userStats.level === 4 ? 300 : 
    userStats.level === 5 ? 550 : 
    userStats.level === 6 ? 800 : 
    (userStats.level - 6) * 1000 + 800; // For levels 7+
  
  const xpNeededForNextLevel = userStats.level === 1 ? 100 : 
    userStats.level === 2 ? 200 : 
    userStats.level === 3 ? 300 : 
    userStats.level === 4 ? 550 : 
    userStats.level === 5 ? 800 : 
    userStats.level === 6 ? 1050 : 
    (userStats.level - 5) * 1000 + 800; // For levels 7+
  
  const xpInCurrentLevel = userStats.totalXp - xpNeededForCurrentLevel
  const xpNeededForLevel = xpNeededForNextLevel - xpNeededForCurrentLevel
  
  const levelProgress = userStats.totalXp > 0 && xpNeededForLevel > 0 ? 
    Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100)) : 0

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.name || user?.email || 'User'}! 🚀
          </h1>
          <p className="text-muted-foreground">
            Continue your career exploration journey and unlock new achievements.
          </p>
        </div>

        {/* Hero Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 mb-8 border-primary">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar & Level */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {getAvatarEmoji(profile?.avatar)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    {userStats.level}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    {profile?.name || 'Career Explorer'}
                  </h2>
                  <p className="text-sm text-muted-foreground">Level {userStats.level} Explorer</p>
                </div>
              </div>

              {/* XP Progress */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Experience Points</span>
                  <span className="text-sm text-muted-foreground">{userStats.totalXp} XP</span>
                </div>
                <div className="relative">
                  <Progress value={levelProgress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Level {userStats.level}</span>
                    <span>{userStats.xpToNextLevel} XP to Level {userStats.level + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{userStats.totalSimulations}</div>
                <div className="text-xs text-muted-foreground">Simulations</div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{userStats.completedSimulations}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Flame className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{userStats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Star className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{userStats.averageScore}</div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-foreground">Achievements</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userStats.achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                >
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked 
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Career Discovery</h3>
                <p className="text-sm text-muted-foreground">Find your ideal career path</p>
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/discover">Start Discovery</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Role Simulations</h3>
                <p className="text-sm text-muted-foreground">Practice real-world scenarios</p>
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/simulate">Browse Roles</Link>
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Leaderboard</h3>
                <p className="text-sm text-muted-foreground">Compete with other users</p>
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </Card>
        </div>

        {/* Your Simulations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Your Simulations</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/simulate">Start New Simulation</Link>
            </Button>
          </div>
          <UserSimulations />
        </div>
      </div>
    </div>
  )
}
