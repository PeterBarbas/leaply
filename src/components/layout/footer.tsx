// src/components/layout/footer.tsx
import Link from 'next/link'
import { Linkedin, Twitter, Instagram, Github, MessageCircle } from 'lucide-react'

export default function Footer() {
  // Server-rendered year avoids client-side Date() hydration issues
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {/* Logo + About */}
        <div className="sm:col-span-2">
          <Link href="/" className="flex items-center group gap-2 mb-4">
            <img
              src="/logo.png"
              alt="Leaply Logo"
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="text-lg font-bold tracking-tight text-foreground">Leaply</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Leaply helps you explore and test-drive real corporate careers through short AI-powered simulations.
          </p>
          <div className="flex gap-4 mt-5 text-muted-foreground">
            <Link href="https://www.linkedin.com/company/meetleaply" target="_blank" className="hover:text-primary transition">
              <Linkedin className="h-5 w-5" />
            </Link>
            {/* <Link href="https://twitter.com" className="hover:text-foreground transition">
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
            </Link> */}
          </div>
        </div>

        {/* Columns */}
        {/* <div>
          <h4 className="font-semibold text-foreground mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-foreground transition">About us</Link>
            </li>
          </ul>
        </div> */}

        <div>
          <h4 className="font-semibold text-foreground mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/simulate" className="hover:text-foreground transition">All Roles</Link>
            </li>
            <li>
              <Link href="/discover" className="hover:text-foreground transition">Career Discovery Assistant</Link>
            </li>
          </ul>
        </div>

        {/* NOTE: removed the stray mt-5 that caused misalignment and mismatch */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/legal/terms" className="hover:text-foreground transition">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/50 mt-8">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-center text-xs text-muted-foreground">
          <p>© {year} Leaply. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
