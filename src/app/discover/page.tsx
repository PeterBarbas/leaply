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
    </main>
  )
}
