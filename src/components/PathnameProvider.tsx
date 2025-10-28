'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function PathnameProvider() {
  const pathname = usePathname()

  useEffect(() => {
    // Add pathname as data attribute to body for CSS targeting
    document.body.setAttribute('data-pathname', pathname)
    
    return () => {
      document.body.removeAttribute('data-pathname')
    }
  }, [pathname])

  return null
}
