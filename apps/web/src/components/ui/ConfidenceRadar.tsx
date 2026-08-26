"use client";

import { useEffect, useRef } from "react";

export interface RadarAxis {
  label: string;
  /** Valeur 0-100 */
  value: number;
  /** Poids du critère dans le score TOPSIS (0-1), optionnel */
  weight?: number;
}

interface ConfidenceRadarProps {
  axes: RadarAxis[];
  className?: string;
}

/**
 * ConfidenceRadar — "Radar de confiance" Thiqti (signature).
 * Radar chart interactif dessiné sur canvas natif (zéro dépendance) :
 *  - légère rotation 3D suivant la souris (yaw/pitch),
 *  - remplissage animé des axes au montage,
 *  - surbrillance + valeur au survol d'un sommet,
 *  - pause hors viewport (IntersectionObserver),
 *  - rendu statique si prefers-reduced-motion,
 *  - liste accessible pour lecteurs d'écran.
 */
export default function ConfidenceRadar({ axes, className = "" }: ConfidenceRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ mouseX: 0, mouseY: 0, hoverIndex: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || axes.length < 3) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const n = axes.length;
    const TAU = Math.PI * 2;

    const vertex = (i: number, radiusFactor: number, rot: number, tilt: number) => {
      const a = rot + (i / n) * TAU - Math.PI / 2;
      const x = Math.cos(a) * radiusFactor;
      const y = Math.sin(a) * radiusFactor * tilt; // aplatissement = pseudo-3D
      return { x, y, depth: (Math.sin(a) + 1) / 2 };
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = reduced ? 1 : Math.min(1, (now - start) / 900);
      const ease = 1 - Math.pow(1 - t, 3);
      const { mouseX, mouseY, hoverIndex } = stateRef.current;

      const cx = width / 2;
      const cy = height / 2 + 4;
      const baseR = Math.min(width, height) / 2 - 34;
      // Rotation lente en idle + décalage suivant la souris (effet 3D)
      const idleRot = reduced ? -0.12 : (now - start) * 0.00012;
      const rot = idleRot + mouseX * 0.35;
      const tilt = 0.72 - mouseY * 0.16;

      // Grille : anneaux
      for (let ring = 1; ring <= 4; ring++) {
        const rf = ring / 4;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const p = vertex(i % n, rf, rot, tilt);
          const px = cx + p.x * baseR;
          const py = cy + p.y * baseR;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(148, 163, 184, ${(0.22 - ring * 0.03).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axes + labels
      ctx.font = "600 10px Inter, system-ui, sans-serif";
      for (let i = 0; i < n; i++) {
        const p = vertex(i, 1, rot, tilt);
        const px = cx + p.x * baseR;
        const py = cy + p.y * baseR;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
        ctx.stroke();

        const lx = cx + p.x * (baseR + 18);
        const ly = cy + p.y * (baseR + 14);
        ctx.fillStyle = i === hoverIndex ? "#7C3AED" : "#64748B";
        ctx.textAlign = "center";
        ctx.fillText(axes[i].label, lx, ly + 3);
      }

      // Polygone des valeurs (remplissage animé)
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const idx = i % n;
        const v = (axes[idx].value / 100) * ease;
        const p = vertex(idx, Math.max(v, 0.02), rot, tilt);
        const px = cx + p.x * baseR;
        const py = cy + p.y * baseR;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const grad = ctx.createLinearGradient(cx - baseR, cy - baseR, cx + baseR, cy + baseR);
      grad.addColorStop(0, "rgba(2, 132, 199, 0.28)");
      grad.addColorStop(1, "rgba(124, 58, 237, 0.28)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(124, 58, 237, 0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sommets
      for (let i = 0; i < n; i++) {
        const v = (axes[i].value / 100) * ease;
        const p = vertex(i, Math.max(v, 0.02), rot, tilt);
        const px = cx + p.x * baseR;
        const py = cy + p.y * baseR;
        const hovered = i === hoverIndex;
        ctx.beginPath();
        ctx.arc(px, py, hovered ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = hovered ? "#7C3AED" : "#0284C7";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (hovered) {
          const label = `${axes[i].label} · ${Math.round(axes[i].value)}/100`;
          ctx.font = "700 11px Inter, system-ui, sans-serif";
          const tw = ctx.measureText(label).width;
          const bx = Math.min(Math.max(px - tw / 2 - 8, 4), width - tw - 20);
          const by = Math.max(py - 34, 4);
          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(bx, by, tw + 16, 22, 8);
          } else {
            ctx.rect(bx, by, tw + 16, 22);
          }
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "left";
          ctx.fillText(label, bx + 8, by + 15);
        }
      }
    };

    const loop = (now: number) => {
      if (!visible) { raf = 0; return; }
      draw(now);
      if (!reduced) raf = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      stateRef.current.mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      stateRef.current.mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      // Sommet le plus proche
      const cx = rect.width / 2;
      const cy = rect.height / 2 + 4;
      const baseR = Math.min(rect.width, rect.height) / 2 - 34;
      const rot = (reduced ? -0.12 : (performance.now() - start) * 0.00012) + stateRef.current.mouseX * 0.35;
      const tilt = 0.72 - stateRef.current.mouseY * 0.16;
      let best = -1;
      let bestD = 26 * 26;
      for (let i = 0; i < n; i++) {
        const v = (axes[i].value / 100) * (reduced ? 1 : Math.min(1, (performance.now() - start) / 900));
        const p = vertex(i, Math.max(v, 0.02), rot, tilt);
        const dx = cx + p.x * baseR - (e.clientX - rect.left);
        const dy = cy + p.y * baseR - (e.clientY - rect.top);
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = i; }
      }
      stateRef.current.hoverIndex = best;
      wrap.style.cursor = best >= 0 ? "pointer" : "default";
    };
    const onMouseLeave = () => {
      stateRef.current.mouseX = 0;
      stateRef.current.mouseY = 0;
      stateRef.current.hoverIndex = -1;
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
      },
      { threshold: 0.05 }
    );

    resize();
    io.observe(wrap);
    wrap.addEventListener("mousemove", onMouseMove, { passive: true });
    wrap.addEventListener("mouseleave", onMouseLeave);
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      if (reduced) draw(performance.now());
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      wrap.removeEventListener("mousemove", onMouseMove);
      wrap.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [axes]);

  if (axes.length < 3) return null;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full"
        style={{ aspectRatio: "10 / 8.5" }}
      />
      <ul className="sr-only">
        {axes.map((a) => (
          <li key={a.label}>
            {a.label} : {Math.round(a.value)} sur 100
            {typeof a.weight === "number" ? ` (poids ${(a.weight * 100).toFixed(0)}%)` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
