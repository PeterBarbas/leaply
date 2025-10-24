'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react'

type SimulationStats = {
  totalSimulations: number;
  completedSimulations: number;
  inProgressSimulations: number;
  averageScore: number;
  totalTasksCompleted: number;
  totalTasks: number;
};

export default function SimulationStats() {
  const [stats, setStats] = useState<SimulationStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/simulations')
        if (!response.ok) return

        const data = await response.json()
        const simulations = data.simulations || []

        // Calculate stats
        const totalSimulations = simulations.length
        const completedSimulations = simulations.filter((s: any) => s.status === 'completed').length
        const inProgressSimulations = simulations.filter((s: any) => s.status === 'started').length
        
        const completedScores = simulations
          .filter((s: any) => s.status === 'completed' && s.score)
          .map((s: any) => s.score)
        const averageScore = completedScores.length > 0 
          ? Math.round((completedScores.reduce((a: number, b: number) => a + b, 0) / completedScores.length) * 10) / 10
          : 0

        const totalTasksCompleted = simulations.reduce((sum: number, s: any) => sum + s.progress.completedTasks, 0)
        const totalTasks = simulations.reduce((sum: number, s: any) => sum + s.progress.totalTasks, 0)

        setStats({
          totalSimulations,
          completedSimulations,
          inProgressSimulations,
          averageScore,
          totalTasksCompleted,
          totalTasks
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats || stats.totalSimulations === 0) {
    return null
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.totalTasksCompleted / stats.totalTasks) * 100) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Total Simulations</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.totalSimulations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.completedSimulations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.inProgressSimulations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">Avg Score</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.averageScore > 0 ? `${stats.averageScore}/10` : 'N/A'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
