import CareerDiscoveryChat from '@/components/CareerDiscoveryChat'
import { Button } from '@/components/ui/button'
import {
  Linkedin,
  Twitter,
  Instagram,
  Github,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

export default async function DiscoverPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
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
            <Link
              href="/simulate"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              All Roles
            </Link>
            <Link
              href="/discover"
              className="text-primary"
            >
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

      {/* main content (flex-1 so it can shrink) */}
      <div className="flex-1 min-h-0">
        <div className="mx-auto max-w-3xl px-6 py-12 h-full flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">
            Find the best role for you 🚀
          </h1>
          <p className="mt-3 text-center text-muted-foreground">
            Quick questions — then we’ll recommend a career path to try out.
          </p>

          {/* fixed-height chat area (adjust calc values if needed) */}
          <div className="mt-8 h-[calc(100dvh-240px)] min-h-[420px]">
            <CareerDiscoveryChat fixedHeight/>
          </div>
        </div>
      </div>

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
