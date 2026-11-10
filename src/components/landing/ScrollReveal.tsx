"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in";
  delayMs?: number;
  durationMs?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  animation = "fade-up",
  delayMs = 0,
  durationMs = 600,
  threshold = 0.15,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getTransformStyles = () => {
    if (isVisible) {
      return "opacity-100 translate-x-0 translate-y-0 scale-100";
    }

    switch (animation) {
      case "fade-up":
        return "opacity-0 translate-y-8";
      case "fade-down":
        return "opacity-0 -translate-y-8";
      case "fade-left":
        return "opacity-0 translate-x-8";
      case "fade-right":
        return "opacity-0 -translate-x-8";
      case "zoom-in":
        return "opacity-0 scale-95";
      default:
        return "opacity-0 translate-y-8";
    }
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all ease-out ${getTransformStyles()} ${className}`}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
