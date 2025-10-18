// app/(legal)/terms/page.tsx
'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Linkedin, Twitter, Instagram, Github, MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button';


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

  return (
    <main className="min-h-screen bg-white text-foreground">
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

      {/* Title */}
      <section className="border-b border-border/40 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Terms & Conditions</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content + TOC */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[240px_minmax(0,1fr)]">
          {/* TOC (sticky) */}
          <aside className="md:block">
            <div className="md:sticky md:top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:bg-muted"
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
    // Base text sizing/measure
    "max-w-none text-[15px] leading-7 text-foreground/90",
    // Give headings real top/bottom rhythm
    "[&_h2]:mb-3 [&_h3]:mt-8 [&_h3]:mb-2",
    // Make anchors scroll nicely under sticky header
    "[&_h2]:scroll-mt-28 [&_h3]:scroll-mt-28",
    // Paragraphs & lists spacing
    "[&_ul]:mt-4 [&_ol]:mt-4 [&_li]:mt-2",
    // Section-to-section spacing
    "[&_section+section]:mt-12",
    // Link styling
    "[&_a]:text-primary hover:[&_a]:underline",
    // List bullets
    "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
  ].join(" ")}
>
            <style>{`
              :target { scroll-margin-top: 96px; }
            `}</style>

            <section id="introduction">
              <h2 className='text-2xl font-bold'>Introduction</h2>
              <p>
                Welcome to Leaply. These Terms & Conditions (“Terms”) govern your access to and use of our
                website, applications, and services (collectively, the “Services”). By using the Services,
                you agree to these Terms.
              </p>
            </section>

            <section id="eligibility">
              <h2 className='text-2xl font-bold'>Eligibility & Accounts</h2>
              <p>
                You must be able to form a binding contract to use the Services. You are responsible for
                safeguarding your account and for all activities that occur under it.
              </p>
            </section>

            <section id="acceptable-use">
              <h2 className='text-2xl font-bold'>Acceptable Use</h2>
              <ul>
                <li>Do not attempt to disrupt, overload, or interfere with the Services.</li>
                <li>Do not misuse content or data you access through the Services.</li>
                <li>Follow all applicable laws and regulations at all times.</li>
              </ul>
            </section>

            <section id="ip">
              <h2 className='text-2xl font-bold'>Intellectual Property</h2>
              <p>
                All content and materials in the Services are the property of Leaply or its licensors and
                are protected by intellectual property laws. You may not copy, modify, or distribute content
                without permission.
              </p>
            </section>

            <section id="payments">
              <h2 className='text-2xl font-bold'>Payments & Trials</h2>
              <p>
                Certain features may require payment. Unless otherwise stated, fees are non-refundable.
                Trials may be available and can be changed or terminated at our discretion.
              </p>
            </section>

            <section id="disclaimers">
              <h2 className='text-2xl font-bold'>Disclaimers</h2>
              <p>
                The Services are provided “as is” without warranties of any kind. We do not guarantee
                uninterrupted or error-free operation or specific outcomes from using the Services.
              </p>
            </section>

            <section id="liability">
              <h2 className='text-2xl font-bold'>Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Leaply will not be liable for indirect, incidental,
                special, consequential, or punitive damages, or any loss of profits or revenues.
              </p>
            </section>

            <section id="termination">
              <h2 className='text-2xl font-bold'>Termination</h2>
              <p>
                We may suspend or terminate access to the Services at any time, with or without cause.
                Upon termination, your right to use the Services will cease immediately.
              </p>
            </section>

            <section id="changes">
              <h2 className='text-2xl font-bold'>Changes to These Terms</h2>
              <p>
                We may update these Terms from time to time. Changes take effect when posted. Your continued
                use of the Services constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section id="contact">
              <h2 className='text-2xl font-bold'>Contact</h2>
              <p>
                Questions? Email us at <a href="mailto:hello@leaply.com">hello@leaply.com</a>.
              </p>
            </section>
          </article>
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
    </main>
  )
}
