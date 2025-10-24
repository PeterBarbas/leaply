'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PlaceholderTabProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export default function PlaceholderTab({ title, description, icon: Icon }: PlaceholderTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              This feature is currently under development. We're working hard to bring you the best experience.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Construction className="h-4 w-4" />
            <span>Under Construction</span>
          </div>
        </div>
      </Card>

      {/* Back to Profile */}
      <div className="flex justify-start">
        <Button asChild variant="outline">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
      </div>
    </div>
  )
}
