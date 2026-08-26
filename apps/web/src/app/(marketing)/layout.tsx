import { Suspense } from "react";
import MarketingNav from "./MarketingNav";

export const metadata = {
  title: "Accueil",
  description:
    "Thiqti : moteur de recherche intelligent pour les voitures au Maroc. 1750+ véhicules, IA de scoring multi-critères, recherche en français et darija.",
  openGraph: {
    title: "Thiqti — Recherche intelligente de voitures au Maroc",
    description:
      "1750+ véhicules comparés par IA. Recherche en français et darija, scoring multi-critères, comparaison côte à côte.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <MarketingNav />
      </Suspense>
      {children}
    </>
  );
}
