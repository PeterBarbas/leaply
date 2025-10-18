'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Search, 
  MessageCircle, 
  X, 
  Linkedin,
  Twitter,
  Instagram,
  Github, } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'


// 👉 Lazy-load the chat to keep this page snappy
const CareerDiscoveryChat = dynamic<
  React.ComponentProps<
    typeof import('@/components/CareerDiscoveryChat').default
  >
>(() => import('@/components/CareerDiscoveryChat'), { ssr: false })

type SimRow = {
  slug: string
  title: string
  steps: any[] | null
  active: boolean
}

export default function SimulateClient ({ sims }: { sims: SimRow[] }) {
  const [q, setQ] = useState('')
  const [openChat, setOpenChat] = useState(false)

  // close on Escape
  useEffect(() => {
    function onKey (e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenChat(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => {
    if (!q.trim()) return sims
    const t = q.toLowerCase()
    return sims.filter(s => s.title.toLowerCase().includes(t))
  }, [q, sims])

  return (
    <>
      <main className='min-h-screen bg-white'>

      {/* header (sticky) */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
              Leaply
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link href="/simulate" className="text-primary">
              All Roles
            </Link>
            <Link href="/discover" className="text-foreground/70 hover:text-foreground transition-colors">
              Career Discovery Assistant
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden sm:block">
            <Button asChild size="sm" className="rounded-full px-5">
              <Link href="/discover">Explore My Path</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero strip (glass) */}
      <section className='mx-auto w-full max-w-6xl px-6 pt-12'>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='rounded-3xl p-6 text-center'
        >
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className='text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'
          >
            Explore your next career — one role at a time.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className='mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg'
          >
            Pick a field, try a short interactive challenge, and see if it
            sparks your interest.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className='mx-auto mt-5 flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center'
          >
            <div className='relative w-full'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder='Search roles (e.g., Marketing, Project Management)'
                className='h-11 pl-9'
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Grid */}
      <section className='mx-auto w-full max-w-6xl px-6 pb-24 pt-8'>
        {filtered.length > 0 ? (
          <motion.div
            initial='hidden'
            animate='show'
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } }
            }}
            className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          >
            {filtered.map(s => {
              const stepCount = Array.isArray(s.steps) ? s.steps.length : 0
              return (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <Link href={`/s/${s.slug}`}>
                    <Card className='group h-full overflow-hidden justify-between rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-background/30'>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-semibold text-foreground transition-colors group-hover:text-primary'>
                          {s.title}
                        </CardTitle>
                        <CardDescription className='text-xs text-muted-foreground'>
                          {stepCount} {stepCount === 1 ? 'step' : 'steps'} • 5–10 min
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='pt-2'>
                        <div className='flex items-center justify-end'>
                          <span className='inline-flex items-center gap-1 text-sm font-medium text-primary'>
                            Start{' '}
                            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                          </span>
                        </div>
                      </CardContent>

                      {/* subtle hover ring */}
                      <div
                        className='pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100'
                        style={{
                          boxShadow: '0 0 0 2px rgba(99,102,241,.22) inset'
                        }}
                      />
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <EmptyState />
        )}
      </section>
      {/* footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Logo + About */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold tracking-tight text-foreground/90">
                Leaply
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Leaply helps you explore and test-drive real corporate careers through short AI-powered simulations.
            </p>
            <div className="flex gap-4 mt-5 text-muted-foreground">
              <Link href="https://linkedin.com" className="hover:text-foreground transition">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="hover:text-foreground transition">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com" className="hover:text-foreground transition">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://github.com" className="hover:text-foreground transition">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="mailto:hello@leaply.com" className="hover:text-foreground transition">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition">About us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/simulate" className="hover:text-foreground transition">All Roles</Link></li>
              <li><Link href="/discover" className="hover:text-foreground transition">Career Discovery Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 mt-5">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/legal/terms" className="hover:text-foreground transition">Terms & Conditions</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-foreground transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Leaply. All rights reserved.</p>
            {/* <p>Built with ❤️ in Amsterdam.</p> */}
          </div>
        </div>
      </footer>

{/* Floating chat launcher */}
<div className="fixed bottom-6 right-6 z-[60]">
  <AnimatePresence>
    {!openChat && (
      <motion.button
        key="fab"
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={() => setOpenChat(true)}
        className="group flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Open career assistant chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-medium">Need help choosing?</span>
      </motion.button>
    )}
  </AnimatePresence>

  {/* Chat panel */}
  <AnimatePresence>
    {openChat && (
      <motion.div
        key="panel"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        // ✅ Responsive width + height that always fit the screen
        className="
          fixed z-[70]
          bottom-[max(1rem,env(safe-area-inset-bottom))]
          right-[max(1rem,env(safe-area-inset-right))]
          w-[min(92vw,520px)]
          h-[min(90dvh,880px)]
          sm:h-[min(86dvh,760px)]
          overflow-hidden
          rounded-2xl border border-foreground/10 bg-background/95 shadow-2xl backdrop-blur-sm
          flex flex-col
        "
        role="dialog"
        aria-label="Career discovery chat"
      >
        {/* Header (fixed) */}
        <div className="flex items-center justify-between gap-3 border-b border-foreground/10 bg-foreground/5 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              L
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Leaply</div>
              <div className="text-[11px] text-muted-foreground">Your Personal Career Assistant</div>
            </div>
          </div>
          <button
            onClick={() => setOpenChat(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-foreground/10"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body (fills the rest; lets the chat control its internal scroll) */}
        <div className="flex-1 min-h-0 px-2 py-2">
          {/* 👇 Hide the “Skip and view all roles” from the floating panel */}
          <div className="h-full">
            <CareerDiscoveryChat embed hideSkip />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

      </main>
    </>
  )
}

function EmptyState () {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='mx-auto max-w-3xl rounded-3xl border border-foreground/10 bg-background/60 p-10 text-center backdrop-blur-sm dark:bg-background/30'
    >
      <div className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5 text-lg'>
        🧪
      </div>
      <h3 className='text-lg font-semibold'>No simulations yet</h3>
      <p className='mt-1 text-sm text-muted-foreground'>
        Try the discovery chat and we’ll recommend (or even create) one for you.
      </p>
      <div className='mt-4 flex justify-center'>
        <Button asChild className='px-6'>
          <Link href='/discover'>🧠 Start career discovery</Link>
        </Button>
      </div>
    </motion.div>
  )
}
