'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAvatarEmoji } from '@/lib/avatarUtils'

const navItems = [
  { href: '/simulate', label: 'All Roles' },
  { href: '/discover', label: 'Career Discovery Assistant' },
]

export default function Header() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  
  const isExperimentPage = pathname === '/experiment'

  // Close the mobile menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close on Escape and click outside
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setUserMenuOpen(false)
      }
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
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open, userMenuOpen])

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="relative mx-auto w-full max-w-7xl px-6">
        {/* Top row: fixed height on mobile so logo & burger don't move */}
        <div className="flex h-14 md:h-16 items-center justify-between">
          {/* Logo */}
          {isExperimentPage ? (
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Leaply Logo"
                className="h-8 w-8 rounded-md object-cover"
              />
              <span className="text-lg font-bold tracking-tight text-foreground">
                Leaply
              </span>
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Leaply Logo"
                className="h-8 w-8 rounded-md object-cover"
              />
              <span className="text-lg font-bold tracking-tight text-foreground">
                Leaply
              </span>
            </Link>
          )}

          {/* Desktop nav */}
          {!isExperimentPage && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'transition-colors font-regular',
                      isActive
                        ? 'text-primary'
                        : 'text-foreground/70',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* User Menu */}
          {!isExperimentPage && (
            <div className="hidden md:flex items-center gap-4">
              {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-foreground/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-base font-bold shadow-sm">
                    {getAvatarEmoji(profile?.avatar)}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {profile?.name || 'User'}
                  </span>
                </button>

                {userMenuOpen && (
                  <Card className="absolute right-0 top-full mt-2 w-48 p-2 shadow-lg">
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-foreground/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-foreground/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-foreground/5 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
          )}

          {/* Burger (mobile) */}
          {!isExperimentPage && (
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
          )}
        </div>

        {/* Mobile panel: absolutely positioned under the row, smooth open/close */}
        {!isExperimentPage && (
          <div
            ref={panelRef}
            aria-hidden={!open}
            className={[
              'md:hidden absolute left-4 right-4 top-full',
              // animation: height + opacity + slight slide
              'overflow-hidden rounded-xl border border-border/50 bg-background shadow-lg backdrop-blur-sm',
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
              
              {/* Mobile Auth Section */}
              <li className="border-t border-border/50 mt-2 pt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-base font-bold shadow-sm">
                        {getAvatarEmoji(profile?.avatar)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {profile?.name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="block px-4 py-2 text-sm rounded-md mx-1 my-0.5 text-foreground/80 hover:bg-foreground/5 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="block px-4 py-2 text-sm rounded-md mx-1 my-0.5 text-foreground/80 hover:bg-foreground/5 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm rounded-md mx-1 my-0.5 text-foreground/80 hover:bg-foreground/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      role="menuitem"
                      className="block px-4 py-2 text-sm rounded-md mx-1 my-0.5 text-foreground/80 hover:bg-foreground/5 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      role="menuitem"
                      className="block px-4 py-2 text-sm rounded-md mx-1 my-0.5 text-foreground/80 hover:bg-foreground/5 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </nav>
        </div>
        )}

        {/* A little bottom padding so the absolutely-positioned panel has space to render */}
        <div className="h-0 md:h-0" />
      </div>
    </header>
  )
}
