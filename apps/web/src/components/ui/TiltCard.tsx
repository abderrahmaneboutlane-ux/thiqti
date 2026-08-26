"use client";

import {
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  style?: CSSProperties;
}

/**
 * TiltCard — Effet de profondeur 3D au survol.
 * Perspective + rotateX/rotateY suivant le curseur + reflet lumineux (glare).
 * Désactivé automatiquement sur écrans tactiles et en reduced-motion.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 7,
  glare = true,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = ((0.5 - py) * maxTilt).toFixed(2);
    const ry = ((px - 0.5) * maxTilt).toFixed(2);
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    el.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    if (glareRef.current) glareRef.current.style.opacity = "1";
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card relative will-change-transform ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 250ms cubic-bezier(0.16,1,0.3,1)",
        ...style,
      }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(420px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.18), transparent 60%)",
          }}
        />
      )}
    </div>
  );
}
