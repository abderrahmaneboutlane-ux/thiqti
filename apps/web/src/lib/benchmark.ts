/**
 * Banc d'essai de 30 requêtes de référence pour le moteur de matching.
 *
 * Conforme à la section 7.4 du cahier des charges.
 * Chaque requête est annotée avec les résultats attendus.
 *
 * Usage :
 *   npx tsx src/lib/benchmark.ts
 *
 * Les résultats sont affichés en tableau et le taux de réussite est calculé.
 */

export interface BenchmarkQuery {
  id: number;
  query: string;
  expectedCriteria: {
    carrosserie?: string;
    motorisation?: string;
    transmission?: string;
    marque?: string;
    budgetMax?: number;
    budgetMin?: number;
    anneeMin?: number;
    anneeMax?: number;
    kmMax?: number;
    ville?: string;
  };
  expectedTopMakes: string[]; // Les marques attendues dans le top 3
  description: string;
}

export const BENCHMARK_QUERIES: BenchmarkQuery[] = [
  // === Requête de référence du cahier des charges ===
  {
    id: 1,
    query: "Je cherche un SUV hybride autour de 350000 dirhams, confortable pour la famille, boîte auto",
    expectedCriteria: { carrosserie: "SUV", motorisation: "Hybride" },
    expectedTopMakes: [],
    description: "Requête de référence - SUV hybride familial",
  },
  // === Requêtes par type de carrosserie ===
  {
    id: 2,
    query: "Une berline diesel pour aller au travail",
    expectedCriteria: { carrosserie: "Berline", motorisation: "Diesel" },
    expectedTopMakes: [],
    description: "Berline diesel quotidienne",
  },
  {
    id: 3,
    query: "Citadine essence pour la ville",
    expectedCriteria: { carrosserie: "Citadine", motorisation: "Essence" },
    expectedTopMakes: [],
    description: "Citadine urbaine",
  },
  {
    id: 4,
    query: "Break familial grand espace",
    expectedCriteria: { carrosserie: "Break" },
    expectedTopMakes: [],
    description: "Break familial",
  },
  // === Requêtes par budget ===
  {
    id: 5,
    query: "SUV sous 250000 DH",
    expectedCriteria: { carrosserie: "SUV", budgetMax: 250000 },
    expectedTopMakes: [],
    description: "SUV petit budget",
  },
  {
    id: 6,
    query: "Entre 400000 et 600000 DH, une voiture haut de gamme",
    expectedCriteria: { budgetMin: 400000, budgetMax: 600000 },
    expectedTopMakes: [],
    description: "Budget premium",
  },
  {
    id: 7,
    query: "Moins de 200000 DH, essence",
    expectedCriteria: { motorisation: "Essence", budgetMax: 200000 },
    expectedTopMakes: [],
    description: "Très petit budget",
  },
  // === Requêtes par marque ===
  {
    id: 8,
    query: "Un Toyota hybride",
    expectedCriteria: { marque: "Toyota", motorisation: "Hybride" },
    expectedTopMakes: ["Toyota"],
    description: "Marque spécifique hybride",
  },
  {
    id: 9,
    query: "Dacia pour le quotidien",
    expectedCriteria: { marque: "Dacia" },
    expectedTopMakes: ["Dacia"],
    description: "Marque Dacia",
  },
  {
    id: 10,
    query: "Hyundai Tucson",
    expectedCriteria: { marque: "Hyundai" },
    expectedTopMakes: ["Hyundai"],
    description: "Modèle spécifique Hyundai",
  },
  // === Requêtes par ville ===
  {
    id: 11,
    query: "SUV disponible à Marrakech",
    expectedCriteria: { carrosserie: "SUV", ville: "Marrakech" },
    expectedTopMakes: [],
    description: "Recherche locale Marrakech",
  },
  {
    id: 12,
    query: "Voiture à Fès diesel",
    expectedCriteria: { motorisation: "Diesel", ville: "Fès" },
    expectedTopMakes: [],
    description: "Recherche locale Fès",
  },
  // === Requêtes par intention ===
  {
    id: 13,
    query: "Voiture économique, pas cher",
    expectedCriteria: {},
    expectedTopMakes: [],
    description: "Intention économique",
  },
  {
    id: 14,
    query: "Véhicule confortable et luxe",
    expectedCriteria: {},
    expectedTopMakes: [],
    description: "Intention confort/luxe",
  },
  {
    id: 15,
    query: "SUV tout-terrain puissant",
    expectedCriteria: { carrosserie: "SUV" },
    expectedTopMakes: [],
    description: "Intention tout-terrain",
  },
  // === Requêtes combinées ===
  {
    id: 16,
    query: "Kia Sportage 2023 diesel",
    expectedCriteria: { marque: "Kia", motorisation: "Diesel" },
    expectedTopMakes: ["Kia"],
    description: "Modèle + année + carburant",
  },
  {
    id: 17,
    query: "Nissan Qashqai autour de 300000 DH",
    expectedCriteria: { marque: "Nissan" },
    expectedTopMakes: ["Nissan"],
    description: "Modèle + budget",
  },
  {
    id: 18,
    query: "Crossover automatique à Casablanca",
    expectedCriteria: { carrosserie: "Crossover", transmission: "Automatique", ville: "Casablanca" },
    expectedTopMakes: [],
    description: "Carrosserie + transmission + ville",
  },
  // === Requêtes avancées ===
  {
    id: 19,
    query: "Je veux un véhicule récent 2024 avec peu de kilométrage",
    expectedCriteria: { anneeMin: 2024, kmMax: 30000 },
    expectedTopMakes: [],
    description: "Année récente + faible km",
  },
  {
    id: 20,
    query: "SUV 7 places pour la famille",
    expectedCriteria: { carrosserie: "SUV" },
    expectedTopMakes: [],
    description: "SUV 7 places familial",
  },
  {
    id: 21,
    query: "Berline premium allemande",
    expectedCriteria: { carrosserie: "Berline" },
    expectedTopMakes: ["BMW", "Mercedes", "Audi", "Volkswagen"],
    description: "Berline premium",
  },
  {
    id: 22,
    query: "Pick-up utilitaire pour le travail",
    expectedCriteria: { carrosserie: "Utilitaire" },
    expectedTopMakes: [],
    description: "Utilitaire professionnel",
  },
  {
    id: 23,
    query: "Voiture électrique autour de 500000 DH",
    expectedCriteria: { motorisation: "Électrique" },
    expectedTopMakes: [],
    description: "Électrique premium",
  },
  {
    id: 24,
    query: "Mitsubishi Outlander neuf",
    expectedCriteria: { marque: "Mitsubishi" },
    expectedTopMakes: ["Mitsubishi"],
    description: "Modèle spécifique Mitsubishi",
  },
  {
    id: 25,
    query: "Monospace pratique pour emmener les enfants",
    expectedCriteria: { carrosserie: "Monospace" },
    expectedTopMakes: [],
    description: "Monospace familial",
  },
  {
    id: 26,
    query: "SUV sous 300000 km diesel 2022 à Tanger",
    expectedCriteria: { carrosserie: "SUV", motorisation: "Diesel", ville: "Tanger" },
    expectedTopMakes: [],
    description: "Critères multiples + ville",
  },
  {
    id: 27,
    query: "Crossover hybride familial 2024",
    expectedCriteria: { carrosserie: "Crossover", motorisation: "Hybride" },
    expectedTopMakes: [],
    description: "Crossover hybride moderne",
  },
  {
    id: 28,
    query: "Renault diesel automatique",
    expectedCriteria: { marque: "Renault", motorisation: "Diesel", transmission: "Automatique" },
    expectedTopMakes: ["Renault"],
    description: "Marque + carburant + transmission",
  },
  {
    id: 29,
    query: "Voiture sportive essence performante",
    expectedCriteria: { motorisation: "Essence" },
    expectedTopMakes: [],
    description: "Intention sportive",
  },
  {
    id: 30,
    query: "SUV berline break citadine diesel essence hybride electrique",
    expectedCriteria: { motorisation: "Diesel" },
    expectedTopMakes: [],
    description: "Requête ambiguë avec tous les types",
  },
];

