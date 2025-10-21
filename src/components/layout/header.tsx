'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const navItems = [
    { href: '/simulate', label: 'All Roles' },
    { href: '/discover', label: 'Career Discovery Assistant' },
  ]

  // Close the mobile menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close on Escape and click outside
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="relative mx-auto w-full max-w-7xl px-6">
        {/* Top row: fixed height on mobile so logo & burger don't move */}
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="Leaply Logo"
              className="h-8 w-8 rounded-md object-cover transition-transform group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
              Leaply
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-foreground',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Burger (mobile) */}
          <button
            ref={btnRef}
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-background/70 hover:bg-foreground/5 transition"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile panel: absolutely positioned under the row, smooth open/close */}
        <div
          ref={panelRef}
          aria-hidden={!open}
          className={[
            'md:hidden absolute left-4 right-4 top-full',
            // animation: height + opacity + slight slide
            'overflow-hidden rounded-xl border border-border/50 bg-background/95 shadow-lg backdrop-blur-sm',
            'transition-[max-height,opacity,transform] duration-250 ease-out will-change-[max-height,opacity,transform]',
            open
              ? 'max-h-[60vh] opacity-100 translate-y-1'
              : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none',
          ].join(' ')}
        >
          <nav role="menu" aria-label="Mobile">
            <ul className="py-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      role="menuitem"
                      className={[
                        'block px-4 py-2 text-sm rounded-md mx-1 my-0.5',
                        'transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground/80 hover:bg-foreground/5',
                      ].join(' ')}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* A little bottom padding so the absolutely-positioned panel has space to render */}
        <div className="h-0 md:h-0" />
      </div>
    </header>
  )
}
