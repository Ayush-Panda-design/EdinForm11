"use client";

import { useEffect, useRef } from "react";
import { useInView } from "~/components/landing/motion";

type LandingVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  label?: string;
  playWhenVisible?: boolean;
  autoPlay?: boolean;
  kenBurns?: boolean;
  playOnHover?: boolean;
};

export function LandingVideo({
  src,
  poster,
  className = "",
  label,
  playWhenVisible = true,
  autoPlay = true,
  kenBurns = false,
  playOnHover = false,
}: LandingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, inView } = useInView(0.15);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || playOnHover) return;

    if (playWhenVisible && inView) {
      void video.play().catch(() => {});
    } else if (playWhenVisible) {
      video.pause();
    }
  }, [inView, playWhenVisible, playOnHover]);

  const handleEnter = () => {
    const video = videoRef.current;
    if (video && playOnHover) void video.play().catch(() => {});
  };

  const handleLeave = () => {
    const video = videoRef.current;
    if (video && playOnHover) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div
      ref={ref}
      className={`mkt-video-wrap${kenBurns ? " mkt-video-kenburns" : ""} ${className}`.trim()}
      onMouseEnter={playOnHover ? handleEnter : undefined}
      onMouseLeave={playOnHover ? handleLeave : undefined}
    >
      <video
        ref={videoRef}
        className="mkt-video"
        muted
        loop
        playsInline
        autoPlay={autoPlay && !playWhenVisible && !playOnHover}
        preload="metadata"
        poster={poster}
        aria-label={label}
      >
        <source src={src} type="video/mp4" />
      </video>
      {label && <span className="mkt-video-badge">{label}</span>}
    </div>
  );
}
