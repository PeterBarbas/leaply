"use client";

import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenVideoPlayerProps {
  videoUrl: string;
  title?: string;
  description?: string;
  onClose: () => void;
}

// Helper function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

// Helper function to convert Vimeo URL to embed URL
function getVimeoEmbedUrl(url: string): string | null {
  // Matches vimeo.com/123456789 or vimeo.com/video/123456789
  const vimeoRegex = /(?:vimeo\.com\/)(?:video\/)?(\d+)/;
  const match = url.match(vimeoRegex);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

// Helper function to check if URL is a direct video file
function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?.*)?$/i.test(url);
}

export default function FullscreenVideoPlayer({
  videoUrl,
  title,
  description,
  onClose,
}: FullscreenVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Determine if this is a YouTube, Vimeo URL or direct video
  const isYouTube = getYouTubeEmbedUrl(videoUrl) !== null;
  const isVimeo = getVimeoEmbedUrl(videoUrl) !== null;
  const isDirectVideo = isDirectVideoUrl(videoUrl);
  let embedUrl: string | null = null;
  
  if (isYouTube) {
    embedUrl = getYouTubeEmbedUrl(videoUrl);
    if (embedUrl) {
      embedUrl += embedUrl.includes("?") ? "&autoplay=1" : "?autoplay=1";
      embedUrl += "&rel=0&modestbranding=1&playsinline=1&fs=1";
    }
  } else if (isVimeo) {
    embedUrl = getVimeoEmbedUrl(videoUrl);
    if (embedUrl) {
      embedUrl += embedUrl.includes("?") ? "&autoplay=1" : "?autoplay=1";
      embedUrl += "&autopause=0";
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    // Try autoplay for direct videos (muted to satisfy policies)
    try {
      video.muted = true;
      setIsMuted(true);
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {});
      }
    } catch {}

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="w-full h-full flex flex-col relative">
        {/* Close button - top right corner */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white hover:bg-white hover:bg-opacity-20 bg-black bg-opacity-50 rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Video Container - Fullscreen within modal */}
        <div className="flex-1 flex items-center justify-center p-0 overflow-hidden">
          {(isYouTube || isVimeo) && embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              title={title || "Video"}
            />
          ) : isDirectVideo ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              controls={false}
              autoPlay
              muted
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-lg mb-4">Unsupported video format</p>
                <p className="text-sm text-gray-400">Please use a direct video file (.mp4, .webm) or YouTube/Vimeo URL</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls - Only show for direct video files */}
        {isDirectVideo && (
          <div className="p-4 bg-black bg-opacity-50">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>

              {/* Time Display */}
              <span className="text-white text-sm font-mono min-w-[80px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Progress Bar */}
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`,
                  }}
                />
              </div>

              {/* Volume */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
