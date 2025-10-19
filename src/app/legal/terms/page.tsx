// app/(legal)/terms/page.tsx
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Linkedin, Twitter, Instagram, Github, MessageCircle } from 'lucide-react'

type Section = { id: string; title: string }

export default function TermsPage() {
  const lastUpdated = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    []
  )

  const sections: Section[] = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'eligibility', title: 'Eligibility & Accounts' },
    { id: 'acceptable-use', title: 'Acceptable Use' },
    { id: 'ip', title: 'Intellectual Property' },
    { id: 'payments', title: 'Payments & Trials' },
    { id: 'disclaimers', title: 'Disclaimers' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'changes', title: 'Changes to These Terms' },
    { id: 'contact', title: 'Contact' },
  ]

  const [activeId, setActiveId] = useState<string>(sections[0].id)
  const topsRef = useRef<number[]>([])
  const idsRef = useRef<string[]>(sections.map(s => s.id))

  // --- Scroll spy (smooth, no jitter)
  useEffect(() => {
    const headerOffset = 96 // sticky header height
    const els = idsRef.current
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    const computeTops = () => {
      topsRef.current = els.map(el => {
        const rect = el.getBoundingClientRect()
        return rect.top + window.scrollY - headerOffset - 8
      })
    }

    const pickActive = () => {
      const y = window.scrollY
      const tops = topsRef.current
      let idx = 0
      for (let i = 0; i < tops.length; i++) {
        if (y >= tops[i]) idx = i
        else break
      }
      const newId = idsRef.current[idx] || idsRef.current[0]
      setActiveId(prev => (prev === newId ? prev : newId))
    }

    // throttle updates
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(pickActive)
    }
    const onResize = () => {
      computeTops()
      pickActive()
    }

    computeTops()
    pickActive()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    const t = setTimeout(() => {
      computeTops()
      pickActive()
    }, 200)

    return () => {
      clearTimeout(t)
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // Honor hash on load and when it changes
  useEffect(() => {
    const setFromHash = () => {
      const hash = window.location.hash?.slice(1)
      if (hash && idsRef.current.includes(hash)) setActiveId(hash)
    }
    setFromHash()
    window.addEventListener('hashchange', setFromHash)
    return () => window.removeEventListener('hashchange', setFromHash)
  }, [])

  const linkCls = (id: string) =>
    [
      'block rounded-md px-2 py-1.5 text-sm transition-colors',
      id === activeId
        ? 'bg-primary text-primary-foreground'
        : 'text-foreground/80 hover:text-foreground hover:bg-muted',
    ].join(' ')

  return (
    <main className="min-h-screen bg-white text-foreground">

      {/* Title */}
      <section className="border-b border-border/40 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content + TOC */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[240px_minmax(0,1fr)]">
          {/* TOC */}
          <aside className="md:block">
            <div className="md:sticky md:top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </p>
              <nav className="space-y-1">
                {sections.map(s => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveId(s.id)}
                    className={linkCls(s.id)}
                    aria-current={activeId === s.id ? 'true' : undefined}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Body */}
          <article
            className={[
              'max-w-none text-[15px] leading-7 text-foreground/90',
              '[&_h2]:mb-3 [&_h3]:mt-8 [&_h3]:mb-2',
              '[&_h2]:scroll-mt-28 [&_h3]:scroll-mt-28',
              '[&_ul]:mt-4 [&_ol]:mt-4 [&_li]:mt-2',
              '[&_section+section]:mt-12',
              '[&_a]:text-primary hover:[&_a]:underline',
              '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
            ].join(' ')}
          >
            <style>{`:target { scroll-margin-top: 96px; }`}</style>

            <section id="introduction">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p>
                Welcome to Leaply. These Terms &amp; Conditions (“Terms”) govern your access to and use of
                our website, applications, and services (collectively, the “Services”). By using the
                Services, you agree to these Terms.
              </p>
            </section>

            <section id="eligibility">
              <h2 className="text-2xl font-bold">Eligibility &amp; Accounts</h2>
              <p>
                You must be able to form a binding contract to use the Services. You are responsible for
                safeguarding your account and for all activities that occur under it.
              </p>
            </section>

            <section id="acceptable-use">
              <h2 className="text-2xl font-bold">Acceptable Use</h2>
              <ul>
                <li>Do not attempt to disrupt, overload, or interfere with the Services.</li>
                <li>Do not misuse content or data you access through the Services.</li>
                <li>Follow all applicable laws and regulations at all times.</li>
              </ul>
            </section>

            <section id="ip">
              <h2 className="text-2xl font-bold">Intellectual Property</h2>
              <p>
                All content and materials in the Services are the property of Leaply or its licensors and
                are protected by intellectual property laws. You may not copy, modify, or distribute content
                without permission.
              </p>
            </section>

            <section id="payments">
              <h2 className="text-2xl font-bold">Payments &amp; Trials</h2>
              <p>
                Certain features may require payment. Unless otherwise stated, fees are non-refundable.
                Trials may be available and can be changed or terminated at our discretion.
              </p>
            </section>

            <section id="disclaimers">
              <h2 className="text-2xl font-bold">Disclaimers</h2>
              <p>
                The Services are provided “as is” without warranties of any kind. We do not guarantee
                uninterrupted or error-free operation or specific outcomes from using the Services.
              </p>
            </section>

            <section id="liability">
              <h2 className="text-2xl font-bold">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Leaply will not be liable for indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues.
              </p>
            </section>

            <section id="termination">
              <h2 className="text-2xl font-bold">Termination</h2>
              <p>
                We may suspend or terminate access to the Services at any time, with or without cause. Upon
                termination, your right to use the Services will cease immediately.
              </p>
            </section>

            <section id="changes">
              <h2 className="text-2xl font-bold">Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. Changes take effect when posted. Your continued
                use of the Services constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section id="contact">
              <h2 className="text-2xl font-bold">Contact</h2>
              <p>
                Questions? Email us at <a href="mailto:hello@leaply.com">hello@leaply.com</a>.
              </p>
            </section>
          </article>
        </div>
      </section>

    </main>
  )
}
