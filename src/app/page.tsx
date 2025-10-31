// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const FIRST_Q = 'Which best describes you right now?';
const OPTIONS: { label: string; pref: 'student' | 'bachelor' | 'midcareer' | 'other' }[] = [
  { label: 'I’m in secondary school deciding what to study', pref: 'student' },
  { label: 'I\'m a bachelor\'s student exploring career options', pref: 'bachelor' },
  { label: 'I’m mid-career and exploring a change', pref: 'midcareer' },
  { label: 'Other', pref: 'other' },
];

export default function Home() {
  const router = useRouter();

  function handleChoose(pref: 'student' | 'bachelor' | 'midcareer' | 'other') {
    router.push(`/discover?pref=${pref}`);
  }

  return (
    <main className="relative flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-white via-[#f7f9fc] to-[#edf2f7] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 min-h-[calc(100vh-64px)]">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.indigo.400/.35),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><path d=%22M0 39.5H40 M39.5 0V40%22 stroke=%22%238a8a8a22%22/></svg>')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[55vh] w-[55vh] rotate-12 rounded-full bg-[conic-gradient(from_220deg,theme(colors.sky.400/.25),theme(colors.fuchsia.400/.25),transparent_55%)] blur-2xl" />
      </div>

      {/* hero */}
      <section className="flex relative z-10 justify-center bg-white flex-1 items-center">
        <div className="mx-auto max-w-6xl w-full px-6 py-10 text-center">
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
                <span>✨ Your Career Discovery Assistant</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
              >
                Your next career move,{' '}
                <span className="text-primary">
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
    {/* 2-col grid: avatar + content */}
    <div className="grid grid-cols-[28px_1fr] gap-x-2">
      {/* Bot avatar */}
      <div className="col-start-1 row-start-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-background text-xs font-semibold">
          🤖
        </div>
      </div>

      {/* Bot message bubble (auto width) */}
      <div className="col-start-2 row-start-1">
        <div className="inline-block max-w-[80%] sm:max-w-[42rem] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-foreground align-top">
          Hey! 👋 I’ll ask a few quick questions to find a great role for you.
        </div>
      </div>

      {/* Question bubble (auto width, same rule) */}
      <div className="col-start-2 mt-2">
        <div className="inline-block max-w-[80%] sm:max-w-[42rem] rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-foreground align-top">
          Which best describes you right now?
        </div>
      </div>

      {/* Options — wrap; never stretch too wide on desktop */}
      <div className="col-start-2 mt-2">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-start">
          {OPTIONS.map((opt) => (
            <Button
              key={opt.pref}
              onClick={() => handleChoose(opt.pref)}
              className={[
                // responsive width
                'w-full sm:w-auto sm:max-w-[32rem] min-w-0 max-w-full',
                // let height grow with lines + nice line-height
                '!h-auto py-2.5 px-4 whitespace-normal break-words text-left leading-[1.35] !items-start',
                // style
                'rounded-md bg-primary text-primary-foreground hover:bg-primary/80 font-medium shadow-sm text-center',
              ].join(' ')}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Hint under options */}
      <div className="col-start-2 mt-3">
        <div className="text-xs text-muted-foreground">
          Select an option to get started...
        </div>
      </div>
    </div>
  </div>
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/5 to-transparent dark:from-black/30" />
    </main>
  );
}
