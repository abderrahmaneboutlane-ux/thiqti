"use client";

import { useEffect } from "react";

/**
 * ScrollDepthEffect — Profondeur discrète au scroll.
 * Les éléments portant [data-scroll-depth="<facteur>"] se décalent
 * très légèrement (translateY) à une vitesse différente du contenu,
 * créant une sensation de plan arrière sans parallax criard.
 *
 * Un seul listener scroll global + rAF, quel que soit le nombre
 * d'éléments. Facteur typique : 0.04–0.08. Désactivé si
 * prefers-reduced-motion ou écran < 768px.
 */
export default function ScrollDepthEffect() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let elements: HTMLElement[] = [];
    let ready = false;

    const collect = () => {
      elements = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-depth]"));
    };

    const update = () => {
      raf = 0;
      if (!ready) return;
      if (window.innerWidth < 768) {
        for (const el of elements) el.style.transform = "";
        return;
      }
      for (const el of elements) {
        const factor = parseFloat(el.dataset.scrollDepth || "0.06");
        const rect = el.getBoundingClientRect();
        // Progression -1 (sous le viewport) → 1 (au-dessus)
        const progress = 1 - (rect.top + rect.height / 2) / (window.innerHeight + rect.height);
        el.style.transform = `translate3d(0, ${(progress * factor * 120).toFixed(1)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Différer après hydratation complète pour éviter tout mismatch SSR
    const warmup = window.setTimeout(() => {
      ready = true;
      collect();
      update();
    }, 600);

    const observer = new MutationObserver(() => {
      if (ready) collect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.clearTimeout(warmup);
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      for (const el of elements) el.style.transform = "";
    };
  }, []);

  return null;
}
