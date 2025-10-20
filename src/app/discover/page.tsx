import CareerDiscoveryChat from '@/components/CareerDiscoveryChat'

type Pref = 'student' | 'midcareer' | 'other'

export default function DiscoverPage({
  searchParams,
}: {
  searchParams: { pref?: Pref }
}) {
  // Safely coerce/validate the query param
  const allowed: Pref[] = ['student', 'midcareer', 'other']
  const pref: Pref | null = allowed.includes(searchParams?.pref as Pref)
    ? (searchParams.pref as Pref)
    : null

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* main content (flex-1 so it can shrink) */}
      <div className="flex-1 min-h-0">
        <div className="mx-auto max-w-3xl px-6 py-12 h-full flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">
                Find the{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                best{' '}
                </span>
                role{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                for you{' '}
                </span>
                🚀
              </h1>
          <p className="mt-3 text-center text-muted-foreground">
            Quick questions — then we’ll recommend a career path to try out.
          </p>

          {/* fixed-height chat area (adjust calc values if needed) */}
          <div className="mt-8 h-[calc(100dvh-240px)] min-h-[420px]">
            {/* ✅ Pass the initialPref from the server, no useSearchParams on client */}
            <CareerDiscoveryChat fixedHeight initialPref={pref} />
          </div>
        </div>
      </div>
    </main>
  )
}