export interface BenchmarkResult {
  queryId: number;
  query: string;
  criteriaMatch: boolean;
  topMakeMatch: boolean;
  resultCount: number;
  latencyMs: number;
  passed: boolean;
  details: string;
}

/**
 * Exécute le banc d'essai complet.
 *
 * @param parseQueryFn Fonction NLP à tester
 * @param searchFn Fonction de recherche à tester
 * @returns Tableau de résultats
 */
export function runBenchmark(
  parseQueryFn: (q: string) => any,
  searchFn: (criteria: any) => Promise<any[]>
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  return Promise.all(
    BENCHMARK_QUERIES.map(async (bq) => {
      const start = performance.now();
      const criteria = parseQueryFn(bq.query);
      const searchResults = await searchFn(criteria);
      const latencyMs = performance.now() - start;

      // Vérifier critères extraits
      let criteriaMatch = true;
      if (bq.expectedCriteria.carrosserie && criteria.carrosserie !== bq.expectedCriteria.carrosserie) {
        criteriaMatch = false;
      }
      if (bq.expectedCriteria.motorisation && criteria.motorisation !== bq.expectedCriteria.motorisation) {
        criteriaMatch = false;
      }
      if (bq.expectedCriteria.marque && criteria.marque !== bq.expectedCriteria.marque) {
        criteriaMatch = false;
      }
      if (bq.expectedCriteria.ville && criteria.ville !== bq.expectedCriteria.ville) {
        criteriaMatch = false;
      }

      // Vérifier top makes
      let topMakeMatch = true;
      if (bq.expectedTopMakes.length > 0 && searchResults.length > 0) {
        const top3Makes = searchResults.slice(0, 3).map((r: any) => r.make);
        topMakeMatch = bq.expectedTopMakes.some((m) => top3Makes.includes(m));
      }

      const passed = criteriaMatch && topMakeMatch && searchResults.length > 0;

      results.push({
        queryId: bq.id,
        query: bq.query,
        criteriaMatch,
        topMakeMatch,
        resultCount: searchResults.length,
        latencyMs: Math.round(latencyMs),
        passed,
        details: !criteriaMatch
          ? `Critères: attendu ${JSON.stringify(bq.expectedCriteria)}, obtenu ${JSON.stringify({
              carrosserie: criteria.carrosserie,
              motorisation: criteria.motorisation,
              marque: criteria.marque,
              ville: criteria.ville,
            })}`
          : searchResults.length === 0
          ? "Aucun résultat"
          : "OK",
      });
    })
  ).then(() => results);
}

