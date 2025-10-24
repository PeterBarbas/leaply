'use client'

import { usePathname } from 'next/navigation'
import Header from './header'
import Footer from './footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Hide header and footer only for signup page
  const isSignupPage = pathname === '/auth/signup'
  
  if (isSignupPage) {
    return <>{children}</>
  }
  
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
