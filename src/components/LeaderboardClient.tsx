'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, Crown, Star, Users, Target, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { getAvatarEmoji } from '@/lib/avatarUtils'

type LeaderboardEntry = {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  avatar?: string;
  totalCompletedSimulations: number;
  averageScore: number;
  totalScore: number;
  leaderboardScore: number;
  level: number;
  totalXp: number;
  completedAt: string | null;
};

export default function LeaderboardClient() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400 via-yellow-500 to-yellow-600"
      case 1:
        return "from-gray-300 via-gray-400 to-gray-500"
      case 2:
        return "from-amber-400 via-amber-500 to-amber-600"
      default:
        return "from-blue-400 via-blue-500 to-blue-600"
    }
  }

  const getPedestalHeight = (index: number) => {
    switch (index) {
      case 0:
        return "h-20 sm:h-28 lg:h-32" // Gold - tallest
      case 1:
        return "h-16 sm:h-24 lg:h-24" // Silver - medium
      case 2:
        return "h-14 sm:h-20 lg:h-20" // Bronze - shortest
      default:
        return "h-12 sm:h-16 lg:h-16"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Pedestal Loading */}
        <div className="flex justify-center items-end gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-16 sm:w-20 lg:w-24 h-20 sm:h-28 lg:h-32 bg-gray-200 rounded-t-lg animate-pulse mb-3 sm:mb-4"></div>
              <div className="w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {/* List Loading */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 sm:h-16 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="text-red-500 mb-3 sm:mb-4 text-2xl sm:text-3xl">⚠️</div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Error Loading Leaderboard</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm sm:text-base"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 text-center">
          <Trophy className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No Rankings Yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Complete some simulations to see the leaderboard!
          </p>
        </CardContent>
      </Card>
    )
  }

  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="space-y-6 sm:space-y-8 pt-2">
      {/* Top 3 Pedestal */}
      {/* Mobile: Horizontal layout like desktop (Silver, Gold, Bronze) */}
      <div className="block sm:hidden mb-8 mx-auto max-w-[320px]">
        <div className="flex items-end justify-center gap-2">
          {[1, 0, 2].map((rankIndex, pos) => {
            const user = topThree[rankIndex];
            if (!user) return null;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pos * 0.15, duration: 0.5 }}
                className="flex flex-col items-center"
              >
                {/* Pedestal */}
                <div className={`w-14 ${getPedestalHeight(rankIndex)} bg-gradient-to-t ${getRankColor(rankIndex)} rounded-t-lg shadow-lg relative`}></div>

                {/* User Card */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.25 + pos * 0.15, duration: 0.35 }}
                  className="relative -mt-3"
                >
                  <Card className="w-24 p-2.5 text-center shadow-lg border-2 border-primary/20">
                    <CardContent className="p-0">
                      {/* Profile Image */}
                      <div className="flex justify-center mb-1.5">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
                          {getAvatarEmoji(user.avatar)}
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="font-semibold text-[11px] mb-0.5 truncate">{user.name}</h3>

                      {/* Level */}
                      <div className="text-[10px] text-muted-foreground mb-0.5">Level {user.level}</div>

                      {/* XP Badge */}
                      <Badge className="mt-0.5 bg-primary/10 text-primary border-primary/20 text-[10px]">
                        {user.totalXp} XP
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Horizontal layout with gold in the middle */}
      <div className="hidden sm:flex justify-center items-end gap-6 lg:gap-8 mb-8 sm:mb-12 sm:mx-auto sm:max-w-4xl">
        {/* Silver (2nd place) - Left */}
        {topThree[1] && (
          <motion.div
            key={topThree[1].id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Pedestal */}
            <div className={`w-20 lg:w-24 ${getPedestalHeight(1)} bg-gradient-to-t ${getRankColor(1)} rounded-t-lg shadow-lg relative`}>
            </div>
            
            {/* User Card */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="relative -mt-4"
            >
              <Card className="w-40 lg:w-48 p-3 lg:p-4 text-center shadow-lg border-2 border-primary/20">
                <CardContent className="p-0">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-sm">
                      {getAvatarEmoji(topThree[1].avatar)}
                    </div>
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-semibold text-sm mb-1 truncate">{topThree[1].name}</h3>
                  
                  {/* Stats */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="h-3 w-3" />
                      <span className="hidden lg:inline">Level {topThree[1].level}</span>
                      <span className="lg:hidden">L{topThree[1].level}</span>
                    </div>
                  </div>
                  
                  {/* XP Badge */}
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 text-xs">
                    {topThree[1].totalXp} XP
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Gold (1st place) - Center */}
        {topThree[0] && (
          <motion.div
            key={topThree[0].id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Pedestal */}
            <div className={`w-20 lg:w-24 ${getPedestalHeight(0)} bg-gradient-to-t ${getRankColor(0)} rounded-t-lg shadow-lg relative`}>
            </div>
            
            {/* User Card */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="relative -mt-4"
            >
              <Card className="w-40 lg:w-48 p-3 lg:p-4 text-center shadow-lg border-2 border-primary/20">
                <CardContent className="p-0">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-sm">
                      {getAvatarEmoji(topThree[0].avatar)}
                    </div>
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-semibold text-sm mb-1 truncate">{topThree[0].name}</h3>
                  
                  {/* Stats */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="h-3 w-3" />
                      <span className="hidden lg:inline">Level {topThree[0].level}</span>
                      <span className="lg:hidden">L{topThree[0].level}</span>
                    </div>
                  </div>
                  
                  {/* XP Badge */}
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 text-xs">
                    {topThree[0].totalXp} XP
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Bronze (3rd place) - Right */}
        {topThree[2] && (
          <motion.div
            key={topThree[2].id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Pedestal */}
            <div className={`w-20 lg:w-24 ${getPedestalHeight(2)} bg-gradient-to-t ${getRankColor(2)} rounded-t-lg shadow-lg relative`}>
            </div>
            
            {/* User Card */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="relative -mt-4"
            >
              <Card className="w-40 lg:w-48 p-3 lg:p-4 text-center shadow-lg border-2 border-primary/20">
                <CardContent className="p-0">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-sm">
                      {getAvatarEmoji(topThree[2].avatar)}
                    </div>
                  </div>
                  
                  {/* Name */}
                  <h3 className="font-semibold text-sm mb-1 truncate">{topThree[2].name}</h3>
                  
                  {/* Stats */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Target className="h-3 w-3" />
                      <span className="hidden lg:inline">Level {topThree[2].level}</span>
                      <span className="lg:hidden">L{topThree[2].level}</span>
                    </div>
                  </div>
                  
                  {/* XP Badge */}
                  <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 text-xs">
                    {topThree[2].totalXp} XP
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Rest of the Leaderboard */}
      {rest.length > 0 && (
        <div className="space-y-3 mx-auto max-w-[320px] sm:max-w-4xl">
          
          {rest.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            >
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8 sm:w-10 lg:w-12 flex-shrink-0">
                      {getRankIcon(index + 3)}
                    </div>
                    
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-sm">
                        {getAvatarEmoji(user.avatar)}
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{user.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className="hidden sm:inline">Level {user.level}</span>
                          <span className="sm:hidden">L{user.level}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* XP */}
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="font-semibold text-xs sm:text-sm">
                        {user.totalXp} XP
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
