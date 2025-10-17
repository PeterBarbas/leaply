import CareerDiscoveryChat from '@/components/CareerDiscoveryChat'
import Link from 'next/link'

export default async function DiscoverPage () {
  return (
    <main className='min-h-screen bg-gradient-to-b from-white via-[#f9fafb] to-[#eef1f5] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 transition-colors'>
      {/* header (sticky) */}
      <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md'>
        <div className='mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5'>
          <Link href='/' className='flex items-center gap-2'>
            <span className='text-lg font-semibold tracking-tight text-foreground/90'>
              Leaply
            </span>
          </Link>

          <nav className='hidden sm:flex items-center gap-4 text-sm'>
            <Link
              href='/simulate'
              className='text-foreground/70 hover:text-foreground transition'
            >
              All Career Roles
            </Link>
            <Link
              href='/discover'
              className='text-foreground/70 hover:text-foreground transition'
            >
              Explore
            </Link>
          </nav>
        </div>
      </header>

      {/* main content */}
      <div className='mx-auto max-w-3xl px-6 py-12'>
        <h1 className='text-3xl sm:text-4xl font-semibold tracking-tight text-center'>
          Find the best role for you 🚀
        </h1>
        <p className='mt-3 text-center text-muted-foreground'>
          Quick questions — then we’ll recommend a career path to try out.
        </p>
        <div className='mt-8'>
          <CareerDiscoveryChat />
        </div>
      </div>
    </main>
  )
}
