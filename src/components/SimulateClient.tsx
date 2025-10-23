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
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // close on Escape
  useEffect(() => {
    function onKey (e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenChat(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Handle mobile keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      // Detect keyboard by comparing window height with visual viewport
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(Math.max(0, heightDiff));
      } else {
        // Fallback for browsers without visual viewport API
        const initialHeight = window.innerHeight;
        const currentHeight = window.screen.height;
        setKeyboardHeight(Math.max(0, initialHeight - currentHeight));
      }
    };

    // Listen for visual viewport changes (modern approach)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [])

  // Prevent body scroll when chat is open (mobile only)
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    
    if (openChat && isMobile) {
      // Prevent body scroll on mobile only
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [openChat])


  // Handle chat open/close
  const handleChatToggle = (open: boolean) => {
    setOpenChat(open)
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return sims
    const t = q.toLowerCase()
    return sims.filter(s => s.title.toLowerCase().includes(t))
  }, [q, sims])

  return (
    <>
      <main className='min-h-screen bg-white'>

      {/* Hero strip (glass) */}
      <section className='mx-auto w-full max-w-6xl px-6 pt-12'>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='rounded-3xl py-6 text-center'
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
        </motion.div>
      </section>

      {/* Grid */}
      <section className='mx-auto w-full max-w-6xl px-6 pb-24 pt-8'>
                  {/* Search */}
                  <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className='mx-auto mb-5 flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center'
          >
            <div className='relative w-full'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder='Search roles (e.g., Marketing)'
                className='h-11 pl-9 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-foreground/10'
              />
            </div>
          </motion.div>

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
                    <Card className='group h-full overflow-hidden justify-between rounded-2xl border border-foreground/10 hover:border-primary bg-background/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-semibold text-foreground transition-colors group-hover:text-primary'>
                          {s.title}
                        </CardTitle>
                        {/* <CardDescription className='text-xs text-muted-foreground'>
                          {stepCount} {stepCount === 1 ? 'step' : 'steps'} • 5–10 min
                        </CardDescription> */}
                      </CardHeader>
                      <CardContent className='pt-2'>
                        <div className='flex items-center justify-end'>
                          <span className='inline-flex items-center gap-1 text-sm font-medium text-primary'>
                            Start{' '}
                            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                          </span>
                        </div>
                      </CardContent>
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

{/* Floating chat launcher */}
<div className="fixed bottom-[10px] right-[10px] z-[60]">
  <AnimatePresence>
    {!openChat && (
      <motion.button
        key="fab"
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ 
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smoother feel
        }}
        onClick={() => handleChatToggle(true)}
        className="group flex items-center gap-2 rounded-full bg-primary w-[48px] h-[48px] sm:w-auto sm:h-auto sm:px-4 sm:py-3 text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring justify-center"
        aria-label="Open career assistant chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-medium">Need help choosing?</span>
      </motion.button>
    )}
  </AnimatePresence>


  {/* Chat panel - Always rendered but hidden when closed */}
  <motion.div
    key="panel"
    initial={false}
    animate={{ 
      opacity: openChat ? 1 : 0,
      y: openChat ? 0 : 30,
      scale: openChat ? 1 : 0.95,
      rotateX: openChat ? 0 : -5,
      pointerEvents: openChat ? 'auto' : 'none'
    }}
    transition={{ 
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      type: "spring",
      stiffness: 300,
      damping: 30
    }}
        // ✅ Responsive width + height that always fit the screen
        className="
          fixed z-[1000000000000]
          inset-0
          sm:bottom-[max(1rem,env(safe-area-inset-bottom))]
          sm:left-auto sm:right-[max(1rem,env(safe-area-inset-right))]
          sm:inset-auto
          w-auto
          sm:w-[min(92vw,520px)]
          h-auto
          sm:h-[min(86dvh,760px)]
          overflow-hidden
          rounded-none sm:rounded-2xl border border-foreground/10 bg-background/95 shadow-2xl backdrop-blur-sm
          flex flex-col
          mx-auto
          sm:mx-0
          max-w-[520px]
          transform-gpu
          will-change-transform
        "
        style={{
          // Ensure proper positioning on mobile
          height: '100dvh', // Use dynamic viewport height for better mobile support
        }}
        role="dialog"
        aria-label="Career discovery chat"
        onTouchStart={(e) => window.innerWidth < 640 && e.stopPropagation()}
        onTouchMove={(e) => window.innerWidth < 640 && e.stopPropagation()}
        onTouchEnd={(e) => window.innerWidth < 640 && e.stopPropagation()}
      >
        {/* Header (fixed) */}
        <motion.div 
          className="flex items-center justify-between gap-3 border-b border-foreground/10 bg-foreground/5 px-4 py-2 flex-shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
          style={{
            // Ensure header stays at top on mobile
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              L
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Leaply</div>
              <div className="text-[11px] text-muted-foreground">Your Personal Career Assistant</div>
            </div>
          </div>
          <motion.button
            onClick={() => handleChatToggle(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-foreground/10"
            aria-label="Close chat"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </motion.div>

        {/* Body (fills the rest; lets the chat control its internal scroll) */}
        <motion.div 
          className="flex-1 min-h-0 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
        >
          {/* 👇 Hide the "Skip and view all roles" from the floating panel */}
          <div className="h-full flex flex-col">
            <CareerDiscoveryChat 
              embed 
              hideSkip 
              onStateChange={(state) => {
                // Save state whenever it changes
                sessionStorage.setItem('chatState', JSON.stringify(state));
              }}
            />
          </div>
        </motion.div>
      </motion.div>
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
      className='mx-auto max-w-3xl rounded-3xl p-10 text-center backdrop-blur-sm dark:bg-background/30'
    >
      <div className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-3xl bg-primary text-lg'>
        ☹️
      </div>
      <h3 className='text-lg font-semibold'>We couldn’t find any results for your search.</h3>
      <p className='mt-1 text-sm text-muted-foreground'>
        Try our Discovery Assistant — we’ll help you find the right match.
      </p>
      <div className='mt-8 flex justify-center'>
        <Button asChild className='px-6'>
          <Link href='/discover'>Career Discovery Assistant</Link>
        </Button>
      </div>
    </motion.div>
  )
}
