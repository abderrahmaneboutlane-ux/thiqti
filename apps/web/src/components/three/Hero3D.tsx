"use client";

import { useEffect, useRef } from "react";

/**
 * Hero3D — Champ de particules 3D temps réel sur canvas.
 *
 * Nouveautés :
 *  - Silhouette de voiture tracée par les particules au chargement,
 *    qui se dissout ensuite dans le réseau orbital (morphing).
 *  - Réaction subtile au scroll : les particules s'espacent et
 *    s'assombrissent légèrement pendant les premiers pixels défilés.
 *  - Projection perspective manuelle (rotation Y + inclinaison X),
 *    parallaxe souris, connexions lumineuses.
 *  - Zéro dépendance externe — respecte prefers-reduced-motion.
 */
export default function Hero3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Particle = {
      ox: number; oy: number; oz: number;   // position orbite (réseau)
      sx: number; sy: number; sz: number;   // position silhouette (intro)
      s: number;
      hasSilhouette: boolean;
    };
    type Projected = { sx: number; sy: number; depth: number; z: number; size: number };

    let particles: Particle[] = [];
    let silhouetteLinks: Array<[number, number]> = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let startTime = performance.now();
    let scrollDim = 0;

    const COUNT_ORBIT = 78;
    const MAX_Z = 480;
    const FOV = 420;
    const LINK_DIST = 115;

    /* ── Silhouette de voiture (profil normalisé -1..1) ──────────── */
    function buildSilhouette(): { pts: Array<[number, number]>; scale: number } {
      const body: Array<[number, number]> = [
        [-0.98, -0.06], [-0.96, 0.06], [-0.88, 0.13], [-0.68, 0.17],
        [-0.52, 0.19], [-0.42, 0.34], [-0.24, 0.46], [-0.04, 0.5],
        [0.12, 0.49], [0.26, 0.4], [0.36, 0.25], [0.5, 0.21],
        [0.68, 0.2], [0.84, 0.17], [0.94, 0.1], [0.97, 0.0],
        [0.93, -0.12], [0.8, -0.17],
      ];
      // Roues : arcs échantillonnés
      const wheels: Array<[number, number]> = [];
      for (const [cx, cy] of [[-0.58, -0.14], [0.56, -0.14]] as Array<[number, number]>) {
        for (let i = 0; i <= 14; i++) {
          const a = Math.PI * (i / 14);
          wheels.push([cx + Math.cos(a) * 0.19, cy + Math.sin(a) * 0.19]);
        }
      }
      // Bas de caisse entre les roues
      const bottom: Array<[number, number]> = [
        [-0.34, -0.17], [0.32, -0.17],
      ];
      return { pts: [...body, ...bottom, ...wheels], scale: 235 };
    }

    const initParticles = () => {
      const { pts, scale } = buildSilhouette();
      const silCount = Math.min(pts.length, 64);

      particles = [];
      // Particules de la silhouette (tracent la voiture puis rejoignent l'orbite)
      for (let i = 0; i < silCount; i++) {
        const [px, py] = pts[i];
        const angle = Math.random() * Math.PI * 2;
        const radius = 130 + Math.random() * 195;
        particles.push({
          sx: px * scale + (Math.random() - 0.5) * 6,
          sy: -py * scale * 0.62 + (Math.random() - 0.5) * 6,
          sz: (Math.random() - 0.5) * 90,
          ox: Math.cos(angle) * radius,
          oy: (Math.random() - 0.5) * 250,
          oz: Math.sin(angle) * radius,
          s: 0.7 + Math.random() * 1.4,
          hasSilhouette: true,
        });
      }
      // Particules purement orbitales
      for (let i = particles.length; i < COUNT_ORBIT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 130 + Math.random() * 195;
        particles.push({
          sx: 0, sy: 0, sz: 0,
          ox: Math.cos(angle) * radius,
          oy: (Math.random() - 0.5) * 250,
          oz: Math.sin(angle) * radius,
          s: 0.6 + Math.random() * 1.7,
          hasSilhouette: false,
        });
      }
      // Liens du contour : relier chaque point silhouette à son voisin le plus proche
      silhouetteLinks = [];
      for (let i = 0; i < silCount; i++) {
        let best = -1;
        let bestD = Infinity;
        for (let j = 0; j < silCount; j++) {
          if (i === j) continue;
          const dx = particles[i].sx - particles[j].sx;
          const dy = particles[i].sy - particles[j].sy;
          const d = dx * dx + dy * dy;
          if (d > 4 && d < bestD) { bestD = d; best = j; }
        }
        if (best >= 0 && !silhouetteLinks.some(([a, b]) => (a === best && b === i))) {
          silhouetteLinks.push([i, best]);
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* ── Morphing intro → orbite + réaction au scroll ───────────── */
    const HOLD_MS = 2100;
    const MORPH_MS = 1600;

    const getMorph = (now: number): number => {
      if (reducedMotion) return 0;
      if (now - startTime < HOLD_MS) return 0;
      return Math.min(1, (now - startTime - HOLD_MS) / MORPH_MS);
    };

    const onScroll = () => {
      const vh = Math.max(window.innerHeight, 1);
      scrollDim = Math.min(1, window.scrollY / (vh * 0.85));
    };

    let rotY = 0;
    let rotX = -0.14;
    let tiltTarget = -0.14;
    let yawOffset = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      yawOffset = ((e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.45;
      tiltTarget = -0.14 + ((e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 0.32;
    };

    const project = (p: Particle, morph: number, spread: number): Projected => {
      const ex = morph * morph * (3 - 2 * morph); // smoothstep
      const x0 = p.hasSilhouette ? p.sx + (p.ox - p.sx) * ex : p.ox;
      const y0 = p.hasSilhouette ? p.sy + (p.oy - p.sy) * ex : p.oy;
      const z0 = p.hasSilhouette ? p.sz + (p.oz - p.sz) * ex : p.oz;
      const x = x0 * spread;
      const y = y0 * spread;
      const z = z0 * spread;

      // La silhouette naît dans l'espace libre du hero (bas-droite),
      // puis migre vers le centre du réseau orbital.
      const cx = width * (0.68 + (0.6 - 0.68) * ex);
      const cy = height * (0.78 + (0.52 - 0.78) * ex);

      const yaw = rotY + yawOffset;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = FOV / (FOV + z2 + MAX_Z * 0.55);
      return {
        sx: cx + x1 * scale,
        sy: cy + y1 * scale,
        depth: scale,
        z: z2,
        size: p.s,
      };
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      const now = performance.now();
      const morph = getMorph(now);
      // Scroll : dispersion + assombrissement progressifs
      const spread = 1 + scrollDim * 0.35;
      const dim = 1 - scrollDim * 0.55;

      const pts = particles.map((p) => project(p, morph, spread));
      const inIntro = morph < 0.999;

      // Tracé de la silhouette pendant l'intro (liens ordonnés lumineux)
      if (inIntro && silhouetteLinks.length > 0) {
        const introAlpha = (1 - morph) * 0.85 * dim;
        ctx.lineWidth = 1.4;
        for (const [a, b] of silhouetteLinks) {
          const pa = pts[a];
          const pb = pts[b];
          if (pa.z >= MAX_Z || pb.z >= MAX_Z) continue;
          ctx.strokeStyle = `rgba(125, 211, 252, ${(introAlpha * Math.min(pa.depth, pb.depth)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
          ctx.stroke();
        }
      }

      // Réseau de connexions orbital
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].sx - pts[j].sx;
          const dy = pts[i].sy - pts[j].sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST && pts[i].z < MAX_Z && pts[j].z < MAX_Z) {
            const alpha = (1 - dist / LINK_DIST) * 0.17 * Math.min(pts[i].depth, pts[j].depth) * dim;
            ctx.strokeStyle = `rgba(125, 211, 252, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[i].sx, pts[i].sy);
            ctx.lineTo(pts[j].sx, pts[j].sy);
            ctx.stroke();
          }
        }
      }

      // Points
      for (const pt of pts) {
        const alpha = Math.min(0.9, 0.28 * pt.depth + 0.12) * dim;
        const size = Math.max(0.6, pt.size * pt.depth * 1.9);
        ctx.fillStyle = `rgba(186, 230, 253, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      return now;
    };

    const tick = () => {
      if (!running) return;
      rotY += 0.0016;
      rotX += (tiltTarget - rotX) * 0.045;
      drawFrame();
      raf = requestAnimationFrame(tick);
    };

    initParticles();
    resize();
    onScroll();

    if (reducedMotion) {
      drawFrame(); // rendu statique unique : silhouette figée
    } else {
      raf = requestAnimationFrame(tick);
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reducedMotion) {
        running = true;
        startTime = performance.now() - (HOLD_MS + MORPH_MS); // ne rejoue pas l'intro
        raf = requestAnimationFrame(tick);
      }
    };
    const onResize = () => {
      resize();
      if (reducedMotion) drawFrame();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
