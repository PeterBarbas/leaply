import LeaderboardClient from '@/components/LeaderboardClient'

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            🏆 Leaderboard
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Compete with other users based on completed simulations and average scores. 
            The more you complete, the higher you rank!
          </p>
        </div>
        
        <LeaderboardClient />
      </div>
    </main>
  )
}
