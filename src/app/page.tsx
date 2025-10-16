'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function Home () {
  return (
    <main className='relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f7f9fc] to-[#edf2f7] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800'>
      {/* background accents */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        {/* radial glow */}
        <div className='absolute left-1/2 top-[-10%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.indigo.400/.35),transparent_60%)] blur-3xl' />
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><path d=%22M0 39.5H40 M39.5 0V40%22 stroke=%22%238a8a8a22%22/></svg>')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        {/* gradient beam */}
        <div className='absolute right-[-10%] bottom-[-10%] h-[55vh] w-[55vh] rotate-12 rounded-full bg-[conic-gradient(from_220deg,theme(colors.sky.400/.25),theme(colors.fuchsia.400/.25),transparent_55%)] blur-2xl' />
      </div>

      {/* header (sticky) */}
      <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md'>
        <div className='mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5'>
          <Link href='/' className='flex items-center gap-2'>
            <span className='inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background font-semibold'>
              L
            </span>
            <span className='text-sm font-semibold tracking-tight text-foreground/90'>
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

      {/* hero */}
      <section className='flex relative z-10 justify-center'>
        <div className='mx-auto max-w-6xl h-full w-full px-6 py-24 text-center'>
          {/* glass card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='mx-auto max-w-3xl rounded-3xl border border-white/40 bg-white/60 p-8 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.25)] backdrop-blur-md dark:border-white/10 dark:bg-white/5'
          >
            <div className='mx-auto max-w-2xl text-center'>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.5 }}
                className='inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-xs text-foreground/70 dark:bg-background/40'
              >
                <span>✨ New</span>
                <span className='h-1 w-1 rounded-full bg-foreground/20' />
                <span>Career Discovery Chat</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className='mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl'
              >
                Test-drive careers{' '}
                <span className='bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent'>
                  before you choose them
                </span>
                .
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className='mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl'
              >
                Short, realistic AI simulations that show what real jobs feel
                like — in minutes, not months.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className='mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row'
              >
                <Button
                  asChild
                  size='lg'
                  className='px-7 text-base font-medium'
                >
                  <Link href='/discover'>Find your next career</Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  size='lg'
                  className='px-7 text-base font-medium border-foreground/15 hover:bg-foreground/5'
                >
                  <Link href='/simulate'>Browse all simulations</Link>
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className='mt-4 text-xs text-muted-foreground'
              >
                No sign-up required • Try one in 5 minutes
              </motion.p>
            </div>
          </motion.div>

          {/* feature tiles */}
          {/* <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[
              { title: "Marketing", desc: "Launch a mini ad campaign.", emoji: "📣" },
              { title: "Project Mgmt", desc: "Plan a sprint like a pro.", emoji: "🧭" },
              { title: "Software", desc: "Solve a real bug scenario.", emoji: "💻" },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-foreground/10 bg-background/60 p-4 backdrop-blur-sm dark:bg-background/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5 text-lg">
                    {f.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div> */}

          {/* foot note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className='mx-auto mt-10 max-w-3xl text-center text-sm text-muted-foreground'
          >
            🚀 Built with{' '}
            <span className='font-medium text-foreground'>Leaply</span> —
            Explore. Learn. Decide.
          </motion.p>
        </div>
      </section>

      {/* bottom gradient bar */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/5 to-transparent dark:from-black/30' />
    </main>
  )
}
