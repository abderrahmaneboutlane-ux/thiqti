export type SourceCategory =
  | "constructeur"
  | "concession"
  | "presse"
  | "reseau_social"
  | "forum"
  | "autre";

export type CollectionMethod =
  | "api"
  | "scraping_html"
  | "scraping_js"
  | "catalogue_statique"
  | "flux_partenaire";

export type LicityStatus = "valide" | "a_verifier" | "rejete";

export type RiskLevel = "faible" | "moyen" | "eleve";

export interface AuthorizedSource {
  name: string;
  category: SourceCategory;
  baseUrl: string;
  method: CollectionMethod;
  refreshIntervalHours: number;
  licityStatus: LicityStatus;
  licityVerifiedAt: string | null;
  robotsTxtChecked: boolean;
  termsChecked: boolean;
  riskLevel: RiskLevel;
  notes: string;
}

export const AUTHORIZED_SOURCES: AuthorizedSource[] = [
  {
    name: "Marques Officielles",
    category: "constructeur",
    baseUrl: "interne",
    method: "catalogue_statique",
    refreshIntervalHours: 168,
    licityStatus: "valide",
    licityVerifiedAt: "2026-08-07",
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "faible",
    notes:
      "Données publiques issues des brochures constructeur. Aucune collecte automatisée requise.",
  },
  {
    name: "Auto24.ma",
    category: "concession",
    baseUrl: "https://auto24.ma",
    method: "api",
    refreshIntervalHours: 24,
    licityStatus: "valide",
    licityVerifiedAt: "2026-08-07",
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "faible",
    notes:
      "API publique officielle. Collecte autorisée par défaut via l'API.",
  },
  {
    name: "Moteur.ma",
    category: "presse",
    baseUrl: "https://moteur.ma",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: true,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "robots.txt vérifié — aucune interdiction explicite pour les chemins utilisés. Vérifier les CGU.",
  },
  {
    name: "SoeezAuto.ma",
    category: "presse",
    baseUrl: "https://soeezauto.ma",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "Site d'annonces automobiles. robots.txt et CGU non vérifiés.",
  },
  {
    name: "Avito.ma",
    category: "autre",
    baseUrl: "https://avito.ma",
    method: "scraping_js",
    refreshIntervalHours: 72,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: true,
    termsChecked: true,
    riskLevel: "eleve",
    notes:
      "CGU interdisent explicitement le scraping. Risque juridique élevé. Envisager l'API officielle ou une autorisation écrite.",
  },
  {
    name: "OVoiture.ma",
    category: "autre",
    baseUrl: "https://ovoiture.ma",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "Plateforme d'annonces. robots.txt et CGU non vérifiés.",
  },
  {
    name: "Wandaloo.com",
    category: "presse",
    baseUrl: "https://wandaloo.com",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "valide",
    licityVerifiedAt: "2026-08-07",
    robotsTxtChecked: true,
    termsChecked: false,
    riskLevel: "faible",
    notes:
      "robots.txt autorise explicitement le crawling des pages de listing.",
  },
  {
    name: "Kifal.ma",
    category: "presse",
    baseUrl: "https://kifal.ma",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "valide",
    licityVerifiedAt: "2026-08-07",
    robotsTxtChecked: true,
    termsChecked: false,
    riskLevel: "faible",
    notes:
      "robots.txt autorise le crawling des chemins pertinents.",
  },
  {
    name: "Spoticar.ma",
    category: "concession",
    baseUrl: "https://spoticar.ma",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "Site Stellantis (occasion). robots.txt et CGU non vérifiés.",
  },
  {
    name: "Autocaz.ma",
    category: "autre",
    baseUrl: "https://autocaz.ma",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "Site d'annonces. robots.txt et CGU non vérifiés.",
  },
  {
    name: "ElectroDrive.ma",
    category: "autre",
    baseUrl: "https://electrodrive.ma",
    method: "api",
    refreshIntervalHours: 24,
    licityStatus: "valide",
    licityVerifiedAt: "2026-08-07",
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "faible",
    notes:
      "API publique officielle. Collecte autorisée par défaut via l'API.",
  },
  {
    name: "MarocAnnonces",
    category: "autre",
    baseUrl: "https://marocannonces.com",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "Site d'annonces généralistes. robots.txt et CGU non vérifiés.",
  },
  {
    name: "Kijiji",
    category: "autre",
    baseUrl: "https://kijiji.ma",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "Plateforme d'annonces automobiles. robots.txt et CGU non vérifiés.",
  },
  {
    name: "Voiture.ma",
    category: "presse",
    baseUrl: "https://voiture.ma",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "Site d'annonces automobiles. robots.txt et CGU non vérifiés.",
  },
  {
    name: "SiaraCash",
    category: "autre",
    baseUrl: "https://siaracash.com",
    method: "scraping_html",
    refreshIntervalHours: 48,
    licityStatus: "a_verifier",
    licityVerifiedAt: null,
    robotsTxtChecked: false,
    termsChecked: false,
    riskLevel: "moyen",
    notes:
      "Plateforme d'annonces automobiles. robots.txt et CGU non vérifiés.",
  },
];

export function getSourceByName(name: string): AuthorizedSource | undefined {
  return AUTHORIZED_SOURCES.find(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
}

export function getApprovedSources(): AuthorizedSource[] {
  return AUTHORIZED_SOURCES.filter((s) => s.licityStatus === "valide");
}

export function getSourcesNeedingReview(): AuthorizedSource[] {
  return AUTHORIZED_SOURCES.filter((s) => s.licityStatus === "a_verifier");
}
