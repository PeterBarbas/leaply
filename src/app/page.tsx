// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Linkedin,
  Twitter,
  Instagram,
  Github,
  MessageCircle,
} from 'lucide-react';

const FIRST_Q = 'Which best describes you right now?';
const OPTIONS: { label: string; pref: 'student' | 'midcareer' | 'other' }[] = [
  { label: 'I’m in secondary school deciding what to study', pref: 'student' },
  { label: 'I’m mid-career and exploring a change', pref: 'midcareer' },
  { label: 'Other', pref: 'other' },
];

export default function Home() {
  const router = useRouter();

  function handleChoose(pref: 'student' | 'midcareer' | 'other') {
    router.push(`/discover?pref=${pref}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#f7f9fc] to-[#edf2f7] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.indigo.400/.35),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><path d=%22M0 39.5H40 M39.5 0V40%22 stroke=%22%238a8a8a22%22/></svg>')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[55vh] w-[55vh] rotate-12 rounded-full bg-[conic-gradient(from_220deg,theme(colors.sky.400/.25),theme(colors.fuchsia.400/.25),transparent_55%)] blur-2xl" />
      </div>

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
            <Link href="/simulate" className="text-foreground/70 hover:text-foreground transition-colors">
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

      {/* hero */}
      <section className="flex relative z-10 justify-center bg-white">
        <div className="mx-auto max-w-6xl h-full w-full px-6 py-10 text-center">
          {/* glass card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl rounded-3xl "
          >
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-xs text-foreground/70 dark:bg-background/40"
              >
                <span>✨ New</span>
                <span className="h-1 w-1 rounded-full bg-foreground/20" />
                <span>Meet Leap - Your Career Discovery Assistant</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
              >
                Your next career move,{' '}
                <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
                powered by experience{' '}
                </span>
                not guesswork.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                Make decisions, solve challenges, and feel what the job is actually like — all in under 10 minutes.
              </motion.p>

              {/* Starter chat inline */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mx-auto mt-7 w-full max-w-xl text-left"
              >
                <div className="rounded-2xl border border-foreground/10 bg-background/70 p-4 backdrop-blur-sm">
                  <div className="mb-2 flex items-start gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-background text-xs font-semibold">
                    🤖
                    </div>
                    <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-foreground">
                      Hey! 👋 I’ll ask a few quick questions to find a great role for you.
                    </div>
                  </div>

                  <div className="mb-2 ml-9 rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm font-medium">
                    {FIRST_Q}
                  </div>

                  <div className="ml-9 flex flex-wrap gap-2">
                    {OPTIONS.map((opt) => (
                      <Button
                        key={opt.pref}
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm"
                        onClick={() => handleChoose(opt.pref)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>

                  {/* hint that the full assistant opens */}
                  <div className="ml-9 mt-3 text-xs text-muted-foreground">
                    Select an option to get started...
                  </div>
                </div>

                {/* Secondary CTAs under the chat */}
                {/* <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg" className="px-7 text-base font-medium">
                    <Link href="/discover">Find your next career</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="px-7 text-base font-medium border-foreground/15 hover:bg-foreground/5"
                  >
                    <Link href="/simulate">Browse all roles</Link>
                  </Button>
                </div> */}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="mt-4 text-xs text-muted-foreground"
              >
                No sign-up required • Try one in 5 minutes
              </motion.p>
            </div>
          </motion.div>
        </div>
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/5 to-transparent dark:from-black/30" />
    </main>
  );
}
