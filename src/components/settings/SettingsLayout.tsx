'use client'

import { ReactNode } from 'react'
import SettingsSidebar from './SettingsSidebar'

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-white">
      <div className="flex flex-col lg:flex-row min-h-full">
        {/* Sidebar */}
        <SettingsSidebar />
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