/**
 * Affiche les résultats du banc d'essai en format tableau.
 */
export function printBenchmarkResults(results: BenchmarkResult[]): void {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const rate = Math.round((passed / total) * 100);

  console.log("\n=== BANC D'ESSAI TOPSIS - 30 REQUÊTES ===\n");
  console.log(`Taux de réussite: ${passed}/${total} (${rate}%)\n`);
  console.log("ID | Passé | Critères | Top Make | Résultats | Latence | Détails");
  console.log("---|-------|----------|----------|-----------|---------|--------");

  for (const r of results) {
    const status = r.passed ? "✅" : "❌";
    const crit = r.criteriaMatch ? "✅" : "❌";
    const topMake = r.topMakeMatch ? "✅" : "⚠️";
    console.log(
      `${String(r.queryId).padStart(2)} |  ${status}   |    ${crit}     |    ${topMake}     |    ${String(r.resultCount).padStart(2)}      |  ${String(r.latencyMs).padStart(4)}ms | ${r.details}`
    );
  }

  console.log(`\nRésumé: ${passed} réussis, ${total - passed} échoués`);
}

// Exécution directe
if (typeof require !== "undefined" && require.main === module) {
  const { parseQuery } = require("./nlp");
  const { rankVehicles } = require("./matching");

  const mockSearch = async (criteria: any) => {
    const mockCars = Array.from({ length: 20 }, (_, i) => ({
      id: `car-${i}`,
      title: `Voiture ${i}`,
      make: ["Toyota", "Renault", "Peugeot", "Hyundai", "Kia", "Dacia"][i % 6],
      model: `Model ${i}`,
      year: 2020 + (i % 5),
      price: 150000 + i * 20000,
      priceFormatted: `${(150000 + i * 20000).toLocaleString("fr-FR")} DH`,
      km: i * 5000,
      fuel: ["Diesel", "Essence", "Hybride"][i % 3],
      city: ["Casablanca", "Rabat", "Marrakech"][i % 3],
      image: "",
      source: "fallback",
      url: "",
      score: 70 + (i % 30),
    }));
    return rankVehicles(mockCars, criteria);
  };

  runBenchmark(parseQuery, mockSearch).then(printBenchmarkResults);
}
