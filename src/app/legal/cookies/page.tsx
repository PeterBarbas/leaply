// app/legal/cookies/page.tsx
'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Linkedin, Twitter, Instagram, Github, MessageCircle } from 'lucide-react'

type Section = { id: string; title: string }

export default function CookiesPage() {
  const lastUpdated = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    []
  )

  const sections: Section[] = [
    { id: 'overview', title: 'Overview' },
    { id: 'what-are-cookies', title: 'What Are Cookies' },
    { id: 'types-of-cookies', title: 'Types of Cookies We Use' },
    { id: 'cookie-purposes', title: 'Cookie Purposes' },
    { id: 'third-party-cookies', title: 'Third-Party Cookies' },
    { id: 'managing-cookies', title: 'Managing Cookies' },
    { id: 'cookie-declaration', title: 'Cookie Declaration' },
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
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Cookies Policy</h1>
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
                This Cookies Policy explains how Leaply ("we", "us", "our") uses cookies and similar technologies 
                when you visit our website. By using our website, you consent to the use of cookies as described 
                in this policy.
              </p>
            </section>

            <section id="what-are-cookies">
              <h2 className="text-2xl font-bold">What Are Cookies</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit 
                a website. They are widely used to make websites work more efficiently and to provide information 
                to website owners.
              </p>
              <p>
                Cookies can be "persistent" (remaining on your device until deleted or expired) or "session" 
                cookies (deleted when you close your browser).
              </p>
            </section>

            <section id="types-of-cookies">
              <h2 className="text-2xl font-bold">Types of Cookies We Use</h2>
              <ul>
                <li><strong>Essential Cookies:</strong> Necessary for the website to function properly and cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.</li>
                <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization.</li>
                <li><strong>Marketing Cookies:</strong> Used to track visitors across websites for advertising purposes.</li>
              </ul>
            </section>

            <section id="cookie-purposes">
              <h2 className="text-2xl font-bold">Cookie Purposes</h2>
              <p>We use cookies for the following purposes:</p>
              <ul>
                <li>To ensure our website functions correctly and securely</li>
                <li>To remember your preferences and settings</li>
                <li>To analyze website traffic and user behavior</li>
                <li>To improve our services and user experience</li>
                <li>To provide personalized content and recommendations</li>
              </ul>
            </section>

            <section id="third-party-cookies">
              <h2 className="text-2xl font-bold">Third-Party Cookies</h2>
              <p>
                We may use third-party services that set their own cookies. These include:
              </p>
              <ul>
                <li><strong>Analytics Services:</strong> To understand website usage and performance</li>
                <li><strong>Content Delivery Networks:</strong> To improve website loading speed</li>
                <li><strong>Social Media Platforms:</strong> For social sharing and integration features</li>
              </ul>
              <p>
                These third parties have their own privacy policies and cookie practices. We recommend 
                reviewing their policies for more information.
              </p>
            </section>

            <section id="managing-cookies">
              <h2 className="text-2xl font-bold">Managing Cookies</h2>
              <p>
                You can control and manage cookies in several ways:
              </p>
              <ul>
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings.</li>
                <li><strong>Cookie Consent Banner:</strong> Use our cookie consent banner to choose which types of cookies to accept.</li>
                <li><strong>Opt-out Links:</strong> Some third-party services provide opt-out mechanisms on their websites.</li>
              </ul>
              <p>
                Please note that disabling certain cookies may affect the functionality of our website.
              </p>
            </section>

            <section id="cookie-declaration">
              <h2 className="text-2xl font-bold">Cookie Declaration</h2>
              <p>
                For detailed information about the specific cookies we use, please refer to our 
                cookie declaration below. This declaration is automatically updated and provides 
                comprehensive details about all cookies used on our website.
              </p>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> The cookie declaration is managed by Cookiebot and will 
                  display detailed information about all cookies used on this website, including 
                  their purpose, duration, and whether they are first-party or third-party cookies.
                </p>
              </div>
              
              {/* Cookiebot Declaration Script */}
              <div className="mt-6">
                <script
                  id="CookieDeclaration"
                  src="https://consent.cookiebot.com/d9c7b88e-b648-4262-9665-fc7102c62640/cd.js"
                  type="text/javascript"
                  async
                />
              </div>
            </section>

            <section id="changes">
              <h2 className="text-2xl font-bold">Changes to This Policy</h2>
              <p>
                We may update this Cookies Policy from time to time to reflect changes in our 
                practices or for other operational, legal, or regulatory reasons. The latest 
                version will be posted on this page with an updated "Last updated" date.
              </p>
            </section>

            <section id="contact">
              <h2 className="text-2xl font-bold">Contact</h2>
              <p>
                If you have any questions about our use of cookies or this Cookies Policy, 
                please contact us at <a href="mailto:hello@leaply.com">hello@leaply.com</a>.
              </p>
            </section>
          </article>
        </div>
      </section>
    </main>
  )
}
