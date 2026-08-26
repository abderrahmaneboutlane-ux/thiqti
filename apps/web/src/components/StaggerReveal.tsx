"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  scale?: boolean;
}

export default function StaggerReveal({
  children,
  className = "",
  staggerMs = 70,
  direction = "up",
  scale = false,
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const directionStyles: Record<string, string> = {
      up: "translateY(20px)",
      down: "translateY(-20px)",
      left: "translateX(20px)",
      right: "translateX(-20px)",
      none: "none",
    };

    const children = Array.from(container.children) as HTMLElement[];
    children.forEach((child, i) => {
      child.style.opacity = "0";
      child.style.transform = `${directionStyles[direction]}${scale ? " scale(0.96)" : ""}`;
      child.style.transition = "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      child.style.transitionDelay = `${i * staggerMs}ms`;
      child.style.willChange = "opacity, transform";
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child) => {
            child.style.opacity = "1";
            child.style.transform = "none";
          });
          observer.unobserve(container);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [staggerMs, direction, scale]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
