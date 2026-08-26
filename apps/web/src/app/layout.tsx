import { Suspense } from "react";
import { Inter, DM_Serif_Display } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollToTop from "@/components/ScrollToTop";
import FloatingBottomNav from "@/components/FloatingBottomNav";
import AnimatedMeshGradient from "@/components/AnimatedMeshGradient";
import CustomCursor from "@/components/CustomCursor";
import ScrollDepthEffect from "@/components/ScrollDepthEffect";
import CommandPalette from "@/components/CommandPalette";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif", display: "swap" });

export const metadata = {
  title: {
    default: "Thiqti — Recherche intelligente de voitures au Maroc",
    template: "%s | Thiqti",
  },
  description:
    "Trouvez votre voiture idéale au Maroc avec l'intelligence artificielle. Comparez 1750+ véhicules neufs et d'occasion de 12 sources. Recherche en français et darija, scoring TOPSIS, comparaison côte à côte.",
  keywords: [
    "voiture maroc", "automobile occasion", "voiture neuve", "prix voiture",
    "comparateur auto", "recherche voiture", "Dacia", "Renault", "Peugeot",
    "Toyota", "Voiture Casablanca", "Voiture Rabat", "Voiture Marrakech",
    "IA automobile", "TOPSIS", "Thiqti",
  ],
  authors: [{ name: "Thiqti", url: "https://thiqti.com" }],
  creator: "Thiqti",
  publisher: "Thiqti",
  metadataBase: new URL("https://thiqti.com"),
  openGraph: {
    title: "Thiqti — Recherche intelligente de voitures au Maroc",
    description:
      "1750+ véhicules comparés par IA. Recherche en français et darija, scoring multi-critères, comparaison côte à côte.",
    type: "website",
    locale: "fr_MA",
    siteName: "Thiqti",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "Thiqti — Moteur de recherche auto IA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thiqti — Recherche intelligente de voitures au Maroc",
    description:
      "1750+ véhicules comparés par IA. Recherche en français et darija.",
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://thiqti.com" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#0284C7" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`min-h-screen bg-transparent text-slate-900 antialiased ${inter.variable} ${dmSerif.variable}`}>
        <AnimatedMeshGradient />
        <Suspense fallback={null}>
          <ToastProvider>
            <ScrollProgress />
            <ScrollDepthEffect />
            <CommandPalette />
            <ScrollToTop />
            <FloatingBottomNav />
            <CustomCursor />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-1/2 focus:z-[100] focus:-translate-x-1/2 focus:translate-y-2 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-600 focus:shadow-lg focus:ring-1 focus:ring-blue-200"
            >
              Aller au contenu principal
            </a>
            <main id="main-content">{children}</main>
          </ToastProvider>
        </Suspense>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}` }} />
      </body>
    </html>
  );
}
