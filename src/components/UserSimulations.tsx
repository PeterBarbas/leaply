'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Target,
  Calendar,
  BarChart3,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type SimulationAttempt = {
  id: string;
  status: 'started' | 'completed' | 'abandoned';
  score?: number;
  created_at: string;
  completed_at?: string;
  result_summary?: {
    strengths: string[];
    improvements: string[];
  };
  simulations: {
    id: string;
    slug: string;
    title: string;
    steps: any[];
  };
  progress: {
    completedTasks: number;
    totalTasks: number;
    percentage: number;
    completedTaskIndices: number[];
  };
};

export default function UserSimulations() {
  const [simulations, setSimulations] = useState<SimulationAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const response = await fetch('/api/user/simulations')
        if (!response.ok) {
          throw new Error('Failed to fetch simulations')
        }
        const data = await response.json()
        setSimulations(data.simulations || [])
      } catch (err) {
        console.error('Error fetching simulations:', err)
        setError(err instanceof Error ? err.message : 'Failed to load simulations')
      } finally {
        setLoading(false)
      }
    }

    fetchSimulations()
  }, [])

  const getStatusBadge = (status: string, score?: number) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Trophy className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case 'started':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Play className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case 'abandoned':
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (simulations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Simulations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start your first career simulation to see your progress here.
          </p>
          <Button asChild>
            <Link href="/simulate">Browse Simulations</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial='hidden'
      animate='show'
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } }
      }}
      className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
    >
      {simulations.map((simulation, index) => (
        <motion.div
          key={simulation.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className='group h-full overflow-hidden justify-between rounded-2xl border border-foreground/10 hover:border-primary bg-background/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
            <CardHeader className='pb-2'>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className='text-base font-semibold text-foreground transition-colors group-hover:text-primary flex-1'>
                  {simulation.simulations.title}
                </CardTitle>
                <div className='px-1'></div>
                {getStatusBadge(simulation.status)}
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Progress</span>
                  <span className="text-xs text-muted-foreground">
                    {simulation.progress.completedTasks}/{simulation.progress.totalTasks}
                  </span>
                </div>
                <Progress 
                  value={simulation.progress.percentage} 
                  className="h-1.5"
                />
              </div>

              {/* Date Info */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Started {formatDate(simulation.created_at)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className='pt-0'>

              {/* Action Buttons and Score */}
              <div className='flex items-center justify-between gap-2'>
                {/* Score for completed simulations */}
                {simulation.status === 'completed' && simulation.score && (
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {simulation.score}/10
                    </span>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {simulation.status === 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-sm font-medium px-3 py-1 h-7"
                      onClick={async () => {
                        // Reset the attempt status to allow restart
                        try {
                          const response = await fetch('/api/attempt/reset', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ attemptId: simulation.id })
                          });
                          
                          if (response.ok) {
                            // Refresh the page to show updated status
                            window.location.reload();
                          }
                        } catch (error) {
                          console.error('Failed to reset attempt:', error);
                        }
                      }}
                    >
                      Try again
                    </Button>
                  )}
                  <Link href={`/s/${simulation.simulations.slug}/overview?attemptId=${simulation.id}`}>
                    <span className='inline-flex items-center gap-1 text-sm font-medium text-primary'>
                      {simulation.status === 'completed' ? 'View Results' : 'Continue'}
                      <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
