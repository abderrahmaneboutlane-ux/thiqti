"use client";

import { useEffect, useState } from "react";

/**
 * AnimatedMeshGradient - Un fond animé très discret.
 * Utilise un radial-gradient animé via background-position.
 * Désactivé si `prefers-reduced-motion` est actif.
 */
export default function AnimatedMeshGradient() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 -z-50 pointer-events-none w-full h-full ${
        reducedMotion ? "" : "animate-mesh-breathing"
      }`}
      style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(219, 234, 254, 0.5) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(191, 219, 254, 0.4) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(224, 231, 255, 0.5) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(239, 246, 255, 0.6) 0px, transparent 50%)
        `,
        backgroundSize: "200% 200%",
        backgroundColor: "#F8FAFC", // slate-50 base
      }}
    />
  );
}
