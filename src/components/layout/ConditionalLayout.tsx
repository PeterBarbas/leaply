'use client'

import { usePathname } from 'next/navigation'
import Header from './header'
import Footer from './footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Hide header and footer for signup page and task pages
  const isSignupPage = pathname === '/auth/signup'
  const isTaskPage = pathname.includes('/s/') && pathname.includes('/task/')
  
  if (isSignupPage || isTaskPage) {
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
