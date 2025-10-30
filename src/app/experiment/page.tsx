'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { X, Mail, CheckCircle } from 'lucide-react';

export default function ExperimentPage() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Track page visit
  useEffect(() => {
    const trackEvent = async (eventType: string, data?: any) => {
      try {
        await fetch('/api/experiment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventType,
            sessionId,
            ...data,
          }),
        });
      } catch (error) {
        console.error('Failed to track event:', error);
      }
    };

    // Track page visit
    trackEvent('page_visit', {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    });
    
    // Track session time when user leaves
    const handleBeforeUnload = () => {
      const sessionTime = Date.now() - sessionStartTime;
      trackEvent('session_end', {
        sessionDurationMs: sessionTime,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionStartTime, sessionId]);

  const handleEarlyAccessClick = async () => {
    // Track button click
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'fake_door_click', {
          page: '/experiment',
          label: 'Get Early Access',
        });
      }
      await fetch('/api/experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'button_click',
          sessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to track button click:', error);
    }
    
    setIsEmailModalOpen(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Track email submission
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'fake_door_submit_email', {
          page: '/experiment',
        });
      }
      await fetch('/api/experiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'email_submit',
          sessionId,
          email: email.trim(),
        }),
      });
    } catch (error) {
      console.error('Failed to track email submission:', error);
    }

    setIsSubmitted(true);
    
    // Close modal after 2 seconds
    setTimeout(() => {
      setIsEmailModalOpen(false);
      setIsSubmitted(false);
      setEmail('');
    }, 2000);
  };

  const handleCloseModal = () => {
    setIsEmailModalOpen(false);
    setIsSubmitted(false);
    setEmail('');
  };

  return (
    <main className="relative flex-1 overflow-hidden bg-gradient-to-b from-white via-[#f7f9fc] to-[#edf2f7] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,theme(colors.indigo.400/.35),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22><path d=%22M0 39.5H40 M39.5 0V40%22 stroke=%22%238a8a8a22%22/></svg>')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[55vh] w-[55vh] rotate-12 rounded-full bg-[conic-gradient(from_220deg,theme(colors.sky.400/.25),theme(colors.fuchsia.400/.25),transparent_55%)] blur-2xl" />
      </div>

      {/* Hero */}
      <section className="flex relative z-10 justify-center items-center bg-white min-h-[80vh]">
        <div className="mx-auto max-w-6xl h-full w-full px-6 py-16 text-center">
          {/* Glass card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl rounded-3xl"
          >
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-xs text-foreground/70 dark:bg-background/40"
              >
                <span>🚀 Coming Soon - Get Early Access</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
              >
                The future of career exploration,{' '}
                <span className="text-primary">
                  powered by AI
                </span>
                {' '}is almost here.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                Experience realistic job simulations, AI-powered career guidance, and personalized learning paths that adapt to your goals.
              </motion.p>

              {/* Early Access Button */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-8"
              >
                <Button
                  onClick={handleEarlyAccessClick}
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Early Access
                  <Mail className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="mt-4 text-xs text-muted-foreground"
              >
                Join the waitlist • Be the first to experience the future
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Email Modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              {isSubmitted ? 'Thank You!' : 'Get Early Access'}
            </DialogTitle>
          </DialogHeader>
          
          {isSubmitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                You're on the list! We'll notify you when we launch.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Join Waitlist
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                We'll only use your email to notify you about the launch.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/5 to-transparent dark:from-black/30" />
    </main>
  );
}
