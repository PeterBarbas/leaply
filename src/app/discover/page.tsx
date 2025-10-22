'use client'

import { useEffect, useState, use } from 'react'
import CareerDiscoveryChat from '@/components/CareerDiscoveryChat'

type Pref = 'student' | 'midcareer' | 'other'

export default function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ pref?: Pref }>
}) {
  const [viewportHeight, setViewportHeight] = useState(0)

  // Unwrap searchParams using React.use()
  const resolvedSearchParams = use(searchParams)

  // Safely coerce/validate the query param
  const allowed: Pref[] = ['student', 'midcareer', 'other']
  const pref: Pref | null = allowed.includes(resolvedSearchParams?.pref as Pref)
    ? (resolvedSearchParams.pref as Pref)
    : null

  // Set initial viewport height and handle resize
  useEffect(() => {
    const setHeight = () => {
      // Use window.innerHeight for more stable height on mobile
      setViewportHeight(window.innerHeight)
    }
    
    setHeight()
    window.addEventListener('resize', setHeight)
    window.addEventListener('orientationchange', setHeight)
    
    return () => {
      window.removeEventListener('resize', setHeight)
      window.removeEventListener('orientationchange', setHeight)
    }
  }, [])

  // Calculate chat height based on viewport
  const chatHeight = viewportHeight > 0 ? Math.max(420, viewportHeight - 240) : 420

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* main content (flex-1 so it can shrink) */}
      <div className="flex-1 min-h-0">
        <div className="mx-auto max-w-3xl px-6 py-12 h-full flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">
                Find the best role for you 🚀
              </h1>
          <p className="mt-3 text-center text-muted-foreground">
            Quick questions — then we'll recommend a career path to try out.
          </p>

          {/* fixed-height chat area with stable mobile height */}
          <div 
            className="mt-8"
            style={{ 
              height: `${chatHeight}px`,
              minHeight: '420px'
            }}
          >
            {/* ✅ Pass the initialPref from the server, no useSearchParams on client */}
            <CareerDiscoveryChat fixedHeight initialPref={pref} />
          </div>
        </div>
      </div>
    </main>
  )
}
