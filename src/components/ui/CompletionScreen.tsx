"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Zap, Target, Clock } from "lucide-react";

export interface CompletionScreenProps {
  isOpen: boolean;
  onClose: () => void;
  isCorrect: boolean;
  timeSpent?: string;
  xpEarned?: number;
  accuracy?: number;
  isNavigating?: boolean;
}

export default function CompletionScreen({
  isOpen,
  onClose,
  isCorrect,
  timeSpent = "1:32",
  xpEarned = 90,
  accuracy = 100,
  isNavigating = false,
}: CompletionScreenProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile - Full Screen */}
      <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="h-full w-full bg-primary flex flex-col relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Main Content - Scrollable */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl font-bold text-white mb-8 text-center drop-shadow-lg"
            >
              {isCorrect ? "Lesson complete!" : "Keep trying!"}
            </motion.h1>

            {/* Stats Cards */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full max-w-sm space-y-4"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30 shadow-lg">
                <div className="text-white/90 text-sm font-medium mb-1">TOTAL XP</div>
                <div className="flex items-center justify-center space-x-2 text-white text-2xl font-bold">
                  <Zap className="h-6 w-6 text-yellow-300" />
                  <span>{xpEarned}</span>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30 shadow-lg">
                <div className="text-white/90 text-sm font-medium mb-1">AMAZING</div>
                <div className="flex items-center justify-center space-x-2 text-white text-2xl font-bold">
                  <Target className="h-6 w-6 text-green-300" />
                  <span>{accuracy}%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sticky Claim Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 p-6 bg-primary/90 backdrop-blur-sm border-t border-white/10"
          >
            <Button
              onClick={onClose}
              disabled={isNavigating}
              className="w-full bg-white text-primary hover:bg-gray-100 font-bold py-4 rounded-2xl text-lg shadow-lg border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isNavigating ? "LOADING..." : "CLAIM XP"}
            </Button>
          </motion.div>

          {/* Loading Overlay */}
          {isNavigating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Desktop - Popup */}
      <div className="hidden md:block fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="bg-primary rounded-3xl p-8 max-w-md w-full relative shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl font-bold text-white mb-8 text-center drop-shadow-lg"
            >
              {isCorrect ? "Lesson complete!" : "Keep trying!"}
            </motion.h1>

            {/* Stats Cards */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full space-y-4 mb-8"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30 shadow-lg">
                <div className="text-white/90 text-sm font-medium mb-1">TOTAL XP</div>
                <div className="flex items-center justify-center space-x-2 text-white text-2xl font-bold">
                  <Zap className="h-6 w-6 text-yellow-300" />
                  <span>{xpEarned}</span>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30 shadow-lg">
                <div className="text-white/90 text-sm font-medium mb-1">AMAZING</div>
                <div className="flex items-center justify-center space-x-2 text-white text-2xl font-bold">
                  <Target className="h-6 w-6 text-green-300" />
                  <span>{accuracy}%</span>
                </div>
              </div>
            </motion.div>

            {/* Claim Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button
                onClick={onClose}
                disabled={isNavigating}
                className="w-full bg-white text-primary hover:bg-gray-100 font-bold py-4 rounded-2xl text-lg shadow-lg border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNavigating ? "LOADING..." : "CLAIM XP"}
              </Button>
            </motion.div>

            {/* Loading Overlay */}
            {isNavigating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10"
              >
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
