import type { Config } from "tailwindcss";

/*
 * ═══════════════════════════════════════════════════════════════════
 * THIQTI — "MARKETPLACE PRO" Design System
 * Marketplace auto marocain — confiance, clarté, conversion.
 * ═══════════════════════════════════════════════════════════════════
 *
 * PALETTE PHILOSOPHY:
 * - Neutral (Slate 950→50) : Fond propre, lisibilité maximale.
 *   Page: slate-50, Cards: white, Borders: slate-200.
 * - Brand (Blue 600) : #0284C7 — confiance, action principale.
 *   Hover: Blue 700, Active: Blue 800, Light: Blue 50/100.
 * - Price (Indigo 600) : #2563EB — prix mis en valeur, hiérarchie claire.
 * - Success (Emerald 600) : #059669 — vérifié, score élevé, actions positives.
 * - Warning (Amber 600) : #D97706 — attention, score moyen.
 * - Danger (Red 600) : #DC2626 — alerte, score faible, actions destructrices.
 * - Glass : backdrop-blur-md + white/80 + border slate-200/50.
 *
 * SPACING SYSTEM:
 * - Base unit: 4px. Scale: 1-32 (4px-128px).
 * - Component gaps: gap-3 (12px), gap-4 (16px), gap-6 (24px).
 * - Section padding: py-12 (mobile), py-20 (desktop).
 *
 * TYPOGRAPHY:
 * - Display: DM Serif Display (hero only)
 * - UI: Inter, variable weight 400-700
 * - Scale: xs(12) sm(14) base(16) lg(18) xl(20) 2xl(24) 3xl(30) 4xl(36) 5xl(48)
 * - Line-height: tight(1.1) snug(1.375) normal(1.5) relaxed(1.625)
 *
 * SHADOWS — 3 niveaux + focus ring:
 * - sm: 0 1px 2px rgba(15,23,42,.03)
 * - md: 0 4px 12px rgba(15,23,42,.05)
 * - lg: 0 12px 24px rgba(15,23,42,.08)
 * - Card hover: md + ring 1px blue-200
 * - Focus ring: 0 0 0 3px rgba(2,132,199,.25)
 *
 * RADIUS: sm(6px) md(10px) lg(14px) xl(18px) 2xl(24px) full
 *
 * ANIMATIONS: Subtiles, fonctionnelles. 150-200ms. Respect prefers-reduced-motion.
 * ═══════════════════════════════════════════════════════════════════
 */

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* ── Brand Blue — Confiance, action ──────────────────────── */
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#0284C7",  // PRIMARY
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
          950: "#082F49",
        },

        /* ── Logo — Couleurs extraites de Logo.jpg ───────────────── */
        logo: {
          ivory: "#F3F4EF",   // fond du logo
          steel: "#9BABBA",   // texte + carrosserie
          sky: "#9ED2EA",     // accents (roues / fenêtres)
        },

        /* ── Price Indigo — Hiérarchie prix ─────────────────────── */
        price: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#2563EB",  // PRIMARY PRICE
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },

        /* ── Accent Violet — Fonctionnalités signature (IA, radar) ─ */
        accent: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",  // ACCENT SIGNATURE
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },

        /* ── Semantic — Utilisés pour états, scores, badges ──────── */
        success: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",  // Vérifié, score ≥85
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",  // Score moyen
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",  // Score faible, actions destructrices
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },

        /* ── Neutral Slate — Fond, texte, bordures ───────────────── */
        slate: {
          50: "#F8FAFC",   // Page background
          100: "#F1F5F9",  // Section alt background
          200: "#E2E8F0",  // Borders, dividers
          300: "#CBD5E1",  // Input borders, disabled
          400: "#94A3B8",  // Placeholder, icons
          500: "#64748B",  // Secondary text
          600: "#475569",  // Body text
          700: "#334155",  // Heading text
          800: "#1E293B",  // Dark heading
          900: "#0F172A",  // Max contrast
          950: "#020617",
        },

        /* Alias legacy */
        navy: "#1D4ED8",
        corporate: {
          DEFAULT: "#0284C7",
          50: "#EFF6FF", 100: "#DBEAFE", 200: "#BFDBFE", 300: "#93C5FD",
          400: "#60A5FA", 500: "#3B82F6", 600: "#0284C7", 700: "#0369A1",
          800: "#075985", 900: "#0C4A6E",
        },
      },

      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-dm-serif)", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        base: ["1rem", { lineHeight: "1.625", letterSpacing: "0" }],
        lg: ["1.125rem", { lineHeight: "1.6", letterSpacing: "-0.01em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.015em" }],
        "2xl": ["1.5rem", { lineHeight: "1.4", letterSpacing: "-0.02em" }],
        "3xl": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "4xl": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.025em" }],
        "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "6xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },

      spacing: {
        0.5: "0.125rem",  // 2px
        1.5: "0.375rem",  // 6px
        2.5: "0.625rem",  // 10px
        3.5: "0.875rem",  // 14px
        4.5: "1.125rem",  // 18px
        5.5: "1.375rem",  // 22px
        6.5: "1.625rem",  // 26px
        7.5: "1.875rem",  // 30px
        8.5: "2.125rem",  // 34px
        9.5: "2.375rem",  // 38px
        13: "3.25rem",    // 52px
        15: "3.75rem",    // 60px
        18: "4.5rem",     // 72px
        22: "5.5rem",     // 88px
        26: "6.5rem",     // 104px
        30: "7.5rem",     // 120px
      },

      borderRadius: {
        sm: "0.375rem",   // 6px
        md: "0.625rem",   // 10px
        lg: "0.875rem",   // 14px
        xl: "1.125rem",   // 18px
        "2xl": "1.5rem",  // 24px
        "3xl": "2rem",    // 32px
        full: "9999px",
      },

      boxShadow: {
        // Elévation 1 - Subtile, au repos
        "elev-1": "0 1px 2px rgba(15,23,42,0.03), 0 1px 1px rgba(15,23,42,0.02)",
        // Elévation 2 - Carte standard
        "elev-2": "0 2px 4px rgba(15,23,42,0.03), 0 8px 16px rgba(15,23,42,0.04)",
        // Elévation 3 - Carte survol, dropdown, modal
        "elev-3": "0 4px 8px rgba(15,23,42,0.04), 0 16px 32px rgba(15,23,42,0.06)",
        // Elévation 4 - Modal, drawer, popover
        "elev-4": "0 8px 16px rgba(15,23,42,0.05), 0 24px 48px rgba(15,23,42,0.08)",
        // Focus ring
        focus: "0 0 0 3px rgba(2,132,199,0.25)",
        // Brand glow (survol bouton primaire)
        "brand-glow": "0 4px 14px rgba(2,132,199,0.3), 0 2px 4px rgba(2,132,199,0.15)",
        // Carte listing au repos
        "card-listing": "0 1px 3px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
        // Carte listing survol
        "card-listing-hover": "0 4px 12px rgba(15,23,42,0.06), 0 16px 32px rgba(15,23,42,0.08), 0 0 0 1px rgba(2,132,199,0.1)",
        // Glass panel
        glass: "0 2px 8px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
      },

      animation: {
        "fade-in": "fadeIn 200ms cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-up": "slideUp 300ms cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-down": "slideDown 200ms cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in": "scaleIn 150ms cubic-bezier(0.34,1.56,0.64,1) forwards",
        "slide-in-right": "slideInRight 250ms cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-out-right": "slideOutRight 200ms cubic-bezier(0.4,0,1,1) forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "mesh-breathing": "meshBreathing 18s ease-in-out infinite alternate",
      },

      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideDown: { from: { opacity: "0", transform: "translateY(-10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { from: { opacity: "0", transform: "scale(0.97)" }, to: { opacity: "1", transform: "scale(1)" } },
        slideInRight: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        slideOutRight: { from: { transform: "translateX(0)" }, to: { transform: "translateX(100%)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        meshBreathing: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 100%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
      },

      transitionDuration: {
        0: "0ms",
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        250: "250ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
        700: "700ms",
        1000: "1000ms",
      },

      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        snappy: "cubic-bezier(0.2, 0, 0, 1)",
      },

      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },

      zIndex: {
        base: "1",
        dropdown: "100",
        sticky: "200",
        "nav-bottom": "400",
        modal: "500",
        overlay: "550",
        popover: "600",
        toast: "700",
        tooltip: "800",
      },

      container: {
        center: true,
        padding: {
          DEFAULT: "1.5rem",
          sm: "2rem",
          lg: "2.5rem",
          xl: "3rem",
          "2xl": "4rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1440px",
        },
      },
    },
  },
  plugins: [],
};

export default config;