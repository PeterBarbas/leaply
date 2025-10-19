// app/(legal)/privacy/page.tsx
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Linkedin, Twitter, Instagram, Github, MessageCircle } from 'lucide-react'

type Section = { id: string; title: string }

export default function PrivacyPage() {
  const lastUpdated = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    []
  )

  const sections: Section[] = [
    { id: 'overview', title: 'Overview' },
    { id: 'data-we-collect', title: 'Data We Collect' },
    { id: 'how-we-use', title: 'How We Use Data' },
    { id: 'sharing', title: 'Sharing & Processors' },
    { id: 'retention', title: 'Retention & Security' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'children', title: 'Children' },
    { id: 'changes', title: 'Changes to This Policy' },
    { id: 'contact', title: 'Contact' },
  ]

  const [activeId, setActiveId] = useState<string>(sections[0].id)
  const topsRef = useRef<number[]>([])
  const idsRef = useRef<string[]>(sections.map(s => s.id))

  // --- Smooth, non-jittery scroll spy
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
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
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

            <section id="overview">
              <h2 className="text-2xl font-bold">Overview</h2>
              <p>
                Leaply (“we”, “us”, “our”) values your privacy. This Policy explains what data we collect,
                how we use it, and your choices.
              </p>
            </section>

            <section id="data-we-collect">
              <h2 className="text-2xl font-bold">Data We Collect</h2>
              <ul>
                <li><strong>Account &amp; Contact:</strong> name, email, preferences you provide.</li>
                <li><strong>Usage:</strong> interactions with simulations, device info, cookies.</li>
                <li><strong>Support:</strong> messages you send to our team.</li>
              </ul>
            </section>

            <section id="how-we-use">
              <h2 className="text-2xl font-bold">How We Use Data</h2>
              <ul>
                <li>Operate and improve the Services and recommendations.</li>
                <li>Personalize experiences and run analytics.</li>
                <li>Provide support and communicate important updates.</li>
              </ul>
            </section>

            <section id="sharing">
              <h2 className="text-2xl font-bold">Sharing &amp; Processors</h2>
              <p>
                We do not sell personal data. We may share limited data with service providers who help us
                operate the Services, under appropriate data protection terms.
              </p>
            </section>

            <section id="retention">
              <h2 className="text-2xl font-bold">Retention &amp; Security</h2>
              <p>
                We retain data only as long as necessary for the purposes described and apply reasonable
                technical and organizational safeguards.
              </p>
            </section>

            <section id="your-rights">
              <h2 className="text-2xl font-bold">Your Rights</h2>
              <p>
                Depending on your location, you may request access, correction, deletion, or portability of
                your data. Contact us to exercise your rights.
              </p>
            </section>

            <section id="children">
              <h2 className="text-2xl font-bold">Children</h2>
              <p>
                Our Services are not directed to children under the age of 13 (or as defined by local law).
              </p>
            </section>

            <section id="changes">
              <h2 className="text-2xl font-bold">Changes to This Policy</h2>
              <p>
                We may update this Policy from time to time. The latest version will be posted on this page.
              </p>
            </section>

            <section id="contact">
              <h2 className="text-2xl font-bold">Contact</h2>
              <p>
                Questions? Email <a href="mailto:hello@leaply.com">hello@leaply.com</a>.
              </p>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}
