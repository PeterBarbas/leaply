'use client'

import { ReactNode } from 'react'
import AdminSidebar from './AdminSidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] bg-white">
      <div className="flex flex-col lg:flex-row min-h-full lg:h-full">
        {/* Sidebar */}
        <div className="lg:h-full">
          <AdminSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 sm:p-4 lg:p-6 xl:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
