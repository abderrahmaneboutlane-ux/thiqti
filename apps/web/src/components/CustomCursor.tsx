"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type CursorState = "default" | "hover" | "view" | "text" | "drag";

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>("default");
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  
  // Pos réelle de la souris
  const mouse = useRef({ x: 0, y: 0 });
  // Pos interpolée du curseur principal
  const dot = useRef({ x: 0, y: 0 });
  // Pos interpolée de la trainée (plus lente)
  const trail = useRef({ x: 0, y: 0 });
  
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (!mounted || isTouch) return;

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Chercher un ancêtre avec data-cursor
      const cursorTarget = target.closest("[data-cursor]");
      if (cursorTarget) {
        setCursorState(cursorTarget.getAttribute("data-cursor") as CursorState);
        return;
      }

      // Détection automatique des liens, boutons, champs de texte
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === "a" || 
        tagName === "button" || 
        target.closest("a") || 
        target.closest("button") ||
        target.classList.contains("btn-primary")
      ) {
        setCursorState("hover");
      } else if (
        tagName === "input" || 
        tagName === "textarea" || 
        target.isContentEditable
      ) {
        setCursorState("text");
      } else {
        setCursorState("default");
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });

    // Initial position to avoid flying from 0,0
    dot.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    trail.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const tick = () => {
      // Inertie plus marquée pour un côté premium/fluide
      const dotSpeed = reducedMotion ? 1 : 0.15;
      const trailSpeed = reducedMotion ? 1 : 0.08;

      dot.current.x += (mouse.current.x - dot.current.x) * dotSpeed;
      dot.current.y += (mouse.current.y - dot.current.y) * dotSpeed;

      trail.current.x += (mouse.current.x - trail.current.x) * trailSpeed;
      trail.current.y += (mouse.current.y - trail.current.y) * trailSpeed;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (trailRef.current && !reducedMotion) {
        // Stretch the trail based on velocity
        const vx = mouse.current.x - trail.current.x;
        const vy = mouse.current.y - trail.current.y;
        const velocity = Math.sqrt(vx * vx + vy * vy);
        const scale = Math.min(velocity * 0.02, 2);
        const angle = Math.atan2(vy, vx);

        trailRef.current.style.transform = `
          translate3d(${trail.current.x}px, ${trail.current.y}px, 0) 
          translate(-50%, -50%) 
          rotate(${angle}rad) 
          scaleX(${1 + scale})
        `;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mounted, isTouch, reducedMotion]);

  if (!mounted || isTouch) return null;

  // Variants de style selon l'état
  let cursorClasses = "h-4 w-4 bg-brand-600 rounded-full mix-blend-multiply";
  let trailClasses = "h-8 w-8 border border-brand-500/30 rounded-full bg-brand-500/10 backdrop-blur-sm";
  let innerContent = null;

  if (cursorState === "hover") {
    cursorClasses = "h-12 w-12 border-2 border-brand-500 bg-brand-500/20 rounded-full backdrop-blur-sm";
    trailClasses = "opacity-0"; // Hide trail on hover
  } else if (cursorState === "view") {
    cursorClasses = "h-16 w-16 bg-white text-brand-600 rounded-full flex items-center justify-center shadow-xl border border-slate-200";
    trailClasses = "opacity-0";
    innerContent = <Search className="h-6 w-6" />;
  } else if (cursorState === "text") {
    cursorClasses = "h-8 w-1 bg-brand-600 rounded-sm";
    trailClasses = "opacity-0";
  } else if (cursorState === "drag") {
    cursorClasses = "h-12 w-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl";
    trailClasses = "opacity-0";
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (pointer: fine) {
          body, a, button, input, textarea, select {
            cursor: none !important;
          }
        }
      `}} />
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {!reducedMotion && (
          <div
            ref={trailRef}
            className={`absolute top-0 left-0 origin-center transition-opacity duration-300 ${trailClasses}`}
            style={{ willChange: "transform" }}
          />
        )}
        <div
          ref={cursorRef}
          className={`absolute top-0 left-0 origin-center flex items-center justify-center transition-[width,height,background-color,border-radius,opacity] duration-300 ${cursorClasses}`}
          style={{ willChange: "transform" }}
        >
          {innerContent}
        </div>
      </div>
    </>
  );
}
